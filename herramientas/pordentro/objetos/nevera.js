// Nevera combi y su compresor (hechos con 08-nevera, 3 nov). Unidades en cm.
//
// compresor(): compresor hermético de nevera, 22 × 19 cm. Cúpula negra soldada en dos mitades, base con gomas,
//   tubos de cobre (aspiración, descarga y servicio) y caja del relé. Dentro (se ve con corte o rayosX): motor con
//   bobinado de cobre, eje, bloque con cilindro y pistón que va y viene, silenciador de aspiración, muelles y aceite.
//   Mandos: motor (0..1, velocidad del pistón), calor (0..1, la cúpula se pone ámbar), vibra (0..1).
//   Partes: cupula, piston, cilindro, motor, bobinado, descarga, aspiracion, rele.
//
// nevera(): combi de 60 × 180 × 63 cm, de acero cepillado, con la puerta de arriba (nevera) y la de abajo
//   (congelador) con bisagra a la izquierda, mirando a +z. Paredes en tres capas (chapa, espuma aislante y
//   plástico blanco), así que el corte lateral (eje x) enseña el aislamiento. Dentro: estantes de cristal,
//   cajón de verduras, yogures, leche, botella, tarro, queso, huevos, cajones del congelador, luz y termostato.
//   Detrás: condensador negro de tubo y varillas, compresor en el hueco de abajo, filtro, capilar, línea de
//   aspiración y evaporadores dentro de la pared del fondo (dentro de la espuma).
//   Mandos: puerta, congelador (0..1, abren), luz (0..1), motor, calor (el condensador y la descarga en ámbar),
//           frio (los evaporadores y el capilar en azul helado), vibra.
//   Partes: puerta, congelador, asa, pantalla, junta, juntaArriba, juntaLado, iman, espuma, puertaEspuma, estantes, yogur, leche, botella, tarro, verduras,
//           interior, interiorCong, fondo, aislante, termostato, luz, compresor, condensador, condArriba,
//           condAbajo, filtro, capilar, evaporador, evapCong, aspiracion, descarga, atras, arriba, suelo.
//   Curvas (para flujos que siguen los tubos de verdad): descarga, condensador, capilar, evaporador, aspiracion.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { serpentin, tubo, bobina } from "./generico.js";

