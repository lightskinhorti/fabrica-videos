# Fuentes: Este QR funciona aunque le falte un trozo

Leídas el 12 de noviembre de 2026.
- Denso Wave (la empresa que creó el QR), "Error correction feature": [página](https://www.qrcode.com/en/about/error_correction.html)
- Denso Wave, "QR Code Standardization" (norma ISO/IEC 18004 y los niveles de corrección): [página](https://www.qrcode.com/en/about/standards.html)
- Denso Wave, "History of QR Code" (los cuadrados de las esquinas y su proporción): [página](https://www.qrcode.com/en/history/)
- Thonky.com, "QR Code Tutorial" (tabla de corrección de errores y colocación de módulos): [tabla](https://www.thonky.com/qr-code-tutorial/error-correction-table) y [colocación](https://www.thonky.com/qr-code-tutorial/module-placement-matrix)

| Dato del guion o de la pantalla | Cifra usada | Fuente |
|---|---|---|
| Un QR lleva un código Reed-Solomon añadido a los datos, y con él se restaura aunque esté sucio o dañado | | Denso Wave, "Error correction feature": "The QR Code error correction feature is implemented by adding a Reed-Solomon Code to the original data" y "QR Code has error correction capability to restore data if the code is dirty or damaged" |
| Cuatro niveles, L, M, Q y H, que recuperan aproximadamente el 7, 15, 25 y 30 % de las palabras de código | 7, 15, 25, 30 % | Denso Wave, "QR Code Standardization": "Level L: Approx. 7% of codewords can be restored", "Level M: Approx. 15%...", "Level Q: Approx. 25%...", "Level H: Approx. 30%..." |
| Es porcentaje de palabras de código, no de superficie (por eso "depende de dónde caiga el golpe") | | Las mismas frases de Denso Wave: "of codewords". La norma habla de palabras de código; el vídeo lo dice así |
| El nivel más usado es el M (15 %) | 15 % | Denso Wave, "Error correction feature": "Typically, Level M (15%) is most frequently selected" |
| La norma ISO/IEC 18004 define el QR | | Denso Wave, "QR Code Standardization": "QR Code is established as an ISO (ISO/IEC18004) standard" |
| Tres cuadrados en las esquinas avisan de que hay un código y su proporción (1:1:3:1:1) es la menos usada en lo impreso; se puede leer desde cualquier ángulo de 360° | 1:1:3:1:1 | Denso Wave, "History of QR Code": los cuadrados de posición, la proporción 1:1:3:1:1 elegida por ser la menos usada en materiales impresos y la lectura "regardless of the angle of scanning, which could be any angle out of 360°" |
| Los cuadrados de las esquinas no guardan datos (son "function patterns", elementos que no son de datos) | | Thonky, "Module Placement in Matrix": los patrones de posición, separadores, alineación, temporización y el módulo oscuro son "function patterns", elementos que no son de datos; los datos se colocan saltándolos |
| Módulo oscuro = 1, claro = 0 | | Thonky, "Module Placement in Matrix": "Use white pixels for 0, and black pixels for 1" |
| Ocho módulos forman una palabra de código (8 bits) | 8 | Convención de la norma (un byte por palabra de código); se comprobó con el código de ejemplo: 29 × 29 con 567 módulos de datos = 70 palabras × 8 + 7 bits de relleno |
| Este código de ejemplo (versión 3, nivel H) tiene 70 palabras: 26 de mensaje y 44 de repuesto | 70, 26, 44 | Thonky, tabla de corrección: "3-H: 26 datos, 22 de corrección por bloque, 2 bloques de 13" (13 × 2 = 26 de datos; 2 × (13 + 22) = 70 en total; 70 − 26 = 44 de repuesto) |
| El QR del vídeo es inventado (el texto "Hola desde dentro"), no lleva a ninguna web ni es de ninguna marca | | Hecho con la librería segno (versión 3, nivel H, texto "Hola desde dentro"), comprobado con el lector de OpenCV |

Cifras y comprobaciones propias (no vienen de una fuente, salen de pruebas hechas con el propio código de ejemplo):
- La pegatina del vídeo tapa 90 módulos, el 11 % de la superficie (90 de 841), y toca 18 de las 70 palabras de código (el 26 %). Con ella, el lector de OpenCV sigue leyendo "Hola desde dentro" aunque la pegatina sea gris claro o mediano. Con una pegatina más grande (110 módulos, 19 palabras) también se lee; con 143 módulos (23 palabras, el 33 %) ya no.
- Tapando uno de los tres cuadrados de las esquinas, el mismo lector no lo lee (nota en pantalla: "En esta prueba, con un cuadrado tapado no se lee"). No es una regla general de todos los lectores.
- Los módulos amarillos que "se rehacen" encima de la pegatina son los módulos oscuros reales que hay debajo: es una ilustración de lo que recupera el lector, no de cómo lo calcula.

Matices:
- La norma habla de "aproximadamente": el porcentaje exacto depende de la versión del código y de dónde caiga el daño.
- Las notas en pantalla: "Código de ejemplo inventado: no lleva a ninguna web", "Ilustración ampliada, no a escala", "Oscuro = 1, claro = 0", "Ejemplo: versión 3, nivel H · 26 + 44 palabras", "Ilustración simplificada", "Porcentajes de palabras de código recuperables (Denso Wave)", "El porcentaje es de palabras de código, no de superficie".
- No se da ningún consejo ni se habla de estafas con QR.
