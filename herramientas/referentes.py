#!/usr/bin/env python3
"""Busca los vídeos que han "reventado" en cada nicho: los que tienen muchas más
visualizaciones que lo normal de su propio creador.

Uso:
    python3 herramientas/referentes.py                 lee las cuentas y escribe la lista
    python3 herramientas/referentes.py --desmontar 3   además baja y transcribe los 3 mejores de cada nicho

Las cuentas se apuntan en datos/referentes.json, por nicho. Solo TikTok, solo
datos públicos, con yt-dlp y sin iniciar sesión ni usar cookies (igual que
metricas.py). Los vídeos bajados van a referencias/revientan/, que no se sube a git:
son para estudiar la receta (gancho, estructura, ritmo), nunca para copiar el tema
ni el guion.

Salidas:
    datos/referentes_resultado.json   todos los vídeos leídos, con su multiplicador
    ideas/referentes.md               la tabla de los que han reventado, por nicho
"""
import argparse
import json
import os
import shutil
import statistics
import subprocess
import sys
import time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUENTAS = os.path.join(RAIZ, "datos", "referentes.json")
RESULTADO = os.path.join(RAIZ, "datos", "referentes_resultado.json")
TABLA = os.path.join(RAIZ, "ideas", "referentes.md")
BAJADOS = os.path.join(RAIZ, "referencias", "revientan")
NOMBRES = {"elcontadorloco": "El contador loco", "lascosaspordentro": "Las cosas por dentro",
           "dinerosinlio": "Dinero sin lío"}
DIA = 86400


def yt():
    ruta = shutil.which("yt-dlp") or "/opt/homebrew/bin/yt-dlp"
    if not os.path.exists(ruta):
        sys.exit("Falta yt-dlp. Instálalo con: brew install yt-dlp")
    return ruta


def videos(usuario, cuantos):
    """Public videos of one account, newest first, with views, date and length."""
    r = subprocess.run(
        [yt(), "--flat-playlist", "--dump-json", "--playlist-end", str(cuantos), "--socket-timeout", "30",
         "--no-warnings", f"https://www.tiktok.com/@{usuario}"],
        capture_output=True, text=True, timeout=600,
    )
    filas = [json.loads(linea) for linea in r.stdout.splitlines() if linea.startswith("{")]
    if not filas:
        error = (r.stderr.strip().splitlines() or ["sin respuesta"])[-1]
        raise RuntimeError("TikTok no encuentra la cuenta" if "secondary user ID" in error else error[:120])
    return [{
        "id": d["id"], "url": d.get("url") or f"https://www.tiktok.com/@{usuario}/video/{d['id']}",
        "vistas": d.get("view_count") or 0, "megusta": d.get("like_count"), "comentarios": d.get("comment_count"),
        "publicado": d.get("timestamp"), "dura": d.get("duration"), "texto": (d.get("title") or "").strip(),
    } for d in filas]


def puntuar(filas, ahora, reposo):
    """Adds 'veces': views divided by the creator's median. Videos younger than
    'reposo' days are left out of the median and of the ranking: they are still growing."""
    asentados = [f for f in filas if not f["publicado"] or ahora - f["publicado"] >= reposo * DIA]
    if len(asentados) < 5:
        return None
    mediana = statistics.median(f["vistas"] for f in asentados) or 1
    for f in filas:
        f["asentado"] = f in asentados
        f["veces"] = round(f["vistas"] / mediana, 1)
    return mediana


def miles(n):
    return f"{n / 1e6:.1f} M".replace(".", ",") if n >= 1e6 else f"{round(n / 1000)} mil" if n >= 1000 else str(n)


