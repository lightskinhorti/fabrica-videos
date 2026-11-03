"""Panel de la fábrica: una página en tu Mac con la línea de montaje de las tres cuentas.

Uso:
    python3 herramientas/panel.py              (abre http://localhost:8790 en el navegador)
    python3 herramientas/panel.py --sin-abrir  (solo arranca el servidor)

Lee cada vídeo de videos/<cuenta>/<video>/ (guion.json y publicacion.md), mira si ya tiene voz
(exports/voces) y vídeo (exports/render), y guarda lo que marcas en el panel (aprobado, programado,
día, hora, Instagram y métricas) en datos/estado.json. Solo usa la biblioteca estándar de Python y
solo escucha en este ordenador (127.0.0.1).
"""
import json
import os
import re
import socket
import sys
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(RAIZ, "herramientas", "panel")
RENDER = os.path.join(RAIZ, "exports", "render")
VOCES = os.path.join(RAIZ, "exports", "voces")
ESTADO = os.path.join(RAIZ, "datos", "estado.json")
PUERTO = int(os.environ.get("PANEL_PUERTO", "8790"))

CUENTAS = [
    {"id": "elcontadorloco", "nombre": "El contador loco", "arroba": "@elcontadorloco", "color": "#0d6fd8", "instagram": True},
    {"id": "lascosaspordentro", "nombre": "Las cosas por dentro", "arroba": "@lascosaspordentro", "color": "#a85a22", "instagram": False},
    {"id": "dinerosinlio", "nombre": "Dinero sin lío", "arroba": "@dinerosinlio", "color": "#1d2a44", "instagram": False},
]
# what the page may save for each video, and its type
CAMPOS = {
    "aprobado": bool, "programado": bool, "descartado": bool, "instagram": bool,
    "fecha": str, "hora": str, "v24": str, "v7": str, "entero": str, "seguidores": str, "nota": str,
}
ESTATICOS = {"/": ("index.html", "text/html"), "/panel.css": ("panel.css", "text/css"), "/panel.js": ("panel.js", "text/javascript")}
cerrojo = threading.Lock()


def leer_estado():
    if not os.path.exists(ESTADO):
        return {}
    with open(ESTADO, encoding="utf-8") as f:
        return json.load(f)


def guardar_estado(estado):
    os.makedirs(os.path.dirname(ESTADO), exist_ok=True)
    tmp = ESTADO + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(estado, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, ESTADO)


def publicacion(carpeta):
    """The text to paste in TikTok (description + hashtags) and the duration, from publicacion.md."""
    ruta = os.path.join(carpeta, "publicacion.md")
    if not os.path.exists(ruta):
        return "", None
    texto = open(ruta, encoding="utf-8").read()
    m = re.search(r"## Descripción[^\n]*\n(.*?)(?:\n## |\Z)", texto, re.S)
    d = re.search(r"\(([\d,]+) s\)", texto)
    return (m.group(1).strip() if m else ""), (float(d.group(1).replace(",", ".")) if d else None)


def videos():
    out = []
    for c in CUENTAS:
        base = os.path.join(RAIZ, "videos", c["id"])
        if not os.path.isdir(base):
            continue
        for slug in sorted(os.listdir(base)):
            carpeta = os.path.join(base, slug)
            if not os.path.isfile(os.path.join(carpeta, "guion.json")):
                continue
            try:
                guion = json.load(open(os.path.join(carpeta, "guion.json"), encoding="utf-8"))
            except json.JSONDecodeError:
                guion = {}
            texto, duracion = publicacion(carpeta)
            mp4 = os.path.isfile(os.path.join(RENDER, slug + ".mp4"))
            version = lambda f: int(os.path.getmtime(os.path.join(RENDER, f)))
            portada = os.path.isfile(os.path.join(RENDER, slug + "-portada.png"))
            out.append({
                "id": f"{c['id']}/{slug}",
                "cuenta": c["id"],
                "slug": slug,
                "titulo": guion.get("titulo", slug),
                "duracion": duracion,
                "texto": texto,
                "voz": mp4 or os.path.isfile(os.path.join(VOCES, slug + ".wav")),
                "video": mp4,
                "mp4": f"/media/{slug}.mp4?v={version(slug + '.mp4')}" if mp4 else None,
                "portada": f"/media/{slug}-portada.png?v={version(slug + '-portada.png')}" if portada else None,
            })
    return out


