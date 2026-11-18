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

Pruebas: `voces/.venv/bin/python -m unittest tests.test_clips`