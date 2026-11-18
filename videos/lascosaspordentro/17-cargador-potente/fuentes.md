# Fuentes: ¿Un cargador potente estropea tu móvil?

Leídas el 18 de noviembre de 2026.
- USB Implementers Forum, página de USB Power Delivery (USB Charger PD): [usb.org/usb-charger-pd](https://www.usb.org/usb-charger-pd)
- Electrical Safety First (Reino Unido), nota de prensa sobre cargadores falsos, actualizada el 27 de octubre de 2025: [nota](https://www.electricalsafetyfirst.org.uk/press-and-media/counterfeiters-are-developing-new-and-dangerous-tactics-to-dupe-consumers-experts-warn/)

| Dato del guion o de la pantalla | Fuente |
|---|---|
| El móvil y el cargador negocian y el móvil pide solo la potencia que necesita | USB-IF: USB PD permite a los dispositivos "negotiate for only the power they require" |
| Los cargadores más potentes llegan a 240 W | USB-IF: USB PD 3.1 entrega "up to 240W of power" con cable y conector USB Type-C (tensiones fijas de 28, 36 y 48 V para 140, 180 y 240 W) |
| 116 cargadores falsos de 20 W analizados | Electrical Safety First: "116 counterfeit and look-alike Apple 20W adapters" (el vídeo no nombra la marca) |
| 107 fallaron una prueba de seguridad crítica | Electrical Safety First: "107 out of 116 samples tested failed (92%)" |
| 92 % | 107 / 116 = 92,2 %; coincide con la cifra de la fuente |
| El cargador "no empuja corriente, solo la ofrece" | Explicación de la negociación de USB PD (el cargador anuncia lo que puede dar y el móvil elige); la fuente no lo dice con esas palabras |
| Cargador de 65 W y móvil que pide 20 W | Ejemplo elegido por nosotros, con cifras redondas (nota en pantalla: "Ejemplo ilustrativo") |
| Con un cargador flojo el móvil solo carga más despacio | Consecuencia de la negociación (el móvil pide lo que el cargador puede dar); no está dicho tal cual en la fuente |

Matices (lo que no se ha podido confirmar):
- La página de USB-IF da poco detalle del protocolo y no habla de seguridad eléctrica. "El peligro es el cargador falso" se apoya solo en la nota de Electrical Safety First (falsos que imitan a una marca concreta, de 20 W); no es una cifra de todos los cargadores baratos.
- El 92 % es de esa muestra de falsos, no de todos los cargadores del mercado.
- Los cargadores muy antiguos o sin negociación (5 V fijos) no se han tratado: el vídeo habla de cargadores actuales con negociación.
- Los dibujos del interior son una ilustración típica, no el esquema de un cargador o un móvil reales; sin marcas.
