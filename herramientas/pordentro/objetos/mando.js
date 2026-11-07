// Mando a distancia, televisor, receptor de infrarrojos y móvil con la cámara abierta (hechos con 09-mando,
// 7 nov). Unidades en cm (el receptor grande, en mm ampliados: ver receptor()). Sin marcas en ninguno.
//
// mando(): mando de tele de 4,6 × 17 × 2,2 cm, tumbado, con la punta (el LED) mirando a +z. Carcasa de plástico
//   mate en dos mitades, botonera de goma (encendido rojo, números, cruceta con OK, volumen y canal, silencio y
//   menú) con sus rótulos, ventana oscura delante. Dentro: placa verde con las pistas de cada botón (las del botón 2
//   son piezas de verdad, para los macros), chip, resonador, transistor, resistencia, LED infrarrojo de 5 mm con su
//   yunque, dos pilas AAA y muelles. Debajo de cada botón, una cúpula de goma con su pastilla de carbón.
//   Los rótulos se leen desde quien lo sujeta con la punta hacia delante (mirando a +z, su izquierda es +x): el
//   1 a su izquierda, el volumen a la izquierda y el canal a la derecha. Visto desde la punta salen boca abajo,
//   como en un mando de verdad (arreglado el 7 nov: antes estaban girados 180° y en espejo).
//   Mandos: abre (0..1, vista despiezada: sube la tapa y la goma), pulsa (0..1, hunde el botón 2 hasta que la
//           pastilla toca las pistas), contacto (0..1, las pistas del 2 brillan), ir (0..1, luz infrarroja dibujada
//           en la punta), parpadeo (0/1, la luz sigue un código, ralentizado para que se vea), placa (0/1, quita
//           la tapa y la goma para ver la placa limpia), seccion (0/1, caras de corte rellenas en x = 0, como un
//           diagrama: úsalo con el plano "corte" de eje x en 0).
//   Partes: led, ventana, punta, placa, chip, cristal (resonador), goma, boton (el 2), pastilla, pistas, pilas,
//           power, ok, arriba, abajo.
//   Curvas: pista (de las pistas del 2 al chip), aLed (del chip al LED), haz (de la punta hacia delante, 60 cm).
//
// tele(): televisor de 96 × 56 cm mirando a +z, con pie. Marco fino, pantalla que se enciende con una imagen
//   genérica (montañas y lago) y el número de canal, y abajo a la derecha la ventanita oscura del receptor con su
//   placa, el receptor y el piloto rojo.
//   Mandos: encendida (0..1), canal (número que se ve), osd (0..1, el rótulo del canal), receptor (0..1, brillo del
//           receptor), rayosX (el marco de abajo se vuelve transparente).
//   Partes: pantalla, ventana, receptor, piloto, placa, pie.
//
// receptor(): el receptor de infrarrojos ampliado (unas 10 veces: 6 × 7 × 3,4 unidades): cápsula de epoxi negra
//   con lente de cúpula, tres patas, y dentro el marco metálico, el fotodiodo PIN (cuadrado azulado con dedos de
//   metal), el chip que amplifica y filtra, y los hilos de oro. El corte lateral (eje x) enseña todo.
//   Mandos: diodo (0..1, el fotodiodo se ilumina), salida (0..1, la pata de salida brilla).
//   Partes: lente, diodo, chip, patas, cuerpo, salida.
//
// movilCamara(): el móvil de detalle.js con la cámara abierta (en español, sin marcas): en el visor se ve la punta
//   de un mando, y con luz > 0 su LED sale morado, como lo ve de verdad una cámara.
//   Mandos: luz (0..1), parpadeo (0/1, sigue el mismo código que el mando).
//   Partes: pantalla, visor (el punto morado del visor), lente.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// the same illustrative code for the remote, the phone and the signal (NEC-like frame, slowed down to be seen):
// 1 = light on. 9 units of leader, 4.5 off, then 32 bits (0.5625 on + 0.5625 or 1.6875 off) and a final burst.
export const CODIGO = (() => {
  const bits = "00100000110111110100000010111111".split("").map(Number);
  const tramos = [[1, 9], [0, 4.5]];
  for (const b of bits) tramos.push([1, 0.5625], [0, b ? 1.6875 : 0.5625]);
  tramos.push([1, 0.5625], [0, 12]);
  const total = tramos.reduce((a, x) => a + x[1], 0);
  // slowed down: the whole frame lasts `lento` seconds on screen
  const enT = (t, lento = 1.6) => {
    let u = (((t % lento) + lento) % lento) / lento * total;
    for (const [on, d] of tramos) { if (u < d) return on; u -= d; }
    return 0;
  };
  return { bits, tramos, total, enT };
})();

const IR = "255,77,109"; // the invisible infrared, drawn in a rose red

