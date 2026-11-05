"""Métricas de TikTok sin entrar en las cuentas: lee lo que enseña la página pública de cada una.

Uso:
    python3 herramientas/metricas.py               (lee las tres cuentas una vez)
    python3 herramientas/metricas.py --instalar    (lo deja programado cada 2 horas en este Mac)
    python3 herramientas/metricas.py --desinstalar (quita la programación)

Cada lectura apunta en datos/lecturas.jsonl las visualizaciones de cada vídeo y los seguidores de cada cuenta.
Con ese historial calcula las visualizaciones a las 24 horas y a los 7 días de cada vídeo, y lo deja todo en
datos/metricas.json, que enseña el panel. Lo que escribes a mano en el panel (datos/estado.json) manda siempre
sobre lo automático: este script nunca toca ese archivo.

El porcentaje que ve el vídeo entero y los seguidores que trae cada vídeo solo salen en TikTok Studio, con la
sesión iniciada, así que esos no salen de aquí.

Usa yt-dlp (de Homebrew) y la biblioteca estándar. Nunca inicia sesión ni usa cookies.
"""
import fcntl
import json
import os
import plistlib
import re
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

from panel import CUENTAS, RAIZ, leer_estado, videos

DATOS = os.path.join(RAIZ, "datos")
LECTURAS = os.path.join(DATOS, "lecturas.jsonl")
METRICAS = os.path.join(DATOS, "metricas.json")
REGISTRO = os.path.join(DATOS, "metricas.log")
ETIQUETA = "com.fabrica-videos.metricas"
PLIST = os.path.expanduser(f"~/Library/LaunchAgents/{ETIQUETA}.plist")
CADA = 2 * 3600
HORA, DIA = 3600, 86400
MADRID = ZoneInfo("Europe/Madrid")
NAVEGADOR = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
# field: (time after publishing, max gap between the two readings around it, max distance of a lone reading)
MOMENTOS = {"v24": (DIA, 12 * HORA, 4 * HORA), "v7": (7 * DIA, 2 * DIA, DIA)}
# by then v24 and v7 are fixed, so older readings are no longer needed
GUARDAR = 10 * DIA


def videos_tiktok(usuario):
    """Every public video of the account (newest first, up to 40) with its counts."""
    yt = shutil.which("yt-dlp") or "/opt/homebrew/bin/yt-dlp"
    r = subprocess.run(
        [yt, "--skip-download", "--dump-json", "--playlist-end", "40", "--socket-timeout", "30", "--no-warnings",
         f"https://www.tiktok.com/@{usuario}"],
        capture_output=True, text=True, timeout=900,
    )
    salida = [json.loads(linea) for linea in r.stdout.splitlines() if linea.startswith("{")]
    if not salida and r.returncode:
        error = (r.stderr.strip().splitlines() or ["yt-dlp no ha devuelto nada"])[-1]
        if "secondary user ID" in error:
            error = f"TikTok no encuentra la cuenta @{usuario}"
        raise RuntimeError(error)
    return [{
        "id": d["id"], "publicado": d.get("timestamp"), "url": d.get("webpage_url"), "texto": d.get("description") or "",
        "vistas": d.get("view_count"), "megusta": d.get("like_count"), "comentarios": d.get("comment_count"),
        "compartidos": d.get("repost_count"),
    } for d in salida]


def perfil(usuario):
    """Followers and total likes of the account, from the data TikTok puts in its public profile page."""
    pedido = urllib.request.Request(f"https://www.tiktok.com/@{usuario}", headers={"User-Agent": NAVEGADOR, "Accept-Language": "es-ES,es;q=0.9"})
    html = urllib.request.urlopen(pedido, timeout=30).read().decode("utf-8", "replace")
    m = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        return None
    u = json.loads(m.group(1)).get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {})
    s = u.get("userInfo", {}).get("stats")
    return {"seguidores": s["followerCount"], "megusta": s["heartCount"]} if u.get("statusCode") == 0 and s else None


def normal(texto):
    """The description without hashtags, punctuation or capitals, to recognise a video on TikTok."""
    return " ".join(re.findall(r"\w+", re.sub(r"#\S+", " ", texto or "").lower()))[:60]


def emparejar(cuenta, tiktok, panel, estado):
    """Panel id of each TikTok video: same start of the description, or else the day and time it was scheduled for."""
    propios = [v for v in panel if v["cuenta"] == cuenta]
    por_texto = {normal(v["texto"]): v["id"] for v in propios if len(normal(v["texto"])) >= 20}
    por_hora = {}
    for v in propios:
        e = estado.get(v["id"], {})
        if e.get("fecha") and e.get("hora"):
            cuando = datetime.fromisoformat(f"{e['fecha']}T{e['hora']}").replace(tzinfo=MADRID)
            por_hora[int(cuando.timestamp())] = v["id"]
    return {t["id"]: por_texto.get(normal(t["texto"])) or por_hora.get(t["publicado"]) for t in tiktok}


