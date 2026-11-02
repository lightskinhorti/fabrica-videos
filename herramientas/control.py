"""Control automático de un vídeo de El contador loco (R10 del PRD).

Uso (con el Python de voces/.venv, que tiene Pillow para medir el texto):
    ../voces/.venv/bin/python control.py <carpeta del vídeo> [video.mp4]

Comprueba:
- Duración: más de 60 s, lo que pide TikTok para cobrar.
- Volumen del MP4: -14 LUFS, con un margen de 1.
- Subtítulos: cada grupo cabe en 2 líneas dentro de su caja (de 1.230 a 1.420 px), así que no
  sube hacia la escena ni se sale por los lados. El título del principio cabe en 3 líneas.
- Marcador y etiquetas: la cifra más larga cabe en el marcador y cada etiqueta en la pantalla.
- Fuentes: cada cifra de las etiquetas está en fuentes.md (si falta, es un error) y cada cifra
  de los subtítulos también (si falta, es un aviso: puede ser un cálculo, como "a los 14 minutos").
No revisa la ortografía: eso lo hace Claude al escribir el guion.
Sale con código 1 si hay algún error, para que producir.sh avise.
"""
import glob
import json
import os
import re
import subprocess
import sys

from PIL import ImageFont

carpeta = sys.argv[1]
mp4 = sys.argv[2] if len(sys.argv) > 2 else None
html = open(os.path.join(carpeta, "index.html"), encoding="utf-8").read()
bloque = lambda i: json.loads(re.search(rf'<script id="{i}" type="application/json">(.*?)</script>', html, re.S).group(1))
VOZ, ESC = bloque("vozdata"), bloque("escena")
D = float(re.search(r'data-composition-id="main"[^>]*data-duration="([\d.]+)"', html).group(1))
errores, avisos = [], []

# ---------- fonts (the same files HyperFrames installs) ----------
FUENTES = os.path.expanduser("~/.cache/hyperframes/fonts")


def letra(familia, peso, px):
    archivos = sorted(glob.glob(f"{FUENTES}/{familia}/{peso}-normal-*.woff2"))
    if not archivos:
        sys.exit(f"No encuentro la letra {familia} {peso} en {FUENTES}: renderiza una vez el vídeo para que HyperFrames la descargue.")
    return [ImageFont.truetype(a, px) for a in archivos]


def ancho(fuentes, texto):
    # each file is a subset of the font; the widest reading is the safe one
    return max(f.getlength(texto) for f in fuentes)


def lineas(fuentes, palabras, caja, hueco):
    n, actual = 1, 0.0
    for p in palabras:
        w = ancho(fuentes, p) + hueco
        if actual and actual + w > caja:
            n, actual = n + 1, w
        else:
            actual += w
    return n


# ---------- duration and loudness ----------
dur = D
if mp4:
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4], capture_output=True, text=True).stdout)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", mp4, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])
    objetivo = -20 if VOZ.get("modo") == "texto" else -14
    if abs(lufs - objetivo) > 1:
        errores.append(f"volumen {lufs:.1f} LUFS (tiene que estar cerca de {objetivo})")
if dur <= 60:
    errores.append(f"dura {dur:.1f} s: TikTok solo paga vídeos de más de 1 minuto")

# ---------- captions: same grouping as the engine ----------
CAP = letra("nunito", 900, 72)
grupos = []
for L in VOZ["lines"]:
    if VOZ.get("modo") == "texto":
        grupos.append([w["w"] for w in L["words"]])
        continue
    cur = []
    for i, w in enumerate(L["words"]):
        cur.append(w["w"])
        if len(cur) >= 4 or re.search(r"[.,:;?!]$", w["w"]) or i == len(L["words"]) - 1:
            grupos.append(cur)
            cur = []
# box: 1080 - 110 - 170 = 800 px; each word has 0.13em of margin per side and 12 px of outline
for g in grupos:
    n = lineas(CAP, g, 800, 72 * 0.26 + 12)
    if n > 2:
        errores.append(f"subtítulo en {n} líneas, se sale de su caja: \"{' '.join(g)}\"")
