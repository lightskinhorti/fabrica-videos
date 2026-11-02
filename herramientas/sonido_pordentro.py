"""Efectos, fondo y mezcla para un vídeo de Las cosas por dentro.

Uso (con el Python de voces/.venv, que tiene numpy, scipy y soundfile):
    ../voces/.venv/bin/python sonido_pordentro.py <carpeta del vídeo> <voz.wav>

Lee del index.html del vídeo los bloques vozdata y escena. Cada sonido de "sonidos" va en el segundo
de un momento (los mismos "momentos" que usa la escena, buscados igual que en pordentro.js):
    { "tipo": "toque", "en": "TAP", "mas": 0.1, "volumen": 0.8 }
    { "tipo": "zumbido", "desde": "CAMPO", "hasta": "SEGUNDO" }
Tipos: toque, desliza, abre, brillo, pop, sube, chip, pagado, metal (una moneda que cae), error, hervor (desde/hasta),
tictac (desde/hasta: un tic en cada segundo entero),
teclas (n, cada), zumbido y morse (desde/hasta; el morse repite P-A-G-O con unidades de 0,09 s, como la
escena) y ping (desde + mas hasta hasta, uno cada `cada` s; la escena lee estos mismos datos para dibujarlos).
En zumbido, "mas" alarga el final; en ping, retrasa el comienzo.
Escribe <carpeta>/assets/mezcla.wav.
"""
import json
import os
import re
import sys
import unicodedata

import numpy as np
import scipy.signal as ss
import soundfile as sf

SR = 48000
carpeta, voz_ruta = sys.argv[1], sys.argv[2]
html = open(os.path.join(carpeta, "index.html"), encoding="utf-8").read()
bloque = lambda i: json.loads(re.search(rf'<script id="{i}" type="application/json">(.*?)</script>', html, re.S).group(1))
VOZ, ESC = bloque("vozdata"), bloque("escena")
D = float(re.search(r'data-composition-id="main"[^>]*data-duration="([\d.]+)"', html).group(1))


def norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if c.isalnum())


# same moments as the scene
words = [w for l in VOZ["lines"] for w in l["words"]]
T, desde = {}, 0
for m in ESC.get("momentos", []):
    i = next((k for k in range(desde, len(words)) if norm(words[k]["w"]).startswith(norm(m["clave"]))), None)
    if i is None:
        sys.exit(f"No encuentro la palabra \"{m['clave']}\" del momento {m['id']} en la voz")
    T[m["id"]] = (words[i]["e"] if m.get("fin") else words[i]["s"]) + m.get("mas", 0)
    desde = i + 1
cuando = lambda x: x if isinstance(x, (int, float)) else T[x]

N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
noise = rng.standard_normal(N)
out = np.zeros(N)


def env(start, attack, hold, release):
    e = np.zeros(N)
    a0, a1 = int(start * SR), int((start + attack) * SR)
    h1, r1 = int((start + attack + hold) * SR), int((start + attack + hold + release) * SR)
    a0, a1, h1, r1 = [min(N, max(0, v)) for v in (a0, a1, h1, r1)]
    e[a0:a1] = np.linspace(0, 1, a1 - a0)
    e[a1:h1] = 1
    e[h1:r1] = np.linspace(1, 0, r1 - h1) ** 2
    return e


def lowpass(x, cut):
    b, a = ss.butter(2, min(0.99, cut / (SR / 2)))
    return ss.lfilter(b, a, x)


def bandpass(x, lo, hi):
    b, a = ss.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return ss.lfilter(b, a, x)


def tono(f, s, ataque, dura, caida, g):
    return np.sin(2 * np.pi * f * t) * env(s, ataque, dura, caida) * g


# the chip's answer: P-A-G-O in morse, 0.09 s per unit, repeated (same pattern as the scene)
UNITS = []
for ch in ".--. .- --. ---":
    UNITS += [1, 0] if ch == "." else [1, 1, 1, 0] if ch == "-" else [0, 0]
UNITS += [0, 0, 0, 0]

