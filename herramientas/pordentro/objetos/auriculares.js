// Auriculares de diadema con cancelación de ruido y las ondas de sonido (hechos con 11-auriculares, 11 nov).
// Unidades en cm. Sin marcas.
//
// auriculares(): auriculares de diadema de 23 × 20 × 8 cm, de pie y flotando, con la diadema arriba (eje de las
//   copas = x; la copa izquierda está en x < 0). Carcasa blanca mate con una placa de aluminio cepillado y el
//   agujerito del micrófono exterior, almohadillas de piel oscura, diadema acolchada, horquillas y correderas de
//   metal. Dentro de cada copa: altavoz (imán, bobina de cobre y membrana), placa con el chip, micrófono exterior
//   y micrófono interior dorados; la batería va en la copa derecha.
//   Mandos (todos de 0 a 1 salvo donde se dice):
//     ruido      anillos coral que llegan a las copas desde fuera (el ruido de la calle, dibujado)
//     anti       anillos dorados que salen de cada altavoz hacia dentro (el antirruido)
//     vibra      la membrana del altavoz vibra
//     seccion    0/1: caras rellenas del corte (carcasa, espuma de la almohadilla, imán) en z = 0,3, para un plano
//                corte de eje z con "en": 0.3 (la cámara mira desde +z: fuera a la izquierda, el oído a la derecha)
//     onda       las ondas del corte, dibujadas como trazos en la copa izquierda: el ruido (coral) llega desde
//                fuera y, dentro, el antirruido (dorado) sale del altavoz; hacia el oído los dos se juntan en su suma
//     llega      hasta dónde ha llegado el frente del ruido (0 = lejos, 0,56 = en el micrófono, 1 = en el oído)
//     cuela      cuánto ruido pasa dentro de la copa
//     antiOnda   cuánto antirruido pone el altavoz (1 = lo anula del todo)
//     agudo      0 = ruido grave y regular (un motor); 1 = agudo y cambiante (una voz): la copia ya no encaja
//   Partes: copa, copaD, micro, microDentro, chip, placa, altavoz, iman, almohadilla, bateria, diadema, centro,
//           oido (donde quedaría el oído izquierdo), fuera (a la izquierda de la copa izquierda), corte (el centro
//           del corte de la copa izquierda).
//   def.caja: la caja sin los anillos ni las ondas, para "llenar".
//
// ondasSonido(): el sonido dibujado. Tres filas de 26 unidades de ancho: el RUIDO (y = 7), la COPIA que fabrica el
//   chip (y = 0) y la SUMA, lo que llega al oído (y = −7). Cada fila tiene su aire (bolitas que se aprietan y se
//   aflojan al pasar la onda), su trazo (coral, dorado y blanco) y cifras de muestra debajo.
//   Mandos: ruido (0..1, la fila del ruido), copia (0..1, aparece la segunda fila, igual que el ruido), vuelta
//           (0..1, la copia se da la vuelta), suma (0..1, aparece la tercera fila), agudo (0 = grave y regular;
//           1 = una voz, y la copia llega desplazada), cifras (0..1), aire (0..1), vel (velocidad de la onda,
//           por defecto 0,75), desfase (radianes que se adelanta la onda), junta (0..1, las filas del ruido y de la copia
//           se acercan a la del centro).
//   Partes: ruido, copia, suma, centro, dos (entre el ruido y la copia), aprieta y afloja (siguen una cresta y un
//           valle de la fila del ruido).
//   Para la pantalla vertical: en el set, "rot": [0, 0, -90] y "opciones": { "vertical": true }. Las filas pasan a
//   ser columnas (el ruido a la izquierda, en x = −7; la copia en 0; la suma en 7), la onda baja de arriba abajo y
//   las cifras siguen derechas.

const CORAL = 0xff5a4a, ORO = 0xffb22e;
const PI = Math.PI, TAU = Math.PI * 2;