TIT = letra("nunito", 900, 92)
n = lineas(TIT, ESC["titulo"].split(), 880, ancho(TIT, " "))
if n > 3:
    errores.append(f"el título ocupa {n} líneas (máximo 3): \"{ESC['titulo']}\"")


# ---------- counter and labels (same formats as the engine) ----------
def miles(n):
    return f"{round(n):,}".replace(",", ".")


def coma(n, d):
    return f"{n:.{d}f}".replace(".", ",")


def valor(v):
    f = ESC.get("formato", "altura")
    if f == "altura":
        return (miles(v), "m") if v < 100000 else (miles(v / 1000), "km")
    if f == "pila":
        return (re.sub(r",0+$", "", coma(v, 2)), "m") if v < 10 else ((miles(v), "m") if v < 100000 else (miles(v / 1000), "km"))
    if f == "estatura":
        return (re.sub(r",0+$", "", coma(v, 2) if v < 10 else coma(v, 1) if v < 1000 else miles(v)), "m")
    if f == "temperatura":
        return (miles(v), "°C")
    if f == "peso":
        return (miles(v), "kg") if v < 10000 else (miles(v / 1000), "t")
    sys.exit(f"Formato desconocido: {f}")


NUM, UNI, LAB = letra("archivo-black", 400, 148), letra("archivo-black", 400, 74), letra("nunito", 900, 30)
for h in ESC["hitos"]:
    num, unidad = valor(h["v"])
    # HUD: number + unit at half size + 56 px of padding and a 6 px border per side, inside the frame
    w = ancho(NUM, num) + ancho(UNI, unidad) + 2 * 62
    if w > 1040:
        errores.append(f"la cifra {num} {unidad} no cabe en el marcador ({w:.0f} px)")
    if h.get("etiqueta"):
        texto = f"{h['etiqueta']} · {num} {unidad}"
        w = ancho(LAB, texto) + len(texto) * 30 * 0.06 + 36
        if w > 1000:
            errores.append(f"la etiqueta \"{texto}\" no cabe en la pantalla ({w:.0f} px)")


# ---------- every number on screen has a source ----------
def numeros(texto):
    """Numbers written the Spanish way: 8.849 and 384.400 are thousands, 2,56 and 8.848,86 decimals."""
    out = []
    for m in re.finditer(r"\d[\d.,]*\d|\d", texto):
        t = m.group(0)
        if re.fullmatch(r"\d{1,3}(\.\d{3})+(,\d+)?", t):
            t = t.replace(".", "").replace(",", ".")
        elif re.fullmatch(r"\d+,\d+", t):
            t = t.replace(",", ".")
        elif re.fullmatch(r"\d{1,3}(,\d{3})+", t):
            t = t.replace(",", "")
        try:
            out.append(float(t))
        except ValueError:
            pass
    return out


ruta_fuentes = os.path.join(carpeta, "fuentes.md")
if not os.path.exists(ruta_fuentes):
    errores.append("falta fuentes.md con la fuente de cada cifra")
else:
    conocidos = numeros(open(ruta_fuentes, encoding="utf-8").read())
    esta = lambda v: any(abs(c - v) <= max(0.5, abs(v) * 0.005) for c in conocidos)
    for h in ESC["hitos"]:
        if h.get("etiqueta"):
            for v in numeros(valor(h["v"])[0]):
                if not esta(v):
                    errores.append(f"la etiqueta {h['etiqueta']} dice {v:g} y esa cifra no está en fuentes.md")
    vistos = set()
    for L in VOZ["lines"]:
        for w in L["words"]:
            for v in numeros(w["w"]):
                if v > 12 and v not in vistos and not esta(v):
                    avisos.append(f"el subtítulo dice {w['w']} y esa cifra no está en fuentes.md (si es un cálculo, apúntalo allí)")
                vistos.add(v)

nombre = os.path.basename(os.path.normpath(carpeta))
for a in avisos:
    print(f"  AVISO {nombre}: {a}")
for e in errores:
    print(f"  ERROR {nombre}: {e}")
print(f"  control {nombre}: {'sin errores' if not errores else f'{len(errores)} errores'}, {len(grupos)} subtítulos, {dur:.1f} s")
sys.exit(1 if errores else 0)