def en(serie, objetivo, hueco, cerca):
    """Views at `objetivo` from the readings (time, views): interpolated between the two readings around it if they
    are at most `hueco` seconds apart, else the closest reading if it is at most `cerca` seconds away."""
    antes = [p for p in serie if p[0] <= objetivo]
    despues = [p for p in serie if p[0] >= objetivo]
    if antes and despues and despues[0][0] - antes[-1][0] <= hueco:
        (ta, va), (td, vd) = antes[-1], despues[0]
        return va if td == ta else round(va + (vd - va) * (objetivo - ta) / (td - ta))
    cerca_de = min(serie, key=lambda p: abs(p[0] - objetivo), default=None)
    return cerca_de[1] if cerca_de and abs(cerca_de[0] - objetivo) <= cerca else None


def escribir(ruta, texto):
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(texto)
    os.replace(tmp, ruta)


def leer():
    os.makedirs(DATOS, exist_ok=True)
    # the scheduled run and a manual one must not write at the same time
    with open(os.path.join(DATOS, ".metricas.lock"), "w") as cerrojo:
        fcntl.flock(cerrojo, fcntl.LOCK_EX)
        ahora = int(time.time())
        metricas = json.load(open(METRICAS, encoding="utf-8")) if os.path.exists(METRICAS) else {"cuentas": {}, "videos": {}}
        panel, estado = videos(), leer_estado()
        nuevas, resumen = [], []
        for c in CUENTAS:
            cuenta = metricas["cuentas"].setdefault(c["id"], {})
            cuenta["tiktok"] = c["tiktok"]
            try:
                lista = videos_tiktok(c["tiktok"])
            except (RuntimeError, subprocess.TimeoutExpired) as e:
                cuenta["error"] = str(e)[:200]
                resumen.append(f"{c['id']}: {cuenta['error']}")
                continue
            try:
                cuenta.update(perfil(c["tiktok"]) or {})
            except (OSError, ValueError):
                pass
            cuenta.update(leido=ahora, error=None)
            pareja = emparejar(c["id"], lista, panel, estado)
            for t in lista:
                v = metricas["videos"].setdefault(t["id"], {})
                v.update({k: t[k] for k in ("publicado", "url", "vistas", "megusta", "comentarios", "compartidos")})
                v.update(cuenta=c["id"], texto=t["texto"][:120], panel=pareja[t["id"]] or v.get("panel"))
            nuevas.append({"t": ahora, "cuenta": c["id"], "seguidores": cuenta.get("seguidores"), "vistas": {t["id"]: t["vistas"] for t in lista}})
            resumen.append(f"{c['id']}: {len(lista)} vídeos, {sum(t['vistas'] or 0 for t in lista)} visualizaciones, {cuenta.get('seguidores')} seguidores")

        historial = [json.loads(linea) for linea in open(LECTURAS, encoding="utf-8")] if os.path.exists(LECTURAS) else []
        historial = [h for h in historial if h["t"] >= ahora - GUARDAR] + nuevas
        series = {}
        for h in historial:
            for vid, n in h["vistas"].items():
                if n is not None:
                    series.setdefault(vid, []).append((h["t"], n))
        # once its moment has passed, each figure is worked out once and then kept
        for vid, v in metricas["videos"].items():
            for campo, (despues, hueco, cerca) in MOMENTOS.items():
                if v.get(campo) is None and v.get("publicado") and ahora >= v["publicado"] + despues:
                    v[campo] = en(sorted(series.get(vid, [])), v["publicado"] + despues, hueco, cerca)
        metricas["leido"] = ahora
        escribir(LECTURAS, "".join(json.dumps(h, ensure_ascii=False) + "\n" for h in historial))
        escribir(METRICAS, json.dumps(metricas, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    print(datetime.fromtimestamp(ahora, MADRID).strftime("%Y-%m-%d %H:%M"), " · ".join(resumen), flush=True)


def instalar():
    yt = shutil.which("yt-dlp")
    if not yt:
        sys.exit("Falta yt-dlp. Instálalo con: brew install yt-dlp")
    desinstalar()
    plist = {
        "Label": ETIQUETA,
        "ProgramArguments": [shutil.which("python3") or sys.executable, os.path.abspath(__file__)],
        "StartInterval": CADA,
        "RunAtLoad": True,
        "ProcessType": "Background",
        "EnvironmentVariables": {"PATH": f"{os.path.dirname(yt)}:/usr/bin:/bin"},
        "StandardOutPath": REGISTRO,
        "StandardErrorPath": REGISTRO,
    }
    os.makedirs(os.path.dirname(PLIST), exist_ok=True)
    with open(PLIST, "wb") as f:
        plistlib.dump(plist, f)
    subprocess.run(["launchctl", "bootstrap", f"gui/{os.getuid()}", PLIST], check=True)
    print(f"Programado: lee TikTok cada {CADA // 3600} horas mientras el Mac está encendido. Registro en {REGISTRO}")


def desinstalar():
    subprocess.run(["launchctl", "bootout", f"gui/{os.getuid()}/{ETIQUETA}"], capture_output=True)
    if os.path.exists(PLIST):
        os.remove(PLIST)


if __name__ == "__main__":
    if "--instalar" in sys.argv:
        instalar()
    elif "--desinstalar" in sys.argv:
        desinstalar()
        print("Quitada la lectura programada de TikTok")
    else:
        leer()
