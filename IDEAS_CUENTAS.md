# Ideas de cuenta

Nichos que encajan con la fábrica: animación 3D con three.js y GSAP, voz de Gemini (`es-es-concierge-12`) y vídeos verticales de 1 a 2 minutos.

## 1. "¿Qué pasaría si X aumentase cada día?"

**Estado:** elegido para el torneo el 2 de noviembre, como nicho 1.

Cada vídeo coge algo cotidiano y lo hace crecer sin parar (cada segundo, cada día, cada vez que pasa algo) para ver hasta dónde llega y qué consecuencias tiene.

**Referencia:** vídeo en inglés de un chico en 3D de bloques (estilo voxel) cuya fuerza al hacer pis se duplica cada segundo, de 4 PSI a 2,4 × 10³⁰ PSI. Está en `referencias/que-pasaria-si-escalada-voxel.mp4` y dura 1 min 50 s.

**Cómo es el formato:**
- Un personaje low-poly hace algo normal, y un contador grande arriba enseña cómo crece una magnitud: el doble cada segundo, +10 % cada día, +1 cada vez que…
- Debajo del número, una comparación real que va cambiando: "más fuerte que una manguera de bomberos", "más que el núcleo de la Tierra", "más rápido que la luz", "suficiente para partir la Luna".
- La cámara se aleja con la escala: casa, barrio, ciudad, planeta, espacio.
- Gags entre medias (un falso telediario con titular absurdo, un "dato curioso") y un remate de una frase al final.

**Por qué encaja:**
- Es una plantilla: cambian la cosa que crece, el ritmo y las comparaciones, y la escena 3D se reutiliza.
- Las comparaciones dan la parte de divulgación (órdenes de magnitud, física, crecimiento exponencial), igual que el vídeo de la tarjeta.
- En español apenas hay cuentas de este formato.

**Ideas de episodios:**
- ¿Y si tu estornudo fuera el doble de fuerte cada segundo?
- ¿Y si crecieras 1 cm más cada día?
- ¿Y si tu móvil se calentara un grado más cada minuto?
- ¿Y si cada día hubiera el doble de palomas en tu calle?
- ¿Y si tu salto fuera el doble de alto cada vez que saltas?
- ¿Y si tu sueldo subiera un 1 % cada día? (interés compuesto)

**Cuidado:** el humor escatológico del vídeo de referencia funciona, pero limita las marcas con las que se puede colaborar. Mejor alternarlo con temas limpios.

## 2. Tácticas de fútbol explicadas

**Estado:** en lista de espera (nicho 8 del PRD). Se quedó fuera del arranque porque paga poco por visualización; en su lugar entra dinero cotidiano.

**Cómo es el formato:**
- Vista cenital de un campo con jugadores como fichas o muñecos low-poly, flechas animadas para pases y desmarques, y zonas sombreadas para los espacios.
- Una pregunta como gancho ("¿Por qué ese equipo juega sin delantero centro?"), y después la explicación paso a paso con la jugada a cámara lenta.

**Por qué encaja:**
- Las fichas, flechas y zonas son fáciles de animar con GSAP. El 3D permite girar la cámara a la altura del jugador para enseñar lo que ve.
- Tiene muchos temas de actualidad: cada jornada deja jugadas que explicar, y el fútbol tiene mucho público en España.

**Ideas de episodios:**
- Qué es un falso 9 y por qué descoloca a los centrales.
- La salida de balón 3+2: cómo se supera la presión.
- Pressing tras pérdida: los 5 segundos para recuperar.
- Por qué la defensa adelanta la línea para dejar en fuera de juego, y cuándo sale mal.
- El rondo: el ejercicio que explica todo un estilo de juego.

**Cuidado:** sin escudos, equipaciones reales ni imágenes de retransmisiones, porque tienen derechos. Nombrar equipos y jugadores en el texto o en la voz sí se puede.

## 3. Historias interactivas: los comentarios deciden

**Estado:** apuntada el 2 de noviembre, sin cuenta asignada todavía.

