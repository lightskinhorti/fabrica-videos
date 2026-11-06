# Fuentes: Tu ratón hace miles de fotos por segundo

| Dato del guion o de la pantalla | Cifra usada | Fuente |
|---|---|---|
| El ratón óptico lleva un sensor que es, en el fondo, una cámara diminuta que hace fotos seguidas de la mesa | | [Wikipedia, Computer mouse](https://en.wikipedia.org/wiki/Computer_mouse) ("an optoelectronic sensor (essentially, a tiny low-resolution video camera) to take successive images of the surface"); [Avago, ADNS-2610, hoja de datos](https://datasheet.sic-components.com/ADNS-2610.pdf) ("optically acquiring sequential surface images (frames)") |
| Hace miles de fotos por segundo; un sensor sencillo, 1.500 | 1.500 fotos por segundo (ADNS-2610); en general, "mil o más" | [Avago, ADNS-2610, hoja de datos](https://datasheet.sic-components.com/ADNS-2610.pdf) ("Frame Rate ... 1500 frames/s"); [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) ("Optical mice capture one thousand successive images or more per second") |
| Debajo hay una luz roja (LED), una lente y el chip del sensor | LED rojo de 639 nm en el ADNS-2610 (no sale en pantalla) | [Avago, ADNS-2610, hoja de datos](https://datasheet.sic-components.com/ADNS-2610.pdf) (sensor, lente HDNS-2100 y LED rojo HLMP-ED80 de 639 nm); [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) ("The color of the optical mouse's LEDs can vary, but red is most common") |
| La luz llega muy inclinada, casi rasante, y cada relieve de la mesa hace sombra | | [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) ("These surfaces, when lit at a grazing angle by a light emitting diode, cast distinct shadows"); [Avago, ADNS-2610](https://datasheet.sic-components.com/ADNS-2610.pdf) (la lente ilumina la superficie "at the optimum angle") |
| El sensor de muchos ratones tiene 18 × 18 píxeles | 18 × 18 = 324 píxeles | [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) ("an image sensor having an 18 × 18 pixel array of monochromatic pixels"); [Avago, ADNS-2610](https://datasheet.sic-components.com/ADNS-2610.pdf) (el registro Pixel_Sum "sums all 324 pixels in the current frame") |
| Las fotos son en gris | 64 niveles de gris (de 0 a 63) en el ADNS-2610 | [Avago, ADNS-2610](https://datasheet.sic-components.com/ADNS-2610.pdf) ("The data ranges from 0 for complete black, to 63 for complete white") |
| Compara cada foto con la anterior y calcula cuánto se ha corrido: eso es el movimiento | | [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) ("Optical mice mathematically process these images using cross correlation"); [Avago, ADNS-2610](https://datasheet.sic-components.com/ADNS-2610.pdf) ("These images are processed by the DSP to determine the direction and distance of motion") |
| Los botones son interruptores (microinterruptores) | | [Wikipedia, Computer mouse](https://en.wikipedia.org/wiki/Computer_mouse) ("Mouse buttons are microswitches") |
| El clic es una lámina de metal que salta | | [Wikipedia, Miniature snap-action switch](https://en.wikipedia.org/wiki/Miniature_snap-action_switch) (mecanismo de punto de vuelco con un muelle plano que salta de golpe; "produces a very distinctive clicking sound") |
| Sobre un cristal, liso y transparente, el ratón óptico no funciona | | [Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse) (no siguen bien "glossy and transparent surfaces"); [Wikipedia, Computer mouse](https://en.wikipedia.org/wiki/Computer_mouse) (problemas con "a transparent or reflective surface, such as glass") |
| Una película son 24 fotos por segundo | 24 fotogramas por segundo | [Wikipedia, Frame rate](https://en.wikipedia.org/wiki/Frame_rate) ("the rate of 24 FPS became standard for 35 mm sound film") |

Cifras solo de la ilustración (no son medidas):
- Las fotos dibujadas (los grises de cada píxel) son inventadas; el tamaño, 18 × 18, es el del sensor de arriba. AHORA es la foto de ANTES corrida 2 píxeles hacia atrás: es un ejemplo, no una medida.
- La superficie de la mesa vista de cerca, sus sombras y la luz roja están dibujadas y muy ampliadas.
- La lectura sube de 0 a 24 y de 24 a 1.500: solo cuenta hasta los datos de arriba.

Matices:
- No todos los sensores son de 18 × 18 ni hacen 1.500 fotos por segundo: el guion dice "en muchos ratones" y "un ratón sencillo". Hay sensores con más píxeles y más fotos por segundo.
- Algunos ratones (los de iluminación de campo oscuro) sí funcionan sobre cristal ([Wikipedia, Optical mouse](https://en.wikipedia.org/wiki/Optical_mouse): "Optical mice that use dark field illumination can function reliably even on such surfaces"). El vídeo habla de un ratón óptico normal.
- El LED también puede ser infrarrojo y algunos ratones usan láser; el vídeo enseña el caso más común, el LED rojo.
- Sin marcas en el ratón, la mesa ni el monitor.

Notas en pantalla: "Fotos dibujadas, muy ampliadas", "Ilustración simplificada, sin marca", "Corte lateral, ampliado", "Mesa vista muy de cerca, luz dibujada", "Como el sensor de un ratón sencillo", "Imagen ilustrativa", "Pantalla ilustrativa, sin marca", "Corte lateral, muy ampliado", "Luz dibujada", "El cine clásico: 24 fotos por segundo" y "Sensor de un ratón sencillo, según su hoja de datos".
