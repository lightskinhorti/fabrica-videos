# Fábrica de vídeos cortos (TikTok España)

Proyecto personal de Javier: una fábrica de vídeos cortos explicativos, hecha con Claude Code, para ganar un dinero extra cada mes con TikTok. El documento principal es `PRD.md`; léelo antes de cambiar nada importante. `LEEME.md` cuenta cómo se hicieron las pruebas de render y de voz, y `IDEAS_CUENTAS.md` recoge las ideas de cuentas.

## Cómo trabajar con Javier

- Respuestas en español sencillo, explicadas por partes y con ejemplos. Sin mezclar inglés y español, sin emojis y sin darle la razón solo por complacer.
- Siempre que hagas un plan, actualiza también `PRD.md`. El PRD es lo más importante.
- En los bloques de comandos para la Terminal del Mac, nada de comentarios con `#` en la misma línea. Las explicaciones van fuera del bloque.
- Puedes hacer commits y `git push` sin preguntar. Las merge requests las crea él.
- Pide permiso antes de cualquier acción en servidores (crear usuarios, cambiar permisos…). En este Mac puedes crear y editar archivos sin preguntar.

## Separación con su trabajo en eduki (obligatorio)

Este Mac es de Javier, pero también lo usa para trabajar en eduki:

- Solo cuentas personales: Google, AI Studio, GitHub y la tarjeta. Nunca credenciales, proyectos de Google Cloud ni repositorios de eduki.
- Ojo: `gcloud` puede tener configurada la cuenta de eduki. No la uses aquí.
- Ojo: el correo global de git es el de eduki. En este proyecto, git tiene que usar el correo personal con `git config user.email` dentro de la carpeta (nunca `--global`), y comprobarlo antes del primer commit. Las claves de voz van en variables de entorno de proyectos personales.
- Todo el proyecto vive en esta carpeta, fuera de `~/dev`.
- Se trabaja fuera del horario de trabajo.
- Nada que compita con eduki: ni material educativo ni temarios escolares.

## Estado (2 de noviembre de 2026)

- **Render resuelto:** en este Mac (M5) sale a 0,035 segundos por fotograma con `--browser-gpu`. Mide siempre con el vídeo entero: los trozos con `--start`/`--end` se dibujan con el procesador.
- **Voz elegida:** Gemini TTS desde AI Studio, voz `es-es-concierge-12`, con la instrucción de estilo de `voces/voz_gemini.py`. Usa el plan gratis, en un proyecto sin facturación. Descartadas: Kokoro, Chatterbox y Google Chirp 3 HD.
- **Tiempos de cada palabra:** `exports/voces/transcript.json`, sacado con la transcripción de HyperFrames.
- **La plantilla** (`render/index.html`) ya lleva la voz de Gemini con sus tiempos reales, y `render/assets/mezcla.wav` es la mezcla nueva. El vídeo está en `exports/render/tarjeta_gemini.mp4`.
- **Mezcla:** `sonido.py` necesita numpy, scipy y soundfile, que están en `voces/.venv` (no en el Python del sistema): `../voces/.venv/bin/python sonido.py ../exports/voces/gemini_esesconcierge12.wav 21.2`. Sus constantes `T_*` tienen que ser iguales a las de `index.html`.

## Qué hay en la carpeta

- `PRD.md`: el plan completo. La versión viva, con diagramas, es un Claude Doc (el enlace está al principio del archivo).
- `referencias/`: los vídeos de referencia.
  - `00`: el original de @vibecodingiseasy.
  - `01`: el trackpad del Mac con el dedo, que es el estilo favorito.
  - `02`: cómo hace sus vídeos el mismo autor.
  - `03`: el contador de lo que ha cobrado Messi.
  - `04`: En Plata, sobre política.
  - `05`: una creadora que edita con Claude.
  - `que-pasaria-si-escalada-voxel.mp4`: el chico de bloques.
- `render/`: la plantilla del estilo "por dentro" y `sonido.py`, que crea los efectos y la mezcla.
- `voces/`: el guion y los scripts de voz.
- `exports/`: todo lo que se genera.
- `.claude/skills/`: la skill del estilo (`video-por-dentro`, con la receta del guion y las lecciones aprendidas) y las tres skills de HyperFrames.

## Decisiones ya tomadas

- **Motor de vídeo:** HyperFrames (Apache 2.0), con escenas de three.js.
- **Estilos y música:** lemo-opuscar (MIT).
- **Reglas de ritmo:** ClaudeAnimationBase (MIT).
- **Descartados:** onetake (su licencia es solo no comercial), gbro-collage-broll (necesita la API de pago de Gemini Video) y las cuentas de HeyGen.
- **Personajes:** nunca a Clawd, caricaturas de personas reales ni escudos de clubes. Personajes propios.
- **Otras cuentas:** se copia la receta y el estilo, nunca sus temas ni sus guiones.
- **Nichos del torneo (2 de noviembre):** "¿Y si X aumentase cada día?", objetos por dentro y dinero cotidiano. El fútbol táctico queda en lista de espera porque paga poco por visualización. Detalle en el PRD, sección "Nichos y torneo".

## Siguiente paso

Hechos el 2 de noviembre: el paso 0 (skill del estilo instalada), el paso 1 (vídeo de la tarjeta con la voz de Gemini, en `exports/render/tarjeta_gemini.mp4`), el paso 2 (nichos del torneo elegidos, ver "Decisiones ya tomadas") y la revisión del contrato con eduki (Javier no ha encontrado nada que lo prohíba).

3. **Resto de la fase 0 del PRD:**
   - Repositorio privado en el GitHub personal de Javier: `gh` aún no tiene sesión iniciada, y git necesita su correo personal en esta carpeta. Sin subir `node_modules`, `.venv`, ni los vídeos de `referencias/` (son de otras cuentas).
   - Nombre y foto para las 3 cuentas, sin el nombre real de Javier.
