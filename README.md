# fabrica-videos

El plan completo está en `PRD.md` y el estado del proyecto en `CLAUDE.md`.

## Clips de streamers (`herramientas/clips.py`)

Coge los clips más vistos de un canal de Twitch (sin iniciar sesión), elige los mejores y
deja un vídeo vertical de 1080x1920 con título y subtítulos en `exports/clips/<canal>/`.
No sube nada. Lo ya hecho se apunta en `datos/clips_hechos.json`, así que repetir la orden
no duplica clips.

    voces/.venv/bin/python herramientas/clips.py listar kaicenat --palabras gta
    voces/.venv/bin/python herramientas/clips.py hacer kaicenat --palabras gta --cuantos 3

Opciones: `--rango` (24hr, 7d, 30d, all), `--min-visitas`, `--min-dur`, `--max-dur`,
`--idioma` (el de la voz del clip, para Whisper). Necesita `yt-dlp`, `ffmpeg`, `npx` y el
Python de `voces/.venv` (Pillow). No usa variables de entorno ni cuesta dinero.

Momentos del propio directo (último VOD del canal, o el directo en curso si Twitch ya
publica su VOD):

    voces/.venv/bin/python herramientas/clips.py directo djmariio --cuantos 2 --idioma es

Lista el último VOD con yt-dlp, baja su chat con la API pública de la web de Twitch (sin
cuenta ni claves), cuenta mensajes por ventanas, elige los picos frente a la mediana y baja
solo ese trozo. Deja `exports/clips/<canal>/directo-<idvod>-<segundo>.mp4` y lo apunta en
`datos/clips_hechos.json` (los momentos ya hechos no se repiten). Opciones: `--horas` (solo
las últimas N horas del VOD, por defecto 3), `--antes` (segundos antes del pico, 22),
`--dura` (30 a 75 s, 45), `--ventana` (10 s), `--vod` (id concreto), `--titulo` (por defecto,
las primeras palabras con sentido de lo que se dice). Un chat muy rápido se corta en 800
páginas y avisa.

Una tanda con todos los canales de `datos/clips_canales.json`, y la cola de subida:

    voces/.venv/bin/python herramientas/clips_tanda.py --solo-clips
    voces/.venv/bin/python herramientas/clips_cola.py pendientes
    voces/.venv/bin/python herramientas/clips_cola.py preparar <id> --titulo "Título de arriba"
    voces/.venv/bin/python herramientas/clips_cola.py subido <id>

`preparar` deja en `exports/clips/subida/` una copia de menos de 10 MB. La subida a TikTok
(`@gta6sinparar`) la hace la tarea programada `clips-gta6sinparar` de la app de Claude; las
decisiones están en `docs/decisiones-clips.md`.

Pruebas: `voces/.venv/bin/python -m unittest tests.test_clips tests.test_clips_cola`