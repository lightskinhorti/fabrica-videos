# PRD — Fábrica de vídeos cortos explicativos (TikTok España)

> Copia del PRD a fecha 2 de noviembre de 2026. La versión viva, con los dos diagramas, está en https://claude.ai/artifact/Pdr1VErJ8vTvNaZ3jAs8GR. A partir de ahora, Claude Code actualiza este archivo.

Nov 1, 2026 · @Javier Hortigüela Valiente

## Resumen

Vamos a construir con Claude Code, en tu ordenador personal, una fábrica de vídeos cortos que explican cosas complejas de forma fácil, con calidad profesional. El objetivo es un ingreso extra cada mes, sin depender de él y con 0 € de inversión inicial.

El estilo de referencia es el vídeo que adjuntaste: personajes 3D sencillos, subtítulos grandes que aparecen palabra a palabra, una cifra que cambia en pantalla y datos e imágenes reales.

Hay dos líneas de ingresos:

1. **TikTok:** cuentas de nichos explicativos en español, que cobran del programa de recompensas de TikTok cuando una cuenta llega a 10.000 seguidores y 100.000 visualizaciones en 30 días.
2. **Instagram:** una cuenta que enseña cómo funciona la fábrica, con un enlace en la bio a packs de configuración para montar tu propia fábrica. Es una venta única, sin llamadas.

Primer hito: tener una cuenta de TikTok dentro del programa de recompensas. \[Estimación: de 3 a 6 meses; no hay datos fiables de cuánto se tarda\]

## Decisiones tomadas

Estas decisiones ya están tomadas y el resto del documento las da por hechas.

| Tema | Decisión |
| --- | --- |
| Plataforma que paga | TikTok: es la única de las grandes que paga por visualizaciones en España |
| Otras redes | Instagram Reels, YouTube Shorts y Facebook, más adelante y con publicación automatizada |
| Mercado | España, en español. Inglés solo para los vídeos que ya funcionen, salvo los temas exclusivos de España |
| Prueba de nichos | Torneo: como máximo 3 cuentas de TikTok activas; cada 2 semanas se sustituye la peor |
| Ritmo | Objetivo de 3 vídeos al día por cuenta, en las horas de más audiencia |
| Cuentas | Independientes: no comparten vídeos ni se apoyan entre ellas |
| Contenido | Explicar cosas complejas de forma fácil de ver y de oír, con calidad profesional y el estilo de los vídeos de referencia |
| Voz y cámara | Voz sintética; nunca tu voz ni tu cara |
| Instagram | Una cuenta que enseña cómo funciona la fábrica, con packs de configuración en la bio |
| Herramienta de vídeo | Vídeo hecho con código y Claude Code, como el de referencia, con HyperFrames y los estilos de lemo-opuscar. Higgsfield queda para cuando haya ingresos |
| Dinero | 0 € de inversión inicial. Claude Max como herramienta de producción, contigo delante |
| Fuera del proyecto | Cursos, formación en directo y llamadas |

## Objetivos y métricas

El objetivo es un extra mensual. No fijamos una cifra todavía: primero hay que demostrar que la fábrica consigue audiencia.

**Hitos, en orden:**

1. La fábrica saca un vídeo de calidad con 5 minutos o menos de tu tiempo.
2. Primer vídeo con más de 100.000 visualizaciones.
3. Una cuenta con 10.000 seguidores y 100.000 visualizaciones en los últimos 30 días, que es lo que pide TikTok para entrar en su programa de pagos.
4. Primer cobro de TikTok.
5. Primera venta de un pack en Instagram.

**Métricas que decide el torneo:**

| Métrica | Qué dice | Dónde se mira |
| --- | --- | --- |
| Visualizaciones por vídeo (la mediana, no la media) | Cuánta gente lo ve normalmente | TikTok Studio |
| Mejor vídeo de las 2 semanas | Si el nicho puede romper | TikTok Studio |
| Porcentaje que ve el vídeo hasta el final | Si engancha | TikTok Studio |
| Seguidores por cada 1.000 visualizaciones | Si la cuenta convence | Cálculo propio |
| Minutos tuyos por vídeo | Si el ritmo es sostenible | Registro propio |

Se mira la mediana porque, en un estudio de Buffer con millones de publicaciones, el vídeo típico se quedaba en unas 500 visualizaciones publicaras lo que publicaras. Publicar más subía sobre todo el techo de los mejores vídeos. \[Fuente: Search Engine Journal sobre el estudio de Buffer, ver Fuentes\]

**Criterios para decidir** \[Supuesto: se ajustan tras las 2 primeras semanas con datos reales\]:

- **Cambiar un nicho:** a las 2 semanas, la cuenta con peor mediana y menos seguidores por cada 1.000 visualizaciones sale del torneo.
- **Apostar por un nicho:** un vídeo por encima de 100.000 visualizaciones, o un ritmo de crecimiento que lleve a 10.000 seguidores en menos de 3 meses.
- **Replantear el proyecto:** si a las 12 semanas ninguna cuenta pasa de 1.000 seguidores y ningún vídeo de 50.000 visualizaciones.

## Alcance

La primera versión es la fábrica más 3 cuentas de TikTok. Instagram y los packs llegan cuando la fábrica ya tenga resultados que enseñar.

**Primera versión:**

- La fábrica en tu ordenador personal: de la idea al vídeo final, vertical, de más de 60 segundos, con voz sintética, subtítulos y sonido.
- Un formato de vídeo al principio y tres al acabar la fase 3.
- 3 cuentas personales de TikTok, una por nicho. Las cuentas de empresa no pueden cobrar del programa de TikTok.
- Una hoja de cálculo con las métricas del torneo.
- Publicación en TikTok a mano o con su programador gratuito.

**Después:**

- Traducción al inglés de los vídeos ganadores.
- Publicación automática en Instagram, YouTube Shorts y Facebook.
- La cuenta de Instagram que enseña cómo funciona la fábrica, y la página con los packs.

**Fuera del proyecto:**

- Cursos, directos y llamadas.
- Herramientas de pago (Higgsfield, ElevenLabs de pago, programadores de pago) hasta que haya ingresos.
- Comprar seguidores o visualizaciones, o hacer que las cuentas se apoyen entre ellas.
- Temas de temario escolar, por el posible conflicto con eduki.

## Formatos de vídeo

La fábrica tendrá 3 plantillas reutilizables. Cada vídeo nuevo solo cambia el guion y los datos, no el código, y eso es lo que permite producir mucho sin perder calidad.

**El estilo, copiado del vídeo de referencia:**

- Dos personajes 3D sencillos que hablan entre ellos: uno pregunta y otro explica.
- Subtítulos grandes que aparecen palabra a palabra, con la palabra clave resaltada en otro color.
- Una cifra en pantalla que va cambiando (altitud, velocidad, tiempo que queda).
- Imágenes reales, por ejemplo fotos de satélite, y efectos de sonido como el viento.
- Frases cortas cada pocos segundos, y cada paso más sorprendente que el anterior.

