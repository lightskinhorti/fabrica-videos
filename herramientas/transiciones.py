"""Mide cortes y transiciones de un vídeo vertical (hecho el 3 de noviembre para comparar con @speedy_devv).

Uso: voces/.venv/bin/python herramientas/transiciones.py <video.mp4> [...] [--eventos]
(necesita numpy, que está en voces/.venv)

Para cada fotograma calcula:
  d1[i]  = diferencia entre el fotograma i-1 y el i (un paso)
  dk[i]  = diferencia entre i-K e i+K (0,4 s de ventana)
Un cambio de plano es un pico de dk. Si casi todo el cambio ocurre en un paso (d1 alto) es un corte seco;
si se reparte en varios fotogramas es una transición (fundido, barrido, zoom que entra...).
"""
import json
import subprocess
import sys

import numpy as np

W, H, K = 72, 128, 6


def fotogramas(ruta):
    cmd = ["ffmpeg", "-v", "error", "-i", ruta, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    # Normalizar cada fotograma por su contraste para que los fondos oscuros no escondan los cambios
    m = f.mean(axis=(1, 2), keepdims=True)
    s = f.std(axis=(1, 2), keepdims=True) + 8
    return (f - m) / s, f


def dif(a, b):
    return float(np.abs(a - b).mean())


def analizar(ruta, fps=30):
    fn, f = fotogramas(ruta)
    n = len(fn)
    d1 = np.zeros(n)
    for i in range(1, n):
        d1[i] = dif(fn[i - 1], fn[i])
    dk = np.zeros(n)
    for i in range(K, n - K):
        dk[i] = dif(fn[i - K], fn[i + K])
    base = np.median(dk[K:n - K])
    umbral = max(0.45, base * 2.2)
    eventos = []
    i = K
    while i < n - K:
        if dk[i] > umbral:
            j = i
            while j < n - K and dk[j] > umbral:
                j += 1
            pico = i + int(np.argmax(dk[i:j]))
            ventana = d1[max(1, pico - K):pico + K + 1]
            paso = float(ventana.max())
            total = dk[pico]
            # cuántos fotogramas hacen falta para llevar el 80 % del cambio
            orden = np.sort(ventana)[::-1]
            acum = np.cumsum(orden) / (orden.sum() + 1e-6)
            frames80 = int(np.searchsorted(acum, 0.8) + 1)
            tipo = "corte" if paso >= 0.6 * total and frames80 <= 2 else "transicion"
            eventos.append({"t": round(pico / fps, 2), "tipo": tipo, "paso": round(paso, 2), "total": round(total, 2), "fotogramas80": frames80})
            i = j + K
        else:
            i += 1
    dur = n / fps
    cortes = [e for e in eventos if e["tipo"] == "corte"]
    trans = [e for e in eventos if e["tipo"] == "transicion"]
    # movimiento de cámara dentro de los planos: mediana de d1 fuera de los eventos
    mascara = np.ones(n, bool)
    for e in eventos:
        c = int(e["t"] * fps)
        mascara[max(0, c - K):c + K] = False
    mov = float(np.median(d1[1:][mascara[1:]]))
    tiempos = [0] + [e["t"] for e in eventos] + [dur]
    planos = np.diff(tiempos)
    return {
        "video": ruta.split("/")[-1],
        "duracion": round(dur, 1),
        "cambios": len(eventos),
        "cortes_secos": len(cortes),
        "transiciones": len(trans),
        "seg_por_plano_media": round(float(planos.mean()), 2),
        "seg_por_plano_mediana": round(float(np.median(planos)), 2),
        "planos_menos_1s": int((planos < 1.0).sum()),
        "planos_mas_3s": int((planos > 3.0).sum()),
        "movimiento_mediano": round(mov, 3),
        "eventos": eventos,
    }


if __name__ == "__main__":
    rutas = [a for a in sys.argv[1:] if not a.startswith("--")]
    for r in rutas:
        s = analizar(r)
        eventos = s.pop("eventos")
        print(json.dumps(s, ensure_ascii=False))
        if "--eventos" in sys.argv:
            print("  " + " ".join(f"{e['t']}{'C' if e['tipo'] == 'corte' else 'T'}" for e in eventos))
