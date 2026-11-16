# Fuentes: ¿Un cargador enchufado sin móvil gasta luz?

Leídas el 16 de noviembre de 2026.
- Reglamento (UE) 2019/1782 de ecodiseño para fuentes de alimentación externas (texto en legislation.gov.uk, artículo 2 y anexo II): [artículo 2](https://www.legislation.gov.uk/eur/2019/1782/article/2), [anexo II](https://legislation.gov.uk/eur/2019/1782/annex/II?view=plain)
- Monolithic Power Systems, nota de aplicación AN069 (controlador de retorno HFC0400), leída del PDF: [documento](https://media.monolithicpower.cn/mps_cms_document/a/n/an069_r1.0_1.pdf)
- Monolithic Power Systems, "An Introduction to Flyback Converters": [página](https://www.monolithicpower.com/en/learning/resources/an-introduction-to-flyback-converters-parameters-topology-and-controllers)

| Dato del guion o de la pantalla | Fuente |
|---|---|
| Desde abril de 2020 el límite del cargador vacío es 0,10 W | Reglamento 2019/1782, anexo II, 1(a): consumo en vacío "from 1 April 2020"; para salida de CA a CC de hasta 49,0 W (y baja tensión) el máximo es 0,10 W (0,21 W por encima de 49 W) |
| "Cargador vacío" = enchufado y sin nada conectado | Reglamento, artículo 2(14), condición de vacío: la entrada conectada a la red y la salida "not connected to any primary load" |
| El reglamento habla de fuentes externas que convierten la corriente de la red en una salida de menor tensión, de hasta 250 W | Reglamento, artículo 2(1). Que los cargadores USB de móvil entran en el anexo I (equipos domésticos y de oficina) no se ha comprobado línea por línea |
| Un transformador la convierte en baja tensión, separada de la red | MPS, introducción al convertidor de retorno: la bobina acoplada "isolates the converter's input from its output"; el reglamento define la salida como de menor tensión |
| Un chip abre y cierra la corriente miles de veces por segundo | MPS AN069: controlador de retorno con frecuencia de conmutación fija de 25 kHz en carga media (25.000 veces por segundo); es un ejemplo de controlador, no el de un cargador concreto |
| Sin móvil casi deja de conectar y solo da ráfagas | MPS AN069: con carga muy baja o nula, el controlador "enters burst-mode"; deja de dar señal a la puerta y la reanuda al bajar la tensión de salida, "alternately enables and disables the switching of the MOSFET thereby reducing switching loss at no load" |
| Algo gasta: el propio chip y unas resistencias que descargan un condensador | MPS AN069: el controlador de ejemplo evita "the power loss caused by the X-CAP discharge resistors", lo que implica que en diseños sin esa función esas resistencias gastan; el gasto del propio chip es el de cualquier circuito alimentado. No se dice cuánto gasta cada pieza |
| Una décima de vatio durante un año son menos de 1 kWh, 876 Wh | Cálculo: 0,10 W × 24 h × 365 días = 876 Wh = 0,876 kWh. Es el máximo legal, no una medición |
| 8.760 horas es un año | Cálculo: 24 × 365 |
| Un hervidor de 2.000 W gasta lo mismo en 26 minutos | Cálculo: 0,876 kWh ÷ 2 kW = 0,438 h ≈ 26 min. Los 2.000 W son un ejemplo elegido por nosotros, no un dato de un aparato concreto (nota en pantalla: "Ejemplo de cálculo") |
| Veredicto: es verdad, pero desenchufarlo apenas ahorra | Consecuencia de las cifras anteriores: como máximo, menos de 1 kWh al año por cargador moderno |

Matices (lo que no se ha podido confirmar):
- El límite de 0,10 W vale para los cargadores nuevos puestos en el mercado de la UE desde abril de 2020. Un cargador antiguo o de fuera de la UE puede gastar más: no se ha encontrado una fuente fiable con la cifra y el vídeo no la da.
- El límite es lo máximo permitido, no lo que mide cada cargador. Por eso el medidor de la pantalla dice "LÍMITE LEGAL" y la nota "Límite legal, no una medición".
- Los dibujos del interior son una ilustración típica de un cargador de retorno (transformador, condensador grande, puente, chip, optoacoplador, condensador de filtro y resistencias): no es el esquema de ninguno real. La señal del chip del panel es un dibujo, sin escala de tiempo.
- Sin precio de la luz: el vídeo no dice cuántos euros son para no citar una tarifa sin fuente.
- Sin marcas: el cargador, el medidor y el enchufe son inventados.
