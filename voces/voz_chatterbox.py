"""Genera el guion con Chatterbox Multilingual V3 (licencia MIT) en tu Mac.

Usa la voz por defecto del modelo. No clones la voz de ninguna persona real.
Instalación (una vez):
    python3.11 -m venv .venv
    .venv/bin/pip install chatterbox-tts "setuptools<81"
"""
import json
import os

import torch
import torchaudio as ta

HERE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.normpath(os.path.join(HERE, "..", "exports", "voces"))
os.makedirs(SALIDA, exist_ok=True)
guion = json.load(open(os.path.join(HERE, "guion.json"), encoding="utf-8"))

device = "mps" if torch.backends.mps.is_available() else "cpu"
print("Usando", device)

# Los pesos se guardaron en una gráfica NVIDIA: en Mac hay que cargarlos en el dispositivo local.
_load = torch.load


def _load_local(*args, **kwargs):
    kwargs.setdefault("map_location", torch.device(device))
    return _load(*args, **kwargs)


torch.load = _load_local

from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # noqa: E402

try:
    model = ChatterboxMultilingualTTS.from_pretrained(device=device, t3_model="v3")
    version = "v3"
except TypeError:
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    version = "v2"
print("Modelo multilingüe", version)

pausa = torch.zeros(1, int(model.sr * guion["pausa_segundos"]))
trozos = []
for linea in guion["lines"]:
    wav = model.generate(linea, language_id="es")
    trozos += [wav.cpu(), pausa]
salida = os.path.join(SALIDA, f"chatterbox_{version}.wav")
ta.save(salida, torch.cat(trozos, dim=1), model.sr)
print("Creado", os.path.basename(salida))
