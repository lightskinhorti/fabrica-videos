"""Mete los tiempos de la voz en el index.html de un vídeo y ajusta su duración.

Uso:
    python3 montar.py index.html vozdata.json [--audio]

- Sustituye el bloque <script id="vozdata">.
- La duración del vídeo es la de la voz más 1,2 s, redondeada hacia arriba a décimas,
  y se cambia en todos los data-duration y en la línea de tiempo.
- Con --audio añade (si no está) <audio id="mezcla" src="assets/mezcla.wav">.
"""
import json
import math
import re
import sys

args = sys.argv[1:]
con_audio = "--audio" in args
args = [a for a in args if a != "--audio"]
ruta, vozdata = args[0], json.load(open(args[1], encoding="utf-8"))
html = open(ruta, encoding="utf-8").read()

dur = math.ceil((vozdata["duration"] + 1.2) * 10) / 10
patron = r'(<script id="vozdata" type="application/json">)(.*?)(</script>)'
if len(re.findall(patron, html, re.S)) != 1:
    sys.exit("No encuentro un único bloque <script id=\"vozdata\"> en " + ruta)
html = re.sub(patron, lambda m: m.group(1) + json.dumps(vozdata, ensure_ascii=False) + m.group(3), html, count=1, flags=re.S)
html = re.sub(r'data-duration="[\d.]+"', f'data-duration="{dur:g}"', html)
html = re.sub(r"tl\.to\(\{\}, \{ duration: [\d.]+ \}, 0\)", f"tl.to({{}}, {{ duration: {dur:g} }}, 0)", html)
if con_audio and 'id="mezcla"' not in html:
    html = html.replace(
        '<div id="caps"',
        f'<audio id="mezcla" src="assets/mezcla.wav" data-start="0" data-duration="{dur:g}"></audio>\n      <div id="caps"',
        1,
    )
open(ruta, "w", encoding="utf-8").write(html)
print(f"Montado: {ruta} · {dur:g} s · {sum(len(l['words']) for l in vozdata['lines'])} palabras")