**Los cinco vídeos nuevos que me pasaste** (uno venía repetido):

| Vídeo | Qué tiene de bueno | Qué copiamos | Qué no copiamos |
| --- | --- | --- | --- |
| El trackpad del Mac con el dedo (@speedy\_devv, en inglés) | Fondo oscuro de cine, el aparato abierto por dentro con piezas de color cobre, un dedo realista que pulsa, y la palabra clave marcada como si fuera texto seleccionado | Este estilo, para la plantilla «Cómo funciona por dentro» | Sus temas y sus guiones. Hacemos otros aparatos con otros textos |
| Cómo hace sus vídeos (@speedy\_devv) | Enseña su fábrica: una línea de tiempo con fotogramas, voz y palabras, y Claude Code haciendo el vídeo. Ofrece su carpeta de reglas en su web a quien comenta una palabra | El formato para la cuenta de Instagram y la forma de entregar los packs | El logo de Claude dentro de nuestra marca |
| Cuánto ha cobrado Messi | Un contador que sube durante 2 minutos, una línea con las etapas de su carrera y un final con pregunta: ¿Messi o Cristiano? | El contador que no para de crecer, para la plantilla «A escala» | La caricatura de una persona real y los escudos de los clubes |
| Vox y tus ayudas (En Plata) | Dibujos planos, marcador rojo en las palabras clave, una encuesta al final y las fuentes en pantalla | Su estructura, para el nicho de política | Su nombre y su marca |
| Editar vídeos con Claude (creadora cocinando) | Confirma las skills que se usan: Remotion, HyperFrames y media-use | Nada del formato | Su cara y su voz, que no van con este proyecto |

**La receta que comparten los que funcionan:**

- Gancho en 2 segundos: algo que choca sobre una cosa que todos conocen. Por ejemplo, «El trackpad de tu MacBook no tiene botón».
- Subtítulos que salen palabra a palabra, con la palabra clave marcada.
- Una idea por plano y un cambio en pantalla cada 2 o 3 segundos.
- Algo que avanza durante todo el vídeo, como un contador o una barra, para que quieras ver el final.
- Notas pequeñas y honestas en pantalla, como «ilustración ampliada», «movimiento exagerado» o «cifra estimada», y las fuentes al final.
- Un cierre que pide compartir o comentar: «Mándaselo a alguien que…», una encuesta o una pregunta con dos bandos.
- Entre 1 y 2 minutos.

**Las 3 plantillas:**

| Plantilla | Qué es | Ejemplo |
| --- | --- | --- |
| ¿Qué pasaría si…? | Una pregunta, una cifra que cambia y una situación que empeora paso a paso | ¿Qué pasaría si saltaras desde 36 km de altura? |
| Cómo funciona por dentro | El aparato se abre por dentro con el estilo del trackpad del Mac: fondo oscuro, piezas que se iluminan al nombrarlas y un dedo que lo usa | Qué pasa dentro de la tarjeta cuando pagas sin contacto |
| A escala | Comparar tamaños, distancias o cantidades alejando la cámara, o con un contador que sube durante todo el vídeo | Cuánto ocupa un millón de euros en billetes |

**Estructura de cada vídeo** \[Supuesto: sale de la receta del vídeo de referencia; se ajusta con los datos\]:

| Tramo | Segundos | Qué pasa |
| --- | --- | --- |
| Gancho | 0 a 2 | La pregunta en pantalla y una imagen que choque |
| Promesa | 2 a 8 | Qué vas a descubrir |
| Desarrollo | 8 a 55 | 4 a 6 pasos, la cifra cambiando, cada paso peor que el anterior |
| Giro | 55 a 65 | El dato más sorprendente |
| Cierre | 65 a 70 | Una pregunta que invite a comentar |

Todos duran más de 60 segundos, porque TikTok solo paga por vídeos de más de un minuto.

## Estilos de animación

Los cinco repositorios que encontraste son skills de Claude Code para hacer vídeos con código. Tres entran en la fábrica y dos no, uno por dinero y otro por licencia.

| Repositorio | Para qué sirve | Licencia | Decisión |
| --- | --- | --- | --- |
| HyperFrames | Monta y renderiza cada vídeo. Trae unos 450 bloques hechos: subtítulos, cifras que cambian, mapas, gráficos y transiciones. La voz va aparte, con Gemini TTS | Apache 2.0, se puede usar para ganar dinero | Sí. Es el motor de vídeo y sustituye a Remotion |
| lemo-opuscar | Biblioteca de 66 estilos visuales, en 2D y en 3D, con una guía de cómo dirigir cada vídeo. Trae también instrumentos para hacer música propia | Código MIT. Lo que hagamos con él es nuestro | Sí. Para diseñar el aspecto de cada plantilla y la música |
| ClaudeAnimationBase | Reglas de ritmo para que el espectador entienda cada momento, y un estilo de dibujo a pincel | MIT | Sí. Sus reglas de ritmo, en todos los vídeos. El dibujo a pincel, solo si un nicho lo pide |
| gbro-collage-broll | Animaciones de recortes de papel | MIT, pero necesita la API de pago de Gemini | Ahora no, porque cuesta dinero. lemo-opuscar tiene un estilo parecido gratis |
| onetake | Vídeos de una sola toma, sin cortes | Solo uso no comercial | No. Los vídeos van a cobrar y su licencia no lo permite. No se instala ni se copia nada de él |

**Estilos de lemo-opuscar que encajan con los nichos** \[Supuesto: se confirma viendo cada demo en su galería\]:

- Ciencia: pizarra blanca, pizarra de tiza o microscopio.
- Coches por dentro: despiece de piezas o plano técnico.
- Dinero cotidiano: datos animados o infografía en perspectiva.
- España a escala: informe con imágenes de satélite reales.

**Reglas para usarlos:**

- Ningún vídeo usa a Clawd, la mascota de Claude que sale en ClaudeAnimationBase y en lemo-opuscar. Es un personaje de Anthropic, y TikTok premia lo original. Nuestros dos personajes se diseñan desde cero.
- Los estilos se usan para crear las 3 plantillas una vez, no para hacer cada vídeo desde cero. Un vídeo completo con lemo-opuscar gasta mucho uso de Claude Max y mucho tiempo de render. Con plantillas, cada vídeo solo cambia el guion y los datos.
- Solo herramientas gratuitas y en tu ordenador. HyperFrames ofrece música y voces de HeyGen si inicias sesión, pero no se usan hasta comprobar que permiten uso comercial.
- La música se hace con los instrumentos libres de lemo-opuscar. Si se usan su piano o su batería, hay que citar a su autor en la descripción del vídeo.
- Antes de cada render se aplican las reglas de ritmo: una idea cada vez, con tiempo para entenderla antes de pasar a la siguiente.

**Por probar en la fase 1** \[Supuesto\]: que los estilos de lemo-opuscar se puedan meter dentro de HyperFrames. Si una plantilla no encaja, se hace con el programa propio de lemo-opuscar, que también usa Kokoro y Whisper.

