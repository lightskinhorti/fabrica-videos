"""Deja una mezcla a -14 LUFS, el volumen habitual en redes, sin pasar de -1,5 dB de pico.

Uso:
    python3 volumen.py assets/mezcla.wav [objetivo]
    python3 volumen.py exports/render/video.mp4 [objetivo]   (solo cambia el audio; al renderizar, HyperFrames lo sube unos 3 dB)

El objetivo por defecto es -14. En el modo texto se usa -20: solo hay efectos y la canción de TikTok va encima.

Mide el volumen con ffmpeg, aplica la ganancia que falta y un limitador para los picos.
Sobrescribe el archivo.
"""
import os
import re
import subprocess
import sys


def medir(ruta):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", ruta, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


ruta = sys.argv[1]
OBJETIVO = float(sys.argv[2]) if len(sys.argv) > 2 else -14.0
antes = ahora = medir(ruta)
mp4 = ruta.endswith(".mp4")
tmp = ruta + (".tmp.mp4" if mp4 else ".tmp.wav")
salida = ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k"] if mp4 else ["-ar", "48000"]
# the limiter eats part of the gain, so repeat until we are within half a unit
for _ in range(4):
    if abs(ahora - OBJETIVO) < 0.5:
        break
    filtro = f"volume={OBJETIVO - ahora:.2f}dB,alimiter=limit=0.84:level=false"
    subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", ruta, "-af", filtro, *salida, tmp],
                   check=True, capture_output=True)
    os.replace(tmp, ruta)
    ahora = medir(ruta)
print(f"  volumen: {antes:.1f} -> {ahora:.1f} LUFS")
