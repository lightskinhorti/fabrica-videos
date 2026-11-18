#!/usr/bin/env python3
"""Clips de streamers: de los clips más vistos de un canal de Twitch a un vídeo vertical.

Uso (desde la raíz del proyecto, con el Python de voces/.venv, que tiene Pillow):

    voces/.venv/bin/python herramientas/clips.py listar kaicenat --palabras gta
    voces/.venv/bin/python herramientas/clips.py hacer kaicenat --palabras gta --cuantos 3
    voces/.venv/bin/python herramientas/clips.py directo djmariio --cuantos 2 --idioma es

Pasos de "hacer": lista los clips más vistos (yt-dlp, sin iniciar sesión), elige los
mejores, los baja, saca los subtítulos con Whisper y monta un vídeo de 1080x1920 en
exports/clips/<canal>/. Lo ya hecho se apunta en datos/clips_hechos.json, así que
repetir la orden no duplica nada. No sube nada a ningún sitio.

Los "buenos momentos" los eligen los espectadores: se ordena por visualizaciones del
clip en Twitch y se descartan los que no llegan al mínimo.

"directo" saca momentos del PROPIO directo: busca el último VOD del canal, baja su chat
(API pública de la web de Twitch, sin cuenta), cuenta mensajes por ventanas de 10 s y
elige los picos frente a la mediana. Cada momento empieza unos 22 s antes del pico (el
chat reacciona después de que pase). Baja solo ese trozo del VOD y lo monta igual que un clip.
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HECHOS = RAIZ / "datos" / "clips_hechos.json"
SALIDA = RAIZ / "exports" / "clips"
ANCHO, ALTO = 1080, 1920
FUENTE = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
HYPERFRAMES = "hyperframes@0.8.228"
RANGOS = ("24hr", "7d", "30d", "all")
# Datos públicos de la web de Twitch (los mismos que usa cualquier visitante sin cuenta).
GQL_URL = "https://gql.twitch.tv/gql"
GQL_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko"
GQL_CHAT_HASH = "b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a"
BOTS = {"nightbot", "streamelements", "streamlabs", "moobot", "fossabot", "wizebot", "sery_bot",
        "commanderroot", "soundalerts"}
RELLENO = {"eh", "ah", "uh", "um", "mm", "mmm", "pues", "bueno", "vale", "bien", "o", "a", "y", "e",
           "oye", "ey", "hey", "ok", "okay", "so", "well", "like", "and", "the", "yeah"}


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


# ---------- momentos del directo: lógica pura ----------

def elegir_vod(entradas: list[dict], vod: str | None = None, min_dur: float = 600) -> dict:
    """El VOD más reciente con duración suficiente (Twitch los lista del nuevo al viejo), o el
    pedido con --vod. Devuelve {id, url, title, duration}, con el id sin la 'v' de yt-dlp."""
    for e in entradas:
        vid = str(e.get("id") or "").lstrip("v")
        if not vid.isdigit():
            continue
        if vod:
            if vid != str(vod).lstrip("v"):
                continue
        elif (e.get("duration") or 0) < min_dur:
            continue
        return {"id": vid, "url": f"https://www.twitch.tv/videos/{vid}",
                "title": e.get("title") or "", "duration": float(e.get("duration") or 0)}
    raise ValueError(f"No hay ningún VOD {'con ese id' if vod else f'de más de {min_dur / 60:.0f} min'} en la lista")


def parsear_comentarios(respuesta) -> tuple[list[dict], int | None, bool]:
    """Respuesta de la API de Twitch (lista con un objeto) -> (mensajes, último segundo, hay más).
    Cada mensaje: {id, t, usuario, texto}. Lanza RuntimeError si Twitch devolvió un error."""
    if not isinstance(respuesta, list) or not respuesta or not isinstance(respuesta[0], dict):
        raise RuntimeError("Respuesta de chat de Twitch con formato inesperado")
    r = respuesta[0]
    video = (r.get("data") or {}).get("video")
    comentarios = (video or {}).get("comments")
    if comentarios is None:
        errores = "; ".join(str(e.get("message")) for e in (r.get("errors") or [])) or "sin comentarios"
        raise RuntimeError(f"Twitch no ha dado el chat: {errores}")
    mensajes = []
    for borde in comentarios.get("edges") or []:
        n = borde.get("node") or {}
        t = n.get("contentOffsetSeconds")
        if t is None or not n.get("id"):
            continue
        texto = "".join(f.get("text") or "" for f in ((n.get("message") or {}).get("fragments") or []))
        mensajes.append({"id": n["id"], "t": int(t), "usuario": ((n.get("commenter") or {}).get("login") or ""),
                         "texto": texto})
    ultimo = max((m["t"] for m in mensajes), default=None)
    hay_mas = bool((comentarios.get("pageInfo") or {}).get("hasNextPage"))
    return mensajes, ultimo, hay_mas


def marcas_de_chat(mensajes: list[dict]) -> list[float]:
    """Segundos de los mensajes que cuentan: sin comandos ('!sorteo'), sin bots y sin repetidos."""
    vistos: set[str] = set()
    marcas = []
    for m in mensajes:
        texto = (m.get("texto") or "").strip()
        if not texto or texto.startswith("!") or (m.get("usuario") or "").lower() in BOTS:
            continue
        if m.get("id") in vistos:
            continue
        vistos.add(m.get("id"))
        marcas.append(float(m["t"]))
    return sorted(marcas)


def momentos(marcas: list[float], cuantos: int = 3, ventana: float = 10, antes: float = 22,
             dura: float = 45, min_dur: float = 30, max_dur: float = 75, umbral: float = 2.0,
             min_mensajes: int = 8, excluir: list[tuple[float, float]] | None = None) -> list[dict]:
    """Los mejores momentos a partir de las marcas de tiempo del chat (segundos del VOD).

    Cuenta mensajes por ventana, compara con la mediana de todo el tramo, junta las ventanas
    calientes contiguas y ordena los grupos por su pico. Cada momento empieza `antes` segundos
    antes de la ventana del pico y dura `dura` (más si la reacción se alarga, entre min_dur y
    max_dur). No se solapan entre sí ni con `excluir`. Devuelve
    [{inicio, fin, pico, mensajes, veces}] ordenados del mejor al peor."""
    if not marcas or cuantos <= 0:
        return []
    cuentas: dict[int, int] = {}
    for t in marcas:
        i = int(t // ventana)
        cuentas[i] = cuentas.get(i, 0) + 1
    primera, ultima = min(cuentas), max(cuentas)
    mediana = max(1.0, statistics.median(cuentas.get(i, 0) for i in range(primera, ultima + 1)))
    calientes = sorted(i for i, c in cuentas.items() if c >= min_mensajes and c >= umbral * mediana)
    grupos_: list[list[int]] = []
    for i in calientes:
        if grupos_ and i == grupos_[-1][-1] + 1:
            grupos_[-1].append(i)
        else:
            grupos_.append([i])
    candidatos = []
    for g in grupos_:
        cima = max(g, key=lambda i: cuentas[i])
        pico = cima * ventana
        inicio = max(0.0, pico - antes)
        fin_reaccion = (g[-1] + 1) * ventana + 10
        fin = min(max(inicio + dura, fin_reaccion), inicio + max_dur)
        fin = max(fin, inicio + min_dur)
        candidatos.append({"inicio": inicio, "fin": fin, "pico": pico, "mensajes": cuentas[cima],
                           "veces": round(cuentas[cima] / mediana, 1)})
    candidatos.sort(key=lambda c: (c["veces"], c["mensajes"]), reverse=True)
    ocupado = list(excluir or [])
    elegidos: list[dict] = []
    for c in candidatos:
        if any(c["inicio"] < f and i < c["fin"] for i, f in ocupado):
            continue
        elegidos.append(c)
        ocupado.append((c["inicio"], c["fin"]))
        if len(elegidos) == cuantos:
            break
    return elegidos


def momentos_con_umbrales(marcas: list[float], cuantos: int = 3, umbrales=(2.0, 1.5, 1.3), **kw) -> list[dict]:
    """`momentos` probando umbrales de más a menos exigente. En un directo grande el chat va
    siempre deprisa y un pico de 1,5 veces lo normal ya es una reacción clara; con el umbral
    de 2 no salía ninguno (pasó con Rubius el 18 de noviembre)."""
    for umbral in umbrales:
        elegidos = momentos(marcas, cuantos, umbral=umbral, **kw)
        if elegidos:
            return elegidos
    return []


def titulo_de_transcripcion(palabras: list[dict], max_palabras: int = 8, min_palabras: int = 3) -> str:
    """Primeras palabras con sentido de lo que se dice: sin muletillas al principio, hasta
    max_palabras o hasta el primer punto. Vacío si no hay al menos min_palabras."""
    textos = [(p.get("text") or "").strip() for p in palabras]
    textos = [t for t in textos if t]
    while textos and re.sub(r"[^\w]", "", textos[0]).lower() in RELLENO:
        textos.pop(0)
    salida = []
    for t in textos:
        salida.append(t)
        if len(salida) >= max_palabras or re.search(r"[.?!]$", t):
            break
    if len(salida) < min_palabras:
        return ""
    return titulo_limpio(" ".join(salida).rstrip(",;:- "))


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
        **(clip.get("extra") or {}),
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


def listar_vods(canal: str, tope: int = 10) -> list[dict]:
    url = f"https://www.twitch.tv/{canal}/videos?filter=archives"
    salida = ejecutar(["yt-dlp", "--socket-timeout", "20", "--flat-playlist",
                       "--playlist-end", str(tope), "-J", url], espera=120, intentos=3)
    entradas = json.loads(salida).get("entries")
    if not isinstance(entradas, list):
        raise RuntimeError(f"Twitch no ha devuelto la lista de VODs de {canal}")
    return entradas


def pedir_chat(vod: str, segundo: int, intentos: int = 3, espera: int = 20) -> list:
    """Una página de chat a partir de `segundo`. Reintenta con espera creciente."""
    cuerpo = json.dumps([{"operationName": "VideoCommentsByOffsetOrCursor",
                          "variables": {"videoID": vod, "contentOffsetSeconds": int(segundo)},
                          "extensions": {"persistedQuery": {"version": 1, "sha256Hash": GQL_CHAT_HASH}}}]).encode()
    ultimo = ""
    for i in range(intentos):
        try:
            req = urllib.request.Request(GQL_URL, cuerpo, {"Client-ID": GQL_CLIENT_ID,
                                                           "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=espera) as r:
                respuesta = json.load(r)
            parsear_comentarios(respuesta)  # falla si Twitch devuelve un error
            return respuesta
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError, OSError) as e:
            ultimo = str(e)
        if i + 1 < intentos:
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"No se pudo leer el chat del VOD {vod} en el segundo {segundo} tras {intentos} intentos: {ultimo}")


def bajar_chat(vod: str, desde: int, hasta: int, max_paginas: int = 800) -> list[dict]:
    """Mensajes del chat del VOD entre `desde` y `hasta` (segundos), paginando por tiempo.
    Cada página trae unos 60 mensajes y empieza un poco antes de lo pedido, así que se quitan
    repetidos por id. Con un chat muy rápido se corta en max_paginas y se avisa."""
    vistos: dict[str, dict] = {}
    pos = int(desde)
    for pagina in range(max_paginas):
        mensajes, ultimo, _ = parsear_comentarios(pedir_chat(vod, pos))
        for m in mensajes:
            vistos.setdefault(m["id"], m)
        if ultimo is None or ultimo >= hasta:
            break
        pos = ultimo if ultimo > pos else pos + 1
    else:
        print(f"AVISO: chat cortado en {max_paginas} páginas, llega hasta el segundo {pos} de {hasta}",
              file=sys.stderr)
    return sorted(vistos.values(), key=lambda m: m["t"])


def bajar_trozo(url: str, inicio: float, fin: float, carpeta: Path) -> Path:
    destino = carpeta / "original.mp4"
    if destino.exists() and destino.stat().st_size > 0:
        return destino
    ejecutar(["yt-dlp", "--socket-timeout", "20", "-f", "best[height<=1080]", "--merge-output-format", "mp4",
              "--download-sections", f"*{int(inicio)}-{int(fin)}", "-o", str(destino), url],
             espera=900, intentos=3)
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


def directo(args) -> int:
    run = uuid.uuid4().hex[:8]
    canal = validar_canal(args.canal)
    t0 = time.time()
    vod = elegir_vod(listar_vods(canal), args.vod)
    log(run, "vod", t0, f"{vod['id']} ({vod['duration'] / 3600:.1f} h) {vod['title'][:60]}")
    hasta = int(vod["duration"])
    desde = max(0, hasta - int(args.horas * 3600))
    hechos = leer_hechos()
    ocupados = [(h["inicio"], h["fin"]) for h in hechos.values()
                if h.get("vod") == vod["id"] and "inicio" in h and "fin" in h]
    t = time.time()
    mensajes = bajar_chat(vod["id"], desde, hasta)
    marcas = marcas_de_chat(mensajes)
    log(run, "chat", t, f"{len(mensajes)} mensajes, {len(marcas)} útiles entre {desde} y {hasta} s")
    elegidos = momentos_con_umbrales(marcas, args.cuantos, ventana=args.ventana, antes=args.antes,
                                     dura=args.dura, excluir=ocupados)
    for m in elegidos:
        print(f"[{run}] momento {m['inicio']:.0f}-{m['fin']:.0f} s: pico {m['mensajes']} mensajes "
              f"({m['veces']} veces lo normal)", flush=True)
    if not elegidos:
        log(run, "fin", t0, "ningún pico claro en el chat (o ya están hechos)")
        return 0
    fallos = 0
    for m in elegidos:
        inicio, fin = int(m["inicio"]), int(m["fin"])
        cid = f"directo-{vod['id']}-{inicio}"
        carpeta = SALIDA / canal / cid
        carpeta.mkdir(parents=True, exist_ok=True)
        destino = SALIDA / canal / f"{cid}.mp4"
        try:
            t = time.time()
            original = bajar_trozo(vod["url"], inicio, fin, carpeta)
            log(run, f"bajar {cid}", t, "ok")
            t = time.time()
            palabras = transcribir(original, carpeta, args.idioma)
            subs = grupos(palabras)
            log(run, f"subtítulos {cid}", t, f"{len(subs)} grupos")
            titulo = titulo_limpio(args.titulo) if args.titulo else (
                titulo_de_transcripcion(palabras) or f"Directo de {canal}")
            t = time.time()
            montar(original, carpeta, titulo, subs, canal, destino)
            apuntar_hecho({"id": cid, "title": titulo, "url": vod["url"],
                           "extra": {"vod": vod["id"], "inicio": inicio, "fin": fin,
                                     "mensajes_pico": m["mensajes"]}}, canal, destino)
            log(run, f"montar {cid}", t, f"{destino.relative_to(RAIZ)} titulo={titulo!r}")
        except (RuntimeError, OSError, ValueError) as e:
            fallos += 1
            print(f"[{run}] ERROR en el momento {cid}: {e}", file=sys.stderr)
    log(run, "fin", t0, f"{len(elegidos) - fallos} hechos, {fallos} con error")
    return 1 if fallos else 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("orden", choices=("listar", "hacer", "directo"))
    p.add_argument("canal")
    p.add_argument("--rango", choices=RANGOS, default="24hr")
    p.add_argument("--palabras", nargs="*", default=[], help="el título debe llevar alguna (p. ej. gta)")
    p.add_argument("--min-visitas", type=int, default=500, dest="min_visitas")
    p.add_argument("--min-dur", type=float, default=15, dest="min_dur")
    p.add_argument("--max-dur", type=float, default=60, dest="max_dur")
    p.add_argument("--cuantos", type=int, default=3)
    p.add_argument("--idioma", default="en")
    p.add_argument("--horas", type=float, default=3, help="directo: solo las últimas N horas del VOD")
    p.add_argument("--antes", type=float, default=22, help="directo: segundos antes del pico")
    p.add_argument("--dura", type=float, default=45, help="directo: duración del momento (30 a 75 s)")
    p.add_argument("--ventana", type=float, default=10, help="directo: segundos por ventana de chat")
    p.add_argument("--vod", help="directo: id del VOD (por defecto, el último)")
    p.add_argument("--titulo", help="directo: título de arriba (por defecto, de lo que se dice)")
    args = p.parse_args()
    try:
        if args.orden == "hacer":
            return hacer(args)
        if args.orden == "directo":
            return directo(args)
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
