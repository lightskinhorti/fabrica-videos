"""Genera el guion con Gemini TTS (Google AI Studio), que acepta instrucciones de estilo.

Necesita una clave de API de Google AI Studio (aistudio.google.com) con tu
cuenta PERSONAL, de un proyecto SIN facturación para usar el plan gratis. La
clave se lee de la variable GEMINI_API_KEY. Solo usa la biblioteca estándar.

Uso:
    python3 voz_gemini.py              # las 3 voces de hombre de España más jóvenes
    python3 voz_gemini.py ID1 ID2 ...  # voces concretas (ver voces_gemini_lista.txt)

Siempre guarda en voces_gemini_lista.txt todas las voces de hombre de España.
"""
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import wave

KEY = os.environ.get("GEMINI_API_KEY")
if not KEY:
    sys.exit("Falta la clave: ejecuta primero  export GEMINI_API_KEY=tu_clave")

BASE = "https://generativelanguage.googleapis.com/v1beta"
MODELO = "gemini-3.8-flash-tts"
HERE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.normpath(os.path.join(HERE, "..", "exports", "voces"))
os.makedirs(SALIDA, exist_ok=True)
guion = json.load(open(os.path.join(HERE, "guion.json"), encoding="utf-8"))
texto = " ".join(guion["lines"])
SR = 24000

ESTILO = (
    "Chico joven de unos 25 años, de Madrid. Acento castellano peninsular claro, con la ce y la zeta "
    "bien marcadas, sin seseo ni acento latinoamericano. Cuenta una curiosidad en un vídeo corto: tono "
    "cercano y con ganas de sorprender, ritmo ágil, natural, sin sonar a anuncio ni a locutor de radio."
)


def call(path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, headers={"x-goog-api-key": KEY, "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode("utf-8"))


def edad(v):
    m = re.search(r"(\d{2})-year-old", v.get("description", ""))
    return int(m.group(1)) if m else 99


catalogo, token = [], None
while True:
    params = {"language_code": "es-ES", "region_code": "ES", "gender": "male", "type": "prebuilt", "page_size": 100}
    if token:
        params["page_token"] = token
    pagina = call("/voices?" + urllib.parse.urlencode(params))
    catalogo += pagina.get("voices", [])
    token = pagina.get("next_page_token") or pagina.get("nextPageToken")
    if not token:
        break
catalogo.sort(key=edad)
with open(os.path.join(HERE, "voces_gemini_lista.txt"), "w", encoding="utf-8") as f:
    for v in catalogo:
        f.write(f"{v['id']} | {v.get('display_name')} | {v.get('description', '')}\n")
print(f"{len(catalogo)} voces de hombre de España guardadas en voces_gemini_lista.txt")

voces = sys.argv[1:] or [v["id"] for v in catalogo[:3]]
for v in catalogo:
    if v["id"] in voces:
        print("Pruebo:", v["id"], "|", v.get("description", "")[:100])

for voz in voces:
    body = {
        "model": MODELO,
        "input": [{
            "type": "user_input",
            "content": [{
                "type": "text",
                "text": texto,
                "annotations": [{"type": "speech_metadata", "style": ESTILO}],
            }],
        }],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voz}]},
    }
    try:
        respuesta = call("/interactions", body)
    except urllib.error.HTTPError as e:
        print("Falló", voz, "->", e.code, e.read().decode("utf-8", "replace")[:300])
        continue
    audios = [
        c["data"]
        for paso in respuesta.get("steps", []) if paso.get("type") == "model_output"
        for c in paso.get("content", []) if c.get("type") == "audio"
    ]
    if not audios:
        print("Falló", voz, "-> la respuesta no trae audio")
        continue
    audio = base64.b64decode(audios[-1])
    nombre = "".join(c for c in voz.lower() if c.isalnum())
    salida = os.path.join(SALIDA, f"gemini_{nombre}.wav")
    if audio[:4] == b"RIFF":
        with open(salida, "wb") as f:
            f.write(audio)
    else:
        with wave.open(salida, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(audio)
    print("Creado", os.path.basename(salida))