export function compresor(THREE, C, X, M) {
  const { v3, hash } = C;
  const PI = Math.PI, v2 = (x, y) => new THREE.Vector2(x, y);
  const g = new THREE.Group();
  const negro = new THREE.MeshPhysicalMaterial({ color: 0x0e0f12, roughness: 0.34, metalness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25, emissive: 0xff3c0a, emissiveIntensity: 0 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(24, 1.0, 17, 2, 0.3), M.grafito); base.position.y = 0.5; g.add(base);
  for (const [x, z] of [[-10, -6.5], [10, -6.5], [-10, 6.5], [10, 6.5]]) { const gm = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 1.6, 20), M.caucho); gm.position.set(x, 1.6, z); g.add(gm); }
  // the dome: two shells of a rounded can, a little elliptical, with the weld seam
  const perfil = (y0, y1, r) => { const p = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * (PI / 2); p.push(v2(r * Math.cos(a) + 0.001, y0 + (y1 - y0) * Math.sin(a))); } return p.reverse(); };
  const pInf = [v2(0.001, 2.4), ...perfil(9.5, 2.4, 8.2).reverse().map((p) => v2(p.x, 2.4 + (9.5 - p.y)))].sort((a, b) => a.y - b.y);
  const inf = new THREE.Mesh(new THREE.LatheGeometry([v2(0.001, 2.4), v2(6.2, 2.6), v2(7.7, 3.6), v2(8.2, 5.2), v2(8.2, 9.6)], 96), negro); inf.scale.x = 1.3; g.add(inf);
  const sup = new THREE.Mesh(new THREE.LatheGeometry([v2(8.25, 9.4), v2(8.25, 12.8), v2(7.6, 15.6), v2(6.0, 17.6), v2(3.4, 18.7), v2(0.001, 19.0)], 96), negro); sup.scale.x = 1.3; g.add(sup);
  const costura = new THREE.Mesh(new THREE.TorusGeometry(8.35, 0.28, 10, 96), negro); costura.rotation.x = PI / 2; costura.scale.x = 1.3; costura.position.y = 9.5; g.add(costura);
  void pInf; void hash;
  // copper stubs: suction (thick), discharge, service
  const stub = (x, z, r, l, ang) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 16), M.cobre); t.rotation.z = ang; t.position.set(x, 12.5, z); g.add(t); return t; };
  stub(-9.6, 2.5, 0.42, 5, PI / 2 - 0.25); stub(-9.4, -2.0, 0.32, 5, PI / 2 - 0.15); stub(-9.0, -5.0, 0.32, 4, PI / 2 - 0.4);
  // relay box with its cable
  const rele = new THREE.Mesh(new RoundedBoxGeometry(4.2, 6.5, 6.0, 2, 0.4), M.plastico); rele.position.set(11.4, 8.5, 0); g.add(rele);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v3(13.3, 10.5, 1.5), v3(16, 13, 3), v3(18, 9, 6), v3(19, 3, 8)]), 32, 0.35, 8, false), new THREE.MeshPhysicalMaterial({ color: 0x1a1b1e, roughness: 0.6 })); g.add(cable);
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.5), new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.5, map: X.rep(X.tex.rayado({ fondo: "#c4c8ce", linea: "rgba(0,0,0,0.25)", paso: 9, diagonal: false }), 1, 1) }));
  placa.position.set(0, 12.5, 6.6); placa.rotation.x = -0.25; placa.userData.sinBordes = true; g.add(placa);
  // inside: springs, motor (laminated stator with copper end windings), shaft, block, cylinder, piston, muffler, oil
  const dentro = new THREE.Group(); g.add(dentro);
  for (const [x, z] of [[-6, -4], [6, -4], [-6, 4], [6, 4]]) { const m = bobina(THREE, C, X, M, { radio: 0.8, largo: 2.6, vueltas: 6, hilo: 0.12, nucleo: false }); m.grupo.position.set(x, 4.4, z); m.grupo.children[0].material = M.acero; dentro.add(m.grupo); }
  const estator = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 4.2, 48), M.laminas); estator.position.y = 8.0; dentro.add(estator);
  for (const y of [5.6, 10.4]) { const w = new THREE.Mesh(new THREE.TorusGeometry(3.9, 1.0, 14, 48), M.bobinado); w.rotation.x = PI / 2; w.position.y = y; dentro.add(w); }
  const eje = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 10, 16), M.acero); eje.position.y = 9.5; dentro.add(eje);
  const bloque = new THREE.Mesh(new RoundedBoxGeometry(13, 3.4, 7, 2, 0.3), M.aceroOsc); bloque.position.set(1.5, 13.2, 0); dentro.add(bloque);
  const cil = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 5.2, 32, 1, true), M.aceroD); cil.rotation.z = PI / 2; cil.position.set(5.6, 15.4, 0); dentro.add(cil);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.4, 32), M.acero); piston.rotation.z = PI / 2; dentro.add(piston);
  const biela = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.6, 0.9, 2, 0.2), M.aceroOsc); dentro.add(biela);
  const silen = new THREE.Mesh(new RoundedBoxGeometry(4, 4, 4.5, 3, 0.8), M.plastico); silen.position.set(-4.5, 15.4, 2.0); dentro.add(silen);
  const aceite = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, 0.6, 64), new THREE.MeshPhysicalMaterial({ color: 0x8a5a14, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.8 })); aceite.scale.x = 1.25; aceite.position.y = 3.1; dentro.add(aceite);
  let vel = 0, vib = 0;
  const domo = [inf, sup, costura];
  return {
    grupo: g, exterior: [inf, sup, costura], cortables: [g],
    partes: {
      cupula: { obj: g, local: [0, 17, 0], radio: 11 }, piston: { obj: piston, local: [0, 0, 0], radio: 2.5 }, cilindro: { obj: cil, local: [0, 0, 0], radio: 3 },
      motor: { obj: estator, local: [0, 0, 5.4], radio: 6 }, bobinado: { obj: g, local: [0, 10.4, 4.5], radio: 3 }, descarga: { obj: g, local: [-10.5, 12.5, -2.0], radio: 2 },
      aspiracion: { obj: g, local: [-10.8, 12.5, 2.5], radio: 2 }, rele: { obj: rele, local: [2.1, 0, 0], radio: 4 },
    },
    controles: {
      motor: (k) => { vel = k; },
      calor: (k) => { for (const m of domo) { m.material.emissiveIntensity = 0.2 * k; } },
      vibra: (k) => { vib = k; },
    },
    defecto: { motor: 0, calor: 0, vibra: 0 },
    actualizar(t) {
      const a = t * 2 * PI * 3.2 * vel;
      piston.position.set(5.0 + 1.1 * Math.cos(a), 15.4, 0);
      biela.position.set(2.6 + 0.55 * Math.cos(a), 15.4, 0.6 * Math.sin(a)); biela.rotation.y = 0.15 * Math.sin(a);
      eje.rotation.y = a;
      g.position.x = (g.userData.x0 ?? (g.userData.x0 = g.position.x)) + vib * 0.05 * Math.sin(t * 2 * PI * 50);
    },
  };
}