**Cómo se instalan**, en tu ordenador personal durante la fase 1. HyperFrames pide Node.js 22 o más nuevo, Chrome y FFmpeg. La voz de lemo-opuscar pide Python 3.11, 3.12 o 3.13.

```
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
git clone https://github.com/JohnHeibel/ClaudeAnimationBase.git
```

**Cómo se instaló de verdad (2 de noviembre).** Nada se instaló para todo Claude Code, para no mezclarlo con tu trabajo en eduki:

- **HyperFrames:** sus 3 skills están copiadas solo en este proyecto (`.claude/skills/`).
- **lemo-opuscar:** solo como biblioteca de consulta, en `lemo-opuscar/` (fuera de git). Tiene sus guías, sus herramientas y las 68 fichas de estilo, sin demos ni imágenes. Su programa de render y sus dependencias no están instalados: los vídeos los hace HyperFrames, y el sistema de permisos bloqueó ejecutar su script de instalación descargado de internet. Sus archivos `CLAUDE.md` y `AGENTS.md` se renombraron, porque Claude Code los cargaba como instrucciones y son de terceros.
- **ClaudeAnimationBase:** solo su guía de ritmo, con la licencia, en `guias/ClaudeAnimationBase/`.

**Plan de la fase 1, empezado el 2 de noviembre:**

1. Ideas: 20 ideas para El contador loco, puntuadas, en `ideas/elcontadorloco.md`. Se proponen 5 para los vídeos de prueba y las apruebas tú.
2. Plantilla de El contador loco en HyperFrames con three.js, partiendo del personaje de bloques de la foto de perfil. Del estilo `lowpoly-island` de lemo-opuscar se toman el sombreado plano sin texturas, la llegada de cada pieza con rebote y nota musical, y el zoom para mostrar la escala. El contador enorme arriba y la cámara que se aleja (de casa a planeta) son fijos en todos los vídeos.
3. Primer vídeo completo con la idea más fuerte: investigación con fuentes, guion de más de 60 segundos, voz de Gemini, subtítulos con Whisper, efectos y render.
4. Control automático: duración de más de 60 segundos, subtítulos dentro de la zona visible, volumen y que cada cifra tenga fuente.
5. Los otros 4 vídeos con la misma plantilla, midiendo cuántos minutos tuyos necesita cada uno.

**Avance de la fase 1 (2 de noviembre):**

- **Los 5 vídeos de prueba están hechos y aprobados (2 de noviembre),** todos de más de 60 segundos, en `exports/render/`: 01-ascensor (61,5 s), 02-movil (61,2 s), 03-gato (65,2 s), 04-crecer (64,5 s) y 05-ropa (61,1 s). Cada uno tiene su `fuentes.md` con las cifras y sus fuentes.
- **Cadena de un solo comando:** `bash herramientas/producir.sh videos/<cuenta>/<video>`. Genera la voz con Gemini si falta (la clave está en `.env`, fuera de git), la transcribe con Whisper, mete los tiempos en la escena, hace la mezcla, ajusta el volumen a -14 LUFS, pasa la revisión de HyperFrames y renderiza.
- **Paso 4 a medias:** la duración, el volumen (-14 LUFS, medido en el vídeo final) y la revisión de HyperFrames ya se comprueban solos. Falta comprobar automáticamente que los subtítulos caen en la zona visible y que cada cifra tiene fuente (ahora están en `fuentes.md` de cada vídeo).
- **Lo aprendido con la voz real:**
  - Whisper escribe los números en cifras ("249") y el guion los tiene en palabras para que la voz los lea bien. `herramientas/vozdata.py` empareja las dos versiones aunque no coincidan palabra a palabra, y en los subtítulos salen las cifras.
  - La voz real fue más rápida que la estimación: 60 segundos en vez de 73.
  - Cada hito se queda en pantalla hasta que acaba su frase, para que el contador no se adelante a lo que dice la voz.
- **Tus minutos en el vídeo 1:** aprobar la idea, guardar la clave una vez y ver el vídeo. Se medirá bien con los vídeos 2 a 5, que ya no necesitan que hagas nada con la voz.
- **Tus minutos en los vídeos 2 a 5:** ninguno durante la producción. Tu parte es aprobar las ideas y ver cada vídeo terminado (uno o dos minutos por vídeo). Lo que sí lleva tiempo es la escena 3D de cada vídeo nuevo: la primera vez de cada tema, Claude tarda en montarla y revisarla. Repetir un tema con otro guion (otro ascensor, otro gato) ya sería casi automático.
- **Lo aprendido en los vídeos 2 a 5:**
  - El guion tiene que tener unas 185 palabras para pasar de 60 segundos con esta voz.
  - Los subtítulos van en grupos de 4 palabras y más abajo (hasta 1.420 px), a petición de Javier.
  - HyperFrames sube el volumen unos 3 dB al renderizar, así que el ajuste a -14 LUFS se hace sobre el vídeo final.
  - Tres formas de escena que ya funcionan: subir por una escala (ascensor, termómetro del móvil, montón de ropa), crecer en el sitio con comparaciones a tamaño real al lado (gato, personaje) y los hitos de "solo etiqueta" para comparar sin mover el contador.
- **Motor común (2 de noviembre):** las piezas que se repiten en todos los vídeos de El contador loco (marcador, subtítulos, etiquetas, anclas a la voz, formato de cifras y el personaje de bloques) están en `herramientas/contador/`. Cada vídeo solo construye su escena 3D. Se comprobó con el ascensor: las capturas salen idénticas píxel a píxel.
- **El formato principal es con voz,** como el del ascensor, que a Javier le gustó.
- **Mejora de gráficos (2 de noviembre), a petición de Javier, mirando el vídeo voxel de referencia:**
  - El personaje tiene brazos, piernas, zapatillas y expresiones: sonríe con la boca cerrada, parpadea, respira y en cada hito pone cara de sorpresa (cejas arriba, boca abierta y brazos fuera) antes de volver a sonreír. Antes tenía siempre la boca abierta.
  - Sombras de verdad del sol (antes, círculos oscuros falsos), cielo dibujado dentro de la escena y un brillo suave en las luces.
  - Se acabó el parpadeo de los modelos lejanos: la cámara ajusta su plano cercano a la distancia (las caras casi pegadas se peleaban) y la imagen se dibuja al doble de tamaño y se reduce, lo que suaviza los bordes finos.
  - La oclusión ambiental (GTAO) se probó y se descartó: con esta configuración dejaba un rectángulo oscuro detrás del personaje.
  - El render sigue tardando unos 25 segundos por vídeo.
- **Modo texto, solo como opción:** en vídeos de este tipo mucha gente no pone voz, sino frases cortas en pantalla y una canción de moda (referencia en `referencias/contador-texto-y-cancion.mp4`). Fue una idea de Javier, no un cambio de formato. La fábrica puede hacer esa versión con `producir.sh --texto` si un guion trae frases cortas en `texto`: solo efectos de sonido a -20 LUFS, y la canción se añade al publicar desde la biblioteca de TikTok (meterla en el vídeo haría que TikTok lo silenciara). Se probó con el vídeo 2. Si algún día se prueba en la fase 2, no se publica el mismo vídeo dos veces.

