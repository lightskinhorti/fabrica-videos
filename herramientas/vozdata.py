"""Convierte el guion (y, si existe, la transcripción de Whisper) en el bloque vozdata de una plantilla.

Uso:
    python3 vozdata.py guion.json [transcript.json] [--audio voz.wav] > vozdata.json
    python3 vozdata.py guion.json --texto > vozdata.json

- Con transcript.json: cada palabra del guion (con su puntuación correcta) recibe los tiempos de Whisper.
  Las palabras se emparejan aunque Whisper oiga algo distinto ("Burg Califa", "Leverest"): los tramos que
  no coinciden se reparten el tiempo de lo que oyó Whisper, y cada diferencia sale como aviso.
- Los números que el guion escribe en palabras para la voz ("doscientos cuarenta y nueve") y Whisper
  escribe en cifras ("249") salen en cifras en los subtítulos.
- Sin transcript.json: estima los tiempos (2,9 palabras por segundo), para montar la escena antes de tener la voz.
- La palabra clave de cada frase sale de "claves" en guion.json (una por frase).
- Con --texto (vídeo sin voz, con canción de TikTok): usa las frases cortas de "texto" y "claves_texto".
  Cada frase sale entera y dura según sus palabras; el total llega al menos a 60 s de vídeo.
"""
import difflib
import json
import re
import sys
import unicodedata
import wave

NUMEROS = set("""
cero un uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciseis
diecisiete dieciocho diecinueve veinte veintiun veintiuno veintiuna veintidos veintitres veinticuatro
veinticinco veintiseis veintisiete veintiocho veintinueve treinta cuarenta cincuenta sesenta setenta ochenta
noventa cien ciento doscientos doscientas trescientos trescientas cuatrocientos cuatrocientas quinientos
quinientas seiscientos seiscientas setecientos setecientas ochocientos ochocientas novecientos novecientas
mil millon millones y
""".split())


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalnum())


args = sys.argv[1:]
audio = None
texto = "--texto" in args
args = [a for a in args if a != "--texto"]
if "--audio" in args:
    i = args.index("--audio"); audio = args[i + 1]; del args[i:i + 2]
guion = json.load(open(args[0], encoding="utf-8"))
claves = [norm(c) for c in guion.get("claves_texto" if texto else "claves", [])]
script_lines = [l.split() for l in guion["texto" if texto else "lines"]]
guion_w = [w for l in script_lines for w in l]
linea_de = [li for li, l in enumerate(script_lines) for _ in l]
tiempos = [None] * len(guion_w)
mostrar = {}

if texto:
    # the title card holds the first 3.6 s; each line stays long enough to read, and the video passes 60 s
    dur = [max(3.2, 1.4 + 0.42 * len(l)) for l in script_lines]
    escala = max(1.0, (60.4 - 3.6) / sum(dur))
    t, k = 3.6, 0
    for l, d in zip(script_lines, dur):
        d *= escala
        for j, w in enumerate(l):
            tiempos[k] = (t + 0.05 * j, t + d - 0.15)
            k += 1
        t += d