export function nevera(THREE, C, X, M) {
  const { v3, clamp } = C;
  const PI = Math.PI;
  const N = new THREE.Group();
  // ---------- materials ----------
  const inoxTex = X.rep(X.tex.metal({ color: "#c3c7cd" }), 1, 3); inoxTex.rotation = PI / 2; inoxTex.center.set(0.5, 0.5);
  const inox = new THREE.MeshPhysicalMaterial({ color: 0xc9cdd3, metalness: 1, roughness: 0.34, map: inoxTex, clearcoat: 0.15, clearcoatRoughness: 0.35 });
  const lateral = new THREE.MeshPhysicalMaterial({ color: 0x9a9fa6, metalness: 1, roughness: 0.36, map: X.rep(X.tex.metal({ color: "#9ea3aa" }), 2, 2) });
  const traseraMat = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.8, map: X.rep(X.tex.rayado({ fondo: "#2c2e33", linea: "rgba(255,255,255,0.05)", paso: 6 }), 3, 6) });
  // the inner plastic, a little grey: pure white burns out under the studio lights
  const liner = new THREE.MeshPhysicalMaterial({ color: 0xc9ced5, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.45 }), espuma = M.espuma;
  const negroCond = new THREE.MeshPhysicalMaterial({ color: 0x141518, metalness: 0.6, roughness: 0.45, clearcoat: 0.4, emissive: 0xff6a1a, emissiveIntensity: 0 });
  const cobreCal = M.cobre.clone(); cobreCal.emissive = new THREE.Color(0xff6a1a); cobreCal.emissiveIntensity = 0;
  const aluFrio = M.aluminio.clone(); aluFrio.emissive = new THREE.Color(0x5fb4ff); aluFrio.emissiveIntensity = 0;
  const cobreFrio = M.cobre.clone(); cobreFrio.emissive = new THREE.Color(0x5fb4ff); cobreFrio.emissiveIntensity = 0;
  const goma = new THREE.MeshPhysicalMaterial({ color: 0x8e949b, roughness: 0.7, clearcoat: 0.1 });
  const caja = (x0, x1, y0, y1, z0, z1, mat, padre, r = 0) => {
    const geo = r > 0 ? new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 2, r) : new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    const m = new THREE.Mesh(geo, mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); padre.add(m); return m;
  };

  // ---------- cabinet: skin, insulating foam, white liner ----------
  const piel = new THREE.Group(), foam = new THREE.Group(), forro = new THREE.Group(); N.add(piel, foam, forro);
  caja(-30, -29.5, 4, 180, -31, 27, lateral, piel); caja(29.5, 30, 4, 180, -31, 27, lateral, piel);
  caja(-30, 30, 179.4, 180, -31, 27, lateral, piel, 0.2);
  caja(-30, 30, 30, 180, -31, -30.5, traseraMat, piel); caja(-30, 30, 30, 30.5, -31, -14, traseraMat, piel); caja(-30, 30, 4, 30.5, -14, -13.5, traseraMat, piel);
  caja(-30, 30, 4, 4.5, -14, 27, lateral, piel);
  // front flange round both openings (covers the front edge of the walls, so the foam only shows when cut)
  caja(-30, -25, 4, 180, 26.8, 27.2, lateral, piel); caja(25, 30, 4, 180, 26.8, 27.2, lateral, piel);
  caja(-25, 25, 175, 180, 26.8, 27.2, lateral, piel); caja(-25, 25, 58, 64, 26.8, 27.2, lateral, piel); caja(-25, 25, 4, 9, 26.8, 27.2, lateral, piel);
  caja(-29.5, -25.5, 4.5, 179.5, -30.5, 26.8, espuma, foam); caja(25.5, 29.5, 4.5, 179.5, -30.5, 26.8, espuma, foam);
  caja(-25.5, 25.5, 175.5, 179.4, -30.5, 26.8, espuma, foam);
  caja(-25.5, 25.5, 35, 175.5, -30.5, -26.5, espuma, foam);
  caja(-25.5, 25.5, 58.5, 63.5, -26.5, 26.8, espuma, foam);
  caja(-25.5, 25.5, 4.5, 8.5, -13.5, 26.8, espuma, foam);
  caja(-25.5, 25.5, 8.5, 35, -13.5, -9.5, espuma, foam); caja(-25.5, 25.5, 30.5, 35, -30.5, -13.5, espuma, foam);
  // liner: fridge (y 64..175) and freezer (y 9..58, with the step at the back)
  caja(-25.5, -25, 64, 175.5, -26.5, 26.8, liner, forro); caja(25, 25.5, 64, 175.5, -26.5, 26.8, liner, forro);
  caja(-25, 25, 175, 175.5, -26.5, 26.8, liner, forro); caja(-25, 25, 64, 175, -26.5, -26, liner, forro); caja(-25, 25, 63.5, 64, -26.5, 26.8, liner, forro);
  caja(-25.5, -25, 8.5, 58.5, -26.5, 26.8, liner, forro); caja(25, 25.5, 8.5, 58.5, -26.5, 26.8, liner, forro);
  caja(-25, 25, 58, 58.5, -26.5, 26.8, liner, forro); caja(-25, 25, 8.5, 9, -9.5, 26.8, liner, forro);
  caja(-25, 25, 35, 58, -26.5, -26, liner, forro); caja(-25, 25, 34.5, 35, -26.5, -9.5, liner, forro); caja(-25, 25, 9, 35, -9.5, -9, liner, forro);
  // plinth grille and feet
  const rejaZ = new THREE.Mesh(new THREE.PlaneGeometry(56, 3.4), new THREE.MeshStandardMaterial({ color: 0x0c0d0f, metalness: 0.5, roughness: 0.5, alphaMap: X.rep(X.tex.perforada({ cols: 24, filas: 4, radio: 0.3 }), 4, 1), transparent: true, side: THREE.DoubleSide }));
  rejaZ.position.set(0, 2.1, 26.9); rejaZ.userData.sinBordes = true; N.add(rejaZ);
  caja(-29, 29, 0.6, 4, -12, 26.5, M.grafito, N);
  for (const [x, z] of [[-26, 22], [26, 22], [-26, -10], [26, -10]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 20), M.caucho); p.position.set(x, 0.6, z); N.add(p); }

  // ---------- doors (hinge on the left, x = -30, front of the cabinet at z = 27) ----------
  function puertaH(y0, y1, asaY0, asaY1) {
    const g = new THREE.Group(); g.position.set(-30, 0, 27.3);
    const alto = y1 - y0, yc = (y0 + y1) / 2;
    // a closed steel shell (the foam core inside only shows when the door is cut)
    const fuera = new THREE.Mesh(new RoundedBoxGeometry(60, alto, 4.6, 3, 0.45), inox); fuera.position.set(30, yc, 2.8); g.add(fuera);
    const nucleo = new THREE.Mesh(new THREE.BoxGeometry(59, alto - 1.2, 3.6), espuma); nucleo.position.set(30, yc, 2.8); g.add(nucleo);
    const dentroP = new THREE.Mesh(new RoundedBoxGeometry(55, alto - 5, 0.8, 2, 0.3), liner); dentroP.position.set(30, yc, 0.3); g.add(dentroP);
    // gasket: a rubber tube round the inner edge, with a magnet strip inside it
    const camino = []; const w = 56, h = alto - 3.6, r = 2.5;
    for (let i = 0; i <= 120; i++) { const p = C.rrPoint(w, h, r, i / 120); camino.push(v3(30 + p.x, yc - p.z, -0.55)); }
    const curvaJ = new THREE.CatmullRomCurve3(camino, true);
    const junta = new THREE.Mesh(new THREE.TubeGeometry(curvaJ, 240, 0.95, 12, true), goma); g.add(junta);
    const iman = new THREE.Mesh(new THREE.TubeGeometry(curvaJ, 240, 0.42, 8, true), M.ferrita); g.add(iman);
    const asa = new THREE.Group(); asa.position.set(55.5, 0, 5.1); g.add(asa);
    { const b = new THREE.Mesh(new RoundedBoxGeometry(1.8, asaY1 - asaY0, 2.2, 3, 0.8), M.aceroOsc); b.position.set(0, (asaY0 + asaY1) / 2, 2.6); asa.add(b);
      for (const y of [asaY0 + 1.5, asaY1 - 1.5]) { const s = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.6, 2.4, 2, 0.4), M.aceroOsc); s.position.set(0, y, 1.2); asa.add(s); } }
    return { g, junta, iman, asa, fuera, nucleo, dentroP };
  }
  const PN = puertaH(64.0, 179.6, 102, 148), PC = puertaH(4.6, 58.3, 38, 54);
  N.add(PN.g, PC.g);
  // small display on the fridge door: 4 °C
  const pantL = X.lienzo(256, 128, (g2, w, h) => { g2.fillStyle = "#050607"; g2.beginPath(); g2.roundRect(0, 0, w, h, 22); g2.fill(); g2.font = '700 76px "JetBrains Mono", monospace'; g2.textAlign = "center"; g2.textBaseline = "middle"; g2.fillStyle = "#dfefff"; g2.shadowColor = "rgba(150,200,255,0.9)"; g2.shadowBlur = 12; g2.fillText("4°", 128, 68); });
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), new THREE.MeshBasicMaterial({ map: pantL.tex, toneMapped: false, transparent: true, color: 0xb0b0b0 })); pant.position.set(30, 160, 5.15); pant.userData.sinBordes = true; PN.g.add(pant);
  // door bins on the inside of the fridge door, with eggs and a bottle
  const binMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, roughness: 0.15, transparent: true, opacity: 0.5, clearcoat: 1, depthWrite: false });
  for (const y of [80, 108, 138]) { const b = new THREE.Mesh(new RoundedBoxGeometry(50, 7, 8, 2, 0.6), binMat); b.position.set(30, y, -4.6); b.userData.sinBordes = true; PN.g.add(b); }
  const huevoG = new THREE.SphereGeometry(1, 24, 16); huevoG.scale(2.1, 2.8, 2.1);
  const huevoM = new THREE.MeshPhysicalMaterial({ color: 0xf1e3cf, roughness: 0.6, clearcoat: 0.1 });
  for (let i = 0; i < 5; i++) { const e = new THREE.Mesh(huevoG, huevoM); e.position.set(12 + i * 5, 141.5, -4.6); PN.g.add(e); }
  const botellaM = new THREE.MeshPhysicalMaterial({ color: 0x9cc8ea, roughness: 0.05, transmission: 0.85, thickness: 1.2, ior: 1.4, clearcoat: 1, transparent: true });
  const botella = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0], [3.6, 0], [3.8, 1], [3.8, 17], [3.0, 20], [1.4, 23], [1.4, 25.5], [0.001, 25.5]].map(([x, y]) => new THREE.Vector2(x, y)), 48), botellaM);
  botella.position.set(44, 77, -4.6); PN.g.add(botella);
  const tapon = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.6, 24), new THREE.MeshPhysicalMaterial({ color: 0x2b6fd6, roughness: 0.4 })); tapon.position.set(44, 103.2, -4.6); PN.g.add(tapon);

  // ---------- inside the fridge ----------
  const dentro = new THREE.Group(); N.add(dentro);
  const estantes = [];
  for (const y of [90, 115, 140]) {
    const e = new THREE.Mesh(new RoundedBoxGeometry(49.6, 0.5, 44, 2, 0.15), M.vidrio); e.position.set(0, y, -3.5); e.userData.sinBordes = true; dentro.add(e); estantes.push(e);
    caja(-24.8, 24.8, y - 0.6, y + 0.6, 18.2, 19.4, M.aceroOsc, dentro, 0.3);
  }
  const cajon = new THREE.Mesh(new RoundedBoxGeometry(48, 20, 42, 2, 1), new THREE.MeshPhysicalMaterial({ color: 0xcfe0ea, roughness: 0.1, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false })); cajon.position.set(0, 75, -4); cajon.userData.sinBordes = true; dentro.add(cajon);
  const tomateM = new THREE.MeshPhysicalMaterial({ color: 0xc8321e, roughness: 0.28, clearcoat: 0.8 }), manzanaM = new THREE.MeshPhysicalMaterial({ color: 0x86b23a, roughness: 0.35, clearcoat: 0.6 });
  [[-12, 69.5, 2, tomateM, 4.2], [-3, 69.5, -6, manzanaM, 4.0], [8, 69.5, 4, tomateM, 4.4], [15, 69.5, -10, manzanaM, 4.1], [-15, 69.5, -12, tomateM, 3.9]].forEach(([x, y, z, m, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), m); s.scale.y = 0.9; s.position.set(x, y, z); dentro.add(s); });
  // yogurts (white cups with coloured foil lids), milk carton, jar of jam, cheese wedge
  const yogM = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f2, roughness: 0.4, clearcoat: 0.3 });
  const tapas = [0xd8452f, 0x3a8f4f, 0xe0a42a, 0x3d6fd1].map((c) => new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.6, roughness: 0.3 }));
  const yogures = [];
  for (let i = 0; i < 4; i++) {
    const y = new THREE.Group(); y.position.set(-18 + (i % 2) * 7.4, 90.25, 6 - Math.floor(i / 2) * 7.4); dentro.add(y);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 2.8, 7, 40), yogM); c.position.y = 3.5; y.add(c);
    const tp = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.55, 0.25, 40), tapas[i]); tp.position.y = 7.1; y.add(tp);
    yogures.push(y);
  }
  const leche = new THREE.Group(); leche.position.set(10, 115.25, 0); dentro.add(leche);
  { const lt = X.lienzo(256, 512, (g2, w, h) => { g2.fillStyle = "#f5f7fa"; g2.fillRect(0, 0, w, h); g2.fillStyle = "#2f6fd0"; g2.fillRect(0, h * 0.55, w, h * 0.3); g2.fillStyle = "#ffffff"; g2.beginPath(); g2.ellipse(w * 0.5, h * 0.7, w * 0.3, h * 0.06, 0, 0, 7); g2.fill(); });
    const b = new THREE.Mesh(new RoundedBoxGeometry(7.2, 19, 7.2, 2, 0.3), new THREE.MeshPhysicalMaterial({ map: lt.tex, roughness: 0.5 })); b.position.y = 9.5; leche.add(b);
    const tejado = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 5.1, 3, 4), new THREE.MeshPhysicalMaterial({ color: 0xf5f7fa, roughness: 0.5 })); tejado.rotation.y = PI / 4; tejado.position.y = 20.5; tejado.scale.z = 0.25; leche.add(tejado); }
  const tarro = new THREE.Group(); tarro.position.set(-10, 140.25, -2); dentro.add(tarro);
  { const v = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 9, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.5, transparent: true })); v.position.y = 4.5; tarro.add(v);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 7.5, 40), new THREE.MeshPhysicalMaterial({ color: 0x8a1420, roughness: 0.2, clearcoat: 1 })); m.position.y = 3.9; tarro.add(m);
    const tp = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 1.3, 40), new THREE.MeshPhysicalMaterial({ color: 0xc9a43a, metalness: 1, roughness: 0.3 })); tp.position.y = 9.6; tarro.add(tp); }
  { const qs = new THREE.Shape(); qs.moveTo(0, 0); qs.lineTo(11, 0); qs.absarc(0, 0, 11, 0, 0.7, false); qs.lineTo(0, 0);
    const q = new THREE.Mesh(new THREE.ExtrudeGeometry(qs, { depth: 6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 }), new THREE.MeshPhysicalMaterial({ color: 0xf0c64a, roughness: 0.6 }));
    q.rotation.x = -PI / 2; q.position.set(-16, 115.3, 8); dentro.add(q); }
  // light and thermostat
  const led = caja(-12, 12, 174.2, 175, 4, 8, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), dentro);
  const luzN = new THREE.PointLight(0xe8f2ff, 0, 160, 2); luzN.position.set(0, 168, 10); dentro.add(luzN);
  const termo = new THREE.Group(); termo.position.set(25, 162, 12); dentro.add(termo);
  { const cj = new THREE.Mesh(new RoundedBoxGeometry(3, 9, 11, 2, 0.8), liner); cj.position.x = -1.5; termo.add(cj);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.4, 40), M.plasticoBlanco); dial.rotation.z = PI / 2; dial.position.set(-3.5, 0, 0); termo.add(dial);
    const marca = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 0.5), new THREE.MeshBasicMaterial({ color: 0x2d7cff })); marca.position.set(-4.25, 0.6, 0); termo.add(marca);
    for (let i = 0; i < 7; i++) { const a = -1.2 + (i / 6) * 2.4; const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), M.plastico); t.position.set(-3.05, Math.cos(a) * 3.6, Math.sin(a) * 3.6); termo.add(t); } }
  // freezer: two frosted drawers with frozen bags
  const hieloM = new THREE.MeshPhysicalMaterial({ color: 0xd8ecf7, roughness: 0.15, transparent: true, opacity: 0.4, clearcoat: 1, depthWrite: false });
  const bolsaM = new THREE.MeshPhysicalMaterial({ color: 0xe9f3fb, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
  for (const [y0, z0] of [[10, -8], [36, -25]]) {
    const d = new THREE.Mesh(new RoundedBoxGeometry(48, 20, 25 - z0 - 1, 2, 1), hieloM); d.position.set(0, y0 + 10, (z0 + 25) / 2); d.userData.sinBordes = true; dentro.add(d);
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new RoundedBoxGeometry(12, 6, 14, 3, 2), bolsaM); b.position.set(-14 + i * 14, y0 + 4, (z0 + 25) / 2 + (i - 1) * 2); b.rotation.y = (i - 1) * 0.3; dentro.add(b); }
  }

  // ---------- the refrigeration circuit ----------
  const circuito = new THREE.Group(); N.add(circuito);
  // condenser: black tube-and-wire grid on the back
  const COND = serpentin(THREE, C, X, M, { ancho: 46, alto: 128, filas: 14, radio: 0.34, alambres: 24, material: negroCond, grosorAlambre: 0.09 });
  COND.grupo.position.set(0, 104, -34); circuito.add(COND.grupo);
  for (const y of [42, 166]) caja(-24, 24, y - 0.5, y + 0.5, -34, -31, M.aceroOsc, circuito);
  // compressor in the recess at the back bottom
  const CP = compresor(THREE, C, X, M); CP.grupo.position.set(-4, 4.6, -24); CP.grupo.rotation.y = PI; CP.grupo.scale.setScalar(0.85); circuito.add(CP.grupo);
  // dryer filter, capillary (thin, coiled), discharge and suction lines, evaporators inside the back wall
  const filtro = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 9, 24), M.cobre); filtro.position.set(18, 32, -34); circuito.add(filtro);
  const cA = COND.puntos[0].clone().add(COND.grupo.position), cZ = COND.puntos[COND.puntos.length - 1].clone().add(COND.grupo.position);
  const DESC = tubo(THREE, C, X, M, { puntos: [[6.1, 15.2, -22.3], [9, 16, -22], [24, 17, -22], [27.5, 21, -30], [27.5, 40, -34.5], [27.5, 172, -34.5], [-23, 172, -34.5], [-23, 168.2, -34], [cZ.x, cZ.y, cZ.z]], radio: 0.32, material: cobreCal, tension: 0.2 });
  circuito.add(DESC.grupo);
  // the hot gas goes in at the top of the grid; the liquid comes out at the bottom, to the filter
  const SAL = tubo(THREE, C, X, M, { puntos: [[cA.x, cA.y, cA.z], [-22, 38, -34], [-22, 30, -34], [12, 27, -34], [18, 27.5, -34]], radio: 0.3, material: M.cobre, tension: 0.2 });
  circuito.add(SAL.grupo);
  const eIn0 = v3(18.33, 170, -27.6);
  const capPts = [[18, 36.5, -34]];
  for (let i = 0; i <= 40; i++) { const a = i * 0.55, y = 38 + i * 0.25; capPts.push([18 + Math.cos(a) * 2.2, y, -35.5 + Math.sin(a) * 1.2]); }
  capPts.push([21, 52, -33], [23, 60, -29], [23, 120, -28.2], [23, 167, -28.2], [eIn0.x, eIn0.y, -27.6]);
  const CAP = tubo(THREE, C, X, M, { puntos: capPts, radio: 0.13, material: cobreFrio, tension: 0.3 }); circuito.add(CAP.grupo);
  const EVAP = serpentin(THREE, C, X, M, { ancho: 44, alto: 66, filas: 10, radio: 0.42, material: aluFrio });
  EVAP.grupo.position.set(0, 137, -27.6); EVAP.grupo.rotation.y = PI; circuito.add(EVAP.grupo);
  const EVC = serpentin(THREE, C, X, M, { ancho: 44, alto: 16, filas: 4, radio: 0.42, material: aluFrio });
  EVC.grupo.position.set(0, 46, -27.6); EVC.grupo.rotation.y = PI; circuito.add(EVC.grupo);
  const eW = (S, p) => p.clone().applyEuler(S.grupo.rotation).add(S.grupo.position);
  const eIn = eW(EVAP, EVAP.puntos[EVAP.puntos.length - 1]), eOut = eW(EVAP, EVAP.puntos[0]), fIn = eW(EVC, EVC.puntos[EVC.puntos.length - 1]), fOut = eW(EVC, EVC.puntos[0]);
  const PUENTE = tubo(THREE, C, X, M, { puntos: [[eOut.x, eOut.y, eOut.z], [eOut.x + 1.5, eOut.y - 8, -28.4], [fIn.x + 1.5, fIn.y + 8, -28.4], [fIn.x, fIn.y, fIn.z]], radio: 0.4, material: aluFrio, tension: 0.3 }); circuito.add(PUENTE.grupo);
  const ASP = tubo(THREE, C, X, M, { puntos: [[fOut.x, fOut.y, fOut.z], [17, 33, -28.5], [15, 29, -27], [10, 20, -27], [6.3, 15.2, -26.1]], radio: 0.42, material: M.cobre, tension: 0.3 }); circuito.add(ASP.grupo);

  // ---------- controls ----------
  let kMotor = 0;
  const curvaPts = (g, pts, rot) => ({ obj: g, puntos: pts.map((p) => (rot ? p.clone().applyEuler(rot) : p.clone())) });
  return {
    grupo: N, dimensiones: { W: 60, H: 180, D: 63 },
    exterior: [piel, PN.fuera, PC.fuera], ocultos: [foam, PN.nucleo, PC.nucleo], semi: [[forro, 0.12], [PN.dentroP, 0.12], [PC.dentroP, 0.12]],
    cortables: [N],
    partes: {
      puerta: { obj: PN.g, local: [30, 122, 5.1], radio: 60 }, congelador: { obj: PC.g, local: [30, 31, 5.1], radio: 30 }, asa: { obj: PN.asa, local: [0, 125, 3.6], radio: 24 },
      pantalla: { obj: pant, local: [0, 0, 0.05], radio: 5 }, junta: { obj: PN.g, local: [2, 170, -0.55], radio: 4 }, iman: { obj: PN.g, local: [2, 150, -0.55], radio: 2.5 },
      estantes: { obj: estantes[1], local: [0, 0, 0], radio: 26 }, yogur: { obj: yogures[0], local: [0, 4, 0], radio: 5 }, leche: { obj: leche, local: [0, 10, 0], radio: 11 },
      botella: { obj: botella, local: [0, 12, 0], radio: 13 }, tarro: { obj: tarro, local: [0, 5, 0], radio: 6 }, verduras: { obj: cajon, local: [0, -4, 0], radio: 22 },
      interior: { obj: N, local: [0, 120, 0], radio: 58 }, interiorCong: { obj: N, local: [0, 33, 5], radio: 28 }, fondo: { obj: N, local: [0, 137, -26], radio: 33 },
      aislante: { obj: N, local: [-27.5, 150, 10], radio: 8 }, espuma: { obj: N, local: [0, 152, -28.5], radio: 6 }, puertaEspuma: { obj: PN.g, local: [30, 132, 2.4], radio: 6 },
      juntaArriba: { obj: PN.g, local: [30, 177.8, -0.55], radio: 3 }, juntaLado: { obj: PN.g, local: [57.5, 125, -0.55], radio: 6 }, termostato: { obj: termo, local: [-4.2, 0, 0], radio: 6 }, luz: { obj: led, local: [0, 0, 0], radio: 12 },
      compresor: { obj: CP.grupo, local: [0, 11, 0], radio: 13 }, condensador: { obj: COND.grupo, local: [0, 0, 0], radio: 66 },
      condArriba: { obj: N, local: [cZ.x, cZ.y, cZ.z], radio: 8 }, condAbajo: { obj: N, local: [cA.x, cA.y, cA.z], radio: 8 },
      filtro: { obj: filtro, local: [0, 0, 0], radio: 5 }, capilar: { obj: N, local: [18, 42, -35.5], radio: 5 },
      evaporador: { obj: EVAP.grupo, local: [0, 0, 0], radio: 34 }, evapCong: { obj: EVC.grupo, local: [0, 0, 0], radio: 23 },
      aspiracion: { obj: N, local: [6.3, 15.2, -26.1], radio: 4 }, descarga: { obj: N, local: [6.1, 15.2, -22.3], radio: 4 },
      atras: { obj: N, local: [0, 104, -34], radio: 70 }, arriba: { obj: N, local: [0, 180, 0], radio: 10 }, suelo: { obj: N, local: [0, 0, 0], radio: 10 },
    },
    curvas: {
      descarga: curvaPts(N, DESC.curva.getPoints(60)), condensador: curvaPts(N, COND.puntos.map((p) => p.clone().add(COND.grupo.position)).reverse()),
      salida: curvaPts(N, SAL.curva.getPoints(20)), capilar: curvaPts(N, CAP.curva.getPoints(120)),
      evaporador: curvaPts(N, EVAP.puntos.map((p) => eW(EVAP, p)).reverse()), puente: curvaPts(N, PUENTE.curva.getPoints(20)),
      evapCong: curvaPts(N, EVC.puntos.map((p) => eW(EVC, p)).reverse()), aspiracion: curvaPts(N, ASP.curva.getPoints(60)),
    },
    controles: {
      puerta: (k) => { PN.g.rotation.y = -k * 1.75; },
      congelador: (k) => { PC.g.rotation.y = -k * 1.4; },
      luz: (k) => { luzN.intensity = 900 * k; led.material.color.setScalar(0.25 + 0.75 * k); },
      motor: (k) => { kMotor = k; CP.controles.motor(k); },
      calor: (k) => { negroCond.emissiveIntensity = 0.5 * k; cobreCal.emissiveIntensity = 0.6 * k; CP.controles.calor(k); },
      frio: (k) => { aluFrio.emissiveIntensity = 0.55 * k; cobreFrio.emissiveIntensity = 0.7 * k; },
      vibra: (k) => CP.controles.vibra(k),
    },
    defecto: { puerta: 0, congelador: 0, luz: 0, motor: 0, calor: 0, frio: 0, vibra: 0 },
    actualizar(t) { CP.actualizar(t); void kMotor; void clamp; },
  };
}