**Primera prueba del estilo del Mac (1 de noviembre).** Vídeo de 21 segundos sobre la tarjeta que paga sin batería. Lo hicieron Claude Code y HyperFrames de principio a fin, sin editar nada a mano. Incluye voz Kokoro en español, efectos de sonido hechos con código y subtítulos con la palabra seleccionada.

- **Ya funciona:** los subtítulos con caja de selección, la tarjeta abierta por dentro con su etiqueta, el campo del datáfono, la corriente por el cobre, el chip que se enciende y el final con «Pagado».
- **Falta para igualar la referencia:** un dedo más realista, más detalle en los objetos y más planos cortos. También falta escuchar si la voz suena natural.
- **Tiempo de render:** sin tarjeta gráfica, unos 6 segundos por fotograma, así que 21 segundos de vídeo tardan una hora. \[Supuesto: en tu Mac, con gráfica, debe ir mucho más rápido; se mide en la fase 1\]
- **Para las plantillas:** HyperFrames puede cambiar textos y datos desde un archivo de variables y renderizar muchos vídeos seguidos.
- **Reutilizar el estilo:** la plantilla, la voz y el sonido están en el proyecto, en `claude/estilo-por-dentro/`, y el estilo está guardado como la skill `video-por-dentro`.

**Lo que salió de la prueba y cómo se arregla:**

- **El render tardó una hora porque se hizo en la nube, sin tarjeta gráfica.** Hay que hacerlo en la Terminal normal de tu Mac, donde Chrome usa el chip gráfico. La conexión de Claude con tu Mac usa una máquina virtual sin acceso a la gráfica, así que no sirve para esto. \[Supuesto: en el Mac bajará a minutos; se mide con el kit de prueba\]
- **Objetivo de velocidad:** menos de unos 0,3 segundos por fotograma. Así un vídeo de 70 segundos tarda unos 10 minutos, y los 9 del día se pueden generar de noche.
- **Revisar con borradores:** se revisa a mitad de tamaño, que son 4 veces menos píxeles, y el tamaño completo se genera una sola vez, al final.
- **Kokoro suena con acento inglés en español.** Queda descartada. Se comparan dos opciones con el mismo guion:
  - Google Chirp 3 HD en español de España: gratis hasta 1 millón de caracteres al mes, y 9 vídeos al día son unos 300.000.
  - Chatterbox V3: licencia MIT, funciona en el Mac y tiene un modelo específico de español de España.
- **El Mac es tuyo, pero también trabajas en él.** Reglas: carpeta aparte, solo cuentas personales (Google, GitHub y tarjeta), trabajar fuera del horario de eduki y, si eduki tiene programas de gestión instalados, un usuario de macOS aparte. Se confirma en la revisión del contrato de la fase 0.

**Resultados en tu Mac (2 de noviembre, con Claude Code):**

- **Render resuelto:** en el MacBook Pro M5 con la gráfica, los 21,2 segundos de vídeo tardaron 20,7 segundos, es decir, 0,035 segundos por fotograma. Mide siempre con el vídeo entero: los trozos con `--start` y `--end` se dibujan con el procesador y salen unas 20 veces más lentos.
- **Voz elegida: Gemini TTS** desde Google AI Studio, con la voz `es-es-concierge-12` (27 años, castellano) y una instrucción de estilo. Chatterbox suena mal, porque la versión publicada aún es la v2. Google Chirp 3 HD suena a IA y algo latinoamericana.
- **Plan gratis de AI Studio:**
  - Funciona en un proyecto sin facturación; si se pasa del límite por minuto, da el error 429.
  - Google no reclama la propiedad del audio.
  - Para quien está en Europa, Google trata los datos del plan gratis como los del plan de pago.
  - La norma de usar solo el plan de pago en Europa es para apps que ofrecen la API a otros usuarios, no para generar tus propios vídeos. \[Supuesto: es nuestra lectura de las condiciones del 23 de marzo de 2026\]
- **Tiempos reales de cada palabra:** la transcripción de HyperFrames da el inicio y el final de cada palabra, que es más preciso que repartirlos por sílabas.
- **Vídeo de la tarjeta rehecho con la voz de Gemini (2 de noviembre):** `exports/render/tarjeta_gemini.mp4`, de 21,2 segundos, renderizado en 13,9 segundos con la gráfica.
  - Los subtítulos usan el texto del guion, con su puntuación, y los tiempos de cada palabra de la transcripción. Las palabras que salían pegadas, como "entonces¿de", se separan.
  - Los momentos de la escena (toque, apertura, campo, corriente, chip y «Pagado») y los efectos de sonido se movieron a la voz nueva. Para cada momento se toman las palabras que lo rodean en la voz antigua y se busca el punto equivalente en la nueva, así se mantiene la sincronía que ya estaba diseñada.
  - `sonido.py` usa las mismas constantes `T_*` que `index.html`, y la mezcla se genera con el entorno de Python de `voces/.venv`.
  - La voz de Gemini dura casi lo mismo que la de Kokoro (termina en 20,45 segundos), así que la duración no cambia. Sigue por debajo del minuto que pide TikTok para cobrar: los vídeos de verdad tendrán que ser más largos.

## Nichos y torneo

Empezamos con 3 nichos de perfiles distintos: uno universal que se puede traducir, uno con un estilo que ya ha demostrado que funciona y uno que paga más por visualización. Los otros 7 esperan turno.

| # | Nicho | Por qué | Riesgo |
| --- | --- | --- | --- |
| 1 (empieza) | ¿Y si X aumentase cada día?: algo cotidiano crece sin parar con un contador, y la cámara se aleja de casa a planeta | Es la familia de la plantilla «¿Qué pasaría si…?», pero más entretenimiento que lección, así que queda lejos del temario escolar. En español casi no hay cuentas así y se traduce bien al inglés | El humor escatológico de la referencia limita marcas: alternarlo con temas limpios |
| 2 (empieza) | Objetos de cada día por dentro: móvil, portátil, tarjeta, coche | Es el estilo del trackpad del Mac, que ya tiene millones de visitas en inglés y en español. Los coches entran aquí | Ya hay cuentas grandes con este estilo. Nombrar marcas solo para explicar, y no promover cambios ilegales en coches |
| 3 (empieza) | Dinero cotidiano en España: nómina, IRPF, hipoteca | Los temas de finanzas pagan más por visualización en TikTok | Explicar, nunca recomendar inversiones |
| 4 | Tecnología e IA explicada fácil | La dominas | Mucha competencia |
| 5 | Qué pasa en el cuerpo cuando entrenas | Te interesa | Dar consejos de salud sin titulación |
| 6 | España a escala: mapas y satélite | Hay imágenes reales gratuitas y aptas para uso comercial (NASA, Copernicus) | Bajo |
| 7 | Historia de España en datos y mapas | Interesa siempre, no caduca | Temas políticos sensibles |
| 8 | Fútbol explicado con datos y tácticas | Mucha audiencia en España, y la plantilla (campo, fichas y flechas) es la más barata de hacer | Sin imágenes de partidos ni escudos. Paga poco por visualización. Mejor conceptos que jugadas concretas, que sin ver el partido pueden salir mal |
| 9 | Cómo se fabrica algo cotidiano | Universal | Hacen falta datos fiables de cada proceso |
| 10 | Videojuegos por dentro: por qué pesan tanto, cómo funciona un motor gráfico | Te interesa | Sin capturas de los juegos |