Una historia por capítulos con un personaje fijo. Cada vídeo acaba en un momento de decisión con 2 o 3 opciones en pantalla ("A, B o C: comenta"), y la opción más votada es la que pasa en el siguiente capítulo.

**Ejemplos de Javier:**
- Un chaval que lleva años encerrado en su cuarto (granos, desorden, cero vida social) consigue una cita, y los comentarios deciden qué se pone, qué dice, a dónde la lleva…
- Un chaval se encuentra 10 millones de euros, y en cada capítulo elige entre varias opciones: devolverlos, gastárselos, invertirlos, desaparecer…

**Por qué encaja:**
- Pedir que comenten para elegir genera muchos comentarios, y los comentarios pesan mucho en el algoritmo de TikTok.
- La gente sigue la cuenta para saber cómo acaba: crea seguidores, no solo visualizaciones sueltas.
- El personaje low poly y la voz de Gemini ya están hechos.

**Cuidado:**
- Al principio habrá pocos comentarios. Hay que decidir antes qué pasa si casi nadie vota (gana el comentario con más "me gusta", o decides tú).
- No se pueden adelantar capítulos: cada uno espera a la votación del anterior, así que la producción va al ritmo de la historia (1 o 2 días por capítulo).
- Quien llegue al capítulo 5 no ha visto los anteriores: cada capítulo necesita un resumen de 3 a 5 segundos al principio.
- Que la gracia esté en lo que le pasa al personaje, no en reírse de su aspecto. Si el chiste es "mira qué gordo y qué granos", puede acabar denunciado y TikTok le quita alcance.
- La de los 10 millones podría ser una serie de @dinerosinlio, con cada opción acompañada de un dato real. Antes hay que comprobar qué dice la ley española sobre el dinero encontrado (Código Civil, hallazgo).

## 4. Vídeos satisfactorios animados

**Estado:** descartada por Javier el 2 de noviembre, después de ver los riesgos de abajo (cobro a partir de 1 minuto, posible "contenido poco original" y mucha competencia). Se deja apuntada por si algún día cambia algo.

Animaciones 3D hipnóticas sin explicación: piezas que encajan perfectas, canicas que bajan por un circuito, una prensa que aplasta cosas, fichas de dominó que caen en espiral, bloques que se ordenan por colores, cosas que se cortan en láminas finas. Sin voz: solo el sonido de cada golpe y una canción de moda puesta en TikTok.

**"Hecho con IA", en nuestro caso:** Claude escribe la escena 3D en código (three.js en HyperFrames, como los otros vídeos). Gratis y con el mismo resultado en cada render. Los generadores de vídeo con IA (Veo, Kling y similares) son de pago y ya se descartaron por eso.

**Por qué encaja:**
- No necesita voz, así que no gasta el límite diario de Gemini (10 voces).
- No tiene idioma: vale para todo el mundo sin traducir.
- La gente lo ve varias veces seguidas. Ver el vídeo entero y repetirlo es lo que más pesa en el algoritmo.
- Es muy de plantilla: una escena (por ejemplo, el circuito de canicas) da decenas de vídeos cambiando colores, piezas y recorrido.
- Es el formato "texto y canción de moda" que propuso Javier para los vídeos de acción.

**Cuidado:**
- **Dinero:** TikTok solo paga vídeos de más de 1 minuto, y lo satisfactorio suele funcionar en 10 a 30 segundos. Habría que encadenar 4 o 5 escenas por vídeo, y no está comprobado que la gente aguante el minuto entero.
- **Contenido "poco original":** el programa de pagos exige contenido original y de calidad. Vídeos muy repetitivos hechos en serie podrían quedarse fuera. No está comprobado: hay que leer las normas actuales antes de abrir la cuenta.
- **Competencia:** es un nicho enorme, con cuentas de millones de seguidores. Hace falta un toque propio. Por ejemplo, objetos cotidianos de España, o mezclarlo con El contador loco ("¿cuántas canicas caben en…?") o con Las cosas por dentro (objetos que se desmontan pieza a pieza).
- **Sonido:** es la mitad del efecto. Los sonidos sintetizados con numpy pueden sonar falsos. Habría que probar con sonidos libres (por ejemplo, de Freesound con licencia CC0) o mejorar los sintetizados.
- **Física:** cortar arena o deformar jabón de forma realista es difícil en three.js. Lo fácil son piezas rígidas (canicas, dominó, engranajes, encajes, ordenar) y lo low poly.
- **Etiqueta de IA:** siempre activada, como en las otras cuentas.