elif len(args) > 1:
    words = []
    for w in json.load(open(args[1], encoding="utf-8")):
        parts = [p for p in re.split(r"(?=[¿¡])", w["text"]) if p]
        lens = [max(1, len(norm(p))) for p in parts]
        acc = w["start"]
        for p, n in zip(parts, lens):
            d = (w["end"] - w["start"]) * n / sum(lens)
            words.append({"t": p, "s": acc, "e": acc + d})
            acc += d
    words = [w for w in words if norm(w["t"])]
    a, b = [norm(w) for w in guion_w], [norm(w["t"]) for w in words]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    if sm.ratio() < 0.7:
        sys.exit(f"El guion y lo que ha oído Whisper se parecen poco ({sm.ratio():.0%}): ¿es la voz de este guion?")
    limpia = lambda t: re.sub(r"^\W+|\W+$", "", t)
    # Whisper writes 1538; Spanish captions read 1.538, except years ("en 2016", "desde 2019")
    miles = lambda c: f"{int(c):,}".replace(",", ".") if re.fullmatch(r"\d{4,}", c) else c
    es_cifra = lambda t: re.fullmatch(r"\d[\d.,]*", limpia(t)) is not None
    ANTES_DE_ANO = {"en", "de", "del", "desde", "hasta", "ano", "el"}
    UNIDADES = {"euros", "euro", "metros", "kilometros", "kilos", "grados", "personas", "billetes", "veces",
                "anos", "dias", "horas", "minutos", "segundos", "numeros"}

    def es_ano(c, i1, i2):
        if not re.fullmatch(r"(19|20)\d\d", c):
            return False
        antes = norm(guion_w[i1 - 1]) if i1 > 0 else ""
        despues = norm(guion_w[i2]) if i2 < len(guion_w) else ""
        return antes in ANTES_DE_ANO and despues not in UNIDADES

    def racha(xs, ok):
        n = 0
        while n < len(xs) and ok(xs[n]):
            n += 1
        return n

    def repartir(i1, i2, j1, j2):
        """Da a las palabras del guion i1..i2 el tiempo de lo que oyó Whisper (words[j1:j2])."""
        if j1 == j2:
            s = words[j1 - 1]["e"] if j1 > 0 else 0.0
            e = max(words[j1]["s"] if j1 < len(words) else s, s + 0.1 * (i2 - i1))
        else:
            s, e = words[j1]["s"], words[j2 - 1]["e"]
        if i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                tiempos[i1 + k] = (words[j1 + k]["s"], words[j1 + k]["e"])
        else:
            lens = [max(1, len(a[i])) for i in range(i1, i2)]
            acc = s
            for i, n in zip(range(i1, i2), lens):
                d = (e - s) * n / sum(lens)
                tiempos[i] = (acc, acc + d)
                acc += d
        if (j1 < j2 and all(x in NUMEROS for x in a[i1:i2]) and linea_de[i1] == linea_de[i2 - 1]
                and all(es_cifra(w["t"]) for w in words[j1:j2])):
            pre = re.match(r"[¿¡]*", guion_w[i1]).group(0)
            post = re.search(r"\W*$", guion_w[i2 - 1]).group(0)
            cifras = [limpia(w["t"]) for w in words[j1:j2]]
            texto_cifras = " ".join(c if es_ano(c, i1, i2) else miles(c) for c in cifras)
            mostrar[i1] = (pre + texto_cifras + post, s, e, list(range(i1, i2)))

    def partir(i1, i2, j1, j2):
        """Separa una cifra al principio o al final del tramo ("del Everest: ocho mil…" / "de Leverest, 8.849")."""
        oido = [w["t"] for w in words[j1:j2]]
        ns, nd = racha(a[i1:i2][::-1], NUMEROS.__contains__), racha(oido[::-1], es_cifra)
        while ns and a[i2 - ns] == "y":
            ns -= 1
        if ns and nd and ns < i2 - i1 and nd < j2 - j1:
            partir(i1, i2 - ns, j1, j2 - nd)
            return repartir(i2 - ns, i2, j2 - nd, j2)
        ns, nd = racha(a[i1:i2], NUMEROS.__contains__), racha(oido, es_cifra)
        while ns and a[i1 + ns - 1] == "y":
            ns -= 1
        if ns and nd and ns < i2 - i1 and nd < j2 - j1:
            repartir(i1, i1 + ns, j1, j1 + nd)
            return partir(i1 + ns, i2, j1 + nd, j2)
        repartir(i1, i2, j1, j2)

    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            repartir(i1, i2, j1, j2)
            continue
        oido = " ".join(w["t"] for w in words[j1:j2])
        if op == "insert":
            print(f"Aviso: Whisper ha oído '{oido}' y no está en el guion", file=sys.stderr)
            continue
        print(f"Aviso: el guion dice '{' '.join(guion_w[i1:i2])}' y Whisper ha oído '{oido}'", file=sys.stderr)
        partir(i1, i2, j1, j2)
else:
    t, k = 0.3, 0
    for l in script_lines:
        for w in l:
            d = 0.12 + 0.055 * len(norm(w))
            tiempos[k] = (t, t + d)
            t, k = t + d + 0.02, k + 1
        t += guion.get("pausa_segundos", 0.35)

r = lambda x: round(x, 3)
lines, i = [], 0
for li, l in enumerate(script_lines):
    clave = claves[li] if li < len(claves) else None
    ws, marcada, fin = [], False, i + len(l)
    while i < fin:
        palabra, s, e, grupo = mostrar.get(i, (guion_w[i], *tiempos[i], [i]))
        key = not marcada and clave is not None and any(norm(guion_w[k]) == clave for k in grupo)
        marcada = marcada or key
        ws.append({"w": palabra, "s": r(s), "e": r(e), "key": key})
        i = grupo[-1] + 1
    lines.append({"id": f"l{li + 1}", "s": ws[0]["s"], "e": ws[-1]["e"], "words": ws})

if audio:
    with wave.open(audio) as wf:
        duration = wf.getnframes() / wf.getframerate()
else:
    duration = lines[-1]["e"] + 0.4
salida = {"duration": r(duration), "lines": lines}
if texto:
    salida["modo"] = "texto"
print(json.dumps(salida, ensure_ascii=False))