**Decisión del 2 de noviembre: el torneo empieza con los nichos 1, 2 y 3.**

- **«¿Y si X aumentase cada día?»** sustituye a «¿Qué pasaría si…?» de ciencia. Usa la misma familia de plantilla, tiene menos competencia en español y se aleja del temario de física, que es la zona de eduki.
- **Objetos por dentro** se queda porque es la única plantilla que ya funciona (la tarjeta). Cada objeto nuevo es una escena 3D, así que se empieza con objetos parecidos (móvil, portátil, auriculares) para reutilizar piezas.
- **Dinero cotidiano** gana al fútbol táctico porque paga más por visualización. A cambio, cada cifra tiene que ser exacta y con fuente, y la revisión será más lenta.
- El fútbol táctico se queda en la lista de espera, en el nicho 8. Se descartó para empezar porque paga poco por visualización, aunque tiene más público y su plantilla es más barata.

El dato de finanzas sale de guías de terceros: hablan de 0,80 a 1,20 $ o más por cada 1.000 visualizaciones, frente a 0,40-0,60 $ en entretenimiento. \[Fuente: FlowShorts\]

**Nicho 11, añadido: política española explicada sin opinar.** Tiene mucha demanda y encaja con tu experiencia con el BOE. Ejemplos: cómo funciona el Congreso, qué es una moción de censura, cómo se reparten los escaños o qué cambia con una ley nueva. Entra como primer sustituto del torneo, con cuatro condiciones:

- Explicar cómo funcionan las cosas, sin opinar ni tomar partido.
- Ningún político real como personaje hecho con IA, ni voces que imiten a nadie.
- Cada dato con fuente oficial (BOE, Congreso, INE) y revisado por ti antes de publicar. Al ser información de interés público, el Reglamento de IA pide que una persona revise el texto o que se avise de que está hecho con IA.
- Riesgo de dinero: TikTok no deja cobrar a las cuentas de políticos, partidos y gobiernos. Una guía dice además que el contenido político no cobra del programa de recompensas, aunque no está confirmado en la web oficial. Puede dar mucha audiencia y poco dinero. \[Fuentes: TikTok Newsroom y SocialCal\]

**Formato para este nicho**, sacado del vídeo de En Plata: lo que hay hoy, lo que se propone, lo que se votó, dónde se aplicó, un resumen y una encuesta, con las fuentes al final. Si un vídeo trata de un partido, los demás partidos reciben el mismo formato, para no tomar partido.

**Reglas del torneo:**

1. Como máximo 3 cuentas activas a la vez.
2. Cada 2 semanas se comparan las métricas de la sección Objetivos. La peor cuenta deja de publicar (no se borra) y entra el siguiente nicho de la lista.
3. Ningún vídeo se repite entre cuentas, y ninguna cuenta interactúa con otra.
4. Cuando un nicho cumple el criterio de ganador, se le dedica todo: más ritmo, más plantillas y versión en inglés.
5. A este ritmo se prueban 8 nichos en 12 semanas sin tener nunca más de 3 abiertos.

**Ideas nuevas de Claude Code (archivo IDEAS\_CUENTAS.md):**

- **«¿Y si X aumentase cada día?»** (elegido como nicho 1 el 2 de noviembre): una variante de la plantilla «¿Qué pasaría si…?». Un personaje 3D de bloques hace algo normal, un contador enorme crece sin parar y la cámara se aleja con la escala, de casa a planeta. La referencia es el vídeo del chico de bloques. En español casi no hay cuentas así. Conviene alternar el humor escatológico con temas limpios.
- **Tácticas de fútbol explicadas** (en lista de espera): encaja en el nicho 8. Vista desde arriba con fichas, flechas y zonas, y cada jornada da temas nuevos. Sin escudos, equipaciones reales ni imágenes de retransmisiones.

## Instagram: cómo lo hacemos y packs en la bio

En Instagram, la cuenta enseña cómo funciona la fábrica, igual que hace la cuenta del vídeo de referencia, y en la bio hay una página con packs de configuración. Instagram no paga por visualizaciones en España, así que aquí el dinero sale de los packs.

- **Qué se vende:** packs para montar tu propia fábrica, con plantillas de vídeo, instrucciones y habilidades para Claude Code, y una guía de instalación. Es una venta única.
- **Dónde:** Gumroad se queda el 10 % + 0,50 $ por venta y se encarga del IVA. Polar y Lemon Squeezy cobran 5 % + 0,50 $. \[Fuentes: Checkout Page y Dodo Payments\]
- **Nombre:** "Claude Code" no puede formar parte del nombre del producto, pero sí puedes decir que funciona con él.
- **Promesas:** nada de "gana X € al mes". Solo lo que hace el pack.
- **Vídeos de la cuenta:** también salen de la fábrica, con una cuarta plantilla que enseña el proceso, como hace @speedy\_devv: una línea de tiempo con los fotogramas, la voz y las palabras, y Claude Code haciendo el vídeo.
- **Cuándo empieza:** cuando la fábrica sea estable y haya algún resultado real que enseñar (fase 4).
- **Cómo se entrega:** quien comenta una palabra clave recibe el enlace por mensaje privado, igual que hace @speedy\_devv con su carpeta. \[Supuesto: hace falta una herramienta de mensajes automáticos; se elige en la fase 4\]

## Requisitos de la fábrica

La fábrica convierte una idea aprobada en un vídeo listo para subir. Tú solo intervienes en dos puntos: al aprobar las ideas y al aprobar el vídeo final.

