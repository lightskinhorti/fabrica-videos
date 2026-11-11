// Memoria USB y su memoria flash (hechos con 12-usb, 11 nov). Sin marcas ni letras en los chips.
//
// pendrive(): la memoria USB tumbada, con el eje largo en x (el conector USB-A a la derecha) y la cara plana hacia +z.
//   Unidades en cm: carcasa de plástico oscuro con estrías de agarre (5,6 × 2,1 × 1), conector de acero con su lengüeta
//   y cuatro contactos dorados, y dentro la placa verde con pistas, el chip de memoria flash (con patas), el
//   controlador, el cristal de cuarzo, un led y unos condensadores. No lleva pila: es el hecho del gancho.
//   Mandos: luz (0..1, el led), datos (0..1, pulsos de luz que van del conector al controlador y a la memoria).
//   Partes: conector, contactos, memoria, controlador, cristal, led, placa, carcasa, centro.
//   Con rayosX (el de siempre) la carcasa se vuelve transparente y se ve la placa.
//
// celdaFlash(): UNA celda de memoria flash en corte lateral (ilustración, no a escala): sustrato de silicio con la fuente
//   y el drenador, la pared fina de óxido (el aislante del túnel), la puerta flotante dorada rodeada de aislante por todos
//   lados y la puerta de control de acero arriba. Los electrones son bolitas cian.
//   Mandos (de 0 a 1 salvo donde se dice):
//     carga     cuántos electrones hay dentro de la puerta flotante (0 = ninguno, 1 = llena); al subir, los electrones
//               atraviesan la pared de uno en uno; al bajar, salen por el mismo sitio
//     volt      tensión en la puerta de control (se ilumina y salen puntos dorados del campo)
//     signo     1 = campo hacia abajo (escribir); -1 = hacia arriba (borrar)
//     lee       corriente entre la fuente y el drenador: pasa si la puerta flotante está vacía y se atasca si está llena
//     bombeo    la carga sube y baja sola (escribir y borrar una y otra vez)
//     desgaste  defectos que aparecen en la pared de óxido (puntos rojos)
//     fuga      los electrones se escapan por los defectos (de 0 a 1 se pierden todos)
//     rebote    los electrones de abajo saltan contra la pared y rebotan
//   Partes: puerta, flotante, oxido, aislante, sustrato, fuente, drenador, canal, reserva, defectos, centro.
//
// memoriaCeldas(): una rejilla de 16 × 24 celdas vista de frente. Cada celda tiene su cuadradito dorado si está cargada.
//   El dibujo (sol, montañas y agua) sale de las celdas cargadas.
//   Mandos: ver (0..1), rellena (0..1, se van cargando de arriba abajo), foto (0..1, las celdas cargadas toman los colores
//   de la foto), bloque (0..1, marco cian de un bloque de filas), borra (0..1, el bloque se vacía entero a la vez),
//   olvida (0..1, la foto se disuelve celda a celda).
//   Partes: centro, bloque.

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PI = Math.PI;
const CIAN = 0x6fdcff, ORO = 0xffb22e;

