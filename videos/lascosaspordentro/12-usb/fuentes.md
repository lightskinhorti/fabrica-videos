# Fuentes: Tu pendrive no tiene pilas

Fuentes técnicas (no Wikipedia): una nota de aplicación de un fabricante de memorias y una presentación de un fabricante de chips.
- Swissbit, nota de aplicación AN2107 "NAND flash endurance testing" (2022, licencia CC BY 4.0): [PDF](https://www.swissbit.com/media/pages/support/application-notes/nand-flash-endurance-testing/4c7c8c72fd-1777284966/an2107en_nand_flash_endurance_testing.pdf)
- Krishna Parat (Intel), "NAND Technology", Hot Chips 25, Stanford, 25 de agosto de 2013: [PDF](https://old.hotchips.org/wp-content/uploads/hc_archives/hc25/HC25.0T2-Storage-epub/HC25.25.220-NAND-Technology-Parat-Intel.pdf)

| Dato del guion o de la pantalla | Cifra usada | Fuente |
|---|---|---|
| La memoria flash es no volátil: guarda sin pila (la tensión solo hace falta para escribir y leer) | | Parat (Intel), diapositiva 2: "Non-volatile memory" |
| Cada celda es un transistor (un interruptor) con una segunda puerta, la puerta flotante | | Swissbit AN2107, apartado 2: la celda "corresponde a la construcción de un transistor de efecto de campo" con otra capa conductora entre la puerta de control y el sustrato |
| La puerta flotante está rodeada de aislante por todos lados y ningún cable la toca | | Swissbit AN2107, apartado 2: "rodeada por todos lados de dieléctricos (SiO2, ONO)" y sin conexión eléctrica conductora; Parat, diapositiva 3: óxido de silicio como óxido de túnel y ONO como dieléctrico entre puertas |
| Escribir es meter electrones en la puerta flotante; borrar es sacarlos | | Parat, diapositiva 4: "Program = Electrons Stored on the Floating Gate", "Erase = Remove electrons from the Floating Gate" |
| Los electrones no pasan por la puerta: atraviesan la pared de óxido por efecto túnel (Fowler-Nordheim) | | Swissbit AN2107, apartado 3: "el efecto túnel de Fowler-Nordheim"; Parat, diapositiva 5: "tunneling electrons through the Tunnel-ox" |
| El chip sube la tensión a unos 20 voltios para escribir | 20 V | Parat, diapositiva 7: las tensiones de programar y borrar "se han mantenido altas, alrededor de ~20 V". El pendrive recibe menos tensión por el USB, así que el chip tiene que subirla por dentro: es una deducción, no una cifra de ninguna ficha. En pantalla: "Valor típico de las celdas NAND" |
| Para leer, el chip mira si la celda deja pasar corriente | | Parat, diapositiva 4: "Read = Look for current through the cell at given gate bias" |
| Con electrones dentro no pasa corriente; sin ellos, sí (ceros y unos) | | Swissbit AN2107, apartado 2: con la puerta flotante cargada negativamente "no se forma canal y el transistor no conduce"; sin carga, conduce. Qué estado es un cero y cuál un uno no se dice en el vídeo (depende del chip) |
| Sin corriente, nada empuja a los electrones a salir | | Deducción física de lo anterior: la carga queda en la puerta flotante aislada (Swissbit AN2107, apartado 2). Matiz: sí se escapan poco a poco, y más con el desgaste (ver más abajo) |
| Borrar es lo contrario y solo por bloques enteros | | Swissbit AN2107, apartado 3: "solo se pueden borrar bloques enteros de flash juntos, mientras que programar se puede hacer de forma más granular" |
| Cada cruce de electrones daña el aislante: se rompen enlaces y aparecen defectos | | Swissbit AN2107, apartado 4: "el óxido de túnel se daña de forma permanente con las operaciones de programar y borrar"; los enlaces atómicos se rompen y crean defectos ("traps") |
| Por los defectos se escapan los electrones | | Swissbit AN2107, apartado 4: los defectos debilitan la barrera y la probabilidad de que un electrón escape aumenta ("trap assisted tunneling", causa de la corriente de fuga inducida por el estrés) |
| Un pendrive casi nuevo recuerda 10 años (lo habitual en las fichas técnicas) | 10 años | Swissbit AN2107, apartado 4: lo habitual es especificar que la flash guarda los datos "al menos 10 años hasta un desgaste del 10 % de los ciclos permitidos de programar y borrar" |
| Con todos los borrados gastados, solo un año | 1 año | Swissbit AN2107, apartado 4: "y 1 año con el número máximo de ciclos" |

Cifras solo de la ilustración (no son medidas):
- Los electrones, los defectos, el campo (puntos dorados) y la corriente (puntos blancos) están dibujados y muy ampliados; la celda no está a escala (la pared de óxido real es mucho más fina que el resto). En pantalla: "Corte simplificado, electrones dibujados" y "Defectos dibujados, ampliados".
- La foto de sol, montañas y agua hecha de celdas es un dibujo de 16 por 24 celdas; un pendrive real tiene miles de millones. En pantalla: "Ilustración ampliada, no a escala".
- Los ceros y unos de la pantalla ("0 1 1 0") son decorativos, no los de ninguna foto.
- "10 AÑOS" y "1 AÑO" salen como texto fijo (no cuentan hacia ningún año). En pantalla: "Retención típica de ficha técnica, no es una garantía".
- Los 20 V de la pantalla cuentan de 0 a 20 como una subida de tensión ilustrativa.

Matices:
- 10 años y 1 año son lo habitual en las especificaciones de endurance y retención de la industria (Swissbit lo dice como "typically"); cada fabricante y cada modelo tiene sus cifras, y el tiempo real depende de la temperatura. El vídeo lo dice como "según las fichas técnicas" y no como garantía.
- No se dice cuántos ciclos aguanta un pendrive ni cuántos electrones caben en una celda: no hay una fuente fiable confirmada para ninguna de las dos cifras.
- Una celda guarda uno o más bits (SLC, MLC, TLC) según cuántos niveles de carga distinga; el vídeo enseña el caso de un bit por celda para simplificar (Swissbit AN2107, apartado 2).
- Los pendrives actuales usan chips NAND con las celdas en vertical (3D) y muchos con trampa de carga en vez de puerta flotante; la puerta flotante es la versión clásica y la que explican las fuentes citadas. Es la simplificación del vídeo.
- Sin marcas en el pendrive: ni letras en los chips, ni logos.

Notas en pantalla: "Sin pila: el pendrive no la necesita", "Foto dibujada con celdas, ilustración", "Sin marca", "Ilustración ampliada, no a escala", "Corte simplificado, electrones dibujados", "Valor típico de las celdas NAND", "Corriente dibujada, ilustración", "Defectos dibujados, ampliados" y "Retención típica de ficha técnica, no es una garantía".
