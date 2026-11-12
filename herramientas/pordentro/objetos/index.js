// Biblioteca de objetos de Las cosas por dentro. Cada objeto se hace una vez y se reutiliza en los vídeos
// siguientes: en la escena (JSON) se pide por su tipo, { "tipo": "microondas", "id": "horno" }, y sus partes
// se nombran "horno.magnetron" o, si no se repite el nombre, solo "magnetron".
//
// Para añadir un objeto: un módulo nuevo en esta carpeta que exporte una función (THREE, C, X, M, opciones)
// y devuelva la definición que explica base.js; luego, una línea en OBJETOS.
//
// Objetos (tipo → partes):
//   microondas  puerta, rejilla, panel, pomo, pantalla, cavidad, plato, cuenco, magnetron, guia, transformador,
//               ventilador, placa, condensador                                (de 07-microondas, 3 nov)
//   magnetron   anodo, iman, catodo, cavidad, antena, aletas, filtro, electron (de 07-microondas, 3 nov)
//   cuenco      borde, sopa, base        plato  centro, ala        vaso  agua, borde
//   placa       chip, centro             bobina hilo, centro
//   serpentin   entrada, salida, centro, arriba, abajo                tubo  inicio, fin, medio
//   nevera      puerta, congelador, asa, pantalla, junta, iman, estantes, yogur, leche, botella, tarro, verduras,
//               interior, interiorCong, fondo, aislante, termostato, luz, compresor, condensador, condArriba,
//               condAbajo, filtro, capilar, evaporador, evapCong, aspiracion, descarga, atras, arriba, suelo
//               (08-nevera, 3 nov; curvas: descarga, condensador, salida, capilar, evaporador, puente,
//               evapCong, aspiracion)
//   compresor   cupula, piston, cilindro, motor, bobinado, descarga, aspiracion, rele      (08-nevera, 3 nov)
//   mando       led, ventana, punta, placa, chip, cristal, goma, boton, pastilla, pistas, pilas, power, ok, arriba,
//               abajo (curvas: pista, aLed, haz)                                  (09-mando, 7 nov; mandos en mando.js)
//   tele        pantalla, ventana, receptor, piloto, placa, pie                  receptor  lente, diodo, chip, patas,
//   movilCamara pantalla, visor, lente                                                     cuerpo, salida
//   senalIR     inicio, aparato, boton, cero, uno, destello, lupa, sol, centro, final      (09-mando, en senales.js)
//   espectro    visible, ir, rojo, marca, ojo, centro                                      (09-mando, en senales.js)
//   raton       led, lente, sensor, chip, prisma, foco, base, ventana, rueda, boton, interruptor, lamina, placa,
//               cable, arriba                                                     (10-raton, 7 nov; mandos en raton.js)
//   mesa        centro, canto    (opciones: { "tipo": "madera" | "cristal", "ancho", "fondo" })
//   superficie  centro, fibra, grano, marco          fotosRaton  antes, ahora, centro, flecha, pila
//   monitor     pantalla, flecha
//   auriculares copa, copaD, micro, microDentro, chip, placa, altavoz, iman, almohadilla, bateria, diadema, centro,
//               oido, fuera, corte                              (11-auriculares, 11 nov; mandos en auriculares.js)
//   ondasSonido ruido, copia, suma, centro, dos, aprieta, afloja            (11-auriculares, en auriculares.js)
//   pendrive    conector, contactos, memoria, controlador, cristal, led, placa, carcasa, centro
//               (12-usb, 11 nov; mandos en pendrive.js: luz, datos)
//   celdaFlash  puerta, flotante, oxido, aislante, sustrato, fuente, drenador, canal, reserva, defectos, lado, centro
//               (12-usb; mandos: carga, volt, signo, lee, bombeo, desgaste, fuga, rebote)
//   memoriaCeldas  centro, bloque, sol, agua  (12-usb; mandos: ver, rellena, foto, bloque, borra, olvida)
//   movilBateria  bateria, placa, chip, conector, carcasa, marco, centro (13-bateria, 11 nov; mandos: capacidad, calor)
//   celdaIon    anodo, catodo, separador, electrolito, cobre, aluminio, costra, iones, circuito, centro
//               (13-bateria; mandos: carga, ciclo, vel, calor, costra, circuito)
//   barrasCapacidad  col1, col2, col3, col4, ref, centro  (13-bateria; mandos: ver, a, b, ref, foco)
//   codigoQR    centro, plano, esquinaTL, esquinaTR, esquinaBL, hueco, modulos, cinta, panel, razon  (14-qr, 12 nov; mandos en codigoqr.js:
//               tapa, repara, golpe, lectura, lecturaMal, esquinas, proporcion, escaneo, bits, reparto, palabra, cinta,
//               danadas, corregidas, giro)
//   nivelesQR   colL, colM, colQ, colH, centro  (14-qr; mandos: ver, a, foco, usado)
// (09-mando y 10-raton, hechos antes de registrarlos, aún los pasan a mano con crearPlantillas(..., { objetos });
// funciona igual, porque lo que se pasa a mano manda sobre esta lista.)
import { magnetron } from "./magnetron.js";
import { microondas } from "./microondas.js";
import { cuenco, plato, vaso } from "./menaje.js";
import { placa, bobina, serpentin, tubo } from "./generico.js";
import { nevera, compresor } from "./nevera.js";
import { mando, tele, receptor, movilCamara } from "./mando.js";
import { senalIR, espectro } from "./senales.js";
import { raton, mesa, superficie, fotosRaton, monitor } from "./raton.js";
import { auriculares, ondasSonido } from "./auriculares.js";
import { pendrive, celdaFlash, memoriaCeldas } from "./pendrive.js";
import { movilBateria, celdaIon, barrasCapacidad } from "./bateria.js";
import { codigoQR, nivelesQR } from "./codigoqr.js";

export const OBJETOS = {
  microondas, magnetron, cuenco, plato, vaso, placa, bobina, serpentin, tubo, nevera, compresor,
  mando, tele, receptor, movilCamara, senalIR, espectro, raton, mesa, superficie, fotosRaton, monitor,
  auriculares, ondasSonido, pendrive, celdaFlash, memoriaCeldas, movilBateria, celdaIon, barrasCapacidad, codigoQR, nivelesQR,
};
export { crearMateriales } from "./materiales.js";
export { crearBase } from "./base.js";
