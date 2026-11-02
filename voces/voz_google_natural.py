"""Genera Charon (Chirp 3 HD) leyendo el guion entero de una vez, no frase a frase.

Usa la misma clave que voz_google.py (variable GOOGLE_TTS_KEY) y solo la
biblioteca estándar de Python.
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request
import wave

KEY = os.environ.get("GOOGLE_TTS_KEY")
if not KEY:
    sys.exit("Falta la clave: ejecuta primero  export GOOGLE_TTS_KEY=tu_clave")

URL = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={KEY}"
HERE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.normpath(os.path.join(HERE, "..", "exports", "voces"))
os.makedirs(SALIDA, exist_ok=True)
guion = json.load(open(os.path.join(HERE, "guion.json"), encoding="utf-8"))
texto = "\n".join(guion["lines"])
SR = 24000

pruebas = [
    ("google_charon_entero.wav", {"languageCode": "es-ES", "name": "es-ES-Chirp3-HD-Charon"}, None),
    # Gemini TTS en Cloud no acepta claves de API (pide OAuth): está en voz_gemini.py, vía AI Studio.
]

for archivo, voz, estilo in pruebas:
    entrada = {"text": texto}
    if estilo:
        entrada["prompt"] = estilo
    body = {
        "input": entrada,
        "voice": voz,
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": SR},
    }
    req = urllib.request.Request(
        URL, data=json.dumps(body).encode("utf-8"), headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            audio = base64.b64decode(json.loads(r.read().decode("utf-8"))["audioContent"])
    except urllib.error.HTTPError as e:
        print("Falló", archivo, "->", e.code, e.read().decode("utf-8", "replace")[:300])
        continue
    with wave.open(os.path.join(SALIDA, archivo), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(audio[44:] if audio[:4] == b"RIFF" else audio)
    print("Creado", archivo)