// a flat ribbon in the xy plane that follows f(u) -> [x, y]; hasta = fraction of the path that is drawn
function traza(THREE, n, color, ancho, brillo = 1.5) {
  const pos = new Float32Array(n * 6), idx = [];
  for (let i = 0; i < n - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(brillo), transparent: true, opacity: 1, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.userData.noCortar = true; mesh.userData.sinBordes = true;
  const P = new Float32Array(n * 2);
  function poner(f, z = 0, hasta = 1) {
    for (let i = 0; i < n; i++) { const p = f(Math.min(i / (n - 1), hasta)); P[i * 2] = p[0]; P[i * 2 + 1] = p[1]; }
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      let tx = P[b * 2] - P[a * 2], ty = P[b * 2 + 1] - P[a * 2 + 1]; const l = Math.hypot(tx, ty);
      const nx = l > 1e-6 ? (-ty / l) * ancho * 0.5 : 0, ny = l > 1e-6 ? (tx / l) * ancho * 0.5 : 0;
      const x = P[i * 2], y = P[i * 2 + 1], o = i * 6;
      pos[o] = x + nx; pos[o + 1] = y + ny; pos[o + 2] = z; pos[o + 3] = x - nx; pos[o + 4] = y - ny; pos[o + 5] = z;
    }
    geo.attributes.position.needsUpdate = true;
  }
  return { mesh, mat, poner };
}

// the pressure of the drawn sound at x (cm) and time t: a low steady hum, or (agudo = 1) a high changing voice.
// Returns [presión, desplazamiento del aire] (the air moves a quarter of a wave behind the pressure)
const L_GRAVE = 6.5, L_VOZ = 1.9;
function sonido(x, t, agudo, vel = 1, desfase = 0) {
  const k1 = TAU / L_GRAVE, a1 = k1 * x - 2.4 * vel * t + desfase;
  let p = Math.sin(a1), d = Math.cos(a1) / k1;
  if (agudo > 0.001) {
    const k2 = TAU / L_VOZ, a2 = k2 * x - 7.4 * vel * t + desfase, m = 0.55 + 0.45 * Math.sin(0.31 * k2 * x - 3.1 * vel * t), a3 = 2.3 * k2 * x - 12.5 * vel * t + 1;
    const p2 = 0.66 * Math.sin(a2) * m + 0.34 * Math.sin(a3), d2 = (0.66 * Math.cos(a2) * m) / k2 + (0.34 * Math.cos(a3)) / (2.3 * k2);
    p += (p2 - p) * agudo; d += (d2 - d) * agudo;
  }
  return [p, d * 0.55];
}