export function pendrive(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const exterior = [];
  const interior = [];

  const plastico = new THREE.MeshPhysicalMaterial({ color: 0x23262c, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 0.8 });
  const estria = new THREE.MeshPhysicalMaterial({ color: 0x0f1013, roughness: 0.6 });
  const dorado = new THREE.MeshPhysicalMaterial({ color: 0xdcaa4e, metalness: 1, roughness: 0.22, clearcoat: 0.3 });
  const chipMat = new THREE.MeshPhysicalMaterial({ color: 0x131419, roughness: 0.4, clearcoat: 0.55 });
  const cond = new THREE.MeshPhysicalMaterial({ color: 0xcdb98a, roughness: 0.5 });
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x222a22, emissive: 0x6dff9a, emissiveIntensity: 0, roughness: 0.4 });

  // ---------- case ----------
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(5.6, 2.1, 1.0, 4, 0.22), plastico); cuerpo.position.set(-0.6, 0, 0); R.add(cuerpo); exterior.push(cuerpo);
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.5, 0.03), estria); e.position.set(-3.0 + i * 0.22, 0, s * 0.505); R.add(e); exterior.push(e);
  }

  // ---------- USB-A plug: steel tube, tongue and four gold contacts ----------
  const plug = new THREE.Group(); R.add(plug);
  const tubo = [[1.2, 1.2, 0.05, 2.8, 0, 0.2], [1.2, 1.2, 0.05, 2.8, 0, -0.2], [1.2, 0.05, 0.45, 2.8, 0.6, 0], [1.2, 0.05, 0.45, 2.8, -0.6, 0]];
  for (const [w, h, d, x, y, z] of tubo) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.acero); m.position.set(x, y, z); plug.add(m); }
  for (const dy of [-0.3, 0.3]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.06), M.aceroOsc); h.position.set(2.95, dy, 0.23); plug.add(h); }
  const lengueta = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 0.14), M.grafito); lengueta.position.set(2.75, 0, -0.04); plug.add(lengueta);
  const contactos = new THREE.Group(); plug.add(contactos);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.11, 0.03), dorado); c.position.set(2.78, -0.375 + i * 0.25, 0.04); contactos.add(c); }

  // ---------- board: a canvas with the traces ----------
  const W = 780, H = 270, X0 = -3.1, X1 = 2.1, Y0 = -0.9, Y1 = 0.9;
  const px = (x) => ((x - X0) / (X1 - X0)) * W, py = (y) => ((Y1 - y) / (Y1 - Y0)) * H;
  const carriles = [-0.3, 0, 0.3];
  const placaTex = X.lienzo(W, H, (g) => {
    g.fillStyle = "#14523b"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + 0.03 * hash(i)})`; g.fillRect(hash(i * 1.7) * W, hash(i * 2.9) * H, 1 + hash(i) * 3, 1); }
    g.strokeStyle = "rgba(150,215,170,0.5)"; g.lineWidth = 2.4; g.lineCap = "round";
    for (const y0 of carriles) { g.beginPath(); g.moveTo(px(2.1), py(y0)); g.lineTo(px(1.7), py(y0)); g.lineTo(px(1.1), py(y0 * 0.6)); g.lineTo(px(-0.5), py(y0 * 0.6)); g.stroke(); }
    // data bus between the controller and the memory
    for (let k = 0; k < 9; k++) { const y = -0.42 + k * 0.105; g.beginPath(); g.moveTo(px(0.22), py(y * 0.9)); g.lineTo(px(-0.1), py(y * 0.9)); g.lineTo(px(-0.3), py(y)); g.lineTo(px(-0.5), py(y)); g.stroke(); }
    // power and quartz traces
    g.beginPath(); g.moveTo(px(0.95), py(0.35)); g.lineTo(px(1.2), py(0.55)); g.lineTo(px(1.2), py(0.6)); g.stroke();
    g.beginPath(); g.moveTo(px(0.4), py(-0.35)); g.lineTo(px(0.4), py(-0.62)); g.lineTo(px(-0.9), py(-0.62)); g.stroke();
    g.beginPath(); g.moveTo(px(-2.7), py(0.62)); g.lineTo(px(-2.7), py(-0.1)); g.lineTo(px(-2.3), py(-0.1)); g.stroke();
    g.fillStyle = "rgba(220,190,120,0.8)";
    for (let i = 0; i < 22; i++) { g.beginPath(); g.arc(px(-2.9 + hash(i * 3.3) * 4.6), py(-0.8 + hash(i * 5.1) * 1.6), 3, 0, 7); g.fill(); }
    g.fillStyle = "#d8b25c"; for (let i = 0; i < 4; i++) g.fillRect(px(1.62), py(-0.375 + i * 0.25) - 6, px(2.1) - px(1.62), 12);
  }).tex;
  const pcbMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: placaTex, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const placa = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.8, 0.1), pcbMat); placa.position.set(-0.5, 0, -0.12); R.add(placa); interior.push(placa);

  // ---------- chips on the board ----------
  const Z = -0.01;
  const nand = new THREE.Mesh(new RoundedBoxGeometry(1.8, 1.0, 0.12, 2, 0.03), chipMat); nand.position.set(-1.35, 0.05, Z); R.add(nand); interior.push(nand);
  const marca = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), M.basica(0x6a6f78, 0.8)); marca.position.set(-2.1, -0.38, Z + 0.062); R.add(marca); interior.push(marca);
  for (const s of [-1, 1]) for (let i = 0; i < 14; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.03), M.acero); l.position.set(-2.18 + i * 0.125, 0.05 + s * 0.55, Z - 0.05); R.add(l); interior.push(l);
  }
  const ctrl = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.75, 0.1, 2, 0.03), chipMat); ctrl.position.set(0.6, 0, Z - 0.01); R.add(ctrl); interior.push(ctrl);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.025), M.acero); a.position.set(0.6 + s * 0.4, -0.3 + i * 0.12, Z - 0.06); R.add(a); interior.push(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.025), M.acero); b.position.set(0.6 - 0.3 + i * 0.12, s * 0.4, Z - 0.06); R.add(b); interior.push(b);
  }
  const cristal = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.22, 0.1, 2, 0.04), M.aluminio); cristal.position.set(1.45, 0.62, Z - 0.01); R.add(cristal); interior.push(cristal);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.07), ledMat); led.position.set(-2.7, 0.62, Z - 0.03); R.add(led); interior.push(led);
  const brilloLed = C.brillo("109,255,154"); brilloLed.scale.setScalar(0.75); brilloLed.position.copy(led.position).add(v3(0, 0, 0.1)); R.add(brilloLed); brilloLed.userData.noCortar = true;
  const pos = [[-2.5, -0.5], [-2.3, -0.56], [-2.55, 0.12], [0.1, 0.62], [0.2, -0.64], [1.1, -0.52], [1.35, -0.18], [1.1, 0.12], [-0.7, -0.72], [-0.4, 0.72]];
  pos.forEach(([x, y], i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 0.18 : 0.12, i % 2 ? 0.09 : 0.18, 0.07), cond); c.position.set(x, y, Z - 0.03); R.add(c); interior.push(c); });
  // gold pads where the plug is soldered
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.02), dorado); p.position.set(1.86, -0.375 + i * 0.25, -0.065); R.add(p); interior.push(p); }

  // ---------- data pulses: connector -> controller -> memory ----------
  const NP = 5, pulsos = [];
  const bola = new THREE.SphereGeometry(0.06, 10, 8);
  for (let j = 0; j < carriles.length; j++) {
    const y0 = carriles[j];
    const curva = new THREE.CatmullRomCurve3([v3(2.45, y0, 0.0), v3(1.7, y0, 0.0), v3(1.1, y0 * 0.6, 0.0), v3(-0.5, y0 * 0.6, 0.0)], false, "catmullrom", 0.05);
    for (let k = 0; k < NP; k++) {
      const m = new THREE.Mesh(bola, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.25, 0.45), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
      m.userData.noCortar = true; m.visible = false; R.add(m); pulsos.push({ m, curva, fase: k / NP + j * 0.17 });
    }
  }
  let kLuz = 0, kDatos = 0;
  function actualizar(t) {
    ledMat.emissiveIntensity = 2.2 * kLuz * (0.85 + 0.15 * Math.sin(t * 9));
    brilloLed.material.opacity = 0.6 * kLuz; brilloLed.visible = kLuz > 0.01;
    for (const p of pulsos) {
      p.m.visible = kDatos > 0.01; if (!p.m.visible) continue;
      const u = (t * 0.55 + p.fase) % 1;
      p.m.position.copy(p.curva.getPoint(u)); p.m.position.z += 0.02;
      p.m.material.opacity = kDatos * Math.sin(PI * u) ** 0.5;
    }
  }

  const plana = (obj, l, r) => ({ obj, local: l, radio: r });
  return {
    grupo: R,
    exterior, semi: [[plug, 0.4]], interior,
    partes: {
      conector: plana(R, [2.8, 0, 0], 1.0), contactos: plana(R, [2.78, 0, 0.05], 0.8), memoria: plana(R, [-1.35, 0.05, 0], 1.25),
      controlador: plana(R, [0.6, 0, 0], 0.65), cristal: plana(R, [1.45, 0.62, 0], 0.45), led: plana(R, [-2.7, 0.62, 0], 0.35),
      placa: plana(R, [-0.5, 0, -0.12], 2.8), carcasa: plana(R, [-0.6, 0, 0], 3.2), centro: plana(R, [0, 0, 0], 3.8),
    },
    caja: [[-3.4, -1.05, -0.5], [3.4, 1.05, 0.5]],
    controles: { luz: (k) => { kLuz = k; }, datos: (k) => { kDatos = k; } },
    defecto: { luz: 1, datos: 0 },
    actualizar,
  };
}

export function celdaFlash(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const PRO = 5;
  const caja = (w, h, x, y, mat, d = PRO) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(0.1, h / 3)), mat); m.position.set(x, y, 0); R.add(m); return m; };

  // ---------- materials ----------
  const granoTex = X.lienzo(256, 256, (g, w, h) => {
    g.fillStyle = "#3a4a66"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${150 + hash(i) * 90},${180 + hash(i * 3) * 60},255,${0.04 + 0.1 * hash(i * 7)})`; g.fillRect(hash(i * 1.3) * w, hash(i * 2.1) * h, 1 + hash(i * 5) * 2, 1 + hash(i * 6) * 2); }
    g.strokeStyle = "rgba(170,200,255,0.06)"; g.lineWidth = 1; for (let i = 0; i < w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  }).tex;
  const sustratoM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: granoTex, roughness: 0.55, clearcoat: 0.2, transparent: true, opacity: 0.55, depthWrite: false });
  const pozoM = new THREE.MeshPhysicalMaterial({ color: 0x2f8f9a, roughness: 0.5, emissive: 0x0d3a42, emissiveIntensity: 0.6, clearcoat: 0.3 });
  const oxidoM = new THREE.MeshPhysicalMaterial({ color: 0x7fd0ff, roughness: 0.08, transparent: true, opacity: 0.5, clearcoat: 1, emissive: 0x0b3a52, emissiveIntensity: 0.7, depthWrite: false });
  const onoM = new THREE.MeshPhysicalMaterial({ color: 0xb9a8ff, roughness: 0.08, transparent: true, opacity: 0.5, clearcoat: 1, emissive: 0x241a5a, emissiveIntensity: 0.7, depthWrite: false });
  const flotanteM = new THREE.MeshPhysicalMaterial({ color: 0xdcaa4e, metalness: 0.6, roughness: 0.25, clearcoat: 0.3, emissive: 0xffb347, emissiveIntensity: 0.06, transparent: true, opacity: 0.42, depthWrite: false });
  const puertaM = new THREE.MeshPhysicalMaterial({ color: 0xc6cad0, metalness: 1, roughness: 0.3, clearcoat: 0.25, emissive: 0xff9a2e, emissiveIntensity: 0 });
  const cableM = new THREE.MeshPhysicalMaterial({ color: 0xc6cad0, metalness: 1, roughness: 0.3, emissive: 0xff9a2e, emissiveIntensity: 0 });

  // ---------- the cell ----------
  caja(19, 5.3, 0, -3.85, sustratoM);                      // silicon substrate
  const fuente = caja(3.6, 2.0, -7.7, -2.2, pozoM, PRO + 0.04);   // n+ wells
  const drenador = caja(3.6, 2.0, 7.7, -2.2, pozoM, PRO + 0.04);
  const oxido = caja(9.4, 0.45, 0, -0.97, oxidoM);          // tunnel oxide: the thin wall
  const flotante = caja(8.0, 2.05, 0, 0.275, flotanteM, PRO - 0.4);
  for (const s of [-1, 1]) caja(0.7, 2.05, s * 4.35, 0.275, oxidoM);   // side insulation
  const ono = caja(9.4, 0.5, 0, 1.55, onoM);                // insulator above the floating gate
  const puerta = caja(9.4, 2.4, 0, 3.0, puertaM);           // control gate
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 20), cableM); cable.position.set(0, 5.3, 0); R.add(cable);
  const haloV = C.brillo("255,170,70"); haloV.scale.setScalar(4.5); haloV.position.set(0, 6.1, 0.5); R.add(haloV); haloV.userData.noCortar = true;
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.6, 16), M.acero); c.position.set(s * 7.7, -0.0, 0); R.add(c); }

  // ---------- electrons ----------
  const N = 54, W = 8, PUERTOS = [-3, -1.8, -0.6, 0.6, 1.8, 3];
  const el = [];
  for (let i = 0; i < N; i++) {
    const px = PUERTOS[i % 6], z0 = (hash(i * 4.4) - 0.5) * 4.0;
    el.push({
      px, z0,
      a: v3(px + (hash(i * 1.7) - 0.5) * 0.9, -2.35 - hash(i * 2.3) * 1.0, z0),
      b: v3((hash(i * 3.1) - 0.5) * 6.8, -0.3 + hash(i * 5.3) * 1.2, (hash(i * 6.7) - 0.5) * 3.6),
    });
  }
  const eGeo = new THREE.SphereGeometry(0.17, 14, 10);
  const eMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CIAN).multiplyScalar(1.7), toneMapped: false });
  const eMesh = new THREE.InstancedMesh(eGeo, eMat, N); eMesh.frustumCulled = false; eMesh.userData.noCortar = true; eMesh.userData.sinBordes = true; R.add(eMesh);
  const NC = 22;
  const cMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.6, 1.8), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const cMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), cMat, NC); cMesh.frustumCulled = false; cMesh.userData.noCortar = true; cMesh.userData.sinBordes = true; R.add(cMesh);
  const NV = 8, vMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ORO).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const vMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), vMat, NV * 5); vMesh.frustumCulled = false; vMesh.userData.noCortar = true; vMesh.userData.sinBordes = true; R.add(vMesh);
  // defects in the oxide
  const ND = 24;
  const dMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 0.35, 0.2), toneMapped: false });
  const dMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), dMat, ND); dMesh.frustumCulled = false; dMesh.userData.noCortar = true; dMesh.userData.sinBordes = true; R.add(dMesh);
  const dpos = Array.from({ length: ND }, (_, i) => v3(PUERTOS[i % 6] + (hash(i * 8.1) - 0.5) * 0.45, -1.15 + hash(i * 9.7) * 0.36, 0.2 + hash(i * 3.7) * 2.2));

  const st = { carga: 0, volt: 0, signo: 1, lee: 0, bombeo: 0, desgaste: 0, fuga: 0, rebote: 0 };
  const dm = new THREE.Object3D();
  const sm = (k) => k * k * (3 - 2 * k);
  const mix = (a, b, k) => a + (b - a) * k;
  let cargaVista = 0;
  function actualizar(t) {
    const carga = mix(st.carga, 0.5 + 0.5 * Math.sin(t * 2.5), st.bombeo);
    cargaVista = carga;
    // electrons crossing the wall one by one
    for (let i = 0; i < N; i++) {
      const e = el[i];
      const entra = clamp((carga * (N + W) - i) / W);
      const sale = clamp((st.fuga * (N + W) - (N - 1 - i)) / W);
      const s = entra * (1 - sale);
      const s1 = clamp(s / 0.35), s2 = clamp((s - 0.35) / 0.3), s3 = clamp((s - 0.65) / 0.35);
      let x, y, z;
      if (s <= 0) {
        x = e.a.x; y = e.a.y; z = e.a.z;
        if (st.rebote > 0.01 && i % 5 === 0) { const b = Math.max(0, Math.sin(t * 3.2 + i * 1.3)) ** 6; y = mix(y, -1.55, b * st.rebote); }
      } else if (s < 0.35) { const k = sm(s1); x = mix(e.a.x, e.px, k); y = mix(e.a.y, -1.62, k); z = mix(e.a.z, e.z0, k); }
      else if (s < 0.65) { const k = s2; x = e.px; y = mix(-1.62, -0.8, k); z = e.z0; }
      else { const k = sm(s3); x = mix(e.px, e.b.x, k); y = mix(-0.8, e.b.y, k); z = mix(e.z0, e.b.z, k); }
      const dentro = s >= 0.99, jig = dentro ? 0.09 : s <= 0 ? 0.05 : 0;
      dm.position.set(x + jig * Math.sin(t * 5 + i * 1.9), y + jig * Math.cos(t * 4.3 + i * 2.7), z + jig * Math.sin(t * 3.7 + i));
      dm.scale.setScalar(1); dm.updateMatrix(); eMesh.setMatrixAt(i, dm.matrix);
    }
    eMesh.instanceMatrix.needsUpdate = true;
    // current in the channel: flows if the floating gate is empty, piles up at the source if it is full
    const bloq = clamp(cargaVista * 2.2), kl = st.lee;
    cMesh.visible = kl > 0.01; cMat.opacity = kl;
    if (cMesh.visible) for (let i = 0; i < NC; i++) {
      const u = (hash(i * 1.9) + t * 0.25) % 1, libre = -5.9 + u * 11.8;
      const atasco = -5.9 + 1.1 * hash(i * 2.7) + 0.12 * Math.sin(t * 6 + i);
      const x = mix(libre, atasco, bloq);
      dm.position.set(x, -1.55 + 0.05 * Math.sin(t * 5 + i), (hash(i * 4.1) - 0.5) * 4.2); dm.scale.setScalar(1); dm.updateMatrix(); cMesh.setMatrixAt(i, dm.matrix);
    }
    cMesh.instanceMatrix.needsUpdate = true;
    // field dots between the control gate and the substrate
    const kv = st.volt; vMesh.visible = kv > 0.01; vMat.opacity = 0.85 * kv;
    if (vMesh.visible) for (let c = 0; c < NV; c++) for (let j = 0; j < 5; j++) {
      const u = (j / 5 + t * 0.5 * st.signo + hash(c * 3.3) * 0.2) % 1, uu = u < 0 ? u + 1 : u;
      const y = mix(1.7, -2.6, uu);
      dm.position.set((c - 3.5) * 1.1, y, (hash(c * 5.9) - 0.5) * 3.6 + 2.45 * 0);
      dm.scale.setScalar(0.6 + 0.8 * Math.sin(PI * uu)); dm.updateMatrix(); vMesh.setMatrixAt(c * 5 + j, dm.matrix);
    }
    vMesh.instanceMatrix.needsUpdate = true;
    puertaM.emissiveIntensity = 0.9 * kv; cableM.emissiveIntensity = 1.4 * kv;
    haloV.material.opacity = 0.55 * kv; haloV.visible = kv > 0.01;
    flotanteM.emissiveIntensity = 0.06 + 0.22 * clamp(cargaVista);
    // defects
    const nd = Math.min(ND, Math.ceil(st.desgaste * ND * 1.02));
    dMesh.visible = nd > 0;
    for (let i = 0; i < ND; i++) { dm.position.copy(dpos[i]); dm.scale.setScalar(i < nd ? 1 + 0.25 * Math.sin(t * 6 + i) : 0.0001); dm.updateMatrix(); dMesh.setMatrixAt(i, dm.matrix); }
    dMesh.instanceMatrix.needsUpdate = true;
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  const mando = (n) => (v) => { st[n] = v; };
  return {
    grupo: R,
    partes: {
      puerta: pl([0, 3.0, 0], 4.2), flotante: pl([0, 0.275, 0], 3.6), oxido: pl([0, -0.97, 0], 3.2), aislante: pl([0, 1.55, 0], 3.2),
      sustrato: pl([0, -4.0, 0], 5.2), fuente: pl([-7.7, -2.2, 0], 2.2), drenador: pl([7.7, -2.2, 0], 2.2), canal: pl([0, -1.55, 0], 3.6),
      reserva: pl([0, -2.8, 0], 3.4), defectos: pl([1.8, -1.0, 0], 1.6), lado: pl([-4.35, 0.275, 0], 1.3), centro: pl([0, 0.6, 0], 8.5),
    },
    caja: [[-9.5, -6.5, -2.5], [9.5, 6.6, 2.5]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, mando(n)])),
    defecto: { carga: 0, volt: 0, signo: 1, lee: 0, bombeo: 0, desgaste: 0, fuga: 0, rebote: 0 },
    actualizar,
  };
}

