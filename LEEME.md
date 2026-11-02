# Prueba en tu Mac: velocidad del render y voces en español

Este kit sirve para dos cosas:

1. Medir cuánto tarda el render en tu Mac, usando su chip gráfico.
2. Comparar varias voces en español con el mismo guion de la tarjeta: Chatterbox, Google Chirp y Gemini.

Atajo: abre Claude Code en esta carpeta y dile "Sigue el LEEME.md paso a paso y avísame de cada resultado".

## Antes de empezar

Como este Mac también lo usas para trabajar, separa bien las dos cosas:

- Pon esta carpeta en tu carpeta de usuario (`~/fabrica-prueba`), lejos de las carpetas de eduki.
- Usa solo tus cuentas personales: Google, GitHub y la tarjeta. Nunca las de eduki.
- Trabaja en esto fuera de tu horario de trabajo.
- Si eduki tiene instalado algún programa de gestión o de seguridad en este Mac, es más limpio crear un usuario de macOS aparte para la fábrica. Revísalo con tu contrato.

## 1. Medir la velocidad del render

Comprueba que tienes Node 22 o más nuevo:

```
node --version
```

Si no lo tienes, o es más antiguo, instálalo con Homebrew. También hace falta FFmpeg para montar el vídeo:

```
brew install node ffmpeg
```

Prepara el proyecto y genera el vídeo entero (21,2 segundos, 636 fotogramas):

```
cd ~/fabrica-prueba/render
bash preparar.sh
time npx -y hyperframes@0.8.228 render --browser-gpu -o ../exports/render/prueba-completa.mp4
```

Si sale el error "Chrome not found", ejecuta esto y repite el último comando:

```
npx -y hyperframes@0.8.228 browser ensure
```

Cómo leer el resultado: divide el tiempo "real" que imprime `time` entre 636 y tendrás los segundos por fotograma. Para confirmar que ha usado la gráfica, busca `--use-angle=metal` en lo que imprime. Si pone `--use-angle=swiftshader`, ha dibujado con el procesador.

- En la nube, sin gráfica, salía a unos 6 segundos por fotograma.
- Para hacer 9 vídeos al día de unos 70 segundos, conviene bajar de unos 0,3 segundos por fotograma. Así cada vídeo tarda unos 10 minutos y los 9 se pueden generar de noche.
- En un MacBook Pro M5 sale a unos 0,035 segundos por fotograma: el vídeo entero en 22 segundos.

No midas con un trozo (`--start 0 --end 2`). Ese modo siempre dibuja con el procesador, aunque pongas `--browser-gpu`, y en el M5 da unos 0,8 segundos por fotograma.

## 2. Voz A: Chatterbox, gratis y en tu Mac

```
cd ~/fabrica-prueba/voces
python3.11 -m venv .venv
.venv/bin/pip install chatterbox-tts "setuptools<81"
.venv/bin/python voz_chatterbox.py
```

- Si no tienes Python 3.11, instálalo con `brew install python@3.11`.
- `setuptools<81` hace falta porque las versiones nuevas quitaron `pkg_resources`. Sin él falla con `'NoneType' object is not callable`.
- La primera vez descarga el modelo, que ocupa varios GB, y tarda un rato.
- Crea el archivo `chatterbox_v2.wav`. La última versión publicada de Chatterbox (0.1.7) aún no trae el modelo v3. Si algún día lo trae, se llamará `chatterbox_v3.wav`.

## 3. Voz B: Google Chirp 3 HD

Pasos en la web, solo una vez y con tu cuenta personal de Google:

1. Entra en console.cloud.google.com y crea un proyecto nuevo llamado `fabrica-videos`.
2. En "Facturación", vincula una cuenta de facturación con tu tarjeta personal. Google la pide aunque no cobre nada mientras no pases el millón de caracteres gratis al mes. Esta prueba usa unos 2.000.
3. En "Facturación" > "Presupuestos y alertas", crea un presupuesto de 1 € con aviso al 50 % y al 100 %. Es solo un aviso: no corta el servicio.
4. Busca "Cloud Text-to-Speech API" y actívala.
5. En "Credenciales" > "Crear credenciales" > "Clave de API", crea una clave y restríngela a "Cloud Text-to-Speech API".