export function auriculares(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const CX = 8.6, CY = -4.4;            // centre of each ear cup: (±CX, CY, 0)
  const OY = 1.2, OZ = 0.98;            // the cups are oval: taller than deep

  // ---------- materials ----------
  const grano = X.lienzo(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = 0.55 * X.ruido(x / 3, y / 3, 5) + 0.45 * X.ruido(x / 1.2, y / 1.2, 6); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 110 + n * 120; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }, false).tex;
  X.rep(grano, 3, 3);
  const carcasa = new THREE.MeshPhysicalMaterial({ color: 0xb9b7b2, roughness: 0.5, bumpMap: grano, bumpScale: 0.25, clearcoat: 0.25, clearcoatRoughness: 0.45, envMapIntensity: 0.6, side: THREE.DoubleSide });
  const piel = new THREE.MeshPhysicalMaterial({ color: 0x34363c, roughness: 0.62, bumpMap: grano, bumpScale: 0.9, sheen: 0.6, sheenRoughness: 0.55, sheenColor: new THREE.Color(0x9aa0aa), clearcoat: 0.12, clearcoatRoughness: 0.6, side: THREE.DoubleSide });
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xaeb2b8, metalness: 1, roughness: 0.42, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 1.3 });
  const acero = new THREE.MeshPhysicalMaterial({ color: 0xc2c6cc, metalness: 1, roughness: 0.28, clearcoat: 0.3 });
  const oscuro = new THREE.MeshPhysicalMaterial({ color: 0x16171a, roughness: 0.55, clearcoat: 0.3, side: THREE.DoubleSide });
  const tela = new THREE.MeshPhysicalMaterial({ color: 0x2a2c31, roughness: 0.9, map: X.rep(X.tex.trama({ fondo: "#2b2d32", punto: "rgba(255,255,255,0.10)", paso: 6 }).tex, 3, 3), side: THREE.DoubleSide });
  const oro = new THREE.MeshPhysicalMaterial({ color: 0xdcaa4e, metalness: 1, roughness: 0.24, clearcoat: 0.3, emissive: 0xffb347, emissiveIntensity: 0.06 });
  const cobre = new THREE.MeshPhysicalMaterial({ color: 0xd27b4b, metalness: 1, roughness: 0.3, clearcoat: 0.3 });
  const membrana = new THREE.MeshPhysicalMaterial({ color: 0xbfc7d2, metalness: 0.5, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.15, side: THREE.DoubleSide });
  const chipMat = new THREE.MeshPhysicalMaterial({ color: 0x131417, roughness: 0.42, clearcoat: 0.5 });
  const pcb = new THREE.MeshPhysicalMaterial({ color: 0x114633, roughness: 0.5, clearcoat: 0.6, side: THREE.DoubleSide });
  const pila = new THREE.MeshPhysicalMaterial({ color: 0x9aa7b8, metalness: 0.85, roughness: 0.32, clearcoat: 0.4 });
  const relleno = (c) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, side: THREE.DoubleSide }); return m; };
  const rCarcasa = relleno(0xcfccc5), rEspuma = relleno(0xd9c98a), rPiel = relleno(0x2a2c31), rIman = relleno(0x8d9299);

  // ---------- one ear cup, built with +x pointing away from the head (the left one is mirrored) ----------
  // profile of the shell as (radius, x): outer wall, flat outer face, then back along the inner wall
  const PERFIL = [[4.0, 0], [4.06, 0.8], [3.92, 1.7], [3.5, 2.4], [2.9, 2.85], [0.001, 2.85], [0.001, 2.63], [2.82, 2.63], [3.3, 2.26], [3.7, 1.62], [3.84, 0.8], [3.78, 0]];
  const exterior = [], rellenos = [], membranas = [];
  const partes = {};
  function copa(lado) {
    const g = new THREE.Group(); g.position.set(lado * CX, CY, 0); g.scale.x = lado; R.add(g);
    const izq = lado < 0;
    // shell (lathe around x, then made oval)
    const sg = new THREE.LatheGeometry(PERFIL.map(([r, x]) => new THREE.Vector2(r, x)), 96);
    sg.rotateZ(-PI / 2); sg.scale(1, OY, OZ);
    const shell = new THREE.Mesh(sg, carcasa); g.add(shell); exterior.push(shell);
    // brushed plate and its ring on the outer face
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.06, 72), alu); plate.rotation.z = -PI / 2; plate.scale.set(OY, 1, OZ); plate.position.set(2.88, -0.35, 0); g.add(plate); exterior.push(plate);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.07, 12, 96), acero); aro.rotation.y = PI / 2; aro.scale.set(OZ, OY, 1); aro.position.x = 2.84; g.add(aro); exterior.push(aro);
    // outer microphone: a tiny dark port with a metal rim, above the plate
    const puerto = new THREE.Group(); puerto.position.set(2.86, 2.72, 0); g.add(puerto);
    { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 40), acero); rim.rotation.y = PI / 2; puerto.add(rim);
      const hoyo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 28), oscuro); hoyo.rotation.z = -PI / 2; puerto.add(hoyo); exterior.push(rim, hoyo); }
    const micF = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 28), oro); micF.rotation.z = -PI / 2; micF.position.set(2.42, 2.72, 0); g.add(micF);
    // baffle between the shell and the cushion, with the fabric over the driver on the ear side
    const baf = new THREE.Mesh(new THREE.CylinderGeometry(3.98, 3.98, 0.16, 72, 1, false), oscuro); baf.rotation.z = -PI / 2; baf.scale.set(OY, 1, OZ); baf.position.x = -0.02; g.add(baf);
    const tl = new THREE.Mesh(new THREE.CircleGeometry(2.25, 64), tela); tl.rotation.y = -PI / 2; tl.scale.set(OZ, OY, 1); tl.position.x = -0.12; g.add(tl);
    // cushion: an oval ring of soft leather with a seam
    const cg = new THREE.TorusGeometry(3.02, 1.0, 28, 96); cg.rotateY(PI / 2); cg.scale(0.95, OY, OZ);
    const coj = new THREE.Mesh(cg, piel); coj.position.x = -1.0; g.add(coj);
    const costura = new THREE.Mesh(new THREE.TorusGeometry(3.98, 0.03, 8, 96), new THREE.MeshBasicMaterial({ color: 0x0c0d0f })); costura.rotation.y = PI / 2; costura.scale.set(OZ, OY, 1); costura.position.x = -0.62; g.add(costura);
    // driver: magnet, copper coil and the diaphragm (which vibrates), facing the ear
    const iman = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.85, 48), acero); iman.rotation.z = -PI / 2; iman.position.x = 0.85; g.add(iman);
    const cesta = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.15, 0.5, 48, 1, true), oscuro); cesta.rotation.z = -PI / 2; cesta.position.x = 0.36; g.add(cesta);
    const bob = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 10, 48), cobre); bob.rotation.y = PI / 2; bob.position.x = 0.36; g.add(bob);
    const mg = new THREE.LatheGeometry([[0.001, 0.02], [0.55, 0.0], [0.95, -0.1], [1.05, -0.02], [1.55, 0.06], [2.0, -0.02], [2.12, -0.1]].map(([r, x]) => new THREE.Vector2(r, x)), 64);
    mg.rotateZ(-PI / 2);
    const mem = new THREE.Mesh(mg, membrana); mem.position.x = 0.2; g.add(mem); membranas.push(mem);
    // board with the chip (outer side of the board, so it is seen through the shell in x-ray)
    const placa = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 6), pcb); placa.rotation.z = -PI / 2; placa.scale.set(1.05, 1, 0.92); placa.position.set(1.72, -0.5, 0); g.add(placa);
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.95, 0.95), chipMat); chip.position.set(1.88, -0.2, 0); g.add(chip);
    for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2 + 0.3 * hash(i * 3.1), 0.2 + 0.25 * hash(i * 5.7)), i % 3 ? chipMat : acero); const a = (i / 9) * TAU + 0.4; c.position.set(1.84, -0.5 + Math.cos(a) * 1.75, Math.sin(a) * 1.55); g.add(c); }
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.16), acero); p.position.set(1.8, -0.2 - 0.39 + i * 0.13, s * 0.55); g.add(p); }
    // inner microphone, on the ear side of the baffle
    const micD = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.3, 28), oro); micD.rotation.z = -PI / 2; micD.position.set(-0.27, -2.3, 0); g.add(micD);
    { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.31, 20), oscuro); h.rotation.z = -PI / 2; h.position.set(-0.28, -2.3, 0); g.add(h); }
    // thin wires: outer mic -> board, inner mic -> board, board -> driver
    const hilo = (pts, col) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => v3(...p))), 24, 0.035, 6), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })); g.add(m); };
    hilo([[2.3, 2.72, -0.05], [2.0, 2.5, -0.2], [1.8, 1.9, -0.2]], 0xb33a32);
    hilo([[-0.12, -2.3, -0.05], [0.6, -2.8, -0.3], [1.5, -2.6, -0.3], [1.72, -2.2, -0.2]], 0x2f5fb8);
    hilo([[1.66, 0.6, -0.3], [1.4, 0.9, -0.5], [1.2, 0.9, -0.5]], 0xd9d9d9);
    // battery in the right cup only
    let bat = null;
    if (!izq) { bat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 2.6), pila); bat.position.set(2.2, -1.2, 0); g.add(bat); }
    // filled faces of the cut at z = 0.3 (shown with `seccion`): shell wall, cushion foam, magnet
    const sec = new THREE.Group(); sec.position.z = 0.29; sec.visible = false; g.add(sec); rellenos.push(sec);
    const cara = (pts, mat, z = 0) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 24), mat); m.position.z = z; m.userData.noCortar = true; m.userData.sinBordes = true; sec.add(m); return m; };
    for (const s of [-1, 1]) cara(PERFIL.map(([r, x]) => [x, s * r * OY]), rCarcasa);
    for (const s of [-1, 1]) {
      const el = (rx, ry) => Array.from({ length: 40 }, (_, i) => [-1.0 + Math.cos((i / 40) * TAU) * rx, s * 3.02 * OY + Math.sin((i / 40) * TAU) * ry]);
      cara(el(0.95, 1.0 * OY), rPiel); cara(el(0.83, 1.0 * OY - 0.12), rEspuma, 0.004);
    }
    cara([[0.43, -1.45], [1.27, -1.45], [1.27, 1.45], [0.43, 1.45]], rIman);
    cara([[-0.1, -3.98 * OY], [0.06, -3.98 * OY], [0.06, 3.98 * OY], [-0.1, 3.98 * OY]], rPiel, 0.002);
    if (izq) Object.assign(partes, {
      copa: { obj: g, local: [0.4, 0, 0], radio: 5.6 }, micro: { obj: g, local: [2.9, 2.72, 0], radio: 0.95 },
      microDentro: { obj: g, local: [-0.42, -2.3, 0], radio: 0.95 }, chip: { obj: g, local: [1.95, -0.2, 0], radio: 1.1 },
      placa: { obj: g, local: [1.75, -0.5, 0], radio: 2.8 }, altavoz: { obj: g, local: [0.3, 0, 0], radio: 2.3 }, iman: { obj: g, local: [0.85, 0, 0], radio: 1.6 },
      almohadilla: { obj: g, local: [-1.2, 3.62, 0], radio: 2.4 }, corte: { obj: g, local: [-0.2, 0, 0.3], radio: 5.6 },
      oido: { obj: g, local: [-3.4, 0, 0], radio: 2.2 }, fuera: { obj: g, local: [6.5, 0, 0], radio: 3 },
    });
    else Object.assign(partes, { copaD: { obj: g, local: [0.4, 0, 0], radio: 5.6 }, bateria: { obj: bat, local: [0, 0, 0], radio: 1.6 } });
    return g;
  }
  const copaI = copa(-1), copaD = copa(1);

  // ---------- headband, sliders and yokes ----------
  const BY = 0.5, BR = 9.9, A0 = (8 * PI) / 180;
  class Arco extends THREE.Curve { constructor(a0, a1, r) { super(); this.a0 = a0; this.a1 = a1; this.r = r; } getPoint(u, out = new THREE.Vector3()) { const a = this.a0 + (this.a1 - this.a0) * u; return out.set(Math.cos(a) * this.r, BY + Math.sin(a) * this.r, 0); } }
  const banda = new THREE.Mesh(new THREE.TubeGeometry(new Arco(A0, PI - A0, BR), 96, 0.3, 14), carcasa); banda.scale.z = 3.4; R.add(banda);
  const acolchado = new THREE.Mesh(new THREE.TubeGeometry(new Arco((48 * PI) / 180, (132 * PI) / 180, BR - 0.5), 64, 0.46, 16), piel); acolchado.scale.z = 2.5; R.add(acolchado);
  for (const s of [-1, 1]) {
    const xe = s * Math.cos(A0) * BR, ye = BY + Math.sin(A0) * BR;
    // slider: a flat steel bar from the end of the band down to the yoke
    const barra = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 1.3), alu); barra.position.set(xe, ye - 1.0, 0); R.add(barra);
    // yoke: a steel arc around the top half of the cup, with a pivot at each end
    const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * PI; pts.push(v3(s * (CX + 1.25), CY + Math.sin(a) * 5.35, Math.cos(a) * 4.25)); }
    const yugo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.26, 12), alu); R.add(yugo);
    for (const z of [-4.25, 4.25]) { const pv = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 20), acero); pv.rotation.x = PI / 2; pv.position.set(s * (CX + 1.25), CY, z * 0.985); R.add(pv); }
  }
  partes.diadema = { obj: R, local: [0, BY + BR, 0], radio: 4.2 };
  partes.centro = { obj: R, local: [0, CY, 0], radio: 7 };

  // ---------- drawn sound around the product: coral rings coming in, gold rings going out of each driver ----------
  const NR = 5, anillos = [];
  const anilloGeo = new THREE.TorusGeometry(1, 0.022, 8, 72); anilloGeo.rotateY(PI / 2);
  const efectos = new THREE.Group(); R.add(efectos);
  for (const s of [-1, 1]) for (const tipo of ["ruido", "anti"]) for (let i = 0; i < NR; i++) {
    const m = new THREE.Mesh(anilloGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(tipo === "ruido" ? CORAL : ORO).multiplyScalar(1.5), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    m.userData.noCortar = true; m.userData.sinBordes = true; m.visible = false; efectos.add(m); anillos.push({ m, s, tipo, i });
  }

  // ---------- the drawn waves of the cut (left cup): noise from outside, anti-noise from the driver, their sum ----------
  const XF = -24, XC = -CX - 2.9, XA = -CX - 0.1, XM = -6.3, XO = -3.2, XE = -0.6;   // far left, shell face, driver, where they meet, ear, end
  const ZT = 0.36, AMP = 1.15;
  const tRuido = traza(THREE, 280, CORAL, 0.11), tAnti = traza(THREE, 150, ORO, 0.11);
  for (const tz of [tRuido, tAnti]) { tz.mesh.visible = false; efectos.add(tz.mesh); }

  let kRuido = 0, kAnti = 0, kVibra = 0, kOnda = 0, kLlega = 1, kCuela = 0.5, kAntiOnda = 0, kAgudo = 0;
  const sm = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  function actualizar(t) {
    for (const a of anillos) {
      const k = a.tipo === "ruido" ? kRuido : kAnti;
      a.m.visible = k > 0.003; if (!a.m.visible) continue;
      const f = (t * (a.tipo === "ruido" ? 0.55 : 0.8) + a.i / NR + (a.s > 0 ? 0.37 : 0)) % 1;
      if (a.tipo === "ruido") {
        const r = 3.3 + 1.0 * (1 - f), w = 1 + 0.07 * Math.sin(t * 9 + a.i * 2.1);
        a.m.position.set(a.s * (CX + 3.2 + (1 - f) * 8.5), CY, 0); a.m.scale.set(1, r * OY * w, r * OZ / w);
        a.m.material.opacity = k * 0.85 * Math.pow(Math.sin(PI * f), 0.7);
      } else {
        const r = 2.0 + 1.5 * f;
        a.m.position.set(a.s * (CX - 2.2 - f * 5.6), CY, 0); a.m.scale.set(1, r * OY, r * OZ);
        a.m.material.opacity = k * 0.95 * Math.pow(Math.sin(PI * f), 0.8);
      }
    }
    for (const m of membranas) m.position.x = 0.2 + kVibra * 0.07 * Math.sin(t * 34);
    const on = kOnda > 0.003;
    tRuido.mesh.visible = on; tAnti.mesh.visible = on && kAntiOnda > 0.003;
    if (!on) return;
    // inside the cup the noise that got through is weaker; where both meet (XM..XO) each trace bends into their sum
    const dentro = (x) => 1 - (1 - kCuela * 0.6) * sm(XC - 0.2, XC + 1.2, x);
    const fuera = (x) => sonido(x, t, kAgudo)[0] * AMP * dentro(x);
    // the copy: upside down; with a high changing sound it comes a little late and no longer matches
    const copia = (x) => -kAntiOnda * sonido(x - kAgudo * 0.55, t, kAgudo)[0] * AMP * dentro(x) * (1 - 0.1 * kAgudo);
    const mez = (x) => sm(XM, XO - 0.4, x);
    const frente = XF + (XE - XF) * clamp(kLlega);
    tRuido.poner((u) => { const x = XF + (XE - XF) * u, r = fuera(x), m = mez(x); return [x, CY + r + (copia(x) * sm(XA, XA + 0.8, x)) * m]; }, ZT, clamp(kLlega));
    tRuido.mat.opacity = kOnda;
    tAnti.poner((u) => { const x = XA + (XE - XA) * u, c = copia(x) * sm(XA, XA + 0.8, x), m = mez(x); return [x, CY + c + fuera(x) * m]; }, ZT + 0.01, clamp((frente - XA) / (XE - XA)));
    tAnti.mat.opacity = kOnda * clamp(kAntiOnda * 3);
  }

  return {
    grupo: R, partes, exterior,
    caja: [[-11.7, -9.3, -4.2], [11.7, 10.8, 4.2]],
    controles: {
      ruido: (k) => { kRuido = k; }, anti: (k) => { kAnti = k; }, vibra: (k) => { kVibra = k; },
      seccion: (k) => { for (const s of rellenos) s.visible = k > 0.5; },
      onda: (k) => { kOnda = k; }, llega: (k) => { kLlega = k; }, cuela: (k) => { kCuela = k; }, antiOnda: (k) => { kAntiOnda = k; }, agudo: (k) => { kAgudo = k; },
    },
    defecto: { ruido: 0, anti: 0, vibra: 0, seccion: 0, onda: 0, llega: 1, cuela: 0.5, antiOnda: 0, agudo: 0 },
    actualizar,
  };
}

