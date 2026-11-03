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
import { magnetron } from "./magnetron.js";
import { microondas } from "./microondas.js";
import { cuenco, plato, vaso } from "./menaje.js";
import { placa, bobina, serpentin, tubo } from "./generico.js";
import { nevera, compresor } from "./nevera.js";

export const OBJETOS = { microondas, magnetron, cuenco, plato, vaso, placa, bobina, serpentin, tubo, nevera, compresor };
export { crearMateriales } from "./materiales.js";
export { crearBase } from "./base.js";
