// Batería del móvil (hechos con 13-bateria, 11 nov). Sin marcas ni letras en los chips.
//
// movilBateria(): un móvil de frente a la cámara (tapa trasera hacia +z, largo en y: 7,2 × 15 × 0,8 cm) que con rayosX
//   deja ver dentro la batería (una bolsa plana de aluminio, con una escala de 12 rayas que se enciende según su
//   capacidad), la placa de arriba con sus chips y la placa pequeña de abajo con el conector. Ilustración, sin marca.
//   Mandos: capacidad (0..1, cuántas rayas de la escala están encendidas), calor (0..1, la batería se pone naranja
//   y parpadea).
//   Partes: bateria, placa, chip, conector, carcasa, marco, centro.
//
// celdaIon(): la batería de iones de litio por dentro, en corte lateral (ilustración, no a escala), con las capas
//   a lo largo de x: lámina de cobre, ánodo de grafito (láminas finas entre las que caben los iones), electrolito,
//   separador con poros, electrolito, cátodo de óxido (granos) y lámina de aluminio. Arriba, el circuito exterior
//   con un aparato que se enciende y los electrones. Los iones de litio son bolitas doradas. Para verlo con las
//   capas apiladas en vertical, ponle "rot": [0, 0, 90] en el set.
//   Mandos (de 0 a 1 salvo donde se dice):
//     carga      dónde están los iones: 0 = todos en el cátodo, 1 = todos en el ánodo (viajan por el electrolito y
//                atraviesan el separador de uno en uno); los electrones del circuito se mueven con ella
//     ciclo      mezcla la carga fija con una que sube y baja sola (cargar y usar una y otra vez)
//     vel        velocidad de ese sube y baja (rad/s; por defecto 1,8)
//     calor      más agitación, el brillo naranja de fondo y el electrolito teñido de rojo
//     costra     la capa de SEI sobre el grafito crece (bultos marrones) y se queda con iones, que se vuelven grises
//                y ya no viajan (hasta un 40 % de los iones)
//     circuito   0 = sin cable ni aparato; 1 = con ellos (por defecto)
//   Partes: anodo, catodo, separador, electrolito, cobre, aluminio, costra, iones, circuito, centro.
//
// barrasCapacidad(): cuatro columnas de capacidad guardada tras un año de reposo (valores de la tabla 2 de
//   Battery University, BU-702, para litio-cobalto): a 25 °C, 96 % con el 40 % de carga y 80 % con el 100 %; a 40 °C,
//   85 % y 65 %. Con una línea de referencia en el 80 %.
//   Mandos: ver (0..1, todo el gráfico), a (0..1, las dos columnas de 25 °C), b (0..1, las de 40 °C), ref (0..1, la
//   línea del 80 %), foco (0..1, atenúa las columnas que no son la 2).
//   Partes: col1, col2, col3, col4, ref, centro.

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PI = Math.PI;
const ORO = 0xffb22e, CIAN = 0x6fdcff;