function rotulo(X, txt, { w = 128, h = 96, color = "#e9ecf0", tam = 64, peso = 700, fondo = null, icono = null } = {}) {
  return X.lienzo(w, h, (g) => {
    if (fondo) { g.fillStyle = fondo; g.fillRect(0, 0, w, h); }
    g.fillStyle = color; g.strokeStyle = color; g.lineCap = "round"; g.lineJoin = "round";
    if (icono) { icono(g, w, h); return; }
    g.font = `${peso} ${tam}px "Inter", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(txt, w / 2, h / 2 + tam * 0.04);
  }).tex;
}

export function mando(THREE, C, X, M) {
  const { v3, hash, clamp } = C;
  const PI = Math.PI;
  const R = new THREE.Group();
  const W = 4.6, L = 17, YS = 1.15, YT = 2.2;
  const Z0 = -L / 2, Z1 = L / 2;

  // ---------- materials ----------
  const grano = X.lienzo(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = 0.55 * X.ruido(x / 3, y / 3, 1) + 0.45 * X.ruido(x / 1.2, y / 1.2, 2); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 110 + n * 120; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }, false).tex;
  X.rep(grano, 1.5, 1.5);
  const carcasa = new THREE.MeshPhysicalMaterial({ color: 0x1c1e22, roughness: 0.58, roughnessMap: grano, bumpMap: grano, bumpScale: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.6 });
  const carcasaB = carcasa.clone(); carcasaB.color.setHex(0x17181b);
  const goma = new THREE.MeshPhysicalMaterial({ color: 0x41454c, roughness: 0.72, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x8a9099), clearcoat: 0.05 });
  const gomaClara = new THREE.MeshPhysicalMaterial({ color: 0x6b7079, roughness: 0.68, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xaab0b8) });
  const gomaRoja = new THREE.MeshPhysicalMaterial({ color: 0xb02a2e, roughness: 0.6, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xff8a80) });
  const gomaLamina = new THREE.MeshPhysicalMaterial({ color: 0x3a3d43, roughness: 0.8, transparent: true, opacity: 0.96, side: THREE.DoubleSide });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.92, bumpMap: grano, bumpScale: 1.2 });
  const oro = new THREE.MeshPhysicalMaterial({ color: 0xd9a54b, metalness: 1, roughness: 0.25, clearcoat: 0.3, emissive: 0xffb347, emissiveIntensity: 0 });
  const ventanaMat = new THREE.MeshPhysicalMaterial({ color: 0x3a0610, roughness: 0.08, transparent: true, opacity: 0.82, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2 });

  // ---------- shells (solid, rounded): bottom and top, split at YS ----------
  const concha = (y0, y1, mat, r = 0.32) => {
    const sh = C.rrShape(W - 2 * r, L - 2 * r, 1.35 - r);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0 - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 6, curveSegments: 28 });
    geo.rotateX(-PI / 2); geo.translate(0, y0 + r, 0);
    const m = new THREE.Mesh(geo, mat); return m;
  };
  const tapa = new THREE.Group(); R.add(tapa);
  const tapaM = concha(YS + 0.02, YT, carcasa); tapa.add(tapaM);
  const baseM = concha(0, YS - 0.02, carcasaB); R.add(baseM);
  // seam: a dark band between the halves
  { const sh = C.rrShape(W - 0.12, L - 0.12, 1.3); const s = new THREE.Mesh(C.slab(sh, 0.05), new THREE.MeshBasicMaterial({ color: 0x050506 })); s.position.y = YS - 0.025; R.add(s); }
  // printed marks on the top face (white, thin): VOL / CH, a line, arrows
  const impreso = X.lienzo(512, 1792, (g, w, h) => {
    const cx = (x) => ((x + W / 2) / W) * w, cz = (z) => ((z - Z0) / L) * h;
    g.fillStyle = "rgba(235,238,242,0.78)"; g.font = '700 30px "Inter", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle";
    // read by whoever holds the remote: each word turned 180° in the canvas, under its buttons (towards the tail)
    const texto = (s, x, z) => { g.save(); g.translate(cx(x), cz(z)); g.rotate(PI); g.fillText(s, 0, 0); g.restore(); };
    texto("VOL", 1.3, -4.8); texto("CH", -1.3, -4.8);
    g.font = '400 22px "Inter", sans-serif'; texto("SILENCIO", 1.2, -6.1); texto("MENÚ", -1.2, -6.1);
    g.strokeStyle = "rgba(235,238,242,0.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx(-1.7), cz(1.65)); g.lineTo(cx(1.7), cz(1.65)); g.stroke();
    g.beginPath(); g.moveTo(cx(-1.7), cz(-1.75)); g.lineTo(cx(1.7), cz(-1.75)); g.stroke();
  });
  // canvas row 0 = back of the remote: a plane lying flat (rotation -90° about x) maps canvas top to -z
  const impM = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshBasicMaterial({ map: impreso.tex, transparent: true, depthWrite: false, toneMapped: false, color: 0xbfc2c6 }));
  impM.rotation.x = -PI / 2; impM.position.y = YT + 0.012; impM.userData.sinBordes = true; impM.userData.noCortar = true; tapa.add(impM);
  // front window (dark red, glossy), flush with the nose
  const ventana = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.95, 0.5, 3, 0.18), ventanaMat);
  ventana.position.set(0, 1.55, Z1 - 0.2); tapa.add(ventana);
  // rubber feet under the remote
  for (const [x, z] of [[-1.5, -7.2], [1.5, -7.2], [-1.5, 6.6], [1.5, 6.6]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.06, 20), M.caucho); p.position.set(x, -0.02, z); R.add(p); }

  // ---------- keypad: rubber sheet, domes, buttons with labels, carbon pills ----------
  const teclado = new THREE.Group(); R.add(teclado);
  const PCB_Y = 1.40;                    // top of the board
  const LAM0 = PCB_Y, LAM1 = PCB_Y + 0.06; // rubber sheet
  const PILL0 = PCB_Y + 0.12, PILL1 = PCB_Y + 0.2;
  const TOP = YT + 0.17;                 // top of the buttons
  const ico = {
    power: (g, w, h) => { g.lineWidth = 9; g.beginPath(); g.arc(w / 2, h / 2 + 4, 26, -PI / 2 + 0.75, -PI / 2 - 0.75 + 2 * PI); g.stroke(); g.beginPath(); g.moveTo(w / 2, h / 2 - 30); g.lineTo(w / 2, h / 2 + 2); g.stroke(); },
    fuente: (g, w, h) => { g.lineWidth = 7; g.strokeRect(w / 2 - 28, h / 2 - 20, 56, 40); g.beginPath(); g.moveTo(w / 2 - 14, h / 2); g.lineTo(w / 2 + 12, h / 2); g.moveTo(w / 2 + 2, h / 2 - 10); g.lineTo(w / 2 + 12, h / 2); g.lineTo(w / 2 + 2, h / 2 + 10); g.stroke(); },
    lista: (g, w, h) => { g.lineWidth = 7; for (const y of [-14, 0, 14]) { g.beginPath(); g.moveTo(w / 2 - 22, h / 2 + y); g.lineTo(w / 2 + 22, h / 2 + y); g.stroke(); } },
    atras: (g, w, h) => { g.lineWidth = 7; g.beginPath(); g.arc(w / 2 + 4, h / 2 + 4, 16, -PI / 2, PI / 2); g.lineTo(w / 2 - 16, h / 2 + 20); g.moveTo(w / 2 + 4, h / 2 - 12); g.lineTo(w / 2 - 18, h / 2 - 12); g.moveTo(w / 2 - 10, h / 2 - 22); g.lineTo(w / 2 - 20, h / 2 - 12); g.lineTo(w / 2 - 10, h / 2 - 2); g.stroke(); },
    silencio: (g, w, h) => { g.beginPath(); g.moveTo(w / 2 - 26, h / 2 - 8); g.lineTo(w / 2 - 16, h / 2 - 8); g.lineTo(w / 2 - 2, h / 2 - 20); g.lineTo(w / 2 - 2, h / 2 + 20); g.lineTo(w / 2 - 16, h / 2 + 8); g.lineTo(w / 2 - 26, h / 2 + 8); g.closePath(); g.fill(); g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2 + 8, h / 2 - 10); g.lineTo(w / 2 + 26, h / 2 + 10); g.moveTo(w / 2 + 26, h / 2 - 10); g.lineTo(w / 2 + 8, h / 2 + 10); g.stroke(); },
    menu: (g, w, h) => { g.lineWidth = 6; for (const [x, y] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) g.strokeRect(w / 2 + x - 8, h / 2 + y - 8, 16, 16); },
    mas: (g, w, h) => { g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2 - 18, h / 2); g.lineTo(w / 2 + 18, h / 2); g.moveTo(w / 2, h / 2 - 18); g.lineTo(w / 2, h / 2 + 18); g.stroke(); },
    menos: (g, w, h) => { g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2 - 18, h / 2); g.lineTo(w / 2 + 18, h / 2); g.stroke(); },
  };
  // the holder looks towards +z, so their left is +x: the first column of each row goes at x > 0
  const B = []; // { id, x, z, w, d, redondo, mat, label | icono }
  B.push({ id: "power", x: 1.25, z: 6.5, w: 0.84, d: 0.84, redondo: true, mat: gomaRoja, icono: ico.power });
  B.push({ id: "fuente", x: -1.25, z: 6.5, w: 0.76, d: 0.76, redondo: true, mat: goma, icono: ico.fuente });
  const NUM = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["lista", "0", "atras"]];
  NUM.forEach((fila, r) => fila.forEach((n, c) => B.push({ id: n === "lista" || n === "atras" ? n : "n" + n, x: (1 - c) * 1.42, z: 5.2 - r * 1.05, w: 1.06, d: 0.68, mat: goma, label: ico[n] ? null : n, icono: ico[n] || null })));
  B.push({ id: "volMas", x: 1.3, z: -2.75, w: 0.8, d: 1.12, mat: goma, icono: ico.mas, roc: true });
  B.push({ id: "volMenos", x: 1.3, z: -3.95, w: 0.8, d: 1.12, mat: goma, icono: ico.menos, roc: true });
  B.push({ id: "chMas", x: -1.3, z: -2.75, w: 0.8, d: 1.12, mat: goma, icono: ico.mas, roc: true });
  B.push({ id: "chMenos", x: -1.3, z: -3.95, w: 0.8, d: 1.12, mat: goma, icono: ico.menos, roc: true });
  B.push({ id: "silencio", x: 1.2, z: -5.45, w: 0.72, d: 0.72, redondo: true, mat: goma, icono: ico.silencio });
  B.push({ id: "menu", x: -1.2, z: -5.45, w: 0.72, d: 0.72, redondo: true, mat: goma, icono: ico.menu });
  const DPAD = { z: 0.05, r0: 0.66, r1: 1.42 };

  const domoGeo = (r) => new THREE.CylinderGeometry(r * 0.78, r * 1.18, LAM1 + 0.3 - LAM1, 32, 1, true);
  const piezas = {};
  function hacerBoton(b) {
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); teclado.add(g);
    const alto = TOP - PILL1;
    const cuerpoGeo = b.redondo ? new THREE.CylinderGeometry(b.w / 2, b.w / 2 + 0.02, alto, 40) : new RoundedBoxGeometry(b.w, alto, b.d, 4, b.roc ? 0.26 : 0.2);
    const cuerpo = new THREE.Mesh(cuerpoGeo, b.mat); cuerpo.position.y = PILL1 + alto / 2; g.add(cuerpo);
    if (b.redondo) { const cap = new THREE.Mesh(new THREE.SphereGeometry(b.w / 2, 40, 12, 0, 2 * PI, 0, 0.35), b.mat); cap.scale.y = 0.5; cap.position.y = TOP - 0.06; g.add(cap); }
    const tex = rotulo(X, b.label || "", { icono: b.icono, tam: 70 });
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(b.w, 0.9) * 0.78, Math.min(b.w, 0.9) * 0.585), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, color: 0xd6d9de }));
    // lying flat with the top of the label towards the tip (+z): turned 180° in its own plane first
    lab.rotation.x = -PI / 2; lab.rotation.z = PI; lab.position.y = TOP + (b.redondo ? 0.025 : 0.008); lab.userData.sinBordes = true; g.add(lab);
    const rr = Math.min(b.w, b.d) / 2;
    const domo = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.82, rr * 1.25, 0.32, 32, 1, true), gomaLamina); domo.position.y = LAM1 + 0.16; g.add(domo);
    const pill = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.58, rr * 0.58, PILL1 - PILL0, 32), carbon); pill.position.y = (PILL0 + PILL1) / 2; g.add(pill);
    piezas[b.id] = { g, cuerpo, domo, pill, b };
    return g;
  }
  B.forEach(hacerBoton);
  // d-pad: a ring with four arrows and the OK in the middle
  {
    const g = new THREE.Group(); g.position.set(0, 0, DPAD.z); teclado.add(g);
    const alto = TOP - 0.04 - PILL1;
    const anillo = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(DPAD.r0 + 0.06, 0), new THREE.Vector2(DPAD.r1, 0), new THREE.Vector2(DPAD.r1, alto - 0.1), new THREE.Vector2(DPAD.r1 - 0.12, alto), new THREE.Vector2(DPAD.r0 + 0.16, alto), new THREE.Vector2(DPAD.r0 + 0.06, alto - 0.1), new THREE.Vector2(DPAD.r0 + 0.06, 0)], 96), goma);
    anillo.position.y = PILL1; g.add(anillo);
    const flechas = X.lienzo(256, 256, (gg, w, h) => { gg.fillStyle = "#e9ecf0"; for (let k = 0; k < 4; k++) { gg.save(); gg.translate(w / 2, h / 2); gg.rotate((k * PI) / 2); gg.beginPath(); gg.moveTo(-14, -100); gg.lineTo(14, -100); gg.lineTo(0, -116); gg.closePath(); gg.fill(); gg.restore(); } }).tex;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(DPAD.r1 * 2, DPAD.r1 * 2), new THREE.MeshBasicMaterial({ map: flechas, transparent: true, depthWrite: false, toneMapped: false, color: 0xd6d9de }));
    fl.rotation.x = -PI / 2; fl.position.y = PILL1 + alto + 0.008; fl.userData.sinBordes = true; g.add(fl);
    const ok = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, TOP - PILL1, 48), gomaClara); ok.position.y = (TOP + PILL1) / 2; g.add(ok);
    const okL = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: rotulo(X, "OK", { tam: 56, color: "#1d2026" }), transparent: true, depthWrite: false, toneMapped: false }));
    okL.rotation.x = -PI / 2; okL.rotation.z = PI; okL.position.y = TOP + 0.008; okL.userData.sinBordes = true; g.add(okL);
    for (let k = 0; k < 4; k++) { const a = (k * PI) / 2, pill = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, PILL1 - PILL0, 24), carbon); pill.position.set(Math.sin(a) * 1.04, (PILL0 + PILL1) / 2, Math.cos(a) * 1.04); g.add(pill); }
    const pOk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, PILL1 - PILL0, 24), carbon); pOk.position.y = (PILL0 + PILL1) / 2; g.add(pOk);
    const domo = new THREE.Mesh(new THREE.CylinderGeometry(DPAD.r1 * 0.95, DPAD.r1 * 1.05, 0.3, 48, 1, true), gomaLamina); domo.position.y = LAM1 + 0.15; g.add(domo);
    piezas.ok = { g: ok };
  }
  // the rubber sheet with a hole under every dome
  {
    const sh = C.rrShape(W - 0.5, 13.1, 0.9);
    const hueco = (x, z, r) => { const p = new THREE.Path(); p.absarc(x, -z, r, 0, 2 * PI, true); sh.holes.push(p); };
    // slab(): the shape's y becomes -z; the sheet is centred at z = 0.55
    for (const b of B) hueco(b.x, b.z - 0.55, Math.min(b.w, b.d) / 2 * 1.2);
    hueco(0, DPAD.z - 0.55, DPAD.r1 * 1.02);
    const lam = new THREE.Mesh(C.slab(sh, LAM1 - LAM0), gomaLamina); lam.position.set(0, LAM0, 0.55); teclado.add(lam);
  }

  // ---------- the board: texture with pads and traces, plus real parts ----------
  const PW = 4.1, PL = 16.0, PZ = 0.1; // board from z = -7.9 to 8.1
  const pcbL = X.lienzo(1024, 4000, (g, w, h) => {
    const cx = (x) => ((x + PW / 2) / PW) * w, cz = (z) => ((z - (PZ - PL / 2)) / PL) * h, s = w / PW;
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#165a3c"); gr.addColorStop(1, "#11492f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // weave of the glass fibre under the solder mask
    g.globalAlpha = 0.05; g.fillStyle = "#000"; for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h); g.globalAlpha = 1;
    // copper traces under the mask (lighter green)
    g.strokeStyle = "rgba(90,170,110,0.55)"; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
    const ruta = (pts) => { g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(cx(x), cz(z)) : g.moveTo(cx(x), cz(z)))); g.stroke(); };
    for (const b of B) { const side = b.x > 0.1 ? 1 : b.x < -0.1 ? -1 : (hash(b.z) > 0.5 ? 1 : -1); ruta([[b.x + side * 0.3, b.z], [side * 1.88, b.z - 0.25]]); }
    ruta([[0.75, 5.2], [1.88, 4.6], [1.88, -6.4], [0.62, -7.0]]);
    ruta([[-0.62, -7.0], [-1.88, -6.4], [-1.88, 7.0], [-0.9, 7.25], [-0.15, 7.25]]);
    for (let i = 0; i < 14; i++) ruta([[-0.45 + (i % 7) * 0.15, -6.62 - (i > 6 ? 0.76 : 0)], [-0.45 + (i % 7) * 0.15 + (hash(i) - 0.5) * 1.4, -6.2 - (i > 6 ? 1.5 : 0)]]);
    // pads: two interleaved combs (gold, carbon-printed edge) under each button
    const pad = (x, z, r) => {
      const X0 = cx(x), Z0p = cz(z), rr = r * s;
      g.fillStyle = "#c9a04e"; g.beginPath(); g.arc(X0, Z0p, rr, 0, 2 * PI); g.fill();
      g.fillStyle = "#123d29";
      const n = 5, paso = (2 * rr) / (2 * n + 1);
      for (let k = 0; k < 2 * n + 1; k++) if (k % 2) g.fillRect(X0 - rr, Z0p - rr + k * paso, 2 * rr, paso * 0.45);
      g.fillRect(X0 - rr * 0.06, Z0p - rr, rr * 0.12, rr * 2);
      g.strokeStyle = "rgba(20,20,20,0.6)"; g.lineWidth = 3; g.beginPath(); g.arc(X0, Z0p, rr, 0, 2 * PI); g.stroke();
    };
    for (const b of B) if (b.id !== "n2") pad(b.x, b.z, Math.min(b.w, b.d) * 0.36);
    for (let k = 0; k < 4; k++) pad(Math.sin((k * PI) / 2) * 1.04, DPAD.z + Math.cos((k * PI) / 2) * 1.04, 0.22);
    pad(0, DPAD.z, 0.24);
    // silkscreen: white outlines and tiny reference marks (no numbers)
    g.strokeStyle = "rgba(240,240,235,0.75)"; g.lineWidth = 4;
    g.strokeRect(cx(-0.7), cz(-7.45), 1.4 * s, 0.9 * s); g.strokeRect(cx(0.95), cz(-7.35), 0.75 * s, 0.5 * s);
    g.beginPath(); g.arc(cx(0), cz(7.75), 0.34 * s, 0, 2 * PI); g.stroke();
    g.fillStyle = "rgba(240,240,235,0.75)"; g.font = '700 46px "Inter", sans-serif'; g.textAlign = "center";
    g.fillText("IR", cx(-0.75), cz(7.95)); g.fillText("+", cx(1.4), cz(-3.05)); g.fillText("−", cx(-1.4), cz(-3.05));
    for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(200,170,90,0.85)"; g.beginPath(); g.arc(cx((hash(i * 3.1) - 0.5) * 3.6), cz(-7.6 + hash(i * 7.7) * 15), 9, 0, 2 * PI); g.fill(); g.fillStyle = "#0e3322"; g.beginPath(); g.arc(cx((hash(i * 3.1) - 0.5) * 3.6), cz(-7.6 + hash(i * 7.7) * 15), 4, 0, 2 * PI); g.fill(); }
  });
  const placa = new THREE.Group(); R.add(placa);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.15, PL), new THREE.MeshPhysicalMaterial({ color: 0x0f3b26, roughness: 0.45, clearcoat: 0.6 }));
  pcb.position.set(0, PCB_Y - 0.075, PZ); placa.add(pcb);
  const pcbTop = new THREE.Mesh(new THREE.PlaneGeometry(PW, PL), new THREE.MeshPhysicalMaterial({ map: pcbL.tex, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2, metalness: 0.05 }));
  pcbTop.rotation.x = -PI / 2; pcbTop.position.set(0, PCB_Y + 0.004, PZ); pcbTop.userData.sinBordes = true; placa.add(pcbTop);
  // the real pads of button 2: two gold combs, so a macro stays sharp
  const pistas = new THREE.Group(); pistas.position.set(0, PCB_Y + 0.006, 5.2); placa.add(pistas);
  {
    const r = 0.36, n = 6, paso = (2 * r) / (2 * n + 1), gr = 0.012;
    const lomo = new THREE.Mesh(new THREE.BoxGeometry(0.06, gr, 2 * r), oro); lomo.position.set(-r + 0.03, gr / 2, 0); pistas.add(lomo);
    const lomo2 = lomo.clone(); lomo2.position.x = r - 0.03; pistas.add(lomo2);
    for (let k = 0; k < 2 * n + 1; k++) {
      const z = -r + (k + 0.5) * paso, izq = k % 2 === 0;
      const dedo = new THREE.Mesh(new THREE.BoxGeometry(2 * r - 0.16, gr, paso * 0.62), oro);
      dedo.position.set(izq ? 0.05 : -0.05, gr / 2, z); pistas.add(dedo);
    }
    const borde = new THREE.Mesh(new THREE.TorusGeometry(r + 0.04, 0.012, 6, 64), new THREE.MeshStandardMaterial({ color: 0x0c2a1c, roughness: 0.6 })); borde.rotation.x = PI / 2; pistas.add(borde);
  }
  // chip (SO-16), resonator, LED driver transistor, resistor, capacitors
  const chip = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.16, 0.7, 2, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x141518, roughness: 0.5, clearcoat: 0.3 }));
  chip.position.set(0, PCB_Y + 0.11, -7.0); placa.add(chip);
  { const marca = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0x2a2c30 })); marca.rotation.x = -PI / 2; marca.position.set(-0.48, 0.081, -0.22); chip.add(marca);
    const pata = new THREE.MeshPhysicalMaterial({ color: 0xc8ccd2, metalness: 1, roughness: 0.3 });
    for (let k = 0; k < 8; k++) for (const sz of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.2), pata); p.position.set(-0.53 + k * 0.152, -0.06, sz * 0.43); chip.add(p); } }
  const cristal = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.32, 0.36, 3, 0.08), new THREE.MeshPhysicalMaterial({ color: 0xb87a3c, roughness: 0.45, clearcoat: 0.6 }));
  cristal.position.set(1.32, PCB_Y + 0.17, -7.1); placa.add(cristal);
  const trans = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 24, 1, false, 0, PI), new THREE.MeshPhysicalMaterial({ color: 0x151619, roughness: 0.5 }));
  trans.rotation.z = PI / 2; trans.rotation.y = PI / 2; trans.position.set(1.25, PCB_Y + 0.25, 7.55); placa.add(trans);
  const resis = new THREE.Group(); resis.position.set(-1.3, PCB_Y + 0.14, 7.55); placa.add(resis);
  { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 6, 16), new THREE.MeshPhysicalMaterial({ color: 0xd6c39a, roughness: 0.5, clearcoat: 0.4 })); c.rotation.z = PI / 2; resis.add(c);
    [0x6b3d1f, 0x111111, 0xd03a1a, 0xd8b04a].forEach((col, i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 16), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.5 })); b.rotation.z = PI / 2; b.position.x = -0.16 + i * 0.1; resis.add(b); }); }
  for (const [x, z] of [[0.95, -6.35], [-0.95, -6.35], [0.6, 6.95]]) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.12, 0.12, 2, 0.02), new THREE.MeshPhysicalMaterial({ color: 0x9a7b55, roughness: 0.5 })); c.position.set(x, PCB_Y + 0.06, z); placa.add(c); }

  // the IR LED: 5 mm epoxy body with its flange, the anvil and post inside, legs bent into the board
  const led = new THREE.Group(); led.position.set(0, 1.74, 7.62); placa.add(led);
  const epoxi = new THREE.MeshPhysicalMaterial({ color: 0xb9c4d6, roughness: 0.04, transparent: true, opacity: 0.55, clearcoat: 1, clearcoatRoughness: 0.03, emissive: new THREE.Color(`rgb(${IR})`), emissiveIntensity: 0, depthWrite: false });
  {
    const perfil = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.29, 0), new THREE.Vector2(0.29, 0.08), new THREE.Vector2(0.25, 0.08), new THREE.Vector2(0.25, 0.5)];
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * (PI / 2); perfil.push(new THREE.Vector2(0.25 * Math.cos(a) + 0.0005, 0.5 + 0.25 * Math.sin(a))); }
    const cuerpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 48), epoxi); cuerpo.rotation.x = PI / 2; led.add(cuerpo);
    const metal = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.25 });
    const yunque = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.3), metal); yunque.position.set(0.04, -0.03, 0.18); led.add(yunque);
    const poste = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.3), metal); poste.position.set(-0.08, 0.02, 0.18); led.add(poste);
    const dado = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), new THREE.MeshStandardMaterial({ color: 0x444a55, emissive: new THREE.Color(`rgb(${IR})`), emissiveIntensity: 0 })); dado.position.set(0.04, 0.0, 0.32); led.add(dado); led.userData.dado = dado;
    for (const x of [-0.1, 0.1]) {
      const pts = [v3(x, 0, 0.02), v3(x, 0, -0.18), v3(x, -0.05, -0.24), v3(x, -0.3, -0.28), v3(x, -(1.74 - PCB_Y) + 0.01, -0.28)];
      const leg = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 24, 0.025, 8, false), metal); led.add(leg);
    }
  }
  // glow of the (drawn) infrared light: at the nose of the LED and outside the window, plus a soft cone
  const brilloLed = C.brillo(IR); brilloLed.scale.setScalar(1.6); brilloLed.position.set(0, 0, 0.75); led.add(brilloLed);
  const brilloFuera = C.brillo(IR); brilloFuera.scale.setScalar(3.2); brilloFuera.position.set(0, 1.55, Z1 + 0.25); brilloFuera.userData.noCortar = true; R.add(brilloFuera);
  const conoMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { k: { value: 0 }, col: { value: new THREE.Color(`rgb(${IR})`) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: "varying vec2 vUv; uniform float k; uniform vec3 col; void main(){ float a = vUv.y * vUv.y; gl_FragColor = vec4(col * a * k * 0.3, 1.0); }" });
  const conoGeo = new THREE.ConeGeometry(2.6, 14, 48, 1, true);
  // the cone must not count in the remote's size (framing of the shots): its box is only the tip
  conoGeo.boundingBox = new THREE.Box3(new THREE.Vector3(-0.1, 6.9, -0.1), new THREE.Vector3(0.1, 7, 0.1));
  const cono = new THREE.Mesh(conoGeo, conoMat); cono.frustumCulled = false; cono.rotation.x = -PI / 2; cono.position.set(0, 1.55, Z1 + 7.2); cono.userData.noCortar = true; cono.userData.sinBordes = true; R.add(cono);

  // ---------- batteries (AAA) and springs, under the board ----------
  const pilas = new THREE.Group(); R.add(pilas);
  const envoltorio = X.lienzo(512, 128, (g, w, h) => { g.fillStyle = "#16181c"; g.fillRect(0, 0, w, h); g.fillStyle = "#c98a2c"; g.fillRect(w * 0.62, 0, w * 0.3, h); g.fillStyle = "#e8e8e8"; g.font = '700 70px "Inter", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("+", w * 0.77, h / 2 + 2); }).tex;
  for (const [x, s] of [[-0.62, 1], [0.62, -1]]) {
    const p = new THREE.Group(); p.position.set(x, 0.66, -5.68); p.rotation.y = s > 0 ? 0 : PI; pilas.add(p);
    const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 4.2, 40, 1, true), new THREE.MeshPhysicalMaterial({ map: envoltorio, roughness: 0.35, clearcoat: 0.8 })); tubo.rotation.x = PI / 2; p.add(tubo);
    const tapaN = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 40), M.acero); tapaN.rotation.x = PI / 2; tapaN.position.z = -2.12; p.add(tapaN);
    const tapaP = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 40), M.acero); tapaP.rotation.x = PI / 2; tapaP.position.z = 2.12; p.add(tapaP);
    const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.12, 24), M.acero); nub.rotation.x = PI / 2; nub.position.z = 2.2; p.add(nub);
  }
  class Muelle extends THREE.Curve { getPoint(u, out = new THREE.Vector3()) { const a = u * 2 * PI * 4; return out.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, -0.25 + 0.5 * u); } }
  for (const x of [-0.62, 0.62]) { const m = new THREE.Mesh(new THREE.TubeGeometry(new Muelle(), 120, 0.03, 6, false), M.acero); m.position.set(x, 0.66, -8.05); pilas.add(m); const pl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.05), M.cincado); pl.position.set(x, 0.66, -3.5); pilas.add(pl); }

  // ---------- cross-section at x = 0 (the corte shot cuts there): flat filled faces, like a diagram ----------
  const secciones = [];
  const secMat = (c, op = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, emissive: c, emissiveIntensity: 0.42, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
  const SM = { pared: secMat(0xa8a39c), goma: secMat(0x7d8592), gomaOk: secMat(0x9aa1ab), lamina: secMat(0x6c7380), pill: secMat(0x050506), pcb: secMat(0x2f8f5c), cobre: secMat(0xe2aa52), chip: secMat(0x1b1c1f), led: secMat(0xc9d4e6, 0.6), ventana: secMat(0x7a1424, 0.92) };
  SM.pill.emissiveIntensity = 0;
  SM.cobre.emissiveIntensity = 0.5;
  // pts = [[z, y], ...] in the coordinates of `padre`; the face sits on the plane x = dx, facing +x
  function sec(pts, mat, padre = R, dx = 0.004) {
    const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(-z, y)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); m.rotation.y = PI / 2; m.position.x = dx;
    m.userData.noCortar = true; m.userData.sinBordes = true; m.visible = false; padre.add(m); secciones.push(m); return m;
  }
  const rect = (z0, z1, y0, y1) => [[z0, y0], [z1, y0], [z1, y1], [z0, y1]];
  const arco = (cz, cy, r, a0, a1, n = 6) => Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * PI) / 180; return [cz + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const rr2 = (z0, z1, y0, y1, r) => [...arco(z1 - r, y0 + r, r, 270, 360), ...arco(z1 - r, y1 - r, r, 0, 90), ...arco(z0 + r, y1 - r, r, 90, 180), ...arco(z0 + r, y0 + r, r, 180, 270)];
  {
    const t = 0.15, rc = 0.32, zf = Z1, zb = Z0;
    // bottom shell: a U open at the top
    sec([[zb, YS - 0.02], ...arco(zb + rc, rc, rc, 180, 270), ...arco(zf - rc, rc, rc, 270, 360), [zf, YS - 0.02], [zf - t, YS - 0.02], ...arco(zf - rc, rc, rc - t, 360, 270), ...arco(zb + rc, rc, rc - t, 270, 180), [zb + t, YS - 0.02]], SM.pared);
    // top shell: front and back ends, and the bits of the top wall between the holes of the buttons
    const yT0 = YS + 0.02;
    sec([[zf, yT0], ...arco(zf - rc, YT - rc, rc, 0, 90), [5.57, YT], [5.57, YT - t], ...arco(zf - rc, YT - rc, rc - t, 90, 0), [zf - t, yT0]], SM.pared, tapa);
    sec([[-1.42, YT], ...arco(zb + rc, YT - rc, rc, 90, 180), [zb, yT0], [zb + t, yT0], ...arco(zb + rc, YT - rc, rc - t, 180, 90), [-1.42, YT - t]], SM.pared, tapa);
    for (const [a, b] of [[4.52, 4.83], [3.47, 3.78], [2.42, 2.73], [1.5, 1.68]]) sec(rect(a, b, YT - t, YT), SM.pared, tapa);
    sec(rect(8.05, 8.55, 1.075, 2.025), SM.ventana, tapa, 0.007);
    // board, copper on top, chip
    sec(rect(PZ - PL / 2, PZ + PL / 2, PCB_Y - 0.15, PCB_Y), SM.pcb);
    sec(rect(PZ - PL / 2 + 0.2, PZ + PL / 2 - 0.2, PCB_Y - 0.012, PCB_Y + 0.004), SM.cobre, R, 0.006);
    sec(rect(-7.35, -6.65, PCB_Y + 0.03, PCB_Y + 0.19), SM.chip);
    // LED profile (translucent)
    sec([[7.62, 1.74 - 0.29], [7.7, 1.74 - 0.29], [7.7, 1.74 - 0.25], [8.12, 1.74 - 0.25], ...arco(8.12, 1.74, 0.25, -90, 90, 10).map(([z, y]) => [z, y]), [7.7, 1.74 + 0.25], [7.7, 1.74 + 0.29], [7.62, 1.74 + 0.29]], SM.led, placa, 0.006);
    // rubber sheet with the gaps of the domes (column x = 0: buttons 2, 5, 8, 0 and the d-pad)
    const col = [5.2, 4.15, 3.1, 2.05];
    const huecos = [...col.map((z) => [z - 0.41, z + 0.41]), [0.05 - 1.45, 0.05 + 1.45]].sort((a, b) => a[0] - b[0]);
    let z = 0.55 - 13.1 / 2;
    for (const [a, b] of huecos) { sec(rect(z, a, LAM0, LAM1), SM.lamina, teclado); z = b; }
    sec(rect(z, 0.55 + 13.1 / 2, LAM0, LAM1), SM.lamina, teclado);
    // each button of the column: body, pill and the two walls of its dome
    const ponBoton = (g, zc, media, mat, dome) => {
      sec(rr2(zc - media, zc + media, PILL1, TOP, 0.14), mat, g);
      sec(rect(zc - 0.2, zc + 0.2, PILL0, PILL1), SM.pill, g, 0.006);
      for (const s of [-1, 1]) sec([[zc + s * (media * 1.2), LAM1], [zc + s * (media * 1.2 - 0.05), LAM1], [zc + s * (media * 0.8 - 0.04), LAM1 + 0.32], [zc + s * (media * 0.8), LAM1 + 0.32]], SM.lamina, dome || g);
    };
    for (const [id, zc] of [["n2", 5.2], ["n5", 4.15], ["n8", 3.1], ["n0", 2.05]]) {
      const P = piezas[id];
      if (id === "n2") {
        // button 2 moves when pressed: its faces live in its group (and the dome walls in its dome)
        sec(rr2(-0.34, 0.34, PILL1, TOP, 0.14), SM.goma, P.g);
        sec(rect(-0.2, 0.2, PILL0, PILL1), SM.pill, P.g, 0.006);
        const y0 = LAM1 + 0.16;
        for (const s of [-1, 1]) sec([[s * 0.41, LAM1 - y0], [s * 0.36, LAM1 - y0], [s * 0.24, LAM1 + 0.32 - y0], [s * 0.28, LAM1 + 0.32 - y0]], SM.lamina, P.domo);
      } else ponBoton(teclado, zc, 0.34, SM.goma);
    }
    // d-pad: ring, OK and their pills
    ponBoton(teclado, 0.05, 0.57, SM.gomaOk);
    for (const s of [-1, 1]) { sec(rr2(0.05 + s * 0.72 - (s > 0 ? 0 : 0.7), 0.05 + s * 0.72 + (s > 0 ? 0.7 : 0), PILL1, TOP - 0.04, 0.12), SM.goma, teclado); sec(rect(0.05 + s * 1.04 - 0.17, 0.05 + s * 1.04 + 0.17, PILL0, PILL1), SM.pill, teclado, 0.006); }
  }

  // ---------- controls ----------
  let kAbre = 0, kPulsa = 0, kIr = 0, parpadeo = 0, kCont = 0, soloPlaca = 0;
  const p2 = piezas.n2;
  function aplicarAbre() {
    tapa.position.y = 4.6 * kAbre; tapa.rotation.x = -0.06 * kAbre;
    teclado.position.y = 2.3 * kAbre;
  }
  function aplicarPulsa() {
    const d = 0.12 * kPulsa;
    p2.cuerpo.position.y = PILL1 + (TOP - PILL1) / 2 - d; p2.pill.position.y = (PILL0 + PILL1) / 2 - d;
    p2.g.children.forEach((o) => { if (o !== p2.cuerpo && o !== p2.pill && o !== p2.domo) o.position.y = (o.userData.y0 ?? (o.userData.y0 = o.position.y)) - d; });
    p2.domo.scale.y = 1 - 0.38 * kPulsa; p2.domo.position.y = LAM1 + 0.16 * (1 - 0.38 * kPulsa);
  }
  aplicarAbre(); aplicarPulsa();
  return {
    grupo: R,
    exterior: [tapaM, baseM, ventana],
    cortables: [R],
    partes: {
      led: { obj: led, local: [0, 0, 0.55], radio: 0.45 },
      ventana: { obj: ventana, local: [0, 0, 0.26], radio: 1.2 },
      punta: { obj: R, local: [0, 1.4, Z1 - 1.0], radio: 2.4 },
      placa: { obj: pcbTop, local: [0, 0, 0], radio: 8 },
      chip: { obj: chip, local: [0, 0.1, 0], radio: 0.75 },
      cristal: { obj: cristal, local: [0, 0.18, 0], radio: 0.45 },
      goma: { obj: teclado, local: [0, LAM1 + 0.2, 3.0], radio: 3.5 },
      boton: { obj: p2.g, local: [0, TOP, 0], radio: 0.65 },
      pastilla: { obj: p2.pill, local: [0, -0.04, 0], radio: 0.32 },
      pistas: { obj: pistas, local: [0, 0, 0], radio: 0.45 },
      pilas: { obj: pilas, local: [0, 0.66, -5.68], radio: 2.6 },
      power: { obj: piezas.power.g, local: [0, TOP, 0], radio: 0.55 },
      ok: { obj: piezas.ok.g, local: [0, 0.6, 0], radio: 0.6 },
      arriba: { obj: R, local: [0, YT, 1.0], radio: 9 },
      abajo: { obj: R, local: [0, 0, -2.0], radio: 9 },
    },
    curvas: {
      pista: { obj: R, puntos: [v3(0.36, PCB_Y + 0.03, 5.2), v3(0.75, PCB_Y + 0.03, 5.2), v3(1.88, PCB_Y + 0.03, 4.6), v3(1.88, PCB_Y + 0.03, -6.4), v3(0.62, PCB_Y + 0.03, -7.0)] },
      aLed: { obj: R, puntos: [v3(-0.62, PCB_Y + 0.03, -7.0), v3(-1.88, PCB_Y + 0.03, -6.4), v3(-1.88, PCB_Y + 0.03, 7.0), v3(-0.9, PCB_Y + 0.03, 7.25), v3(-0.15, PCB_Y + 0.03, 7.3), v3(0, 1.74, 7.7), v3(0, 1.74, 8.35)] },
      haz: { obj: R, puntos: [v3(0, 1.6, Z1 + 0.1), v3(0, 1.6, Z1 + 20), v3(0, 1.6, Z1 + 40), v3(0, 1.6, Z1 + 60)] },
    },
    controles: {
      abre: (k) => { kAbre = k; aplicarAbre(); },
      pulsa: (k) => { kPulsa = clamp(k); aplicarPulsa(); },
      contacto: (k) => { kCont = k; oro.emissiveIntensity = 0.9 * k; },
      ir: (k) => { kIr = k; },
      parpadeo: (k) => { parpadeo = k; },
      placa: (k) => { soloPlaca = k; tapa.visible = teclado.visible = !(k > 0.5); },
      seccion: (k) => { for (const m of secciones) m.visible = k > 0.5; },
    },
    defecto: { abre: 0, pulsa: 0, contacto: 0, ir: 0, parpadeo: 0, placa: 0, seccion: 0 },
    actualizar(t) {
      const on = parpadeo ? CODIGO.enT(t) : 1, k = kIr * (parpadeo ? 0.15 + 0.85 * on : 1);
      epoxi.emissiveIntensity = 1.4 * k; led.userData.dado.material.emissiveIntensity = 3 * k;
      brilloLed.material.opacity = 0.9 * k; brilloLed.visible = k > 0.002;
      brilloFuera.material.opacity = 0.85 * k * (1 - kAbre); brilloFuera.visible = k > 0.002 && kAbre < 0.5;
      conoMat.uniforms.k.value = k * (1 - kAbre); cono.visible = k > 0.002 && kAbre < 0.5;
      void kCont; void soloPlaca;
    },
  };
}

// ======================================================================================================
export function tele(THREE, C, X, M) {
  const { v3 } = C;
  const PI = Math.PI;
  const T = new THREE.Group();
  const AN = 96, AL = 56, G = 2.4, YB = 9; // width, height, depth; bottom of the panel at y = 9 (on its stand)
  const marco = new THREE.MeshPhysicalMaterial({ color: 0x15161a, roughness: 0.32, metalness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const trasera = new THREE.MeshPhysicalMaterial({ color: 0x232529, roughness: 0.55, map: X.rep(X.tex.rayado({ fondo: "#26282c", linea: "rgba(255,255,255,0.04)", paso: 5 }), 4, 3) });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(AN, AL, G, 4, 0.5), marco); cuerpo.position.set(0, YB + AL / 2, -G / 2); T.add(cuerpo);
  const caja = new THREE.Mesh(new RoundedBoxGeometry(AN * 0.62, AL * 0.6, 5, 4, 1.4), trasera); caja.position.set(0, YB + AL * 0.42, -G - 2.2); T.add(caja);
  // stand: two feet
  for (const s of [-1, 1]) {
    const pie = new THREE.Mesh(new RoundedBoxGeometry(2.2, YB + 3, 1.6, 3, 0.5), marco); pie.position.set(s * AN * 0.38, (YB + 3) / 2 - 0.2, -1.2); pie.rotation.z = s * 0.3; T.add(pie);
    const base = new THREE.Mesh(new RoundedBoxGeometry(5, 0.8, 22, 3, 0.35), marco); base.position.set(s * AN * 0.38 + s * 1.6, 0.4, 2); T.add(base);
  }
  // screen: canvas with a generic landscape and the channel badge
  const SW = AN - 1.6, SH = AL - 2.6, SY = YB + 1.9 + SH / 2;
  const lz = X.lienzo(1280, 720, () => {});
  const pantMat = new THREE.MeshBasicMaterial({ map: lz.tex, toneMapped: false, color: 0x000000 });
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), pantMat); pant.position.set(0, SY, 0.3); pant.userData.sinBordes = true; T.add(pant);
  const cristal = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshPhysicalMaterial({ color: 0x0a0b0d, roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5, depthWrite: false }));
  cristal.position.set(0, SY, 0.42); cristal.userData.sinBordes = true; T.add(cristal);
  let clave = null;
  function pintar(canal, osd) {
    const k = `${canal}|${osd.toFixed(2)}`; if (k === clave) return; clave = k;
    const g = lz.g, w = 1280, h = 720;
    const cielo = g.createLinearGradient(0, 0, 0, h * 0.6); cielo.addColorStop(0, "#2d5f9a"); cielo.addColorStop(1, "#f2b27a"); g.fillStyle = cielo; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,236,200,0.95)"; g.beginPath(); g.arc(w * 0.68, h * 0.42, 42, 0, 2 * PI); g.fill();
    const monte = (c, y0, amp, f, s) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 - amp * (0.6 * Math.sin(x * f + s) + 0.4 * Math.sin(x * f * 2.7 + s * 3))); g.lineTo(w, h); g.closePath(); g.fill(); };
    monte("#5b4a6e", h * 0.5, 70, 0.006, 1); monte("#37304a", h * 0.58, 50, 0.009, 4); monte("#1f2a2c", h * 0.66, 30, 0.014, 2);
    const lago = g.createLinearGradient(0, h * 0.66, 0, h); lago.addColorStop(0, "#d79a6a"); lago.addColorStop(1, "#1b2c44"); g.fillStyle = lago; g.fillRect(0, h * 0.68, w, h * 0.32);
    g.fillStyle = "rgba(255,240,210,0.35)"; for (let i = 0; i < 18; i++) g.fillRect(w * 0.68 - 60 + Math.sin(i * 2.3) * 30, h * 0.7 + i * 12, 120 - i * 4, 3);
    if (osd > 0.01) {
      g.globalAlpha = osd;
      g.fillStyle = "rgba(10,12,16,0.62)"; g.beginPath(); g.roundRect(56, 48, 240, 150, 18); g.fill();
      g.fillStyle = "#ffffff"; g.font = '700 110px "Inter", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(canal), 176, 128);
      g.globalAlpha = 1;
    }
    lz.tex.needsUpdate = true;
  }
  // bottom bezel: built around the receiver window, so the window is a real opening
  const VX = 30, VW = 2.6, VH = 0.95, BY = YB + 0.95;
  const borde = new THREE.Group(); T.add(borde);
  const tira = (x0, x1, y0, y1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.8), marco); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.2); borde.add(m); return m; };
  tira(-AN / 2 + 0.4, VX - VW / 2, YB + 0.2, YB + 1.8); tira(VX + VW / 2, AN / 2 - 0.4, YB + 0.2, YB + 1.8);
  tira(VX - VW / 2, VX + VW / 2, YB + 0.2, BY - VH / 2); tira(VX - VW / 2, VX + VW / 2, BY + VH / 2, YB + 1.8);
  const ventana = new THREE.Mesh(new THREE.PlaneGeometry(VW, VH), new THREE.MeshPhysicalMaterial({ color: 0x2a0a10, roughness: 0.06, transparent: true, opacity: 0.55, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.2, depthWrite: false }));
  ventana.position.set(VX, BY, 0.45); ventana.userData.sinBordes = true; T.add(ventana);
  // the receiver board behind the window
  const placa = new THREE.Group(); placa.position.set(VX, BY, -0.3); T.add(placa);
  placa.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(5, 1.6, 0.1), M.pcb), {}));
  const epoxi = new THREE.MeshPhysicalMaterial({ color: 0x0c0d10, roughness: 0.25, clearcoat: 0.8, emissive: 0xff4d6d, emissiveIntensity: 0 });
  const rec = new THREE.Group(); rec.position.set(-0.2, 0, 0.3); placa.add(rec);
  rec.add(new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.72, 0.42, 2, 0.06), epoxi));
  const lente = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, 2 * PI, 0, PI / 2), epoxi); lente.rotation.x = PI / 2; lente.position.set(0, 0.08, 0.21); rec.add(lente);
  const piloto = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 12), new THREE.MeshStandardMaterial({ color: 0x601010, emissive: 0xff2a1a, emissiveIntensity: 0.6 })); piloto.position.set(0.8, 0, 0.25); placa.add(piloto);
  const brilloRec = C.brillo("255,77,109"); brilloRec.scale.setScalar(1.3); brilloRec.position.set(0, 0.08, 0.45); rec.add(brilloRec);
  let kOn = 1, canal = 1, osd = 0, kRec = 0;
  return {
    grupo: T,
    exterior: [borde.children[0], borde.children[1], borde.children[2], borde.children[3], ventana],
    cortables: [T],
    partes: {
      pantalla: { obj: pant, local: [0, 0, 0], radio: AN / 2 },
      ventana: { obj: ventana, local: [0, 0, 0], radio: 1.6 },
      receptor: { obj: rec, local: [0, 0.08, 0.3], radio: 0.5 },
      piloto: { obj: piloto, local: [0, 0, 0], radio: 0.3 },
      placa: { obj: placa, local: [0, 0, 0], radio: 2.6 },
      canal: { obj: pant, local: [-SW / 2 + 9, SH / 2 - 7.5, 0], radio: 6 },
      pie: { obj: T, local: [0, 3, 0], radio: 10 },
    },
    controles: {
      encendida: (k) => { kOn = k; },
      canal: (n) => { canal = n; },
      osd: (k) => { osd = k; },
      receptor: (k) => { kRec = k; },
    },
    defecto: { encendida: 1, canal: 1, osd: 0, receptor: 0 },
    actualizar(t) {
      pintar(canal, osd);
      pantMat.color.setScalar(0.9 * kOn);
      epoxi.emissiveIntensity = 0.5 * kRec; brilloRec.material.opacity = 0.8 * kRec; brilloRec.visible = kRec > 0.01;
      void t; void v3;
    },
  };
}

// ======================================================================================================
// the IR receiver, about 10 times bigger: 6 wide, 7 tall, 3.4 deep (units ~ 0.1 mm × 10), lens towards +z
export function receptor(THREE, C, X, M) {
  const { v3 } = C;
  const PI = Math.PI;
  const g = new THREE.Group();
  const epoxi = new THREE.MeshPhysicalMaterial({ color: 0x0b0c0f, roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.12, envMapIntensity: 0.9 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(6, 7, 3.4, 4, 0.5), epoxi); cuerpo.position.set(0, 3.5, 0); g.add(cuerpo);
  const lente = new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 32, 0, 2 * PI, 0, PI / 2), epoxi); lente.rotation.x = PI / 2; lente.position.set(0, 4.5, 1.7); g.add(lente);
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xd2d5da, metalness: 1, roughness: 0.22, map: X.rep(X.tex.metal({ color: "#c8ccd2" }), 1, 1), emissive: 0xffb347, emissiveIntensity: 0 });
  const patas = new THREE.Group(); g.add(patas);
  const pataSal = [];
  for (const x of [-1.9, 0, 1.9]) { const p = new THREE.Mesh(new RoundedBoxGeometry(0.55, 7, 0.28, 2, 0.08), x === -1.9 ? metal : metal.clone()); p.position.set(x, -3.2, 0); patas.add(p); if (x === -1.9) pataSal.push(p); }
  // inside: lead frame, PIN photodiode die with metal fingers, the amplifier/filter chip and gold wires
  const dentro = new THREE.Group(); g.add(dentro);
  const marco = new THREE.Mesh(new THREE.BoxGeometry(4.6, 6.0, 0.16), metal); marco.position.set(0, 3.2, -0.5); dentro.add(marco);
  const diodoL = X.lienzo(512, 512, (gg, w, h) => {
    const gr = gg.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#3c4a66"); gr.addColorStop(0.5, "#5a4a7a"); gr.addColorStop(1, "#2c3a58"); gg.fillStyle = gr; gg.fillRect(0, 0, w, h);
    gg.strokeStyle = "rgba(230,232,240,0.85)"; gg.lineWidth = 10; gg.strokeRect(20, 20, w - 40, h - 40);
    gg.lineWidth = 6; for (let x = 70; x < w - 40; x += 56) { gg.beginPath(); gg.moveTo(x, 20); gg.lineTo(x, h - 70); gg.stroke(); }
    gg.fillStyle = "#e9c46a"; gg.fillRect(w / 2 - 40, h - 80, 80, 50);
  });
  const diodoMat = new THREE.MeshPhysicalMaterial({ map: diodoL.tex, roughness: 0.18, metalness: 0.3, clearcoat: 1, emissive: 0xff4d6d, emissiveIntensity: 0 });
  const diodo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.3), [M.aceroOsc, M.aceroOsc, M.aceroOsc, M.aceroOsc, diodoMat, M.aceroOsc]); diodo.position.set(0, 4.5, -0.27); dentro.add(diodo);
  const chipL = X.lienzo(256, 256, (gg, w, h) => { gg.fillStyle = "#3a3f48"; gg.fillRect(0, 0, w, h); gg.strokeStyle = "rgba(200,170,90,0.8)"; gg.lineWidth = 3; for (let i = 0; i < 26; i++) { gg.strokeRect(20 + (i % 6) * 36, 20 + Math.floor(i / 6) * 44, 26, 30); } gg.fillStyle = "#e9c46a"; for (let i = 0; i < 6; i++) gg.fillRect(14 + i * 40, h - 22, 18, 14); });
  const chipMat = new THREE.MeshPhysicalMaterial({ map: chipL.tex, roughness: 0.2, metalness: 0.4, clearcoat: 1 });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 0.25), [M.aceroOsc, M.aceroOsc, M.aceroOsc, M.aceroOsc, chipMat, M.aceroOsc]); chip.position.set(0, 1.75, -0.29); dentro.add(chip);
  const oroH = new THREE.MeshPhysicalMaterial({ color: 0xe9c46a, metalness: 1, roughness: 0.2 });
  const hilo = (a, b, h) => { const m = a.clone().lerp(b, 0.5).add(v3(0, 0, h)); dentro.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 24, 0.025, 6, false), oroH)); };
  hilo(v3(0, 3.42, -0.1), v3(0, 2.45, -0.15), 0.6); hilo(v3(-0.5, 1.2, -0.15), v3(-1.9, 0.35, -0.42), 0.5); hilo(v3(0.5, 1.2, -0.15), v3(1.9, 0.35, -0.42), 0.5); hilo(v3(0.7, 2.4, -0.15), v3(1.6, 3.0, -0.42), 0.4);
  const brillo = C.brillo("255,77,109"); brillo.scale.setScalar(4.5); brillo.position.set(0, 4.5, 0.2); g.add(brillo);
  let kD = 0, kS = 0;
  return {
    grupo: g, exterior: [cuerpo, lente], cortables: [g],
    partes: {
      lente: { obj: lente, local: [0, 0, 1.9], radio: 2.0 },
      diodo: { obj: diodo, local: [0, 0, 0.15], radio: 1.4 },
      chip: { obj: chip, local: [0, 0, 0.15], radio: 1.0 },
      patas: { obj: patas, local: [0, -3.2, 0], radio: 3.5 },
      salida: { obj: pataSal[0], local: [0, -2, 0], radio: 1.5 },
      cuerpo: { obj: cuerpo, local: [0, 0, 0], radio: 4.6 },
    },
    controles: { diodo: (k) => { kD = k; }, salida: (k) => { kS = k; } },
    defecto: { diodo: 0, salida: 0 },
    actualizar(t) {
      diodoMat.emissiveIntensity = 0.9 * kD; brillo.material.opacity = 0.7 * kD; brillo.visible = kD > 0.01;
      const on = kS * (0.25 + 0.75 * CODIGO.enT(t)); metal.emissiveIntensity = 0.0; pataSal[0].material.emissiveIntensity = 1.2 * on;
    },
  };
}

// ======================================================================================================
// phone with the camera app open, pointed at a remote: the viewfinder shows its LED in purple
export function movilCamara(THREE, C, X, M) {
  const MF = X.movil();
  const UI = (g, w, h, luz) => {
    // viewfinder: a dim room, the remote's nose seen from the front, slightly from above
    const f = g.createLinearGradient(0, 0, 0, h); f.addColorStop(0, "#1d2129"); f.addColorStop(0.55, "#2a2622"); f.addColorStop(1, "#14110f"); g.fillStyle = f; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = ((i * 97) % 100) / 100 * w, y = (((i * 61) % 100) / 100) * h * 0.5; g.fillStyle = `rgba(255,214,170,${0.03 + 0.04 * ((i * 13) % 7) / 7})`; g.beginPath(); g.arc(x, y, 18 + ((i * 7) % 5) * 9, 0, 2 * Math.PI); g.fill(); }
    const cx = w / 2, cy = h * 0.47;
    // table edge and the remote lying on it, pointing at the camera
    g.fillStyle = "#3b2a1e"; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w, h * 0.6); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    const cuerpo = g.createLinearGradient(0, cy, 0, h); cuerpo.addColorStop(0, "#2b2e34"); cuerpo.addColorStop(1, "#141518");
    g.fillStyle = cuerpo; g.beginPath(); g.moveTo(cx - 150, cy + 40); g.lineTo(cx + 150, cy + 40); g.lineTo(cx + 230, h * 0.96); g.lineTo(cx - 230, h * 0.96); g.closePath(); g.fill();
    g.fillStyle = "#4a4e55"; for (let r = 0; r < 4; r++) for (let c = -1; c <= 1; c++) { const y = cy + 110 + r * 70 + r * r * 6, s = 1 + r * 0.12; g.beginPath(); g.ellipse(cx + c * 78 * s, y, 30 * s, 12 * s, 0, 0, 2 * Math.PI); g.fill(); }
    g.fillStyle = "#b02a2e"; g.beginPath(); g.ellipse(cx - 85, cy + 70, 24, 10, 0, 0, 2 * Math.PI); g.fill();
    g.fillStyle = "#1a1c20"; g.beginPath(); g.roundRect(cx - 150, cy - 40, 300, 90, 34); g.fill();
    g.fillStyle = "#2a0a10"; g.beginPath(); g.roundRect(cx - 80, cy - 20, 160, 52, 16); g.fill();
    if (luz > 0.01) {
      const r = 230 * (0.6 + 0.4 * luz);
      const gr = g.createRadialGradient(cx, cy + 5, 0, cx, cy + 5, r);
      gr.addColorStop(0, `rgba(255,250,255,${luz})`); gr.addColorStop(0.08, `rgba(236,214,255,${luz})`); gr.addColorStop(0.25, `rgba(178,120,255,${0.75 * luz})`); gr.addColorStop(0.6, `rgba(120,70,220,${0.25 * luz})`); gr.addColorStop(1, "rgba(80,40,180,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy + 5, r, 0, 2 * Math.PI); g.fill();
      g.strokeStyle = `rgba(220,190,255,${0.5 * luz})`; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - r * 1.1, cy + 5); g.lineTo(cx + r * 1.1, cy + 5); g.moveTo(cx, cy + 5 - r * 0.7); g.lineTo(cx, cy + 5 + r * 0.7); g.stroke();
    }
    // camera interface (generic, Spanish)
    g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, w, h * 0.085); g.fillRect(0, h * 0.8, w, h * 0.2);
    g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(w * 0.1, h * 0.05); g.lineTo(w * 0.085, h * 0.064); g.lineTo(w * 0.1, h * 0.064); g.lineTo(w * 0.088, h * 0.078); g.stroke();
    g.beginPath(); g.arc(w * 0.9, h * 0.064, 16, 0, 2 * Math.PI); g.stroke();
    g.font = '700 30px "Inter", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.arc(w / 2, h * 0.76, 34, 0, 2 * Math.PI); g.fill(); g.fillStyle = "#ffd34a"; g.fillText("1×", w / 2, h * 0.761);
    g.font = '700 30px "Inter", sans-serif';
    [["VÍDEO", -0.27], ["FOTO", 0], ["RETRATO", 0.29]].forEach(([s, dx]) => { g.fillStyle = dx === 0 ? "#ffd34a" : "rgba(255,255,255,0.85)"; g.fillText(s, w / 2 + dx * w, h * 0.83); });
    g.fillStyle = "#fff"; g.beginPath(); g.arc(w / 2, h * 0.905, 62, 0, 2 * Math.PI); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h * 0.905, 52, 0, 2 * Math.PI); g.stroke();
    g.fillStyle = "#6b5a48"; g.beginPath(); g.roundRect(w * 0.13, h * 0.88, 74, 74, 14); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.arc(w * 0.82, h * 0.905, 34, 0.4, 2 * Math.PI - 0.4); g.stroke();
    // grid of thirds
    g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; for (const k of [1, 2]) { g.beginPath(); g.moveTo((w * k) / 3, h * 0.085); g.lineTo((w * k) / 3, h * 0.8); g.stroke(); g.beginPath(); g.moveTo(0, h * 0.085 + (h * 0.715 * k) / 3); g.lineTo(w, h * 0.085 + (h * 0.715 * k) / 3); g.stroke(); }
  };
  let luz = 0, parpadeo = 0;
  const visor = new THREE.Object3D(); visor.position.copy(MF.punto(0.5, 0.47)); MF.grupo.add(visor);
  return {
    grupo: MF.grupo,
    partes: {
      pantalla: { obj: MF.grupo, local: [0, 0, 0.5], radio: 7.6 },
      visor: { obj: visor, local: [0, 0, 0], radio: 1.4 },
      lente: { obj: MF.grupo, local: [1.8, 5.6, -0.5], radio: 1 },
    },
    controles: { luz: (k) => { luz = k; }, parpadeo: (k) => { parpadeo = k; } },
    defecto: { luz: 0, parpadeo: 0 },
    actualizar(t) {
      const k = luz * (parpadeo ? 0.12 + 0.88 * CODIGO.enT(t) : 1);
      MF.pantalla.dibujar((g, w, h) => UI(g, w, h, k), k.toFixed(2));
    },
  };
}