class Panel(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def enviar(self, codigo, cuerpo, tipo="application/json", extra=None):
        datos = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo + ("; charset=utf-8" if tipo.startswith(("text", "application/json")) else ""))
        self.send_header("Content-Length", str(len(datos)))
        extra = dict(extra or {})
        self.send_header("Cache-Control", extra.pop("Cache-Control", "no-store"))
        for k, v in extra.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(datos)

    def do_GET(self):
        ruta = urlparse(self.path).path
        if ruta in ESTATICOS:
            nombre, tipo = ESTATICOS[ruta]
            return self.enviar(200, open(os.path.join(WEB, nombre), "rb").read(), tipo)
        if ruta == "/api/datos":
            with cerrojo:
                estado = leer_estado()
            return self.enviar(200, {"cuentas": CUENTAS, "videos": videos(), "estado": estado})
        if ruta.startswith("/media/"):
            return self.media(unquote(ruta[len("/media/"):]))
        self.enviar(404, {"error": "no existe"})

    def media(self, nombre):
        # only finished videos and covers from exports/render, never anything else
        if not re.fullmatch(r"[\w.-]+\.(mp4|png)", nombre):
            return self.enviar(404, {"error": "no existe"})
        ruta = os.path.join(RENDER, nombre)
        if not os.path.isfile(ruta):
            return self.enviar(404, {"error": "no existe"})
        tipo = "video/mp4" if nombre.endswith(".mp4") else "image/png"
        total = os.path.getsize(ruta)
        rango = re.fullmatch(r"bytes=(\d*)-(\d*)", self.headers.get("Range", ""))
        # the page adds ?v=<modification time> to each file, so a re-rendered video is fetched again
        cache = "max-age=86400"
        with open(ruta, "rb") as f:
            if not rango or rango.group(0) == "bytes=-":
                return self.enviar(200, f.read(), tipo, {"Accept-Ranges": "bytes", "Cache-Control": cache})
            ini = int(rango.group(1)) if rango.group(1) else max(0, total - int(rango.group(2)))
            fin = int(rango.group(2)) if rango.group(1) and rango.group(2) else total - 1
            fin = min(fin, total - 1)
            if ini > fin:
                return self.enviar(416, b"", tipo, {"Content-Range": f"bytes */{total}"})
            f.seek(ini)
            trozo = f.read(fin - ini + 1)
        self.enviar(206, trozo, tipo, {"Accept-Ranges": "bytes", "Content-Range": f"bytes {ini}-{fin}/{total}", "Cache-Control": cache})

    def do_POST(self):
        if urlparse(self.path).path != "/api/estado":
            return self.enviar(404, {"error": "no existe"})
        # the page is only reachable from this machine; reject requests made by other sites
        if re.sub(r":\d+$", "", self.headers.get("Host", "")) not in ("127.0.0.1", "localhost", "[::1]"):
            return self.enviar(403, {"error": "solo desde este ordenador"})
        try:
            pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))) or b"{}")
            vid, cambios = pedido["id"], pedido["cambios"]
        except (ValueError, KeyError, TypeError):
            return self.enviar(400, {"error": "petición mal formada"})
        if vid not in {v["id"] for v in videos()}:
            return self.enviar(400, {"error": f"no hay ningún vídeo {vid}"})
        limpios = {}
        for k, v in cambios.items():
            if k not in CAMPOS or not isinstance(v, CAMPOS[k]) or (isinstance(v, str) and len(v) > 500):
                return self.enviar(400, {"error": f"campo no válido: {k}"})
            limpios[k] = v
        with cerrojo:
            estado = leer_estado()
            estado.setdefault(vid, {}).update(limpios)
            guardar_estado(estado)
        self.enviar(200, estado[vid])


class PanelIPv6(ThreadingHTTPServer):
    address_family = socket.AF_INET6


if __name__ == "__main__":
    # "localhost" may resolve to the IPv6 loopback, so listen on both loopbacks (never on the network)
    servidor = ThreadingHTTPServer(("127.0.0.1", PUERTO), Panel)
    try:
        threading.Thread(target=PanelIPv6(("::1", PUERTO), Panel).serve_forever, daemon=True).start()
    except OSError:
        pass
    url = f"http://localhost:{PUERTO}"
    print(f"Panel de la fábrica en {url} (Ctrl+C para cerrarlo)")
    if "--sin-abrir" not in sys.argv:
        webbrowser.open(url)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
