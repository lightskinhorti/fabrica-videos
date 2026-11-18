#!/usr/bin/env python3
"""Foto de perfil de la cuenta de clips: voces/.venv/bin/python perfiles/clips/foto.py
Texto propio sobre un color plano (sin logotipos de Rockstar ni de ningún streamer).
Todo cabe en el círculo central, que es lo que enseña TikTok."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent.parent
FUENTE = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
N = 1000
img = Image.new("RGB", (N, N), (255, 90, 54))
d = ImageDraw.Draw(img)


def centrado(texto, tam, y, color):
    f = ImageFont.truetype(FUENTE, tam)
    w = d.textlength(texto, font=f)
    d.text(((N - w) / 2, y), texto, font=f, fill=color)


# triángulo de "play" arriba
d.polygon([(450, 170), (450, 290), (560, 230)], fill=(17, 24, 39))
centrado("GTA 6", 230, 300, (255, 255, 255))
# etiqueta amarilla con CLIPS
d.rounded_rectangle((250, 590, 750, 770), radius=28, fill=(255, 221, 51))
centrado("CLIPS", 130, 600, (17, 24, 39))
img.save(RAIZ / "exports" / "perfiles" / "clips.png")
img.resize((400, 400)).save(RAIZ / "exports" / "perfiles" / "clips-400.jpg", quality=92)
print("ok")
