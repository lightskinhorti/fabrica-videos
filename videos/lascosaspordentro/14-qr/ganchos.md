# Ganchos: el código QR por dentro

Punto de partida del encargo: "Este QR funciona aunque le falte un trozo". Se escriben 10 ganchos de tipos distintos y se puntúan con la lista de 7 comprobaciones del PRD (un punto por cada sí; se hace con 5 o más):

1. Se dice en menos de 2 s (7 palabras como mucho).
2. Se entiende sin sonido, solo con la imagen y el texto.
3. Habla de quien mira ("tú", "tu").
4. Lleva una cifra concreta o contradice algo que la gente cree.
5. Deja una pregunta abierta que solo se resuelve viendo el vídeo.
6. No dice el nombre del tema de una forma que ya dé la respuesta.
7. Es verdad, con fuente (`fuentes.md`).

| # | Tipo | Voz | Texto en pantalla (5 palabras como mucho) | Imagen del fotograma 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Reto + lo que crees es falso | "Tapado, y se lee igual." (5 palabras) | "¿Cuánto se puede tapar?" | QR con una pegatina gris en medio y el panel "LEÍDO" en verde | sí | sí | no | sí (contradice que un QR tapado no se lee) | sí (¿cuánto?, se cierra a mitad y se reabre al final) | sí | sí | **6** |
| 2 | Cifra que te toca | "Treinta por ciento, y sigue leyéndose." (6) | "30 % tapado" | El QR con el 30 % de su superficie tapado | sí | sí | no | sí | no (la cifra ya lo resuelve) | no (da la respuesta) | no (falso: el 30 % es de palabras de código, no de superficie) | 3 |
| 3 | Te cuesta algo | "Tu entrada del concierto aguanta una mancha." (7) | "Una mancha, y entras" | QR con una mancha | sí | sí | sí | no | sí | sí | no (no hay fuente de qué pasa con una entrada concreta; exagerado) | 5, descartado por 7 |
| 4 | Lo haces cada día sin saberlo | "Cada vez que escaneas, un cálculo rehace lo que falta." (10) | "Rehace lo que falta" | QR con módulos amarillos sobre el hueco | no (10 palabras) | sí | sí | no | sí | no | sí | 4 |
| 5 | Pregunta directa | "¿Por qué se lee un QR roto?" (7) | "¿Por qué se lee?" | QR roto | sí | sí | no | no | sí | no (la pregunta ya dice el tema) | sí | 4 |
| 6 | Reto | "Adivina cuánto se puede tapar." (5) | "¿Cuánto aguanta?" | QR con una "?" encima | sí | sí | no | no | sí | sí | sí | 5 |
| 7 | Lo que crees es falso | "Un QR no necesita estar entero." (6) | "No hace falta entero" | QR con trozo faltante | sí | sí | no | sí | no | sí | sí | 5 |
| 8 | Contradice la intuición | "Los cuadrados de las esquinas no guardan nada." (7) | "Tres cuadrados vacíos" | Un solo cuadrado de esquina iluminado | sí | sí | no | sí | sí | sí | sí | 6, pero no cuenta el tema principal (dato de la parte 1) |
| 9 | Cifra pequeña | "Quince por ciento: lo que aguanta casi todo QR." (9) | "15 %" | Columna M en ámbar | no | no | no | sí | sí | no | no ("casi todo" no está en la fuente: solo dice que M es el más usado) | 2 |
| 10 | Algo que le pasa a quien mira | "El último QR que escaneaste estaba lleno de repuestos." (9) | "Lleno de repuestos" | Cinta de 70 palabras | no | sí | sí | no | sí | sí | no (no se sabe qué nivel tenía ese QR) | 4 |

## Elegido: el 1

- **Voz (segundo 0, termina en 1,9 s):** "Tapado, y se lee igual." Cuatro palabras que contradicen lo que la gente cree y no leen el texto: la pantalla pregunta, la voz afirma.
- **Texto en pantalla (4 palabras):** "¿Cuánto se puede tapar?". Dice lo que está en juego y es el reto que se resuelve al final ("hasta el 30 % de los datos").
- **Imagen del fotograma 0 (empezar por el final):** el QR ya con la pegatina gris en medio, el panel verde "LEÍDO · Hola desde dentro" y la cinta de 70 palabras debajo; la cámara ya se mueve y una barra de luz cruza el código. Después el vídeo vuelve atrás ("tres trucos lo hacen posible"). El QR es inventado y no lleva a ninguna web. La pegatina tapa el 11 % de la superficie y toca 26 % de las palabras: se comprobó con un lector que se sigue leyendo.
- **Segundo gancho (segundo 2 a 5):** "Tres trucos lo hacen posible, y el último es matemáticas puras", con un "3" gigante y "TRES TRUCOS". Se cumple: cuadrados, unos y ceros y Reed-Solomon.
- **Pregunta abierta:** "¿Cuánto se puede tapar? Lo verás al final." Se resuelve en "Lo prometido: el nivel más alto aguanta hasta el treinta por ciento".
- **Cebo para comentar (decidido por Javier el 12 de noviembre):** el dato guardado para el final es verdadero y con fuente ("el más usado es el quince, la mitad": Denso Wave dice que el nivel M, 15 %, es el que más se elige), y el cierre es un reto de una palabra o un número, dicho y escrito en el último plano: "Ahora tú: ¿cuánto aguantaría el último QR que escaneaste? Dime un número." Sin datos falsos ni errores a propósito.
- **Por qué este y no el 2 o el 8:** el 2 es falso si no se aclara que el 30 % es de palabras de código, no de superficie, y no cabe en 2 s. El 8 es un buen dato, pero es solo la primera de las tres ideas. El 1 pone el resultado en la imagen y deja la pregunta abierta.
- **Tipo distinto de `13-bateria`:** aquel fue "lo haces cada día sin saberlo"; este es "reto + lo que crees es falso".