**Ideas de episodios:**
- El circuito de canicas más largo: 1.000 canicas por 12 rampas.
- Piezas que encajan perfectas en su hueco, cada vez más difíciles.
- Dominó en espiral que dibuja una figura al caer.
- Ordenar 500 bloques por colores, de caos a degradado.
- La prensa contra objetos de bloques (sin marcas reales).

## 5. Formas de ganar dinero invirtiendo poco, en internet o fuera

Idea de Javier del 12 de noviembre: "formas de ganar dinero en internet invirtiendo poco y en internet o no, eso sí que va a enganchar a la gente". Apuntada, sin decidir ni empezar.

Cada vídeo coge una forma concreta de ganar dinero (vender en Wallapop o Vinted, hacer encuestas, alquilar el trastero, afiliación, vender fotos, dar clases, reparto, revender…) y cuenta con cifras qué hace falta para empezar, cuánto se gana de verdad y cuánto tiempo lleva.

**Por qué encaja:**
- Pasa las 5 preguntas del PRD ("Ganchos y temas") con nota alta: le toca el bolsillo a todo el mundo, sorprende y se comenta.
- Invita a comentar sin forzarlo: mucha gente ya lo ha probado y tiene opinión ("eso no da ni para un café").
- El gancho sale solo: una cifra y una promesa ("30 € al mes sin salir de casa").
- Se puede hacer con el motor plano de Dinero sin lío, que es el más rápido de producir.
- Es el nicho que mejor enlaza con los packs de la fábrica: la propia fábrica de vídeos es una de esas formas.
- Suele estar entre los temas mejor pagados por los anunciantes (dato general, sin cifra comprobada).

**Cuidado:**
- **Choca con la regla de Dinero sin lío** ("explicar, nunca recomendar"). O es una cuenta nueva, o hay que cambiar esa regla. En la misma cuenta no caben las dos cosas.
- **Es el nicho con más humo y más estafas.** Para distinguirse: solo cifras reales y con fuente (o probadas por nosotros), contar también lo que no funciona y nunca prometer ingresos. Un formato posible: "lo probé 7 días y gané esto".
- **Nada de inversiones, criptomonedas, trading ni apuestas.** En España, recomendar inversiones al público está regulado por la CNMV, y TikTok limita ese contenido. Solo trabajo, venta y servicios.
- **Publicidad encubierta:** si un vídeo habla de una aplicación o una plataforma concreta, no se cobra por ello sin decirlo, y mejor no nombrar marcas.
- **Impuestos:** lo que se gane con estas formas también se declara. Decirlo en los vídeos da credibilidad.
- **Competencia:** es un nicho enorme en español. El toque propio serían las cifras medidas y el enfoque de España (Wallapop, autónomos, Hacienda).
- **Sin comprobar todavía:** qué exige TikTok a este tipo de contenido y si lo deja entrar en su programa de pagos.

**Ideas de episodios:**
- Vendí todo lo que no uso en una semana: cuánto saqué.
- Cuánto pagan de verdad las encuestas de pago, por hora.
- Lo que deja alquilar una plaza de garaje o un trastero.
- Cuánto gana un repartidor por hora, quitando gastos.
- Vender fotos del móvil en bancos de imágenes: cuántas hacen falta para ganar 10 €.
- Cuánto cuesta y cuánto deja poner una máquina expendedora.
- La afiliación de Amazon con nuestras propias cifras.

**Cómo probarlo sin abrir cuenta:** un par de vídeos de este tipo en Dinero sin lío, contados como explicación ("cuánto se gana de verdad con…") y sin recomendar, para ver si retienen más que los de ahora.