def desmontar(nicho, usuario, f):
    """Downloads one video, transcribes it and returns what the script writer needs."""
    carpeta = os.path.join(BAJADOS, nicho)
    os.makedirs(carpeta, exist_ok=True)
    base = os.path.join(carpeta, f"{usuario}_{f['id']}")
    ficha = base + ".json"
    if os.path.exists(ficha):
        return json.load(open(ficha, encoding="utf-8"))
    if not os.path.exists(base + ".mp4"):
        subprocess.run([yt(), "-q", "--no-warnings", "-f", "mp4/best", "-o", base + ".mp4", f["url"]],
                       check=True, timeout=600)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", base + ".mp4", "-ac", "1",
                    "-ar", "16000", base + ".wav"], check=True)
    # first three seconds, one frame every half second: what the viewer sees before deciding
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-t", "3", "-i", base + ".mp4", "-vf",
                    "fps=2,scale=270:-1,tile=6x1", "-frames:v", "1", base + "-arranque.jpg"], check=True)
    tmp = base + "-tr"
    os.makedirs(tmp, exist_ok=True)
    subprocess.run(["npx", "-y", "hyperframes@0.8.228", "transcribe", base + ".wav", "--engine", "whisper",
                    "--model", "small", "-d", tmp], cwd=tmp, capture_output=True, timeout=900)
    palabras = []
    try:
        datos = json.load(open(os.path.join(tmp, "transcript.json"), encoding="utf-8"))
        palabras = datos if isinstance(datos, list) else datos.get("words") or datos.get("segments") or []
    except (OSError, ValueError):
        pass
    texto = " ".join((p.get("text") or p.get("word") or p.get("w") or "").strip() for p in palabras).strip()
    fin = max((p.get("end") or p.get("e") or 0) for p in palabras) if palabras else 0
    primera = texto
    for corte in ".?!":
        primera = primera.split(corte)[0] if len(primera.split(corte)[0]) > 8 else primera
    salida = {
        "url": f["url"], "vistas": f["vistas"], "veces": f["veces"], "dura": f["dura"],
        "gancho": primera[:140], "palabras": len(texto.split()),
        "palabras_por_segundo": round(len(texto.split()) / fin, 2) if fin else None,
        "transcripcion": texto, "arranque": os.path.relpath(base + "-arranque.jpg", RAIZ),
    }
    json.dump(salida, open(ficha, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.remove(base + ".wav")
    shutil.rmtree(tmp, ignore_errors=True)
    return salida


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--desmontar", type=int, default=0, metavar="N",
                   help="baja y transcribe los N mejores de cada nicho")
    p.add_argument("--videos", type=int, default=60, help="cuántos vídeos leer de cada cuenta (60)")
    p.add_argument("--veces", type=float, default=3.0, help="mínimo de veces sobre lo normal del creador (3)")
    p.add_argument("--minimo", type=int, default=20000, help="mínimo de visualizaciones para contar (20000)")
    p.add_argument("--reposo", type=int, default=3, help="días que tiene que llevar publicado (3)")
    p.add_argument("--nicho", help="solo este nicho")
    a = p.parse_args()

    if not os.path.exists(CUENTAS):
        sys.exit(f"Falta {os.path.relpath(CUENTAS, RAIZ)} con las cuentas de cada nicho.")
    cuentas = json.load(open(CUENTAS, encoding="utf-8"))
    ahora = time.time()
    todo, fallos = {}, []
    for nicho, usuarios in cuentas.items():
        if nicho.startswith("_") or (a.nicho and nicho != a.nicho):
            continue
        todo[nicho] = {}
        for usuario in usuarios:
            usuario = usuario.lstrip("@")
            try:
                filas = videos(usuario, a.videos)
            except (RuntimeError, subprocess.TimeoutExpired) as e:
                fallos.append(f"@{usuario}: {e}")
                continue
            mediana = puntuar(filas, ahora, a.reposo)
            if mediana is None:
                fallos.append(f"@{usuario}: menos de 5 vídeos con más de {a.reposo} días")
                continue
            todo[nicho][usuario] = {"mediana": mediana, "videos": filas}
            print(f"{nicho}: @{usuario}, {len(filas)} vídeos, lo normal son {miles(mediana)}", file=sys.stderr)

    lineas = [
        "# Vídeos que han reventado en cada nicho", "",
        f"Lista hecha por `herramientas/referentes.py` el {time.strftime('%d/%m/%Y')}. "
        f"Entra un vídeo si tiene al menos {a.veces:g} veces las visualizaciones normales de su creador "
        f"(la mediana de sus últimos {a.videos}), más de {miles(a.minimo)} y más de {a.reposo} días publicado.",
        "", "Sirve para copiar la receta (gancho, estructura y ritmo), nunca el tema ni el guion.", "",
    ]
    for nicho, creadores in todo.items():
        elegidos = sorted(
            ((u, f) for u, c in creadores.items() for f in c["videos"]
             if f.get("asentado") and f["veces"] >= a.veces and f["vistas"] >= a.minimo),
            key=lambda x: -x[1]["veces"])
        lineas += [f"## {NOMBRES.get(nicho, nicho)}", ""]
        if not creadores:
            lineas += ["Sin cuentas leídas.", ""]
            continue
        lineas += ["Cuentas leídas: " + ", ".join(f"@{u} (lo normal: {miles(c['mediana'])})"
                                                  for u, c in creadores.items()) + ".", ""]
        if not elegidos:
            lineas += ["Ninguno pasa el corte.", ""]
            continue
        lineas += ["| Veces | Visualizaciones | Segundos | Cuenta | Descripción | Gancho dicho |", "|---|---|---|---|---|---|"]
        for i, (u, f) in enumerate(elegidos[:25]):
            gancho = ""
            if i < a.desmontar:
                try:
                    ficha = desmontar(nicho, u, f)
                    gancho = ficha["gancho"].replace("|", "/")
                    f["desmontado"] = True
                except (subprocess.SubprocessError, OSError) as e:
                    fallos.append(f"@{u} {f['id']}: no se pudo bajar o transcribir ({str(e)[:80]})")
            texto = f["texto"].replace("|", "/").replace("\n", " ")[:70]
            lineas.append(f"| ×{f['veces']:g} | {miles(f['vistas'])} | {f['dura'] or '?'} | @{u} | "
                          f"[{texto or 'ver'}]({f['url']}) | {gancho} |")
        lineas.append("")
    if fallos:
        lineas += ["## Cuentas o vídeos que no se han podido leer", ""] + [f"- {x}" for x in fallos] + [""]

    json.dump({"leido": time.strftime("%Y-%m-%d %H:%M"), "nichos": todo}, open(RESULTADO, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    open(TABLA, "w", encoding="utf-8").write("\n".join(lineas))
    print(f"Hecho: {os.path.relpath(TABLA, RAIZ)}" + (f" ({len(fallos)} avisos)" if fallos else ""))


if __name__ == "__main__":
    main()