export function ondasSonido(THREE, C, X, M, { vertical = false } = {}) {
  const { v3, clamp } = C;
  const R = new THREE.Group();
  const ANCHO = 26, X0 = -ANCHO / 2, YF = vertical ? [-7, 0, 7] : [7, 0, -7], AMP = 1.5;
  const COLS = 72, FILAS = 6, N = COLS * FILAS;
  const colores = [new THREE.Color(CORAL), new THREE.Color(ORO), new THREE.Color(0xffffff)];
  const base = new THREE.Color(0x56627a);
  const bolaGeo = new THREE.SphereGeometry(0.105, 10, 8);
  const filas = YF.map((y, f) => {
    const g = new THREE.Group(); g.position.y = y; R.add(g);
    const aire = new THREE.InstancedMesh(bolaGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, depthWrite: false, toneMapped: false }), N);
    aire.frustumCulled = false; aire.userData.sinBordes = true; g.add(aire);
    for (let i = 0; i < N; i++) aire.setColorAt(i, base);
    const tz = traza(THREE, 240, colores[f].getHex(), f === 2 ? 0.1 : 0.14, f === 2 ? 0.95 : 1.5); g.add(tz.mesh);
    // a faint axis under the trace
    const eje = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false })); g.add(eje);
    const xs = Array.from({ length: 7 }, (_, i) => X0 + ((i + 0.5) / 7) * ANCHO);
    const cif = X.cifras(xs.map((x) => v3(x, vertical ? -3.05 : -2.55, 0.05)), { tam: 0.82, ancho: 3.4, color: "#aeb6c4", fuerte: "#ffffff" }); g.add(cif.grupo);
    if (vertical) for (const it of cif.items) it.mesh.rotation.z = PI / 2;
    return { g, aire, tz, eje, cif, xs };
  });
  const dm = new THREE.Object3D(), col = new THREE.Color();
  const aprieta = new THREE.Object3D(), afloja = new THREE.Object3D(); filas[0].g.add(aprieta, afloja);
  const st = { ruido: 1, copia: 0, vuelta: 0, suma: 0, agudo: 0, cifras: 0, aire: 1, vel: 0.75, desfase: 0, junta: 0 };

  function actualizar(t) {
    const ag = st.agudo, signo = Math.cos(PI * clamp(st.vuelta));
    // pressure and air displacement of each row at x
    const f0 = (x) => sonido(x, t, ag, st.vel, st.desfase);
    const f1 = (x) => { const s = sonido(x - ag * 0.55, t, ag, st.vel, st.desfase), k = signo * (1 - 0.1 * ag); return [s[0] * k, s[1] * k]; };
    const f2 = (x) => { const a = f0(x), b = f1(x); return [a[0] + b[0] * clamp(st.copia), a[1] + b[1] * clamp(st.copia)]; };
    const fs = [f0, f1, f2], vis = [clamp(st.ruido), clamp(st.copia), clamp(st.suma)];
    filas.forEach((F, f) => {
      const a = vis[f]; F.g.visible = a > 0.003; if (!F.g.visible) return;
      F.g.position.y = YF[f] * (1 - 0.72 * clamp(st.junta));
      const fn = fs[f];
      F.tz.poner((u) => { const x = X0 + ANCHO * u; return [x, fn(x)[0] * AMP]; }, 0.02);
      F.tz.mat.opacity = a; F.eje.material.opacity = 0.16 * a;
      const ka = a * clamp(st.aire);
      F.aire.visible = ka > 0.003;
      if (F.aire.visible) {
        F.aire.material.opacity = 0.9 * ka;
        for (let i = 0; i < N; i++) {
          const c = i % COLS, r = Math.floor(i / COLS);
          const x = X0 + ((c + 0.5 + (C.hash(i * 1.7) - 0.5) * 0.7) / COLS) * ANCHO, y = ((r + 0.5 + (C.hash(i * 2.9) - 0.5) * 0.8) / FILAS - 0.5) * 3.4;
          const s = fn(x);
          dm.position.set(x + s[1], y, -0.05); dm.scale.setScalar(0.8 + 0.5 * C.hash(i * 4.3)); dm.updateMatrix(); F.aire.setMatrixAt(i, dm.matrix);
          F.aire.setColorAt(i, col.copy(base).lerp(colores[f], clamp(0.12 + 0.6 * s[0])));
        }
        F.aire.instanceMatrix.needsUpdate = true; if (F.aire.instanceColor) F.aire.instanceColor.needsUpdate = true;
      }
      const kc = a * clamp(st.cifras);
      F.cif.grupo.visible = kc > 0.003;
      if (F.cif.grupo.visible) {
        // sample values like a meter: read 5 times a second
        const tq = Math.floor(t * 5) / 5;
        const g0 = (x) => sonido(x, tq, ag, st.vel, st.desfase)[0], g1 = (x) => sonido(x - ag * 0.55, tq, ag, st.vel, st.desfase)[0] * signo * (1 - 0.1 * ag);
        F.xs.forEach((x, i) => {
          const v = Math.round((f === 0 ? g0(x) : f === 1 ? g1(x) : g0(x) + g1(x) * clamp(st.copia)) * 80);
          F.cif.poner(i, v > 0 ? "+" + v : v < 0 ? "−" + -v : "0", f === 2);
        });
        F.cif.dibujar(); F.cif.items.forEach((it) => (it.mesh.material.opacity = kc));
      }
    });
    // a crest and a trough of the noise row, for the labels (grave wave)
    const k = TAU / L_GRAVE, w = 2.4 * st.vel * t - st.desfase;
    const xc = ((((PI / 2 + w) / k + 6.5) % L_GRAVE) + L_GRAVE) % L_GRAVE - 6.5;
    aprieta.position.set(xc, 0, 0); afloja.position.set(xc + L_GRAVE / 2, 0, 0);
  }
  const mando = (n) => (v) => { st[n] = v; };
  return {
    grupo: R,
    partes: {
      ruido: { obj: R, local: [0, YF[0], 0], radio: 7 }, copia: { obj: R, local: [0, YF[1], 0], radio: 7 }, suma: { obj: R, local: [0, YF[2], 0], radio: 7 },
      centro: { obj: R, local: [0, 0, 0], radio: 12 }, dos: { obj: R, local: [0, 3.5, 0], radio: 9 },
      aprieta: { obj: aprieta, local: [0, 0.4, 0], radio: 2 }, afloja: { obj: afloja, local: [0, -0.4, 0], radio: 2 },
    },
    caja: vertical ? [[X0, -11.2, -0.3], [-X0, 8.9, 0.3]] : [[X0, -10.5, -0.3], [-X0, 9.5, 0.3]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, mando(n)])),
    defecto: { ruido: 1, copia: 0, vuelta: 0, suma: 0, agudo: 0, cifras: 0, aire: 1, vel: 0.75, desfase: 0, junta: 0 },
    actualizar,
  };
}