export function memoriaCeldas(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const COLS = 16, ROWS = 24, P = 1.0, N = COLS * ROWS;
  const BLOQUE = [7, 16];
  // the picture: sun, two mountains and water. 0 = empty cell
  const pix = (c, r) => {
    if ((c - 11.5) ** 2 + (r - 5.5) ** 2 <= 9) return 1;
    const a = 11 + Math.abs(c - 4) * 0.95, b = 13 + Math.abs(c - 11) * 0.95;
    if (r <= 19 && r >= Math.min(a, b)) return a <= b ? 2 : 3;
    if (r >= 20 && (r + c) % 3 !== 0) return 4;
    return 0;
  };
  const paleta = [new THREE.Color(0x0e1a33), new THREE.Color(0xffd45a), new THREE.Color(0x7aa8e6), new THREE.Color(0x3f6fb8), new THREE.Color(0x4fc7c9)];
  const cielo = new THREE.Color(0x1d3c70), vacia = new THREE.Color(0x141c2c);
  const placaGeo = new RoundedBoxGeometry(0.88, 0.88, 0.16, 2, 0.07);
  const placas = new THREE.InstancedMesh(placaGeo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.25 }), N);
  placas.frustumCulled = false; R.add(placas);
  const luz = new THREE.InstancedMesh(new RoundedBoxGeometry(0.6, 0.6, 0.1, 2, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), N);
  luz.frustumCulled = false; luz.userData.noCortar = true; luz.userData.sinBordes = true; R.add(luz);
  const celdas = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) celdas.push({ c, r, x: (c - (COLS - 1) / 2) * P, y: ((ROWS - 1) / 2 - r) * P, code: pix(c, r), h: hash(r * 31 + c * 7.7), h2: hash(r * 17.3 + c * 3.1 + 9) });
  // frame of the block of rows
  const marcoM = new THREE.MeshBasicMaterial({ color: new THREE.Color(CIAN).multiplyScalar(1.5), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const y0 = ((ROWS - 1) / 2 - BLOQUE[0]) * P + 0.5, y1 = ((ROWS - 1) / 2 - BLOQUE[1]) * P - 0.5, wx = COLS * P + 0.5;
  const lados = [[wx, 0.1, 0, y0], [wx, 0.1, 0, y1], [0.1, y0 - y1, -wx / 2, (y0 + y1) / 2], [0.1, y0 - y1, wx / 2, (y0 + y1) / 2]];
  const marcos = lados.map(([w, h, x, y]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), marcoM); m.position.set(x, y, 0.15); m.userData.noCortar = true; m.userData.sinBordes = true; R.add(m); return m; });
  const st = { ver: 1, rellena: 1, foto: 0, bloque: 0, borra: 0, olvida: 0 };
  const dm = new THREE.Object3D(), col = new THREE.Color();
  const sm = (k) => k * k * (3 - 2 * k);
  function actualizar(t) {
    R.visible = st.ver > 0.003;
    if (!R.visible) return;
    marcoM.opacity = st.bloque * (0.75 + 0.25 * Math.sin(t * 5));
    for (let i = 0; i < N; i++) {
      const q = celdas[i];
      // load wave from the top; the block empties all at once (a little ripple), the picture dissolves cell by cell
      let on = q.code > 0 ? sm(clamp((st.rellena * 1.35 - (q.r / ROWS) * 0.9 - q.h * 0.1) / 0.18)) : 0;
      if (q.r >= BLOQUE[0] && q.r <= BLOQUE[1]) on *= 1 - sm(clamp(st.borra * 1.25 - (q.c / COLS) * 0.25));
      on *= 1 - sm(clamp(st.olvida * 1.3 - q.h2 * 0.3));
      dm.position.set(q.x, q.y, 0); dm.scale.setScalar(st.ver); dm.updateMatrix(); placas.setMatrixAt(i, dm.matrix);
      const f = st.foto, base = q.code > 0 ? paleta[q.code] : cielo;
      placas.setColorAt(i, col.copy(vacia).lerp(cielo, f * (q.code === 0 ? 1 : 0)));
      dm.position.z = 0.11; dm.scale.setScalar(Math.max(0.0001, on * st.ver * (1.0 + 0.2 * f)) * (0.92 + 0.08 * Math.sin(t * 4 + q.h * 20))); dm.updateMatrix(); luz.setMatrixAt(i, dm.matrix);
      const dorado = col.set(ORO).multiplyScalar(1.4), foto = base.clone().multiplyScalar(1.15);
      luz.setColorAt(i, col.copy(dorado).lerp(foto, f));
    }
    placas.instanceMatrix.needsUpdate = luz.instanceMatrix.needsUpdate = true;
    placas.instanceColor.needsUpdate = luz.instanceColor.needsUpdate = true;
  }
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    partes: { centro: pl([0, 0, 0], 13), bloque: pl([0, (y0 + y1) / 2, 0], 6.5), sol: pl([(11.5 - 7.5) * P, 6.0, 0], 3.2), agua: pl([0, -10.5, 0], 6) },
    caja: [[-8.5, -12.5, -0.2], [8.5, 12.5, 0.4]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { ver: 1, rellena: 1, foto: 0, bloque: 0, borra: 0, olvida: 0 },
    actualizar,
  };
}
