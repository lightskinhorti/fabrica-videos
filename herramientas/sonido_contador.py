"""Efectos, música y mezcla para un vídeo de El contador loco.

Uso (con el Python de voces/.venv, que tiene numpy, scipy y soundfile):
    ../voces/.venv/bin/python sonido_contador.py <carpeta del vídeo> <voz.wav | ->

Con "-" en vez de la voz (modo texto) solo hay efectos: la canción se pone al publicar en TikTok,
por eso tampoco lleva el fondo musical.

Lee del index.html del vídeo los bloques vozdata y escena, coloca los sonidos en el
segundo exacto de cada hito y escribe <carpeta>/assets/mezcla.wav.
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
SON = ESC.get("sonido", {})
D = float(re.search(r'data-composition-id="main"[^>]*data-duration="([\d.]+)"', html).group(1))


def norm(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if c.isalnum())


# same anchors and climb curve as the scene
words = [w for l in VOZ["lines"] for w in l["words"]]
fin_frase = [l["e"] for l in VOZ["lines"] for _ in l["words"]]
Yf = lambda h: 10 * np.log10(1 + h)
anchors, desde = [], 0
for hito in ESC["hitos"]:
    i = next((k for k in range(desde, len(words)) if norm(words[k]["w"]).startswith(hito["clave"])), None)
    if i is None:
        continue
    anchors.append((words[i]["s"], Yf(hito.get("v", hito.get("h"))), hito, fin_frase[i]))
    desde = i + 1


def smooth(k):
    return k * k * k * (k * (k * 6 - 15) + 10)


# landmarks marked "solo_etiqueta" get a note but do not move the counter
curva = [a for a in anchors if not a[2].get("solo_etiqueta")]


def y_at(t):
    if not curva or t <= curva[0][0]:
        return curva[0][1] if curva else 0.0
    for (ta, ya, _, fa), (tb, yb, _, _) in zip(curva, curva[1:]):
        if t < tb:
            start = max(ta + 0.25, tb - 3.2, min(fa, tb - (0.9 if VOZ.get("modo") == "texto" else 1.5)))
            return ya + (yb - ya) * smooth(min(1, max(0, (t - start) / (tb - start))))
    return curva[-1][1]


N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
noise = rng.standard_normal(N)
y_ctrl = np.array([y_at(x) for x in np.arange(0, D, 0.01)])
y = np.interp(t, np.arange(len(y_ctrl)) * 0.01, y_ctrl)
speed = np.abs(np.gradient(y, 1 / SR))
speed = ss.lfilter([1 - 0.9995], [1, -0.9995], speed)


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


def marimba(f, start, gain):
    n = int(1.6 * SR)
    i0 = int(start * SR)
    if i0 >= N:
        return
    tt = np.arange(min(n, N - i0)) / SR
    note = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5) + 0.35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt * 14)
    note *= np.minimum(1, tt / 0.004)
    out[i0:i0 + len(tt)] += note * gain


out = np.zeros(N)
# "etereo_desde": scene height where the warm pad thins out into an airy shimmer (the ascensor uses 45, space)
space = np.clip((y - SON["etereo_desde"]) / 10, 0, 1) if "etereo_desde" in SON else np.zeros(N)

# music bed: warm chord that thins out into an airy shimmer in space
pad = sum(np.sin(2 * np.pi * f * t + p) for f, p in ((130.81, 0), (164.81, 1), (196.0, 2), (261.63, 0.5)))
pad *= 0.65 + 0.35 * np.sin(2 * np.pi * 0.09 * t)
air = sum(np.sin(2 * np.pi * f * t) for f in (523.25, 659.25, 783.99)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * t))
bed = lowpass(pad, 700) * (1 - 0.6 * space) * 0.05 + lowpass(air, 3000) * space * 0.018
if voz_ruta != "-":
    out += bed * env(0, 1.5, D - 4, 2.4)

# optional, from "sonido" in the scene: elevator ding at the start, motor hum and wind that follow the speed
if SON.get("campanilla"):
    for f, s in ((1046.5, 0.12), (830.6, 0.32)):
        out += np.sin(2 * np.pi * f * t) * env(s, 0.004, 0.02, 1.2) * 0.09
if SON.get("motor"):
    hum = np.sin(2 * np.pi * 70 * t) + 0.4 * np.sin(2 * np.pi * 140 * t)
    out += lowpass(hum, 300) * np.clip(speed / 2, 0, 1) * (1 - space) * 0.05
if SON.get("viento"):
    out += bandpass(noise, 400, 4000) * np.clip(speed / 8, 0, 1) ** 1.5 * 0.05
# heat: crackles that get denser and a low fire roar, from 150 °C up to the last landmark
if SON.get("chisporroteo"):
    calor = np.clip((y - Yf(150)) / (curva[-1][1] - Yf(150)), 0, 1)
    clicks = (rng.random(N) < 0.0006 + 0.004 * calor) * rng.standard_normal(N)
    out += bandpass(clicks, 1500, 7000) * (calor > 0) * (0.15 + 0.5 * calor) * 0.35
    out += lowpass(noise, 250) * calor ** 1.5 * 0.08

# every landmark reached plays the next note of a pentatonic scale, with a soft thump
ESCALA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]
n = 0
for ta, _, hito, _ in anchors[1:]:
    marimba(ESCALA[min(n, len(ESCALA) - 1)], ta, 0.11)
    marimba(ESCALA[min(n, len(ESCALA) - 1)] / 2, ta, 0.05)
    out += lowpass(noise, 180) * env(ta, 0.003, 0.02, 0.18) * 0.12
    n += 1
# last landmark: a final bell chord
if anchors:
    tm = anchors[-1][0]
    for f, g in ((523.25, 0.08), (659.25, 0.06), (783.99, 0.06), (1046.5, 0.05)):
        out += np.sin(2 * np.pi * f * t) * env(tm + 0.05, 0.01, 0.2, 2.8) * g

# voice on top, music ducked under it (text mode: effects only, the song is added on TikTok)
if voz_ruta == "-":
    voz, sr = np.zeros(SR), SR
else:
    voz, sr = sf.read(voz_ruta)
if voz.ndim > 1:
    voz = voz.mean(axis=1)
if sr != SR:
    voz = ss.resample_poly(voz, SR, sr)
v = np.zeros(N)
v[: min(N, len(voz))] = voz[: min(N, len(voz))]
v_env = ss.lfilter([1 - 0.999], [1, -0.999], np.abs(v))
duck = 1 - 0.55 * np.clip(v_env / (v_env.max() + 1e-9) * 3, 0, 1)
mix = v * 0.95 + out * duck
mix = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
os.makedirs(os.path.join(carpeta, "assets"), exist_ok=True)
sf.write(os.path.join(carpeta, "assets", "mezcla.wav"), mix.astype(np.float32), SR)
print("ok", round(len(mix) / SR, 2), "s ·", len(anchors) - 1, "hitos con nota")
