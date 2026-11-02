# Fuentes: Tu tarjeta no tiene batería

| Dato del guion | Cifra usada | Fuente |
|---|---|---|
| La tarjeta sin contacto no lleva batería: se enciende con el campo del datáfono | | Norma ISO/IEC 14443 (tarjetas pasivas de proximidad), resumida en [Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_14443) y en la nota de aplicación de NXP [AN13453](https://www.nxp.com/docs/en/application-note/AN13453.pdf) |
| La antena es un hilo o pista de cobre que da varias vueltas por el borde | 4 vueltas en el dibujo | Ejemplos de antenas de tarjeta de 4 y 6 vueltas en un artículo de NXP y la TU Graz ([PDF](https://graz.elsevierpure.com/files/2805742/PID1143279.pdf)). El número real depende de cada tarjeta |
| El campo del datáfono "va y viene trece millones y medio de veces por segundo" | 13,56 MHz = 13.560.000 veces por segundo (se dice 13 millones y medio) | ISO/IEC 14443 ([Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_14443)) |
| El chip contesta "gastando a ratos un poco más de energía" | | Modulación de carga: la tarjeta conecta y desconecta una carga y el lector nota el cambio (subportadora de 847,5 kHz, 1/16 de 13,56 MHz). Patente y documentación de NXP citadas arriba |
| Cada pago crea un código nuevo que solo vale para ese pago | | Criptograma dinámico de EMV: "every contactless payment transaction includes dynamic data that is unique for that transaction" ([Secure Technology Alliance](https://www.securetechalliance.org/?p=42035)); el contador de transacciones hace que cada criptograma sea distinto |
| Todo pasa en menos de medio segundo | menos de 0,5 s | Infineon anuncia chips de pago con transacciones de menos de 200 ms ([eeNews Europe](https://www.eenewseurope.com/en/security-chip-targets-contactless-payment/)). Se dice "menos de medio segundo" para dejar margen |
| El datáfono está hecho para leer a menos de 4 cm | 4 cm | Thales: la distancia óptima es de 4 cm o menos ([Thales](https://www.thalesgroup.com/en/node/2729834)); el Banco de Bangladés describe lo mismo ([The Financial Express](https://old.thefinancialexpress.com.bd/trade/contactless-service-to-make-card-based-transactions-easier-1531457844)) |
| En España, por encima de 50 € pide el PIN | 50 € por operación | Límite subido de 20 a 50 € en 2020 ([Merca2](https://www.merca2.es/2020/03/25/mastercard-contactless), [HelpMyCash](https://www.helpmycash.com/blog/el-limite-para-pagar-con-las-tarjetas-contactless-aumenta-por-el-covid-19-que-precauciones-debemos-tomar/)); el Banco de España recuerda que es por operación ([Que.es](https://www.que.es/2024/06/26/banco-de-espana-advierte-pagar-tarjeta-movil/2/)). Algunos comercios lo piden antes: está en la nota de la pantalla |

Cifras solo de la ilustración (no son datos): importe de 12,50 € y de 62,00 € en el datáfono, el código "9F27 4C1A" y el número 4821 de la tarjeta.

Notas en pantalla: "Ilustración ampliada y simplificada", "Campo mostrado en ámbar: en realidad es invisible", "Corriente mostrada en ámbar · valores ilustrativos" e "Importes de ejemplo · algunos comercios piden el PIN antes".
