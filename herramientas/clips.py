#!/usr/bin/env python3
"""Clips de streamers: de los clips más vistos de un canal de Twitch a un vídeo vertical.

Uso (desde la raíz del proyecto, con el Python de voces/.venv, que tiene Pillow):

    voces/.venv/bin/python herramientas/clips.py listar kaicenat --palabras gta
    voces/.venv/bin/python herramientas/clips.py hacer kaicenat --palabras gta --cuantos 3

Pasos de "hacer": lista los clips más vistos (yt-dlp, sin iniciar sesión), elige los
mejores, los baja, saca los subtítulos con Whisper y monta un vídeo de 1080x1920 en
exports/clips/<canal>/. Lo ya hecho se apunta en datos/clips_hechos.json, así que
repetir la orden no duplica nada. No sube nada a ningún sitio.

Los "buenos momentos" los eligen los espectadores: se ordena por visualizaciones del
clip en Twitch y se descartan los que no llegan al mínimo.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
import uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HECHOS = RAIZ / "datos" / "clips_hechos.json"
SALIDA = RAIZ / "exports" / "clips"
ANCHO, ALTO = 1080, 1920
FUENTE = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
HYPERFRAMES = "hyperframes@0.8.228"
RANGOS = ("24hr", "7d", "30d", "all")


def log(run: str, paso: str, t0: float, resultado: str) -> None:
    print(f"[{run}] {paso}: {resultado} ({time.time() - t0:.1f} s)", flush=True)


def ejecutar(orden: list[str], espera: int, intentos: int = 1, cwd: Path | None = None) -> str:
    """Lanza una orden externa con límite de tiempo y reintentos con espera creciente."""
    ultimo = ""
    for i in range(intentos):
        try:
            r = subprocess.run(orden, capture_output=True, text=True, timeout=espera, cwd=cwd)
            if r.returncode == 0:
                return r.stdout
            ultimo = (r.stderr or r.stdout).strip()[-400:]
        except subprocess.TimeoutExpired:
            ultimo = f"sin respuesta en {espera} s"
        if i + 1 < intentos:
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"Falló {orden[0]} tras {intentos} intento(s): {ultimo}")


# ---------- lógica (sin red, con pruebas en tests/test_clips.py) ----------

def validar_canal(canal: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9_]{3,25}", canal):
        raise ValueError(f"Nombre de canal de Twitch no válido: {canal!r}")
    return canal.lower()


def elegir(entradas: list[dict], palabras: list[str], min_visitas: int, min_dur: float,
           max_dur: float, cuantos: int, hechos: set[str]) -> list[dict]:
    """Los mejores clips: con alguna de las palabras en el título, dentro de la duración,
    con el mínimo de visualizaciones, no hechos ya, ordenados de más a menos vistos."""
    claves = [p.lower() for p in palabras if p.strip()]
    buenos = []
    for e in entradas:
        titulo = (e.get("title") or "").strip()
        visitas = e.get("view_count") or 0
        dur = e.get("duration") or 0
        if not e.get("id") or not e.get("url") or str(e["id"]) in hechos:
            continue
        if claves and not any(c in titulo.lower() for c in claves):
            continue
        if visitas < min_visitas or not (min_dur <= dur <= max_dur):
            continue
        buenos.append(e)
    buenos.sort(key=lambda e: e.get("view_count") or 0, reverse=True)
    return buenos[:cuantos]


def titulo_limpio(titulo: str, maximo: int = 60) -> str:
    """Título para poner arriba: sin símbolos sueltos y recortado por palabras."""
    t = re.sub(r"[^\w\s¿?¡!.,'’:-]", " ", titulo or "", flags=re.UNICODE)
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) <= maximo:
        return t
    return t[:maximo].rsplit(" ", 1)[0].rstrip(".,:-") + "…"


def grupos(palabras: list[dict], por_grupo: int = 3, pausa: float = 0.6) -> list[dict]:
    """Junta las palabras de Whisper en subtítulos de pocas palabras. Corta también
    cuando hay una pausa larga, para no dejar un texto colgado sobre un silencio."""
    salida: list[dict] = []
    actual: list[dict] = []
    for p in palabras:
        texto = (p.get("text") or "").strip()
        if not texto or p.get("start") is None or p.get("end") is None:
            continue
        if actual and (len(actual) >= por_grupo or p["start"] - actual[-1]["end"] > pausa):
            salida.append(_grupo(actual))
            actual = []
        actual.append({"text": texto, "start": float(p["start"]), "end": float(p["end"])})
    if actual:
        salida.append(_grupo(actual))
    for a, b in zip(salida, salida[1:]):
        a["end"] = min(max(a["end"], a["start"] + 0.35), b["start"])
    return salida


def _grupo(ps: list[dict]) -> dict:
    return {"text": " ".join(p["text"] for p in ps).upper(), "start": ps[0]["start"], "end": ps[-1]["end"]}


def partir_lineas(texto: str, mide, ancho_max: int) -> list[str]:
    """Reparte un texto en líneas que caben en ancho_max. `mide(texto)` da el ancho en px."""
    lineas: list[str] = []
    actual = ""
    for palabra in texto.split():
        prueba = f"{actual} {palabra}".strip()
        if actual and mide(prueba) > ancho_max:
            lineas.append(actual)
            actual = palabra
        else:
            actual = prueba
    if actual:
        lineas.append(actual)
    return lineas


def leer_hechos(ruta: Path = HECHOS) -> dict:
    if not ruta.exists():
        return {}
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    if not isinstance(datos, dict):
        raise ValueError(f"{ruta} no tiene el formato esperado (un objeto por id de clip)")
    return datos


def apuntar_hecho(clip: dict, canal: str, archivo: Path, ruta: Path = HECHOS) -> None:
    datos = leer_hechos(ruta)
    datos[str(clip["id"])] = {
        "canal": canal, "titulo": clip.get("title"), "url": clip.get("url"),
        "visitas_twitch": clip.get("view_count"), "archivo": str(archivo.relative_to(RAIZ)),
        "hecho": time.strftime("%Y-%m-%d %H:%M"),
    }
    ruta.parent.mkdir(parents=True, exist_ok=True)
    tmp = ruta.with_suffix(".tmp")
    tmp.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(ruta)


# ---------- pasos con red o con programas externos ----------

def listar(canal: str, rango: str, tope: int = 60) -> list[dict]:
    url = f"https://www.twitch.tv/{canal}/clips?filter=clips&range={rango}"
    salida = ejecutar(["yt-dlp", "--socket-timeout", "20", "--flat-playlist",
                       "--playlist-end", str(tope), "-J", url], espera=120, intentos=3)
    datos = json.loads(salida)
    entradas = datos.get("entries")
    if not isinstance(entradas, list):
        raise RuntimeError(f"Twitch no ha devuelto la lista de clips de {canal}")
    return entradas


def bajar(clip: dict, carpeta: Path) -> Path:
    destino = carpeta / "original.mp4"
    if destino.exists() and destino.stat().st_size > 0:
        return destino
    ejecutar(["yt-dlp", "--socket-timeout", "20", "-f", "best[height<=1080]", "--merge-output-format",
              "mp4", "-o", str(destino), clip["url"]], espera=300, intentos=3)
    return destino


def transcribir(video: Path, carpeta: Path, idioma: str) -> list[dict]:
    ruta = carpeta / "transcript.json"
    if not ruta.exists():
        audio = carpeta / "audio.wav"
        ejecutar(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-vn", "-ac", "1",
                  "-ar", "16000", str(audio)], espera=120)
        ejecutar(["npx", "-y", HYPERFRAMES, "transcribe", str(audio), "--engine", "whisper",
                  "--model", "small", "--language", idioma, "-d", str(carpeta)],
                 espera=900, cwd=carpeta)
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    if not isinstance(datos, list):
        raise RuntimeError(f"La transcripción de {video.name} no es una lista de palabras")
    return datos


def _dibujar(texto: str, tam: int, ancho_max: int, destino: Path, relleno=(255, 255, 255)) -> tuple[int, int]:
    """Texto centrado con borde negro sobre fondo transparente. Devuelve (ancho, alto)."""
    from PIL import Image, ImageDraw, ImageFont
    fuente = ImageFont.truetype(FUENTE, tam)
    borde = max(6, tam // 9)
    lapiz = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    lineas = partir_lineas(texto, lambda t: lapiz.textlength(t, font=fuente), ancho_max - 2 * borde)
    alto_linea = int(tam * 1.22)
    img = Image.new("RGBA", (ancho_max, alto_linea * len(lineas) + 2 * borde), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, linea in enumerate(lineas):
        x = (ancho_max - d.textlength(linea, font=fuente)) / 2
        d.text((x, borde + i * alto_linea), linea, font=fuente, fill=relleno,
               stroke_width=borde, stroke_fill=(0, 0, 0))
    img.save(destino)
    return img.size


def montar(video: Path, carpeta: Path, titulo: str, subs: list[dict], canal: str, destino: Path) -> None:
    """1080x1920: el clip entero a lo ancho sobre su propia imagen desenfocada, el título
    arriba, los subtítulos debajo de la imagen y el nombre del canal como crédito."""
    alto_clip = 608
    y_clip = (ALTO - alto_clip) // 2 - 40
    capas = [(carpeta / "titulo.png", titulo.upper(), 76, None)]
    _, alto_t = _dibujar(titulo.upper(), 76, ANCHO - 120, capas[0][0], relleno=(255, 221, 51))
    credito = carpeta / "credito.png"
    _dibujar(f"twitch.tv/{canal}", 34, ANCHO - 120, credito)
    entradas = ["-i", str(video), "-i", str(capas[0][0]), "-i", str(credito)]
    filtro = [
        f"[0:v]scale={ANCHO}:{ALTO}:force_original_aspect_ratio=increase,crop={ANCHO}:{ALTO},"
        f"boxblur=24:2,eq=brightness=-0.25[fondo]",
        f"[0:v]scale={ANCHO}:{alto_clip}:force_original_aspect_ratio=decrease,"
        f"pad={ANCHO}:{alto_clip}:(ow-iw)/2:(oh-ih)/2[clip]",
        f"[fondo][clip]overlay=0:{y_clip}[v0]",
        f"[v0][1:v]overlay=60:{max(120, y_clip - alto_t - 50)}[v1]",
        f"[v1][2:v]overlay=60:{ALTO - 330}[v2]",
    ]
    ultima = "v2"
    for i, s in enumerate(subs):
        png = carpeta / f"sub_{i:03d}.png"
        _dibujar(s["text"], 84, ANCHO - 120, png)
        entradas += ["-i", str(png)]
        filtro.append(f"[{ultima}][{i + 3}:v]overlay=60:{y_clip + alto_clip + 70}:"
                      f"enable='between(t,{s['start']:.2f},{s['end']:.2f})'[s{i}]")
        ultima = f"s{i}"
    ejecutar(["ffmpeg", "-y", "-loglevel", "error", *entradas, "-filter_complex", ";".join(filtro),
              "-map", f"[{ultima}]", "-map", "0:a?", "-r", "30", "-c:v", "libx264", "-preset", "medium",
              "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
              "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-movflags", "+faststart", str(destino)],
             espera=900)


def hacer(args) -> int:
    run = uuid.uuid4().hex[:8]
    canal = validar_canal(args.canal)
    t0 = time.time()
    entradas = listar(canal, args.rango)
    elegidos = elegir(entradas, args.palabras, args.min_visitas, args.min_dur, args.max_dur,
                      args.cuantos, set(leer_hechos()))
    log(run, "lista", t0, f"{len(entradas)} clips leídos, {len(elegidos)} elegidos")
    fallos = 0
    for clip in elegidos:
        carpeta = SALIDA / canal / str(clip["id"])
        carpeta.mkdir(parents=True, exist_ok=True)
        destino = SALIDA / canal / f"{clip['id']}.mp4"
        try:
            t = time.time()
            original = bajar(clip, carpeta)
            log(run, f"bajar {clip['id']}", t, "ok")
            t = time.time()
            subs = grupos(transcribir(original, carpeta, args.idioma))
            log(run, f"subtítulos {clip['id']}", t, f"{len(subs)} grupos")
            t = time.time()
            montar(original, carpeta, titulo_limpio(clip.get("title") or ""), subs, canal, destino)
            apuntar_hecho(clip, canal, destino)
            log(run, f"montar {clip['id']}", t, str(destino.relative_to(RAIZ)))
        except (RuntimeError, OSError, ValueError) as e:
            fallos += 1
            print(f"[{run}] ERROR en el clip {clip['id']}: {e}", file=sys.stderr)
    log(run, "fin", t0, f"{len(elegidos) - fallos} hechos, {fallos} con error")
    return 1 if fallos else 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("orden", choices=("listar", "hacer"))
    p.add_argument("canal")
    p.add_argument("--rango", choices=RANGOS, default="24hr")
    p.add_argument("--palabras", nargs="*", default=[], help="el título debe llevar alguna (p. ej. gta)")
    p.add_argument("--min-visitas", type=int, default=500, dest="min_visitas")
    p.add_argument("--min-dur", type=float, default=15, dest="min_dur")
    p.add_argument("--max-dur", type=float, default=60, dest="max_dur")
    p.add_argument("--cuantos", type=int, default=3)
    p.add_argument("--idioma", default="en")
    args = p.parse_args()
    try:
        if args.orden == "hacer":
            return hacer(args)
        canal = validar_canal(args.canal)
        for e in elegir(listar(canal, args.rango), args.palabras, args.min_visitas, args.min_dur,
                        args.max_dur, args.cuantos, set(leer_hechos())):
            print(f"{e.get('view_count'):>8}  {e.get('duration'):>4.0f} s  {e.get('title')}  {e.get('url')}")
        return 0
    except (RuntimeError, ValueError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
