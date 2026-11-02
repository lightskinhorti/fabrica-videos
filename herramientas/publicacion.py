"""Texto de publicación y portada de un vídeo (R12 del PRD).

Uso:
    python3 publicacion.py <carpeta del vídeo> <video.mp4>

Escribe <carpeta>/publicacion.md con la descripción lista para copiar, los hashtags, la hora y lo que
hay que comprobar al subirlo (la etiqueta de IA). Saca la portada del segundo 1, donde se ve la
pregunta en grande, en exports/render/<video>-portada.png. Para la versión sin voz (<video>-texto.mp4)
escribe publicacion-texto.md, con el recordatorio de añadir la canción en TikTok.

La descripción y los hashtags propios del vídeo salen de "publicacion" en guion.json:
    "publicacion": { "descripcion": "...", "hashtags": ["#gatos", ...] }
Si no está, usa el título y la pregunta final del guion.
"""
import json
import os
import re
import subprocess
import sys

carpeta, mp4 = sys.argv[1], sys.argv[2]
nombre = os.path.basename(os.path.normpath(carpeta))
cuenta = os.path.basename(os.path.dirname(os.path.normpath(carpeta)))
guion = json.load(open(os.path.join(carpeta, "guion.json"), encoding="utf-8"))
pub = guion.get("publicacion", {})

# hashtags shared by every video of the account, then the video's own
COMUNES = {
    "elcontadorloco": ["#quepasariasi", "#curiosidades", "#datoscuriosos", "#parati"],
    "lascosaspordentro": ["#comofunciona", "#tecnologia", "#curiosidades", "#parati"],
    "dinerosinlio": ["#dinero", "#finanzaspersonales", "#economia", "#parati"],
}
hashtags = COMUNES.get(cuenta, ["#curiosidades", "#parati"]) + [h for h in pub.get("hashtags", []) if h not in COMUNES.get(cuenta, [])]

if "descripcion" in pub:
    descripcion = pub["descripcion"]
else:
    final = re.sub(r"\s*Te leo en los comentarios\.?", "", guion["lines"][-1]).strip()
    descripcion = f"{guion['titulo']} {final} Valores aproximados."

texto_mode = os.path.basename(mp4).endswith("-texto.mp4")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4], capture_output=True, text=True).stdout)
portada = mp4[: -len(".mp4")] + "-portada.png"
# "portada_en": seconds, or a word of the voice (the frame 0.35 s after it starts, so its caption is selected,
# but before it ends: a short word can be followed at once by the next caption group)
en = pub.get("portada_en", 1.0)
if isinstance(en, str):
    voz = json.load(open(os.path.join(carpeta, "vozdata.json"), encoding="utf-8"))
    quita = lambda s: re.sub(r"\W", "", s.lower())
    todas = [w for l in voz["lines"] for w in l["words"]] + [{"s": 1e9}]
    i = next(k for k, w in enumerate(todas) if quita(w.get("w", "")).startswith(quita(en)))
    # the next caption group can start 0.06 s before the next word: stay 0.1 s before it
    en = min(todas[i]["s"] + 0.35, todas[i + 1]["s"] - 0.1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{en:.2f}", "-i", mp4, "-frames:v", "1", portada], check=True)
raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(carpeta))))
rel = lambda p: os.path.relpath(os.path.abspath(p), raiz)

texto = f"""# Publicación: {guion['titulo']}

- **Cuenta:** @{cuenta} en TikTok (y en Instagram cuando toque)
- **Vídeo:** `{rel(mp4)}` ({f'{dur:.1f}'.replace('.', ',')} s)
- **Portada:** `{rel(portada)}` (el segundo {f'{en:.1f}'.replace('.', ',')}, con el gancho en pantalla)
- **Hora:** 18:00, 20:00 o 22:00, la franja libre de ese día

## Descripción (copiar y pegar)

{descripcion}

{' '.join(hashtags)}

## Al subirlo

- [ ] Activar "Contenido generado con IA" (en Más opciones). Siempre, aunque no parezca real.
- [ ] Portada: el fotograma del gancho (el de la imagen de portada).
- [ ] Comprobar que dura más de 1 minuto.
- [ ] Verlo entero una vez antes de programarlo.
"""
if texto_mode:
    texto += "- [ ] Añadir una canción de moda desde la biblioteca de sonidos de TikTok (no va dentro del vídeo, para que no lo silencien) y subirla por encima de los efectos.\n"
salida = os.path.join(carpeta, "publicacion-texto.md" if texto_mode else "publicacion.md")
open(salida, "w", encoding="utf-8").write(texto)
print(f"  publicación: {rel(salida)} y portada {rel(portada)}")
