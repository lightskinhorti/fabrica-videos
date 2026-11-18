#!/usr/bin/env python3
"""Una tanda de clips: recorre los canales de datos/clips_canales.json y, de cada uno,
saca los clips más vistos del día y los mejores momentos de su último directo.

    voces/.venv/bin/python herramientas/clips_tanda.py            (todo)
    voces/.venv/bin/python herramientas/clips_tanda.py --solo-clips   (rápido, sin directos)

Solo fabrica: lo que sale queda pendiente en la cola (clips_cola.py pendientes). Repetirla
no duplica nada, porque clips.py apunta lo hecho. Si un canal falla, sigue con el siguiente.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CONFIG = RAIZ / "datos" / "clips_canales.json"
CLIPS = RAIZ / "herramientas" / "clips.py"


def ordenes(config: dict, solo_clips: bool = False) -> list[list[str]]:
    """Las órdenes de clips.py que tocan, canal a canal (función pura, con prueba)."""
    canales = config.get("canales")
    if not isinstance(canales, list) or not canales:
        raise ValueError("clips_canales.json no tiene la lista 'canales'")
    n_clips = str(int(config.get("clips_por_canal", 3)))
    n_mom = str(int(config.get("momentos_por_canal", 2)))
    salida = []
    for c in canales:
        if not c.get("canal"):
            raise ValueError("Hay un canal sin nombre en clips_canales.json")
        idioma = c.get("idioma", "es")
        salida.append(["hacer", c["canal"], "--min-visitas", str(int(c.get("min_visitas", 300))),
                       "--min-dur", "14", "--cuantos", n_clips, "--idioma", idioma])
        if not solo_clips:
            salida.append(["directo", c["canal"], "--horas", str(c.get("horas_directo", 1)),
                           "--cuantos", n_mom, "--idioma", idioma])
    return salida


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--solo-clips", action="store_true")
    p.add_argument("--espera", type=int, default=1500, help="segundos como mucho por orden")
    args = p.parse_args()
    try:
        lista = ordenes(json.loads(CONFIG.read_text(encoding="utf-8")), args.solo_clips)
    except (OSError, ValueError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    fallos = 0
    for orden in lista:
        t0 = time.time()
        try:
            r = subprocess.run([sys.executable, str(CLIPS), *orden], cwd=RAIZ, timeout=args.espera,
                               capture_output=True, text=True)
            ultima = (r.stdout.strip().splitlines() or [""])[-1]
            error = (r.stderr.strip().splitlines() or [""])[-1] if r.returncode else ""
            fallos += 1 if r.returncode else 0
            print(f"{orden[0]} {orden[1]}: {ultima} {error} ({time.time() - t0:.0f} s)", flush=True)
        except subprocess.TimeoutExpired:
            fallos += 1
            print(f"{orden[0]} {orden[1]}: sin terminar en {args.espera} s", flush=True)
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
