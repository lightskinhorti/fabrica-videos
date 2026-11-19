#!/usr/bin/env python3
"""Cola de subida de los clips: qué hay hecho y sin subir, prepararlo y marcarlo.

    voces/.venv/bin/python herramientas/clips_cola.py pendientes
    voces/.venv/bin/python herramientas/clips_cola.py preparar <id> --titulo "Título de arriba"
    voces/.venv/bin/python herramientas/clips_cola.py subido <id> --descripcion "texto publicado"
    voces/.venv/bin/python herramientas/clips_cola.py descartar <id> --motivo "no se entiende"
    voces/.venv/bin/python herramientas/clips_cola.py hoy

`pendientes` enseña cada clip sin subir con lo que se dice en él (para decidir si vale).
`preparar` lo vuelve a montar con el título dado y deja en exports/clips/subida/<id>.mp4
una copia de menos de 9,5 MB (el límite de la subida desde Chrome son 10 MB).
`subido` y `descartar` lo apuntan en datos/clips_hechos.json; repetirlos no cambia nada.
`hoy` dice cuántos se han subido hoy (para respetar el tope diario). No sube nada.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clips  # noqa: E402

SUBIDA = clips.SALIDA / "subida"
TOPE_BYTES = 9_500_000


# ---------- lógica (con pruebas en tests/test_clips_cola.py) ----------

def pendientes(hechos: dict) -> list[tuple[str, dict]]:
    """Clips ni subidos ni descartados, del más nuevo al más viejo."""
    libres = [(i, d) for i, d in hechos.items() if not d.get("subido") and not d.get("descartado")]
    return sorted(libres, key=lambda par: par[1].get("hecho") or "", reverse=True)


def subidos_el(hechos: dict, dia: str) -> int:
    return sum(1 for d in hechos.values() if str(d.get("subido") or "").startswith(dia))


def kbps_para(dur: float, tope_bytes: int = TOPE_BYTES, audio_kbps: int = 128) -> int:
    """Bitrate de vídeo para que un clip de `dur` segundos quepa en el tope, con margen."""
    if dur <= 0:
        raise ValueError("La duración tiene que ser mayor que cero")
    total = tope_bytes * 8 / dur / 1000 * 0.94
    return max(300, int(total - audio_kbps))


FUERTES = re.compile(r"\b(put[ao]s?)\b", re.IGNORECASE)


def censurar(texto: str) -> str:
    """Tapa en los subtítulos los insultos más fuertes (deja la inicial): TikTok lee el texto
    en pantalla y puede limitar el vídeo. La voz no se toca."""
    return FUERTES.sub(lambda m: m.group(1)[0] + "*" * (len(m.group(1)) - 1), texto)


def texto_de(palabras: list[dict], maximo: int = 420) -> str:
    return " ".join((p.get("text") or "").strip() for p in palabras)[:maximo]


# ---------- pasos con disco y ffmpeg ----------

def _original(carpeta: Path) -> Path:
    directo = carpeta / "original.mp4"
    if directo.exists():
        return directo
    otros = sorted(carpeta.glob("*.mp4"))
    if not otros:
        raise RuntimeError(f"No encuentro el vídeo original en {carpeta}")
    return otros[0]


def _guardar(hechos: dict) -> None:
    tmp = clips.HECHOS.with_suffix(".tmp")
    tmp.write_text(json.dumps(hechos, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(clips.HECHOS)


def _dato(hechos: dict, ident: str) -> dict:
    if ident not in hechos:
        raise ValueError(f"No hay ningún clip con id {ident} en {clips.HECHOS.name}")
    return hechos[ident]


def preparar(ident: str, titulo: str) -> Path:
    hechos = clips.leer_hechos()
    dato = _dato(hechos, ident)
    carpeta = clips.SALIDA / dato["canal"] / ident
    original = _original(carpeta)
    palabras = json.loads((carpeta / "transcript.json").read_text(encoding="utf-8"))
    montado = clips.SALIDA / dato["canal"] / f"{ident}.mp4"
    subs = [{**g, "text": censurar(g["text"])} for g in clips.grupos(palabras)]
    clips.montar(original, carpeta, clips.titulo_limpio(titulo, 70), subs, dato["canal"], montado)
    SUBIDA.mkdir(parents=True, exist_ok=True)
    destino = SUBIDA / f"{ident}.mp4"
    if montado.stat().st_size <= TOPE_BYTES:
        destino.write_bytes(montado.read_bytes())
    else:
        dur = float(clips.ejecutar(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "csv=p=0", str(montado)], espera=60).strip())
        kbps = kbps_para(dur)
        clips.ejecutar(["ffmpeg", "-y", "-loglevel", "error", "-i", str(montado), "-c:v", "libx265",
                        "-tag:v", "hvc1", "-preset", "medium", "-b:v", f"{kbps}k", "-maxrate", f"{kbps}k",
                        "-bufsize", f"{kbps * 2}k", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                        "-movflags", "+faststart", str(destino)], espera=900)
        if destino.stat().st_size > 10_000_000:
            raise RuntimeError(f"La copia de {ident} pesa {destino.stat().st_size} bytes: no cabe en la subida")
    dato["titulo_final"] = titulo
    dato["subida"] = str(destino.relative_to(clips.RAIZ))
    _guardar(hechos)
    return destino


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("orden", choices=("pendientes", "preparar", "subido", "descartar", "hoy"))
    p.add_argument("id", nargs="?")
    p.add_argument("--titulo")
    p.add_argument("--descripcion", default="")
    p.add_argument("--motivo", default="")
    args = p.parse_args()
    try:
        hechos = clips.leer_hechos()
        hoy = time.strftime("%Y-%m-%d")
        if args.orden == "hoy":
            print(subidos_el(hechos, hoy))
            return 0
        if args.orden == "pendientes":
            for ident, d in pendientes(hechos):
                ruta = clips.SALIDA / d["canal"] / ident / "transcript.json"
                dicho = texto_de(json.loads(ruta.read_text(encoding="utf-8"))) if ruta.exists() else "(sin transcripción)"
                print(f"## {ident} | {d['canal']} | visitas en Twitch: {d.get('visitas_twitch')} | "
                      f"pico de chat: {d.get('mensajes_pico')} | título original: {d.get('titulo')}\n   {dicho}")
            return 0
        if not args.id:
            raise ValueError("Falta el id del clip")
        if args.orden == "preparar":
            if not (args.titulo or "").strip():
                raise ValueError("Falta --titulo")
            destino = preparar(args.id, args.titulo.strip())
            print(f"{destino} {destino.stat().st_size} bytes")
            return 0
        dato = _dato(hechos, args.id)
        if args.orden == "subido":
            dato.setdefault("subido", time.strftime("%Y-%m-%d %H:%M"))
            if args.descripcion:
                dato["descripcion"] = args.descripcion
        else:
            dato.setdefault("descartado", args.motivo or "sin motivo")
        _guardar(hechos)
        print("apuntado")
        return 0
    except (RuntimeError, ValueError, OSError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