Después, en la Terminal:

```
cd ~/fabrica-prueba/voces
export GOOGLE_TTS_KEY=PEGA_AQUI_TU_CLAVE
python3 voz_google.py
```

Crea hasta 4 archivos `google_<voz>.wav`, con voces de hombre y de mujer.

Chirp suena mejor si lee el guion entero de una vez en lugar de frase a frase. `python3 voz_google.py` va frase a frase; `python3 voz_google_natural.py` lo lee entero y crea `google_charon_entero.wav`.

## 4. Voz C: Gemini TTS, la elegida

Gemini TTS acepta una instrucción de estilo (edad, acento, tono) y tiene voces nativas de España. Es la que mejor ha sonado: `es-es-concierge-12`, de 27 años, en castellano.

Se usa desde Google AI Studio, no desde Google Cloud: en Cloud, Gemini no acepta claves de API y da un error 403.

Pasos en la web, solo una vez y con tu cuenta personal de Google:

1. Entra en aistudio.google.com/apikey y pulsa "Crear clave de API".
2. Elige crear un proyecto nuevo, no `fabrica-videos`. Un proyecto con facturación exige saldo prepagado (mínimo 5 $) y, sin saldo, da el error 402. Uno sin facturación usa el plan gratis.

Después, en una pestaña de la Terminal. No funciona con `!` desde el chat de Claude, porque ahí no se puede pegar la clave:

```
cd ~/fabrica-prueba/voces
read -s "GEMINI_API_KEY?Pega tu clave de AI Studio: " && export GEMINI_API_KEY && echo
python3 voz_gemini.py
```

- Sin nada más, prueba las 3 voces de hombre de España más jóvenes y guarda todas en `voces_gemini_lista.txt` (hay 12, de 23 a 59 años).
- Para usar voces concretas: `python3 voz_gemini.py es-es-concierge-12`.
- El estilo se cambia en la variable `ESTILO` de `voz_gemini.py`.
- Crea `gemini_<voz>.wav`. Si sale un error 429, es el límite del plan gratis: espera un minuto y repite.

**Para que Claude genere las voces sin ti** (solo una vez): guarda la clave en el archivo `.env` de la raíz del proyecto. Git lo ignora y `chmod 600` hace que solo tu usuario del Mac pueda leerlo. Desde la raíz del proyecto:

```
read -s "K?Pega tu clave de AI Studio: " && printf 'GEMINI_API_KEY=%s\n' "$K" > .env && chmod 600 .env && unset K && echo
```

Desde entonces `voz_gemini.py` lee la clave de ahí si no hay variable, y `herramientas/producir.sh` genera la voz del vídeo cuando falta.

Precio de pago: 0,00225 $ por cada 10 s de audio hasta el 31-12-2026 y 0,0045 $ desde el 1-1-2027. Para 9 vídeos de 70 s al día son unos 4 $ al mes, y unos 8,5 $ desde enero.

Opcional: `voz_elevenlabs.py` prueba ElevenLabs (variable `ELEVENLABS_KEY`). No se ha probado todavía y su API cuesta unos 0,08 $ por cada 1.000 caracteres, unos 24 $ al mes al mismo ritmo.

## 5. Escuchar y elegir

En la carpeta `exports/voces` tendrás (todo lo que generamos va a `exports/`):

- `kokoro_actual.wav` (este está en `voces/`, viene con el kit): la voz actual, la que suena a guiri.
- `chatterbox_v2.wav`: suena mal.
- `google_charon.wav`, `google_orus.wav`, `google_kore.wav` y `google_aoede.wav`, y `google_charon_entero.wav`: suenan algo a IA y algo latinoamericanas.
- `gemini_<voz>.wav`: la elegida es `gemini_esesconcierge12.wav`.

Resultado de la primera prueba, en un MacBook Pro M5: render a 0,035 segundos por fotograma y voz Gemini `es-es-concierge-12`.

Ideas de cuenta para la fábrica: ver [IDEAS_CUENTAS.md](IDEAS_CUENTAS.md).