export function movilBateria(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const exterior = [], interior = [];

  // ---------- body: frame and glass back ----------
  const marcoM = new THREE.MeshPhysicalMaterial({ color: 0x9aa0a8, metalness: 1, roughness: 0.3, clearcoat: 0.3 });
  const marco = new THREE.Mesh(new RoundedBoxGeometry(7.2, 15, 0.8, 5, 0.9), marcoM); R.add(marco);
  const tapaM = new THREE.MeshPhysicalMaterial({ color: 0x1f2a3a, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1 });
  const tapa = new THREE.Mesh(new RoundedBoxGeometry(6.9, 14.7, 0.08, 5, 0.8), tapaM); tapa.position.z = 0.38; R.add(tapa); exterior.push(tapa);
  const isla = new THREE.Mesh(new RoundedBoxGeometry(3.0, 3.0, 0.12, 4, 0.6), new THREE.MeshPhysicalMaterial({ color: 0x151c27, roughness: 0.25, clearcoat: 0.9 })); isla.position.set(-1.65, 5.55, 0.46); R.add(isla); exterior.push(isla);
  for (const [dx, dy] of [[-0.7, 0.7], [0.7, 0.7], [0, -0.7]]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 28), new THREE.MeshPhysicalMaterial({ color: 0x07090d, roughness: 0.1, clearcoat: 1 })); l.rotation.x = PI / 2; l.position.set(-1.65 + dx, 5.55 + dy, 0.54); R.add(l); exterior.push(l);
  }
  // the screen side (dark plate far back) so the x-ray has something behind the battery
  const pantalla = new THREE.Mesh(new RoundedBoxGeometry(6.8, 14.5, 0.1, 4, 0.7), new THREE.MeshPhysicalMaterial({ color: 0x05070b, roughness: 0.3, clearcoat: 0.8 })); pantalla.position.z = -0.36; R.add(pantalla);

  // ---------- battery pouch ----------
  const BW = 5.8, BH = 8.6, BY = -1.7;
  const folioTex = X.lienzo(256, 512, (g, w, h) => {
    g.fillStyle = "#aeb6c2"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * hash(x * 1.3)})`; g.fillRect(x, 0, 1, h); }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(40,50,70,${0.04 + 0.06 * hash(i)})`; g.fillRect(hash(i * 1.9) * w, hash(i * 2.7) * h, 1 + hash(i) * 6, 1); }
    g.fillStyle = "rgba(30,40,60,0.28)"; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
  }).tex;
  const bolsaM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: folioTex, metalness: 0.75, roughness: 0.38, clearcoat: 0.3 });
  const bolsa = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, 0.42, 4, 0.14), bolsaM); bolsa.position.set(0, BY, 0.02); R.add(bolsa); interior.push(bolsa);
  const lengueta = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), M.aluminio); lengueta.position.set(0, BY + BH / 2 + 0.3, 0.02); R.add(lengueta); interior.push(lengueta);
  const flex = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.04), new THREE.MeshPhysicalMaterial({ color: 0xc58a2a, roughness: 0.45 })); flex.position.set(0, BY + BH / 2 + 1.0, 0.05); R.add(flex); interior.push(flex);
  // scale of 12 bars glued on the pouch
  const NB = 12, barras = [];
  for (let i = 0; i < NB; i++) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
    const b = new THREE.Mesh(new RoundedBoxGeometry(4.5, 0.45, 0.05, 2, 0.06), m);
    b.position.set(0, BY - BH / 2 + 0.75 + i * 0.64, 0.25); b.userData.noCortar = true; b.userData.sinBordes = true; R.add(b); interior.push(b); barras.push(b);
  }
  const halo = C.brillo("255,120,50"); halo.scale.setScalar(13); halo.position.set(0, BY, 0.5); halo.userData.noCortar = true; R.add(halo);

  // ---------- boards ----------
  const pcbM = new THREE.MeshPhysicalMaterial({ color: 0x0f3b2a, roughness: 0.5, clearcoat: 0.6, map: M.pcb.map });
  const chipM = new THREE.MeshPhysicalMaterial({ color: 0x131419, roughness: 0.4, clearcoat: 0.55 });
  const placa = new THREE.Mesh(new RoundedBoxGeometry(6.6, 3.5, 0.12, 2, 0.1), pcbM); placa.position.set(0, 5.6, 0.0); R.add(placa); interior.push(placa);
  const latas = [[-1.65, 5.65, 2.2, 2.2, M.aluminio], [1.7, 5.9, 1.7, 1.5, chipM], [1.5, 4.5, 1.9, 0.9, chipM], [-0.2, 4.2, 1.2, 0.8, M.aluminio]];
  let chip = null;
  for (const [x, y, w, h, mat] of latas) { const c = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.14, 2, 0.05), mat); c.position.set(x, y, 0.13); R.add(c); interior.push(c); if (!chip) chip = c; }
  const placa2 = new THREE.Mesh(new RoundedBoxGeometry(6.6, 1.5, 0.1, 2, 0.1), pcbM); placa2.position.set(0, -7.0, 0.0); R.add(placa2); interior.push(placa2);
  const usbc = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.6, 0.16, 3, 0.25), M.acero); usbc.position.set(0, -7.0, 0.12); R.add(usbc); interior.push(usbc);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), M.aceroOsc); g.rotation.x = PI / 2; g.position.set(s * (1.6 + i * 0.3), -7.0, 0.1); R.add(g); interior.push(g); }

  let kCap = 1, kCalor = 0;
  const colA = new THREE.Color(ORO), colR = new THREE.Color(0xff4a2a), col = new THREE.Color();
  function actualizar(t) {
    const lit = kCap * NB;
    for (let i = 0; i < NB; i++) {
      const on = clamp(lit - i);
      const b = barras[i];
      col.copy(colA).lerp(colR, kCalor).multiplyScalar(1.5 * (0.85 + 0.15 * Math.sin(t * 7 + i * 0.7 + kCalor * t * 6)));
      b.material.color.copy(col);
      b.material.opacity = Math.max(0.1, on * 0.95);
    }
    halo.material.opacity = 0.55 * kCalor * (0.8 + 0.2 * Math.sin(t * 6));
    halo.visible = kCalor > 0.01;
    bolsaM.emissive.setRGB(0.5 * kCalor, 0.12 * kCalor, 0.02 * kCalor);
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    exterior, semi: [[marco, 0.4]], interior,
    partes: { bateria: pl([0, BY, 0.1], 4.8), placa: pl([0, 5.6, 0.1], 3.6), chip: pl([-1.65, 5.65, 0.2], 1.4), conector: pl([0, -7.0, 0.1], 1.6), carcasa: pl([0, 0, 0.4], 8.4), marco: pl([0, 0, 0], 8.4), centro: pl([0, 0, 0], 8.6) },
    caja: [[-3.7, -7.6, -0.45], [3.7, 7.6, 0.45]],
    controles: { capacidad: (k) => { kCap = k; }, calor: (k) => { kCalor = k; } },
    defecto: { capacidad: 1, calor: 0 },
    actualizar,
  };
}

