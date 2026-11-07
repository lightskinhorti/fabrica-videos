#!/bin/bash
# Del guion al vídeo terminado, para una carpeta de vídeo con guion.json e index.html.
# Uso: bash herramientas/producir.sh videos/<cuenta>/<video> [voz.wav] [--sin-render] [--texto]
# Sin voz.wav usa exports/voces/<video>.wav. Si la voz no existe, la genera con Gemini
# (la clave se lee del .env de la raíz del proyecto). Si la voz no llega a 60 s, avisa antes de mezclar y renderizar.
# Al final deja publicacion.md (descripción, hashtags, portada) y pasa el control automático (control.py).
# Con --texto hace la versión sin voz: frases cortas de "texto" en guion.json, solo efectos de sonido
# (la canción se pone al publicar en TikTok) y sale en exports/render/<video>-texto.mp4.
set -e
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="$(cd "$1" && pwd)"
NOMBRE="$(basename "$VIDEO")"
VOZ_GEMINI="es-es-concierge-12"
VOZ="$RAIZ/exports/voces/$NOMBRE.wav"
SIN_RENDER=""
TEXTO=""
for a in "${@:2}"; do
  if [ "$a" = "--sin-render" ]; then SIN_RENDER=1
  elif [ "$a" = "--texto" ]; then TEXTO=1
  else VOZ="$(cd "$(dirname "$a")" && pwd)/$(basename "$a")"; fi
done
PY="$RAIZ/voces/.venv/bin/python"
# each account has its own sound script (its scene engine is linked as comun/ in the video folder)
CUENTA="$(basename "$(dirname "$VIDEO")")"
if [ "$CUENTA" = "lascosaspordentro" ] || [ "$CUENTA" = "dinerosinlio" ]; then SONIDO="sonido_pordentro.py"; else SONIDO="sonido_contador.py"; fi

if [ -n "$TEXTO" ]; then
  echo "1-2/6 Modo texto: tiempos de cada frase, sin voz"
  python3 "$RAIZ/herramientas/vozdata.py" "$VIDEO/guion.json" --texto > "$VIDEO/vozdata.json"
  VOZ="-"
  NOMBRE="$NOMBRE-texto"
else

if [ ! -f "$VOZ" ]; then
  echo "0/6 Generando la voz con Gemini ($VOZ_GEMINI)"
  python3 "$RAIZ/voces/voz_gemini.py" --guion "$VIDEO/guion.json" --salida "$(basename "$VOZ" .wav)" "$VOZ_GEMINI"
  VOZ="$RAIZ/exports/voces/$(basename "$VOZ")"
  [ -f "$VOZ" ] || { echo "No se ha creado la voz: mira el error de arriba"; exit 1; }
fi

# a voice under 60 s gives a video under or just over 1 minute (voice + 1.2 s, as montar.py does), and TikTok only
# pays videos of more than 1 minute: say so now, before the mix and the render, not only in the final check
python3 - "$VOZ" <<'FIN'
import math, sys, wave
with wave.open(sys.argv[1]) as w:
    voz = w.getnframes() / w.getframerate()
video = math.ceil((voz + 1.2) * 10) / 10
coma = lambda x: f"{x:.1f}".replace(".", ",")
if voz < 60:
    print(f"AVISO: la voz dura {coma(voz)} s, menos de 60. El vídeo saldrá de {coma(video)} s.")
    if video <= 60:
        print("       TikTok solo paga vídeos de más de 1 minuto y el control dará error: alarga el guion.")
    else:
        print("       Pasa el minuto solo por el margen del final: mejor alargar el guion una frase.")
FIN

echo "1/6 Transcribiendo la voz (Whisper, español)"
(cd "$VIDEO" && npx -y hyperframes@0.8.228 transcribe "$VOZ" --engine whisper --model small --language es -d "$VIDEO" > /dev/null)

echo "2/6 Tiempos de cada palabra"
python3 "$RAIZ/herramientas/vozdata.py" "$VIDEO/guion.json" "$VIDEO/transcript.json" --audio "$VOZ" > "$VIDEO/vozdata.json"
fi

echo "3/6 Montando el HTML"
python3 "$RAIZ/herramientas/montar.py" "$VIDEO/index.html" "$VIDEO/vozdata.json" --audio

echo "4/6 Efectos, música y mezcla"
"$PY" "$RAIZ/herramientas/$SONIDO" "$VIDEO" "$VOZ"
python3 "$RAIZ/herramientas/volumen.py" "$VIDEO/assets/mezcla.wav" "$([ -n "$TEXTO" ] && echo -20 || echo -14)"

echo "5/6 Revisión"
(cd "$VIDEO" && npx -y hyperframes@0.8.228 check --json 2>/dev/null | python3 -c "
import json, sys
d = json.load(sys.stdin)
malos = [(k, f) for k, v in d.items() if isinstance(v, dict) for f in v.get('findings', []) if f.get('severity') == 'error']
for k, f in malos: print('  ERROR', k, f.get('code'), f.get('selector'), f.get('message', '')[:120])
print('  revisión sin errores' if not malos else f'  {len(malos)} errores')
")

if [ -z "$SIN_RENDER" ]; then
  mkdir -p "$RAIZ/exports/render"
  (cd "$VIDEO" && npx -y hyperframes@0.8.228 render --browser-gpu -o "$RAIZ/exports/render/$NOMBRE.mp4" 2>&1 | grep -E "rendered in|✗")
  python3 "$RAIZ/herramientas/volumen.py" "$RAIZ/exports/render/$NOMBRE.mp4" "$([ -n "$TEXTO" ] && echo -20 || echo -14)"
  python3 "$RAIZ/herramientas/publicacion.py" "$VIDEO" "$RAIZ/exports/render/$NOMBRE.mp4"
  echo "6/6 Control automático"
  "$PY" "$RAIZ/herramientas/control.py" "$VIDEO" "$RAIZ/exports/render/$NOMBRE.mp4"
else
  echo "6/6 Control automático (sin vídeo: la duración es la prevista y el volumen no se mide)"
  "$PY" "$RAIZ/herramientas/control.py" "$VIDEO"
fi
