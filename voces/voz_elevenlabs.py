"""Genera el guion con voces de ElevenLabs en español de España.

Necesita una clave de API de una cuenta PERSONAL de ElevenLabs (el plan gratis
basta para la prueba: gasta unos 1.300 de sus 10.000 créditos al mes). La clave
se lee de la variable ELEVENLABS_KEY. Solo usa la biblioteca estándar de Python.

Busca en la biblioteca de voces las 2 voces de hombre en español más usadas que
permiten el plan gratis y las prueba con los modelos v3 y Multilingual v2.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import wave

KEY = os.environ.get("ELEVENLABS_KEY")
if not KEY:
    sys.exit("Falta la clave: ejecuta primero  export ELEVENLABS_KEY=tu_clave")

BASE = "https://api.elevenlabs.io"
HERE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.normpath(os.path.join(HERE, "..", "exports", "voces"))
os.makedirs(SALIDA, exist_ok=True)
guion = json.load(open(os.path.join(HERE, "guion.json"), encoding="utf-8"))
texto = " ".join(guion["lines"])
SR = 24000


def call(path, body=None, raw=False):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, headers={"xi-api-key": KEY, "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        contenido = r.read()
    return contenido if raw else json.loads(contenido.decode("utf-8"))


def error(e):
    return f"{e.code} {e.read().decode('utf-8', 'replace')[:200]}"


modelos = [m["model_id"] for m in call("/v1/models")]
elegidos = [m for m in ("eleven_v3", "eleven_multilingual_v2") if m in modelos]
print("Modelos:", ", ".join(elegidos))

query = urllib.parse.urlencode({"language": "es", "gender": "male", "page_size": 50, "sort": "usage_character_count_1y"})
biblioteca = call(f"/v1/shared-voices?{query}")["voices"]
espana = [
    v for v in biblioteca
    if v.get("free_users_allowed", True)
    and any(p in (v.get("accent") or "").lower() for p in ("peninsular", "castilian", "spain", "european"))
]
voces = (espana or biblioteca)[:2]
if not voces:
    sys.exit("No aparecen voces en español en la biblioteca.")
print("Voces:", ", ".join(f"{v['name']} ({v.get('accent')})" for v in voces))

for v in voces:
    for modelo in elegidos:
        body = {"text": texto, "model_id": modelo}
        ruta = f"/v1/text-to-speech/{v['voice_id']}?output_format=pcm_{SR}"
        try:
            audio = call(ruta, body, raw=True)
        except urllib.error.HTTPError as e:
            # Algunas cuentas solo pueden usar voces de la biblioteca después de añadirlas a "Mis voces".
            if e.code not in (400, 403, 404):
                print("Falló", v["name"], modelo, "->", error(e))
                continue
            try:
                call(f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": v["name"]})
                audio = call(ruta, body, raw=True)
            except urllib.error.HTTPError as e2:
                print("Falló", v["name"], modelo, "->", error(e2))
                continue
        nombre = "".join(c for c in v["name"].split()[0].lower() if c.isalnum())
        salida = os.path.join(SALIDA, f"eleven_{nombre}_{modelo.replace('eleven_', '')}.wav")
        with wave.open(salida, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(audio)
        print("Creado", os.path.basename(salida))

sub = call("/v1/user/subscription")
print(f"Créditos usados este mes: {sub['character_count']} de {sub['character_limit']}")