export function celdaIon(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const DZ = 6, H = 14;
  const XA0 = -10.2, XA1 = -4.2, XC0 = 4.2, XC1 = 10.2;
  const sm = (k) => k * k * (3 - 2 * k);
  const mix = (a, b, k) => a + (b - a) * k;

  // ---------- foils ----------
  const cobre = new THREE.Mesh(new RoundedBoxGeometry(0.6, H + 0.4, DZ, 2, 0.1), M.cobre); cobre.position.set(XA0 - 0.3, 0, 0); R.add(cobre);
  const alu = new THREE.Mesh(new RoundedBoxGeometry(0.6, H + 0.4, DZ, 2, 0.1), M.aluminio); alu.position.set(XC1 + 0.3, 0, 0); R.add(alu);

  // ---------- anode: graphite sheets ----------
  const NS = 28, SP = 0.5, hojaAncho = XA1 - XA0;
  const grafM = new THREE.MeshPhysicalMaterial({ color: 0x3c4150, metalness: 0.55, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const hojas = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), grafM, NS);
  hojas.frustumCulled = false; R.add(hojas);
  const dm = new THREE.Object3D();
  for (let k = 0; k < NS; k++) { dm.position.set((XA0 + XA1) / 2, -H / 2 + 0.3 + k * SP, 0); dm.scale.set(hojaAncho, 0.13, DZ - 0.3); dm.updateMatrix(); hojas.setMatrixAt(k, dm.matrix); }
  const hojasY = (k) => -H / 2 + 0.3 + k * SP;

  // ---------- cathode: oxide grains ----------
  const COLS = 6, ROWS = 14, ZS = 3;
  const granoM = new THREE.MeshPhysicalMaterial({ color: 0x6f7fa6, roughness: 0.45, metalness: 0.2, clearcoat: 0.5, flatShading: true });
  const granos = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.47, 0), granoM, COLS * ROWS * ZS);
  granos.frustumCulled = false; R.add(granos);
  let gi = 0; const gcol = new THREE.Color();
  for (let z = 0; z < ZS; z++) for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const h = hash(gi * 1.7);
    dm.position.set(XC0 + 0.5 + c * 1.0 + (hash(gi * 3.1) - 0.5) * 0.08 + (r % 2) * 0.08, -H / 2 + 0.5 + r * 1.0, (z - 1) * 2.0 + (hash(gi * 5.3) - 0.5) * 0.3);
    dm.rotation.set(h * 6, h * 9, h * 3); const s = 0.92 + 0.2 * hash(gi * 9.1); dm.scale.set(s, s, s); dm.updateMatrix(); granos.setMatrixAt(gi, dm.matrix);
    granos.setColorAt(gi, gcol.setHSL(0.6 + 0.04 * hash(gi * 2.3), 0.25, 0.42 + 0.14 * hash(gi * 4.9))); gi++;
  }
  dm.rotation.set(0, 0, 0);

  // ---------- separator and electrolyte ----------
  const porosTex = X.lienzo(256, 512, (g, w, h) => {
    g.fillStyle = "#dfe6ee"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(20,30,48,${0.4 + 0.4 * hash(i)})`; g.beginPath(); g.ellipse(hash(i * 1.3) * w, hash(i * 2.1) * h, 3 + hash(i * 3.3) * 5, 2 + hash(i * 4.1) * 3, 0, 0, 7); g.fill(); }
  }).tex;
  const sepM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: porosTex, roughness: 0.5, transparent: true, opacity: 0.6, depthWrite: false });
  const sep = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, DZ), sepM); R.add(sep);
  const elecM = new THREE.MeshPhysicalMaterial({ color: 0x5aa6ff, roughness: 0.1, transparent: true, opacity: 0.08, emissive: 0x0b2a55, emissiveIntensity: 0.28, clearcoat: 0.6, depthWrite: false });
  const elecA = new THREE.Mesh(new THREE.BoxGeometry(-0.25 - XA1, H, DZ), elecM); elecA.position.set((XA1 - 0.25) / 2, 0, 0); R.add(elecA);
  const elecC = new THREE.Mesh(new THREE.BoxGeometry(XC0 - 0.25, H, DZ), elecM); elecC.position.set((XC0 + 0.25) / 2, 0, 0); R.add(elecC);

  // ---------- SEI crust: bumps on the anode face ----------
  const NSEI = 170;
  const seiM = new THREE.MeshStandardMaterial({ color: 0x9a6a44, roughness: 0.92, emissive: 0x2a1006, emissiveIntensity: 0.6, flatShading: true });
  const sei = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 1), seiM, NSEI);
  sei.frustumCulled = false; R.add(sei);
  const seiPos = Array.from({ length: NSEI }, (_, i) => ({ y: (hash(i * 2.9) - 0.5) * (H - 0.6), z: (hash(i * 4.3) - 0.5) * (DZ - 0.6), r: 0.5 + 0.7 * hash(i * 6.1), u: hash(i * 7.7) }));
  for (let i = 0; i < NSEI; i++) sei.setColorAt(i, gcol.setHSL(0.07 + 0.03 * hash(i), 0.45, 0.28 + 0.12 * hash(i * 1.9)));

  // ---------- lithium ions ----------
  const N = 72, W = 0.38;
  const ion = [];
  const orden = Array.from({ length: N }, (_, i) => i).sort((a, b) => hash(a * 3.7) - hash(b * 3.7));
  const rango = new Array(N); orden.forEach((i, r) => { rango[i] = r; });
  const muertosN = Math.floor(N * 0.4);
  for (let i = 0; i < N; i++) {
    const ya = -H / 2 + 1.0 + Math.floor(hash(i * 5.1) * (ROWS - 1)) * 1.0;
    const a = v3(XC0 + 1.0 + Math.floor(hash(i * 1.3) * (COLS - 1)) * 1.0, ya, (hash(i * 2.1) - 0.5) * 4.6);
    const k = Math.floor(hash(i * 6.7) * (NS - 1));
    const b = v3(mix(XA0 + 0.8, XA1 - 0.8, hash(i * 9.9)), hojasY(k) + SP / 2, (hash(i * 4.4) - 0.5) * 4.8);
    const yp = mix(a.y, b.y, 0.5) + (hash(i * 3.3) - 0.5) * 0.4;
    ion.push({ a, b, pts: [a, v3(XC0 - 0.6, mix(a.y, yp, 0.6), a.z * 0.7), v3(0.5, yp, a.z * 0.3), v3(-0.5, yp, b.z * 0.3), v3(XA1 + 0.6, mix(b.y, yp, 0.6), b.z * 0.7), b], th: rango[i] / N, muerto: rango[i] < muertosN ? (rango[i] + 0.5) / muertosN : 2, ph: hash(i * 7.1) * 6.28 });
  }
  const ionM = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const ionMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.27, 16, 12), ionM, N);
  ionMesh.frustumCulled = false; ionMesh.userData.noCortar = true; ionMesh.userData.sinBordes = true; R.add(ionMesh);
  const dorado = new THREE.Color(ORO).multiplyScalar(1.9), gris = new THREE.Color(0.34, 0.32, 0.31), cc = new THREE.Color();

  // ---------- outer circuit with a device and electrons ----------
  const YW = H / 2 + 2.8;
  const cam = new THREE.CurvePath();
  const P = [v3(XA0 - 0.3, H / 2 + 0.2, 0), v3(XA0 - 0.3, YW, 0), v3(-2.2, YW, 0), v3(2.2, YW, 0), v3(XC1 + 0.3, YW, 0), v3(XC1 + 0.3, H / 2 + 0.2, 0)];
  for (let i = 0; i < P.length - 1; i++) cam.add(new THREE.LineCurve3(P[i], P[i + 1]));
  const circuito = new THREE.Group(); R.add(circuito);
  const cableM = new THREE.MeshPhysicalMaterial({ color: 0xd27b4b, metalness: 1, roughness: 0.3 });
  for (const [a, b] of [[P[0], P[1]], [P[1], P[2]], [P[3], P[4]], [P[4], P[5]]]) {
    const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, d.length(), 12), cableM);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(v3(0, 1, 0), d.clone().normalize()); circuito.add(m);
  }
  const aparatoM = new THREE.MeshPhysicalMaterial({ color: 0x1b2230, roughness: 0.35, clearcoat: 0.8, emissive: 0xffa030, emissiveIntensity: 0 });
  const aparato = new THREE.Mesh(new RoundedBoxGeometry(4.4, 1.9, 2.2, 3, 0.35), aparatoM); aparato.position.set(0, YW, 0); circuito.add(aparato);
  const aparatoHalo = C.brillo("255,170,70"); aparatoHalo.scale.setScalar(7); aparatoHalo.position.set(0, YW, 1.2); aparatoHalo.userData.noCortar = true; circuito.add(aparatoHalo);
  const NE = 22;
  const eMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(CIAN).multiplyScalar(1.8), toneMapped: false, transparent: true, opacity: 1 }), NE);
  eMesh.frustumCulled = false; eMesh.userData.noCortar = true; eMesh.userData.sinBordes = true; circuito.add(eMesh);

  const halo = C.brillo("255,90,40"); halo.scale.setScalar(34); halo.position.set(0, 0, -4); halo.userData.noCortar = true; R.add(halo);

  const st = { carga: 0, ciclo: 0, vel: 1.8, calor: 0, costra: 0, circuito: 1 };
  let cargaVista = 0;
  function actualizar(t) {
    const calor = st.calor;
    const fase = t * st.vel * (1 + 1.2 * calor);
    const carga = mix(st.carga, 0.5 + 0.5 * Math.sin(fase - 1.2), st.ciclo);
    cargaVista = carga;
    const jig = 0.05 + 0.2 * calor, fj = 4 + 9 * calor;
    for (let i = 0; i < N; i++) {
      const q = ion[i];
      const s = clamp((carga * (1 + W) - q.th) / W);
      // position along the broken line a -> pores -> b (smooth in each leg)
      const u = s * (q.pts.length - 1), j = Math.min(q.pts.length - 2, Math.floor(u)), f = sm(u - j);
      const p0 = q.pts[j], p1 = q.pts[j + 1];
      let x = mix(p0.x, p1.x, f), y = mix(p0.y, p1.y, f), z = mix(p0.z, p1.z, f);
      const dentro = s <= 0.001 || s >= 0.999, a = jig * (dentro ? 1 : 0.5);
      x += a * Math.sin(t * fj + q.ph); y += a * Math.cos(t * fj * 0.83 + q.ph * 1.7) * (dentro && s > 0.5 ? 0.35 : 1); z += a * Math.sin(t * fj * 0.7 + q.ph * 2.3);
      // ions caught by the crust
      const kd = q.muerto > 1.5 ? 0 : sm(clamp((st.costra - q.muerto * 0.92) / 0.06));
      if (kd > 0) {
        const espesor = 0.25 + 1.0 * st.costra;
        x = mix(x, XA1 + 0.15 + espesor * (0.2 + 0.6 * hash(q.ph * 9)), kd); y = mix(y, hojasY(Math.floor(hash(q.ph * 3) * NS)) + 0.25, kd); z = mix(z, (hash(q.ph * 5) - 0.5) * 4.6, kd);
      }
      dm.position.set(x, y, z); dm.scale.setScalar(1); dm.updateMatrix(); ionMesh.setMatrixAt(i, dm.matrix);
      ionMesh.setColorAt(i, cc.copy(dorado).lerp(gris, kd));
    }
    ionMesh.instanceMatrix.needsUpdate = true; ionMesh.instanceColor.needsUpdate = true;
    // crust: bumps growing on the anode face
    const k = st.costra; sei.visible = k > 0.005;
    if (sei.visible) for (let i = 0; i < NSEI; i++) {
      const b = seiPos[i], g = sm(clamp((k * 1.25 - b.u * 0.25) / 1.0));
      dm.position.set(XA1 + 0.1 + b.r * g * 0.45, b.y, b.z); dm.scale.set(b.r * g * (0.7 + 0.5 * k), b.r * g * 1.1, b.r * g * 1.1); dm.updateMatrix(); sei.setMatrixAt(i, dm.matrix);
    }
    sei.instanceMatrix.needsUpdate = true;
    // electrons follow the charge: when ions go to the anode they run from the aluminium side to the copper side
    const kc = st.circuito; circuito.visible = kc > 0.01;
    for (let i = 0; i < NE; i++) {
      const uu = (((i / NE - carga * 1.7) % 1) + 1) % 1;
      const p = cam.getPoint(uu * 0.998);
      dm.position.set(p.x, p.y, p.z + 0.0); dm.scale.setScalar(1); dm.updateMatrix(); eMesh.setMatrixAt(i, dm.matrix);
    }
    eMesh.instanceMatrix.needsUpdate = true;
    aparatoM.emissiveIntensity = 0.15 + 1.2 * clamp(Math.abs(Math.cos(fase - 1.2))) * st.ciclo + 0.6 * clamp(st.carga * (1 - st.carga) * 4);
    aparatoHalo.material.opacity = 0.35 * aparatoM.emissiveIntensity / 1.2; aparatoHalo.visible = true;
    halo.material.opacity = 0.42 * calor * (0.85 + 0.15 * Math.sin(t * 5)); halo.visible = calor > 0.01;
    elecM.emissive.setRGB(0.04 + 0.55 * calor, 0.16 - 0.1 * calor, 0.33 - 0.28 * calor);
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  const mando = (n) => (v) => { st[n] = v; };
  return {
    grupo: R,
    partes: {
      anodo: pl([(XA0 + XA1) / 2, 0, 0], 6.4), catodo: pl([(XC0 + XC1) / 2, 0, 0], 6.4), separador: pl([0, 0, 0], 4.6), electrolito: pl([-2.2, 0, 0], 3.4),
      cobre: pl([XA0 - 0.3, 0, 0], 5.5), aluminio: pl([XC1 + 0.3, 0, 0], 5.5), costra: pl([XA1 + 0.5, 0, 0], 3.6), iones: pl([0, 0, 0], 4.2),
      circuito: pl([0, YW, 0], 4.4), centro: pl([0, 1.2, 0], 12.5),
    },
    caja: [[-11.2, -7.4, -3.2], [11.2, YW + 1.2, 3.2]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, mando(n)])),
    defecto: { carga: 0, ciclo: 0, vel: 1.8, calor: 0, costra: 0, circuito: 1 },
    actualizar,
  };
}

export function barrasCapacidad(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const ESC = 0.17; // 100 % = 17 units
  const datos = [
    { v: 96, x: -5.6, grupo: 0, col: 0x6fdcff, etq: "40 %" },
    { v: 80, x: -2.4, grupo: 0, col: 0xffb22e, etq: "100 %" },
    { v: 85, x: 2.4, grupo: 1, col: 0x6fdcff, etq: "40 %" },
    { v: 65, x: 5.6, grupo: 1, col: 0xff7a4a, etq: "100 %" },
  ];
  const AN = 2.3, FON = 2.2;
  const baseM = new THREE.MeshPhysicalMaterial({ color: 0x141b27, roughness: 0.4, clearcoat: 0.6 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(15.5, 0.4, 4.4, 2, 0.1), baseM); base.position.set(0, -0.2, 0); R.add(base);

  // text on a plane (canvas), redrawn only when the text changes
  function rotulo(ancho, alto, tam, color, mono = false) {
    const px = 64, cv = document.createElement("canvas"); cv.width = Math.round(ancho * px); cv.height = Math.round(alto * px);
    const g = cv.getContext("2d"); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    let ultimo = null;
    m.userData.poner = (txt) => {
      if (txt === ultimo) return; ultimo = txt;
      g.clearRect(0, 0, cv.width, cv.height); g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 ${Math.round(tam * px)}px ${mono ? '"JetBrains Mono"' : '"Inter"'}, sans-serif`; g.fillText(txt, cv.width / 2, cv.height / 2); tex.needsUpdate = true;
    };
    m.userData.noCortar = true; return m;
  }
  const cols = datos.map((d, i) => {
    const m = new THREE.MeshPhysicalMaterial({ color: d.col, roughness: 0.12, transparent: true, opacity: 0.55, clearcoat: 1, emissive: d.col, emissiveIntensity: 0.55, depthWrite: false });
    const geo = new RoundedBoxGeometry(AN, 1, FON, 3, 0.18);
    const b = new THREE.Mesh(geo, m); R.add(b);
    const tope = new THREE.Mesh(new RoundedBoxGeometry(AN + 0.1, 0.12, FON + 0.1, 2, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(d.col).multiplyScalar(1.7), toneMapped: false })); R.add(tope);
    const val = rotulo(4.2, 1.5, 1.0, "#ffffff", true); R.add(val);
    const etq = rotulo(4.2, 1.1, 0.62, "#c9d3e3"); etq.position.set(d.x, -0.95, FON / 2 + 0.2); etq.userData.poner(d.etq); R.add(etq);
    return { d, b, m, tope, val };
  });
  const tit = [[-4.0, "25 °C"], [4.0, "40 °C"]].map(([x, tx]) => { const r = rotulo(5, 1.3, 0.9, "#ffffff", true); r.position.set(x, -2.2, FON / 2 + 0.2); r.userData.poner(tx); R.add(r); return r; });
  // reference line at 80 %
  const refM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(1.4), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const refs = [];
  for (let i = 0; i < 21; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.07), refM); r.position.set(-7.5 + i * 0.75, 80 * ESC, FON / 2 + 0.2); R.add(r); refs.push(r); }
  const refTxt = rotulo(3, 1, 0.6, "#ffffff", true); refTxt.position.set(-9.2, 80 * ESC, FON / 2 + 0.2); refTxt.userData.poner("80 %"); refTxt.material.opacity = 0; R.add(refTxt);

  const st = { ver: 1, a: 0, b: 0, ref: 0, foco: 0 };
  const sm = (k) => k * k * (3 - 2 * k);
  function actualizar(t) {
    R.visible = st.ver > 0.003; if (!R.visible) return;
    for (let i = 0; i < 4; i++) {
      const c = cols[i], k = sm(clamp(i < 2 ? st.a : st.b)) * st.ver;
      const alto = Math.max(0.0001, c.d.v * ESC * k);
      c.b.scale.y = alto; c.b.position.set(c.d.x, alto / 2, 0);
      c.tope.position.set(c.d.x, alto, 0); c.tope.visible = k > 0.01;
      c.val.position.set(c.d.x, alto + 1.2, FON / 2 + 0.2); c.val.visible = k > 0.01;
      c.val.userData.poner(`${Math.round(c.d.v * k)} %`);
      c.m.opacity = (0.55 - 0.3 * st.foco * (i === 1 ? 0 : 1));
      c.m.emissiveIntensity = (i === 1 ? 0.55 + 0.4 * st.foco : 0.55 * (1 - 0.6 * st.foco));
    }
    refM.opacity = st.ref * 0.8; refTxt.material.opacity = st.ref; refs.forEach((r) => { r.visible = st.ref > 0.01; }); refTxt.visible = st.ref > 0.01;
  }
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    partes: { col1: pl([-5.6, 8, 0], 5.5), col2: pl([-2.4, 7, 0], 5), col3: pl([2.4, 7, 0], 5), col4: pl([5.6, 5.5, 0], 5), ref: pl([0, 13.6, 0], 9), centro: pl([0, 8, 0], 10) },
    caja: [[-9.8, -2.9, -2.3], [9.8, 19.8, 2.3]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { ver: 1, a: 0, b: 0, ref: 0, foco: 0 },
    actualizar,
  };
}