| ID | Paso | Qué hace | Quién |
| --- | --- | --- | --- |
| R1 | Ideas | Propone 20 ideas por nicho, puntuadas por gancho, datos disponibles y riesgo | Claude; tú apruebas |
| R2 | Investigación | Busca los datos, y cada cifra lleva el enlace a su fuente | Claude |
| R3 | Guion | Diálogo de dos personajes con los 5 tramos de la sección Formatos, frases de 12 palabras como máximo y más de 60 segundos | Claude |
| R4 | Voz | Una voz sintética distinta para cada personaje, generada en tu ordenador | Código |
| R5 | Subtítulos | Palabra a palabra, sincronizados con la voz, con la palabra clave resaltada | Código |
| R6 | Montaje | La plantilla recibe el guion, los datos y el audio, y monta personajes, cifra, imágenes y transiciones | Código |
| R7 | Imágenes reales | Solo de fuentes aptas para uso comercial, como NASA o Copernicus, guardando la atribución que piden | Código |
| R8 | Sonido | Efectos y música con licencia comercial. Si TikTok silencia un vídeo por derechos, deja de cobrar | Código |
| R9 | Render | MP4 vertical de 1080 × 1920 a 30 fotogramas por segundo, con portada | Código |
| R10 | Control automático | Comprueba duración, subtítulos dentro de la zona visible, volumen, ortografía y que cada cifra tenga fuente | Código |
| R11 | Aprobación | Ves el vídeo y lo apruebas o lo rechazas con un comentario, en 5 minutos como máximo | Tú |
| R12 | Texto de publicación | Descripción, hashtags y recordatorio de activar la etiqueta de contenido con IA | Claude |
| R13 | Cola | Ordena los vídeos aprobados en las 3 franjas de cada cuenta | Código |
| R14 | Métricas | Una hoja para apuntar cada semana los datos de TikTok Studio, y un informe del torneo cada 2 semanas | Claude y tú |
| R15 | Inglés (fase 4) | Versión en inglés de los vídeos ganadores: guion, voz y subtítulos | Claude y código |
| R16 | Otras redes (fase 4) | Publicación en Instagram, YouTube Shorts y Facebook | Código |

"Claude" significa Claude Code en tus sesiones, contigo delante. "Código" son los programas que Claude Code escribe una vez y luego funcionan solos.

## Límites que hay que respetar

El límite que más aprieta es tu tiempo. Con 3 cuentas a 3 vídeos al día salen 63 vídeos a la semana, así que tu revisión tiene que quedarse en unos 5 minutos por vídeo, unas 5 horas a la semana.

| Límite | Valor | Por qué |
| --- | --- | --- |
| Coste | 0 € hasta el primer ingreso | Regla del proyecto |
| Equipo | Tu ordenador personal, nunca el de eduki. El código va en tu GitHub personal, no en el GitLab de eduki | Evitar cualquier conflicto con la empresa |
| Tu tiempo por vídeo | 5 minutos de media como máximo | Es lo que permite llegar a 3 vídeos al día |
| Tiempo de render | En tu MacBook Pro M5, el render tarda lo mismo que dura el vídeo (0,035 segundos por fotograma) | Dato medido en la prueba del 2 de noviembre |
| Uso de Claude Max | Plantillas reutilizables: Claude escribe guion y datos, no código nuevo en cada vídeo | Los límites de Max suponen un uso normal e individual, y el uso automatizado con `claude -p` gasta de un crédito mensual aparte |
| Calidad | Ningún vídeo sale sin tu aprobación | Normas de originalidad de TikTok |
| Reproducible | Plantillas, configuración e instrucciones en un solo repositorio | Es la base de los packs de Instagram |
| Horario | Todo se trabaja por las tardes y los fines de semana. Lo que caiga en tu horario laboral sale programado | Compatible con tu trabajo |

## Cómo funciona la fábrica

&#91;embedded content: cómo funciona la fábrica · 10 pasos, 3 responsables\]

Claude Code prepara la idea, los datos y el guion en tus sesiones. Después, los programas montan el vídeo solos, y tú solo apruebas y publicas. Si rechazas un vídeo, tu comentario vuelve al guion.

| Pieza | Herramienta | Coste y licencia |
| --- | --- | --- |
| Cerebro | Claude Code con tu Max | Ya pagado. Uso normal e individual |
| Vídeo hecho con código | HyperFrames | Gratis y de código abierto, licencia Apache 2.0, con uso comercial permitido |
| Estilos y música | lemo-opuscar | Gratis, licencia MIT. Sus instrumentos son libres; el piano y la batería obligan a citar al autor |
| Voz | Gemini TTS (Google AI Studio), voz es-es-concierge-12 en castellano | Gratis con el plan de AI Studio, en un proyecto sin facturación. De pago, unos 4 $ al mes para 9 vídeos al día, y unos 8,5 $ desde enero de 2027. Google no reclama la propiedad del audio |
| Sincronizar subtítulos | Whisper, en tu ordenador | Gratis y de código abierto |
| Unir audio y vídeo | FFmpeg | Gratis y de código abierto |
| Imágenes reales | NASA y Copernicus | Gratis, con atribución |
| Métricas | Hoja de cálculo | Gratis |
| Guardar el código | GitHub personal | Gratis |
| Más adelante | Higgsfield y ElevenLabs de pago | Higgsfield cuesta desde unos 19 $ al mes, y su plan gratis no da créditos ni uso comercial. Solo cuando haya ingresos |

## Calendario de publicación

El objetivo es 3 vídeos al día por cuenta, pero se llega por escalones. Si la revisión pasa de 5 minutos o la calidad baja, no se sube de escalón.

| Semanas desde el lanzamiento | Vídeos al día por cuenta | Vídeos a la semana (3 cuentas) | Condición para subir |
| --- | --- | --- | --- |
| 1 y 2 | 1 | 21 | La fábrica funciona de principio a fin |
| 3 y 4 | 2 | 42 | Revisión de 5 minutos o menos y control automático sin fallos |
| De la 5 en adelante | 3 | 63 | Lo mismo, durante 2 semanas seguidas |

**Por qué 3 al día es razonable, con condiciones:**

- TikTok ha recomendado tradicionalmente publicar entre 1 y 4 veces al día.
- En el estudio de Buffer, quien publica 11 o más veces a la semana consigue un 34 % más de visualizaciones por vídeo que quien publica una vez. La mejora viene sobre todo de los mejores vídeos.
- Otro análisis, de TT Calculator, encontró la mejor interacción por vídeo con un vídeo al día, y un 18 % menos con 3 o más. Por eso la calidad va antes que el ritmo.

**Horas:**

- Punto de partida: 18:00, 20:00 y 22:00, separadas al menos 2 horas. \[Supuesto\] En España la actividad se concentra por la tarde-noche, y las 18:00 aparecen como la mejor hora general según datos de TikTok recogidos por Metricool.
- Las tres caen fuera de tu horario laboral, así que se pueden publicar a mano si hace falta.
- A las 2 semanas se ajustan con TikTok Studio, en Audiencia > Actividad de seguidores.
- TikTok tiene un programador gratuito en su web que deja programar con hasta 10 días de antelación. Una fuente dice que exige cuenta de empresa, que no puede cobrar del programa: hay que comprobarlo con una cuenta personal.

**Cómo se publica (revisado el 2 de noviembre):**

Hay tres formas, de menos a más automática:

| Forma | Cómo va | Coste | Problema |
| --- | --- | --- | --- |
| A. TikTok Studio en la web | Claude deja cada vídeo con su texto, hashtags y hora. Tú lo subes y lo programas una vez a la semana, hasta 10 días antes | Gratis | Unos 2 o 3 minutos tuyos por vídeo. Sin comprobar si una cuenta personal puede programar |
| B. Metricool | Programador español que publica solo en TikTok e Instagram con las APIs oficiales. Su ayuda dice que vale para cuentas personales | Gratis para 1 marca (1 TikTok y 1 Instagram); 3 cuentas pasan al plan de pago | Fuentes contradictorias sobre si el plan gratis publica solo y cuántos vídeos al mes deja |
| C. Programa propio con la API de TikTok | Claude escribe un programa que publica cada vídeo aprobado | Gratis | TikTok tiene que auditar la aplicación antes: hasta entonces solo publica en privado y como mucho para 5 usuarios al día. La auditoría pide web, política de privacidad y un vídeo de demostración |

- **Decisión propuesta:** forma A en la fase 2, mientras el torneo decide la cuenta ganadora. En la fase 4, la cuenta ganadora pasa a B o a C, junto con Instagram. Instagram también tiene API para publicar Reels, pero exige cuenta profesional y no está claro si vale la de creador o solo la de empresa.
- **Lo que hace Claude en cada vídeo (R12):** un archivo `publicacion.md` con la descripción, los hashtags, la hora y el recordatorio de la etiqueta de IA. La portada es el primer fotograma, que ya lleva la pregunta en grande.
- **Etiqueta de IA:** TikTok exige etiquetar el contenido hecho con IA que parece real, y puede poner la etiqueta él solo si lo detecta. Los dibujos de bloques no parecen reales y la voz no imita a una persona conocida, pero se activa siempre igualmente, como ya decía el plan. Así no hay riesgo de que retiren un vídeo.
- **Siempre es tu decisión publicar:** ni Claude ni ningún programa publica un vídeo que no hayas aprobado.

## Plan de ejecución

&#91;embedded content: plan de ejecución · 6 fases, 5 filtros\]

Ninguna fase empieza por fecha: empieza cuando se cumple el filtro de la anterior. Las semanas cuentan desde el día que empiezas, así que la semana 4 del plan es la semana 1 del calendario de publicación. Si una cuenta gana antes de la semana 15, se salta directamente a la fase 4.

| Fase | Qué se hace en detalle |
| --- | --- |
| 0 · Preparar | Leer el contrato con eduki y, si hay dudas, consultarlo con un gestor o abogado. Usar solo tu ordenador, tu correo y tus cuentas personales. Crear el repositorio privado en tu GitHub personal. Elegir nombre y foto para las 3 cuentas. |
| 1 · Fábrica mínima | Se instalan las skills de HyperFrames y lemo-opuscar, y Claude Code monta la cadena completa con la plantilla «¿Qué pasaría si…?»: ideas, investigación, guion, voz, subtítulos, montaje, render y control automático. Se hacen 5 vídeos de prueba y se mide cuántos minutos tuyos necesita cada uno. |
| 2 · Torneo | Se abren las 3 cuentas: «¿Y si X aumentase cada día?», objetos por dentro y dinero cotidiano. Un vídeo al día por cuenta, con la etiqueta de IA, y dos al día desde la semana 6. Cada vídeo se apunta en la hoja de métricas. |
| 3 · Ritmo completo | Entran las plantillas «Cómo funciona por dentro» y «A escala». Tres vídeos al día por cuenta. Cada 2 semanas la peor cuenta se cambia por un nicho nuevo, hasta probar 8 nichos. |
| 4 · Ganador | La cuenta ganadora recibe todo el tiempo. Se añaden la versión en inglés, la publicación automática en otras redes y la cuenta de Instagram con la página de packs. |
| 5 · Cobrar | Con 10k seguidores y 100k vistas en 30 días se pide el programa de pago de TikTok. Antes, revisar con el gestor cómo se factura y cómo se declara. |

## Riesgos

El riesgo más probable es que ninguna cuenta despegue. Por eso el proyecto está montado como un torneo con fecha de revisión a las 12 semanas.

| Riesgo | Qué puede pasar | Cómo se reduce |
| --- | --- | --- |
| Ninguna cuenta despega | Meses de trabajo sin ingresos | Torneo de nichos y criterio de replanteo a las 12 semanas |
| TikTok lo ve como contenido de plantilla | Menos alcance y sin cobro | Datos reales en cada vídeo, 3 plantillas distintas y tu revisión de cada vídeo |
| La voz sintética en español suena artificial | La gente se va en los primeros segundos | Resuelto en la prueba: Gemini TTS con la voz es-es-concierge-12 suena natural y en castellano. Plan B: ElevenLabs de pago con el primer ingreso |
| Errores en los datos | Pérdida de confianza y vídeos retirados | Cada cifra con su fuente, control automático y tu revisión |
| Derechos de imágenes o música | Vídeo silenciado o retirado, y sin cobro | Solo fuentes con licencia comercial, con su atribución |
| Límites de Claude Max | Parones a mitad de semana | Plantillas reutilizables y trabajo por lotes en tus sesiones |
| El programador de TikTok exige cuenta de empresa | No se puede programar | Publicar a mano en las franjas de tarde-noche |
| Conflicto con eduki | Problemas en el trabajo, más aún en periodo de prueba | Equipo y cuentas personales, nada de eduki, marca sin tu nombre y revisar el contrato antes de lanzar |
| Cansancio | Dejarlo antes de ver resultados | Subir por escalones y tener una semana de vídeos en reserva |
| TikTok cambia su programa de pagos | Cae el ingreso principal | Otras redes, afiliación y packs de Instagram como respaldo |
| Nicho de política | Mucha audiencia pero poco cobro, y comentarios tóxicos | Las cuatro condiciones de la sección Nichos y torneo |
| Usar a Clawd u otro personaje ajeno | Reclamación de marca y vídeos que no cuentan como originales | Personajes propios diseñados desde cero; Clawd nunca sale |
| Licencia de una skill | Usar en vídeos que cobran una herramienta solo para uso no comercial, como onetake | Solo HyperFrames, lemo-opuscar y ClaudeAnimationBase; revisar la licencia de cualquier skill nueva antes de instalarla |
| Parecerse demasiado a una cuenta concreta | Denuncias, perder la marca de contenido original y no cobrar | Copiar la receta y el estilo, nunca sus temas, guiones ni dibujos; nada traducido de sus vídeos |
| Caricaturas de personas reales | Reclamaciones por derechos de imagen o de marca, como en el vídeo de Messi | Personajes genéricos, sin caras reconocibles ni escudos de clubes |

## Normas, licencias e impuestos

Esta lista hay que tenerla hecha antes de publicar el primer vídeo. La parte de impuestos no es asesoramiento fiscal: confírmala con tu gestor.

**Antes de lanzar:**

