"""Genera el guion con las voces Chirp 3 HD de Google en español de España.

Necesita una clave de API de un proyecto PERSONAL de Google Cloud con la API
Cloud Text-to-Speech activada. La clave se lee de la variable GOOGLE_TTS_KEY.
Solo usa la biblioteca estándar de Python (no hay que instalar nada).
"""
import base64
import json
import os
import sys
import urllib.request
import wave

KEY = os.environ.get("GOOGLE_TTS_KEY")
if not KEY:
    sys.exit("Falta la clave: ejecuta primero  export GOOGLE_TTS_KEY=tu_clave")

BASE = "https://texttospeech.googleapis.com/v1"
HERE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.normpath(os.path.join(HERE, "..", "exports", "voces"))
os.makedirs(SALIDA, exist_ok=True)
guion = json.load(open(os.path.join(HERE, "guion.json"), encoding="utf-8"))
SR = 24000


def call(url, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


voices = call(f"{BASE}/voices?languageCode=es-ES&key={KEY}")["voices"]
chirp = sorted(v["name"] for v in voices if "Chirp3-HD" in v["name"] and v["name"].startswith("es-ES"))
if not chirp:
    sys.exit("No aparecen voces Chirp 3 HD para es-ES con esta clave.")
preferidas = ["es-ES-Chirp3-HD-Charon", "es-ES-Chirp3-HD-Orus", "es-ES-Chirp3-HD-Kore", "es-ES-Chirp3-HD-Aoede"]
elegidas = [v for v in preferidas if v in chirp] or chirp[:4]
print("Voces disponibles:", len(chirp), "| Pruebo:", ", ".join(elegidas))

silencio = b"\x00\x00" * int(SR * guion["pausa_segundos"])
for name in elegidas:
    trozos = []
    for linea in guion["lines"]:
        body = {
            "input": {"text": linea},
            "voice": {"languageCode": "es-ES", "name": name},
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": SR},
        }
        audio = base64.b64decode(call(f"{BASE}/text:synthesize?key={KEY}", body)["audioContent"])
        trozos.append(audio[44:] if audio[:4] == b"RIFF" else audio)
        trozos.append(silencio)
    salida = os.path.join(SALIDA, f"google_{name.split('-')[-1].lower()}.wav")
    with wave.open(salida, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(trozos))
    print("Creado", os.path.basename(salida))