for s in ESC.get("sonidos", []):
    tipo, vol = s["tipo"], s.get("volumen", 1.0)
    if "en" in s:
        a = cuando(s["en"]) + s.get("mas", 0)
    if tipo == "toque":
        out += (lowpass(noise, 2500) * env(a, 0.002, 0.01, 0.05) * 0.35 + tono(90, a, 0.002, 0.01, 0.12, 0.25)) * vol
    elif tipo == "desliza":
        out += bandpass(noise, 300, 2200) * env(a + 0.1, 0.4, 0.5, 0.5) * 0.06 * vol
    elif tipo == "abre":
        out += bandpass(noise, 800, 6000) * env(a, 0.35, 0.1, 0.6) * 0.07 * vol
        out += np.sin(2 * np.pi * (600 + 900 * np.clip((t - a) / 0.8, 0, 1)) * t) * env(a + 0.05, 0.05, 0.2, 0.6) * 0.02 * vol
    elif tipo == "brillo":
        for k, f in enumerate((1568.0, 2093.0, 2637.0)):
            out += tono(f, a + 0.06 * k, 0.005, 0.02, 0.7, 0.025 * vol)
    elif tipo == "pop":
        out += (tono(660, a, 0.003, 0.02, 0.18, 0.05) + lowpass(noise, 1200) * env(a, 0.002, 0.01, 0.06) * 0.08) * vol
    elif tipo == "sube":
        out += np.sin(2 * np.pi * (300 + 500 * np.clip((t - a) / 1.2, 0, 1)) * t) * env(a - 0.05, 0.3, 0.6, 0.6) * 0.025 * vol
    elif tipo == "chip":
        out += (tono(880, a, 0.01, 0.05, 0.4, 0.05) + tono(1320, a + 0.08, 0.01, 0.05, 0.4, 0.035)) * vol
    elif tipo == "pagado":
        for f, d in ((1318.5, -0.02), (1760.0, 0.13)):
            out += tono(f, a + d, 0.005, 0.03, 0.9, 0.08 * vol)
    elif tipo == "teclas":
        for k in range(s.get("n", 4)):
            b = a + k * s.get("cada", 0.4)
            out += (tono(1046.5, b, 0.002, 0.06, 0.08, 0.05) + lowpass(noise, 3000) * env(b, 0.001, 0.005, 0.03) * 0.12) * vol
    elif tipo == "zumbido":
        a, b = cuando(s["desde"]), cuando(s["hasta"]) + s.get("mas", 0)
        hum = np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t) + 0.2 * np.sin(2 * np.pi * 360 * t)
        hum *= 0.75 + 0.25 * np.sin(2 * np.pi * 6 * t)
        out += hum * env(a - 0.08, 0.8, max(0, b - a - 0.8), 0.9) * 0.022 * vol
    elif tipo == "hervor":
        # water simmering: little bubble pops and a soft hiss (the scene draws steam over the same window)
        a, b = cuando(s["desde"]), cuando(s["hasta"])
        w = env(a, 1.0, max(0, min(b, D) - a - 1.0), 0.8)
        pops = (rng.random(N) < 0.0012) * rng.standard_normal(N)
        out += (bandpass(pops, 600, 3500) * 0.25 + bandpass(noise, 2000, 7000) * 0.008) * w * vol
    elif tipo == "tictac":
        # a watch tick on every whole second between desde and hasta (the scene steps the second hand then)
        a, b = cuando(s["desde"]), min(cuando(s["hasta"]), D)
        k = int(np.ceil(a))
        while k < b:
            out += (tono(3200.0, k, 0.0005, 0.003, 0.02, 0.035) + bandpass(noise, 2000, 8000) * env(k, 0.0005, 0.002, 0.012) * 0.12) * vol
            k += 1
    elif tipo == "metal":
        for f, g in ((2350.0, 0.05), (3720.0, 0.035), (5180.0, 0.02)):
            out += tono(f, a, 0.001, 0.005, 0.35, g * vol)
        out += lowpass(noise, 4000) * env(a, 0.001, 0.004, 0.03) * 0.15 * vol
    elif tipo == "error":
        for k in range(2):
            out += tono(330, a + 0.18 * k, 0.005, 0.08, 0.06, 0.06 * vol)
    elif tipo == "ping":
        b, k = cuando(s["hasta"]), 0
        a = cuando(s["desde"]) + s.get("mas", 0)
        while a + k * s.get("cada", 0.6) < b:
            out += tono(1568.0, a + k * s.get("cada", 0.6), 0.003, 0.02, 0.15, 0.03 * vol)
            k += 1
    elif tipo == "morse":
        a, b = cuando(s["desde"]), cuando(s["hasta"])
        u = np.floor((t - a) / 0.09).astype(int)
        on = np.where((t >= a) & (t < b), np.array(UNITS)[np.mod(u, len(UNITS))], 0).astype(float)
        on = ss.lfilter([1 - 0.995], [1, -0.995], on)
        out += np.sin(2 * np.pi * 1200 * t) * on * 0.03 * vol
    else:
        sys.exit(f"Tipo de sonido desconocido: {tipo}")

# warm low drone under everything
pad = np.sin(2 * np.pi * 55 * t) * 0.5 + np.sin(2 * np.pi * 82.4 * t) * 0.35 + np.sin(2 * np.pi * 110 * t) * 0.25
pad *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)
out += lowpass(pad, 400) * env(0, 1.5, D - 4.0, 2.4) * 0.05

# voice on top, effects ducked a little under it
voz, sr = sf.read(voz_ruta)
if voz.ndim > 1:
    voz = voz.mean(axis=1)
if sr != SR:
    voz = ss.resample_poly(voz, SR, sr)
v = np.zeros(N)
v[: min(N, len(voz))] = voz[: min(N, len(voz))]
v_env = ss.lfilter([1 - 0.999], [1, -0.999], np.abs(v))
duck = 1 - 0.35 * np.clip(v_env / (v_env.max() + 1e-9) * 3, 0, 1)
mix = v * 0.95 + out * duck
mix = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
os.makedirs(os.path.join(carpeta, "assets"), exist_ok=True)
sf.write(os.path.join(carpeta, "assets", "mezcla.wav"), mix.astype(np.float32), SR)
print("ok", round(len(mix) / SR, 2), "s ·", len(ESC.get("sonidos", [])), "sonidos en", len(T), "momentos")
