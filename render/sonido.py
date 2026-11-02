"""Efectos de sonido y mezcla para el vídeo de la tarjeta.

Uso:  python3 sonido.py [voz.wav] [duracion_segundos]
Por defecto usa la voz de Gemini de ../exports/voces/ y escribe assets/mezcla.wav.

Los segundos de cada efecto salen de las constantes T_* de abajo, que tienen
que ser iguales a las de index.html (están puestas para la voz de Gemini).
Necesita numpy, scipy y soundfile.
"""
import os
import sys

import numpy as np
import soundfile as sf

SR = 48000
T_TAP, T_SLIDE0, T_CUT, T_FIELD, T_CURRENT, T_CHIP, T_PAID = 0.69, 2.63, 5.96, 9.53, 15.23, 18.35, 19.92
HERE = os.path.dirname(os.path.abspath(__file__))
VOZ = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "exports", "voces", "gemini_esesconcierge12.wav")
voz, sr = sf.read(VOZ)
if voz.ndim > 1:
    voz = voz.mean(axis=1)
if sr != SR:
    import scipy.signal as ss
    voz = ss.resample_poly(voz, SR, sr)
D = float(sys.argv[2]) if len(sys.argv) > 2 else max(21.2, len(voz) / SR + 0.8)
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def env(start, attack, hold, release):
    e = np.zeros(N)
    a0, a1 = int(start * SR), int((start + attack) * SR)
    h1 = int((start + attack + hold) * SR)
    r1 = int((start + attack + hold + release) * SR)
    e[a0:a1] = np.linspace(0, 1, a1 - a0)
    e[a1:h1] = 1
    e[h1:r1] = np.linspace(1, 0, r1 - h1) ** 2
    return e


def lowpass(x, cut):
    import scipy.signal as ss
    b, a = ss.butter(2, cut / (SR / 2))
    return ss.lfilter(b, a, x)


def bandpass(x, lo, hi):
    import scipy.signal as ss
    b, a = ss.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return ss.lfilter(b, a, x)


noise = rng.standard_normal(N)
out = np.zeros(N)

# pad: warm low drone
pad = (np.sin(2 * np.pi * 55 * t) * 0.5 + np.sin(2 * np.pi * 82.4 * t) * 0.35 + np.sin(2 * np.pi * 110 * t) * 0.25)
pad *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)
pad *= env(0, 1.5, D - 4.0, 2.4)
out += lowpass(pad, 400) * 0.05

# finger tap on the card
out += lowpass(noise, 2500) * env(T_TAP, 0.002, 0.01, 0.05) * 0.35
out += np.sin(2 * np.pi * 90 * t) * env(T_TAP, 0.002, 0.01, 0.12) * 0.25

# card slides on the desk
out += bandpass(noise, 300, 2200) * env(T_SLIDE0 + 0.1, 0.4, 0.5, 0.5) * 0.06

# cutaway opens
sw = bandpass(noise, 800, 6000) * env(T_CUT, 0.35, 0.1, 0.6)
out += sw * 0.07
out += np.sin(2 * np.pi * (600 + 900 * np.clip((t - T_CUT) / 0.8, 0, 1)) * t) * env(T_CUT + 0.05, 0.05, 0.2, 0.6) * 0.02

# magnetic field hum, from the field until the payment
hum = np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t) + 0.2 * np.sin(2 * np.pi * 360 * t)
hum *= 0.75 + 0.25 * np.sin(2 * np.pi * 6 * t)
out += hum * env(T_FIELD - 0.08, 0.8, T_PAID - T_FIELD - 0.64, 0.9) * 0.022

# current starts flowing
rise = np.sin(2 * np.pi * (300 + 500 * np.clip((t - T_CURRENT) / 1.2, 0, 1)) * t)
out += rise * env(T_CURRENT - 0.05, 0.3, 0.6, 0.6) * 0.025

# chip powers on
out += np.sin(2 * np.pi * 880 * t) * env(T_CHIP, 0.01, 0.05, 0.4) * 0.05
out += np.sin(2 * np.pi * 1320 * t) * env(T_CHIP + 0.08, 0.01, 0.05, 0.4) * 0.035

# payment chime
for f, s in ((1318.5, T_PAID - 0.02), (1760.0, T_PAID + 0.13)):
    out += np.sin(2 * np.pi * f * t) * env(s, 0.005, 0.03, 0.9) * 0.08

v = np.zeros(N)
v[: min(N, len(voz))] = voz[: min(N, len(voz))]
mix = v * 0.95 + out
mix = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
sf.write(os.path.join(HERE, "assets", "mezcla.wav"), mix.astype(np.float32), SR)
print("ok", round(len(mix) / SR, 2))