- [x] Revisar si el contrato de eduki tiene pacto de plena dedicación. Revisado por ti el 2 de noviembre: no hay nada que prohíba este proyecto. Aun así, la ley prohíbe hacer competencia desleal a tu empresa, y por eso siguen fuera los temas de temario escolar.
- [x] Crear las cuentas de TikTok como personales, con tus datos reales, porque TikTok lo exige para cobrar. Creadas el 2 de noviembre las 3, en TikTok e Instagram: `@elcontadorloco`, `@lascosaspordentro` y `@dinerosinlio`. No se publica nada hasta la fase 2.
- [ ] Activar en cada vídeo la etiqueta de contenido generado con IA. TikTok la exige para el contenido realista y la recomienda para el resto.
- [ ] Poner la atribución de las imágenes: "Copernicus Sentinel data" y el año en las de Copernicus, y el crédito a la NASA en las suyas.
- [ ] Usar solo música y efectos con licencia comercial.
- [ ] Reglamento de IA: revisar tú los textos sobre temas de interés público, como política o dinero, o avisar de que están hechos con IA. Nada de imitar con IA a personas reales.

**Impuestos:**

- [ ] Antes del primer cobro, añadir en Hacienda el epígrafe o epígrafes que correspondan. No hay ninguno específico para creadores de contenido, así que lo decide tu gestor.
- [ ] Preguntar al gestor cómo facturar los pagos de TikTok, porque los hace una empresa extranjera.

* Packs en Gumroad: Gumroad cobra y paga el IVA de cada comprador, y tú le facturas a Gumroad.
* Los ingresos van en la renta como actividad económica, igual que el resto de tu actividad como autónomo.

## Preguntas abiertas

- [x] Mandar como archivo los reels de Instagram de referencia, porque los enlaces no se pueden abrir desde aquí.
- [x] Confirmar qué ordenador personal vas a usar y si tiene espacio para los renders: tu MacBook Pro M5 de 32 GB, con unos 780 GB libres.
- [ ] Comprobar si el programador de TikTok funciona con una cuenta personal.
- [x] Crear el repositorio privado en tu GitHub personal: `lightskinhorti/fabrica-videos`, creado el 2 de noviembre. Git está configurado solo en la carpeta del proyecto, sin tocar tu configuración de trabajo.
- [x] Elegir la voz sintética en español: Gemini TTS, voz es-es-concierge-12.
- [x] Poner nombre a cada cuenta, sin tu nombre real. Elegidos el 2 de noviembre, con el mismo @ en TikTok e Instagram (libres ese día en las dos):
  - «¿Y si X aumentase cada día?»: **El contador loco**, `@elcontadorloco`. Regla de la cuenta: cada vídeo lleva un contador que no para, también los de «¿Qué pasaría si…?».
  - Objetos por dentro: **Las cosas por dentro**, `@lascosaspordentro`. Primero se eligió «Mira por dentro», pero en Instagram `@mirapordentro` estaba cogido (una cuenta desactivada) y `@mirapordentro_` hace exactamente lo mismo, así que se cambió en las dos plataformas para no confundirse con ella.
  - Dinero cotidiano: **Dinero sin lío**, `@dinerosinlio`.
- [ ] Decidir qué incluye cada pack y a qué precio (fase 4).
- [x] Confirmar si el contrato de eduki tiene pacto de plena dedicación: revisado por ti el 2 de noviembre, no hay nada que prohíba el proyecto.

## Fuentes

- Vídeos de referencia: el reel de @vibecodingiseasy y los cinco vídeos que adjuntaste (el trackpad del Mac y cómo hace sus vídeos, de @speedy\_devv; Messi; En Plata; y la creadora que edita con Claude). Son archivos, sin enlace.
- Requisitos del programa de TikTok: [Contentstudio](https://contentstudio.io/blog/tiktok-creativity-program) · [TimeToPost](https://timetopost.co/blog/tiktok-creator-rewards-requirements-2026/)
- Lo que paga TikTok por país: [TTCalculator](https://ttcalculator.net/learn/tiktok-rpm-by-country/)
- Nichos que pagan más: [FlowShorts](https://flowshorts.app/blog/tiktok-pay-per-view)
- Frecuencia de publicación: [Search Engine Journal sobre el estudio de Buffer](https://www.searchenginejournal.com/study-shows-2-5-weekly-tiktoks-deliver-biggest-view-increase/558641/) · [Buffer](https://buffer.com/resources/how-often-should-you-post-on-tiktok/) · [TT Calculator](https://ttcalculator.net/data/engagement/posting-frequency-engagement-correlation/) · [Shortimize](https://shortimize.com/blog/how-often-to-post-on-tiktok)
- Mejores horas en España: [Metricool](https://metricool.com/es/mejores-horas-publicar-tiktok/) · [Mega Digital](https://megadigital.ai/es/blog/mejores-horas-para-publicar-en-tiktok/) · [Kolsquare](https://www.kolsquare.com/es/blog/cual-es-la-mejor-hora-del-dia-para-publicar-en-tiktok)
- Programador de TikTok: [InfluenceFlow](https://influenceflow.io/resources/tiktok-scheduling-tools-the-ultimate-guide-for-creators-and-brands-2026-edition/) · [TimeToPost](https://timetopost.co/blog/how-to-schedule-tiktok-videos)
- Política y monetización: [TikTok Newsroom](https://newsroom.tiktok.com/en-us/updating-our-policies-for-political-accounts) · [SocialCal](https://socialcal.app/blog/how-to-monetize-tiktok)
- Etiqueta de IA en TikTok: [ClipSpeed](https://www.clipspeed.ai/blog/can-ai-videos-be-monetized.html)
- Vídeo silenciado sin cobro: [Soundstripe](https://www.soundstripe.com/blogs/how-much-does-tiktok-pay-per-view)
- Higgsfield: [Creatify](<https://creatify.ai/blog/is-higgsfield-free-free-plan-trials-and-promo-codes-explained-(2026)>) · [Recurdash](https://recurdash.com/subscription-pricing/higgsfield)
- Voz y vídeo: [Kokoro en TTS.ai](https://tts.ai/voices/kokoro/) · [ElevenLabs gratis sin uso comercial](https://dupple.com/learn/is-elevenlabs-free)
- Voz de Gemini: [Condiciones de la API de Gemini](https://ai.google.dev/gemini/terms)
- Estilos de animación: [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) · [HyperFrames](https://github.com/heygen-com/hyperframes) · [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) · [gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) · [onetake](https://github.com/feitangyuan/onetake)
- Imágenes: [NASA Earth Observatory](https://earthobservatory.nasa.gov/ImageUse) · [Copernicus](https://forum.dataspace.copernicus.eu/t/use-of-images-in-media/336)
- Venta de packs: [Checkout Page sobre Gumroad](https://checkoutpage.com/blog/gumroad-fees) · [Dodo Payments sobre Polar y Lemon Squeezy](https://dodopayments.com/blogs/cheapest-merchant-of-record)
- Claude Max: [Documentación de Claude Code](https://code.claude.com/docs/en/legal-and-compliance) · [Tech Insider](https://tech-insider.org/ie/?p=560)
- Reglamento de IA: [Dastra](https://www.dastra.eu/en/blog/ai-act-transparency-rules-what-changes-august-2-2026/60164)
- Competencia desleal: [RSM](https://www.rsm.global/spain/es/node/655)
