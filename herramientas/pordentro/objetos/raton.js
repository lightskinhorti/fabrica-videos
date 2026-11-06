// Ratón óptico, mesa, superficie ampliada, las fotos del sensor y un monitor (hechos con 10-raton, 7 nov).
// Unidades en cm salvo donde se dice. Sin marcas en ninguno.
//
// raton(): ratón óptico con cable de 6,2 × 11,6 × 3,7 cm, apoyado en y = 0, con los botones mirando a +z. Carcasa de
//   plástico mate con el surco de los botones, rueda de goma con estrías, base con patas de teflón y la ventanita del
//   sensor. Dentro: placa, sensor (cámara diminuta, encapsulado de 8 patas que mira hacia abajo), lente de
//   policarbonato con su prisma, LED rojo que entra casi rasante, dos interruptores con su lámina de metal y el cable.
//   Mandos: luz (0..1, el LED rojo y su brillo en la mesa), clic (0..1, el botón izquierdo baja y la lámina del
//           interruptor salta), avanza (cm que se mueve hacia +z), seccion (0/1, caras de corte rellenas en x = 0,
//           para el plano corte de eje x en 0), seccionClic (0/1, lo mismo en x = -1,25, el interruptor izquierdo),
//           rafaga (0..1, destellos del LED como fotos), halo (0..1, brillo de la mancha roja y de la luz que
//           tiñe la mesa; bájalo en los cortes para que no deslumbre).
//   Partes: led, lente, sensor, chip (= sensor), prisma, foco (el punto de la mesa que fotografía), base, ventana
//           (agujero de abajo), rueda, boton, interruptor, lamina, placa, cable, arriba.
//
// mesa({ tipo: "madera" | "cristal", ancho, fondo }): tablero de 36 × 26 cm (madera con veta y barniz) o de cristal
//   de 0,8 cm con canto verdoso. La cara de arriba está en y = 0. Partes: centro, canto.
//
// superficie(): un trozo de mesa visto muy de cerca (12 × 12 unidades, unos 2 mm de verdad): fibras y poros en
//   relieve. Con luz > 0 entra una luz roja casi rasante desde -x y cada fibra hace sombra (sombras calculadas).
//   Mandos: luz (0..1), marco (0..1, el cuadrado de 18 × 18 que ve el sensor). Partes: centro, fibra, grano, marco.
//
// fotosRaton(): las fotos del sensor como dos losetas de 18 × 18 píxeles en gris (1 unidad = 1 píxel): ANTES (a la
//   izquierda) y AHORA (a la derecha, la misma imagen corrida 2 píxeles hacia atrás). Mandos: relieve (0..1, cada
//   píxel sube según su brillo: un mapa), desliza (0..1, AHORA viaja encima de ANTES buscando dónde encaja),
//   encaja (0..1, marco verde), flecha (0..1, flecha del corrimiento), iguales (0/1, fotos de un cristal: todo gris,
//   no encaja nunca), rafaga (0..1, una pila de fotos que se renueva sin parar). Partes: antes, ahora, centro,
//   flecha, pila.
//
// monitor(): pantalla de ordenador de 54 × 32 cm con un escritorio genérico en español y la flecha del ratón.
//   Mandos: cursor (0..1, la flecha recorre su camino), estela (0..1, rastro de la flecha). Partes: pantalla, flecha.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const ROJO = "255,60,48";

function grano(X, s = 1) {
  return X.lienzo(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = 0.55 * X.ruido(x / 3, y / 3, s) + 0.45 * X.ruido(x / 1.2, y / 1.2, s + 1); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 110 + n * 120; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }, false).tex;
}

export function raton(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const PI = Math.PI;
  const R = new THREE.Group();     // follows `avanza`
  const BASE = 0.4, LZ = 5.8;
  const Wd = (zn) => 3.1 * (1 - 0.06 * zn * zn) - 0.12 * zn;
  const Hd = (zn) => 3.3 * Math.exp(-0.9 * ((zn + 0.25) / 1.05) ** 2);
  const alto = (x, z) => { const zn = z / LZ, xn = x / Wd(zn), y = Math.sqrt(Math.max(0, 1 - xn * xn - zn * zn)); return BASE + y * Hd(zn); };

  const g0 = grano(X, 3); X.rep(g0, 2, 2);
  const carcasa = new THREE.MeshPhysicalMaterial({ color: 0x1e2024, roughness: 0.5, roughnessMap: g0, bumpMap: g0, bumpScale: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45, envMapIntensity: 0.7, side: THREE.DoubleSide });
  const baseMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2c31, roughness: 0.75, bumpMap: g0, bumpScale: 0.8 });
  const teflon = new THREE.MeshPhysicalMaterial({ color: 0xdcd8cf, roughness: 0.25, clearcoat: 0.6 });
  const goma = new THREE.MeshPhysicalMaterial({ color: 0x34373d, roughness: 0.8, sheen: 0.4, sheenColor: new THREE.Color(0x8a9099) });
  const policarb = new THREE.MeshPhysicalMaterial({ color: 0xcfe2f2, roughness: 0.05, transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2 });
  const negroChip = new THREE.MeshPhysicalMaterial({ color: 0x131417, roughness: 0.45, clearcoat: 0.4 });
  const plata = new THREE.MeshPhysicalMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.28 });

  // ---------- shell: a deformed half egg (taller at the back, low at the front) ----------
  const casco = new THREE.SphereGeometry(1, 160, 80, 0, 2 * PI, 0, PI / 2);
  { const p = casco.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setXYZ(i, x * Wd(z), BASE + y * Hd(z), z * LZ); }
    casco.computeVertexNormals(); }
  const cascoM = new THREE.Mesh(casco, carcasa); R.add(cascoM);
  // grooves: between the buttons, and where the buttons end
  const surco = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.6 });
  const surcos = [];
  const tubo = (pts, r = 0.04) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 4, r, 6, false), surco); m.userData.sinBordes = true; R.add(m); surcos.push(m); return m; };
  { const a = []; for (let z = 3.15; z <= 5.75; z += 0.1) a.push(v3(0, alto(0, Math.min(z, 5.72)) + 0.004, Math.min(z, 5.72))); tubo(a);
    const b = []; for (let x = -2.75; x <= 2.75; x += 0.1) { const z = 1.0 + 0.45 * (x / 2.75) ** 2; b.push(v3(x, alto(x, z) + 0.004, z)); } tubo(b);
    const c = []; for (let z = 1.0; z <= 1.25; z += 0.05) c.push(v3(0, alto(0, z) + 0.004, z)); tubo(c); }
  // wheel: rubber tyre with ridges, poking out of the slot between the buttons
  const RW = 0.85, rueda = new THREE.Group(); rueda.position.set(0, alto(0, 2.2) + 0.3 - RW, 2.2); R.add(rueda);
  { const t = new THREE.Mesh(new THREE.CylinderGeometry(RW, RW, 0.62, 64), goma); t.rotation.z = PI / 2; rueda.add(t);
    const est = new THREE.InstancedMesh(new THREE.BoxGeometry(0.58, 0.06, 0.09), goma, 36); const dm = new THREE.Object3D();
    for (let i = 0; i < 36; i++) { const a = (i / 36) * 2 * PI; dm.position.set(0, Math.cos(a) * (RW + 0.02), Math.sin(a) * (RW + 0.02)); dm.rotation.set(a, 0, 0); dm.updateMatrix(); est.setMatrixAt(i, dm.matrix); }
    rueda.add(est);
    for (const s of [-1, 1]) { const tapa = new THREE.Mesh(new THREE.CylinderGeometry(RW * 0.82, RW * 0.82, 0.04, 48), M.plastico); tapa.rotation.z = PI / 2; tapa.position.x = s * 0.33; rueda.add(tapa); } }
  const slot = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.4, 2.0, 3, 0.18), new THREE.MeshBasicMaterial({ color: 0x030304 })); slot.position.set(0, alto(0, 2.2) - 0.16, 2.2); R.add(slot);

  // ---------- base plate with the window of the sensor, and the teflon feet ----------
  const contorno = []; for (let i = 0; i <= 96; i++) { const zn = -1 + (2 * i) / 96; contorno.push([Wd(zn) * Math.sqrt(Math.max(0, 1 - zn * zn)) * 0.985, zn * LZ * 0.985]); }
  const shBase = new THREE.Shape(); contorno.forEach(([x, z], i) => (i ? shBase.lineTo(x, -z) : shBase.moveTo(x, -z))); for (let i = contorno.length - 1; i >= 0; i--) shBase.lineTo(-contorno[i][0], -contorno[i][1]);
  { const hueco = new THREE.Path(); const hw = 0.62, z0 = -0.05, z1 = 2.15, r = 0.5; hueco.moveTo(-hw + r, -z0); hueco.lineTo(hw - r, -z0); hueco.quadraticCurveTo(hw, -z0, hw, -z0 - r); hueco.lineTo(hw, -z1 + r); hueco.quadraticCurveTo(hw, -z1, hw - r, -z1); hueco.lineTo(-hw + r, -z1); hueco.quadraticCurveTo(-hw, -z1, -hw, -z1 + r); hueco.lineTo(-hw, -z0 - r); hueco.quadraticCurveTo(-hw, -z0, -hw + r, -z0); shBase.holes.push(hueco); }
  const base = new THREE.Mesh(C.slab(shBase, BASE - 0.06), baseMat); base.position.y = 0.05; R.add(base);
  for (const [z, w] of [[4.4, 2.6], [-4.7, 3.0]]) { const p = new THREE.Mesh(C.slab(C.rrShape(w, 0.7, 0.3), 0.05), teflon); p.position.set(0, 0.0, z); R.add(p); }

  // ---------- inside: board, sensor, lens with its prism, red LED, switches, cable ----------
  const PCB0 = 0.9, PCB1 = 1.06;
  const shP = new THREE.Shape(); [[-1.9, 3.9], [1.9, 3.9], [1.9, -2.4], [1.65, -2.4], [1.65, -3.6], [-1.65, -3.6], [-1.65, -2.4], [-1.9, -2.4]].forEach(([x, y], i) => (i ? shP.lineTo(x, y) : shP.moveTo(x, y)));
  { const h = new THREE.Path(); h.absarc(0, -0.6, 0.3, 0, 2 * PI, true); shP.holes.push(h); const w = new THREE.Path(); w.moveTo(-0.5, -1.2); w.lineTo(0.5, -1.2); w.lineTo(0.5, -3.2); w.lineTo(-0.5, -3.2); w.closePath(); shP.holes.push(w); }
  const placa = new THREE.Mesh(C.slab(shP, PCB1 - PCB0), M.pcb); placa.position.y = PCB0; R.add(placa);
  const sensor = new THREE.Group(); sensor.position.set(0, PCB1, 0.6); R.add(sensor);
  { const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.36, 1.25, 2, 0.05), negroChip); cuerpo.position.y = 0.18; sensor.add(cuerpo);
    const ventana = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), new THREE.MeshBasicMaterial({ color: 0x3a2a5a })); ventana.rotation.x = -PI / 2; ventana.position.y = 0.362; sensor.add(ventana);
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.12), plata); p.position.set(s * 0.56, 0.0, -0.45 + k * 0.3 + (s > 0 ? 0.15 : 0)); sensor.add(p); } }
  // lens: a plate over the window, the imaging bump under the sensor and the prism that bends the LED light down
  const lente = new THREE.Group(); R.add(lente);
  { const placaL = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.1, 3.1, 2, 0.04), policarb); placaL.position.set(0, BASE + 0.12, 1.05); lente.add(placaL);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.42, 40), policarb); col.position.set(0, BASE + 0.38, 0.6); lente.add(col);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 40, 16, 0, 2 * PI, 0, PI / 2), policarb); cap.rotation.x = PI; cap.position.set(0, BASE + 0.07, 0.6); cap.scale.y = 0.45; lente.add(cap);
    const pr = new THREE.Shape([new THREE.Vector2(1.45, 0.5), new THREE.Vector2(2.15, 0.5), new THREE.Vector2(2.15, 0.9), new THREE.Vector2(1.6, 0.9), new THREE.Vector2(1.3, 0.18)]);
    const prisma = new THREE.Mesh(new THREE.ExtrudeGeometry(pr, { depth: 0.7, bevelEnabled: false }), policarb); prisma.rotation.y = -PI / 2; prisma.position.set(0.35, 0, 0); lente.add(prisma); lente.userData.prisma = prisma; }
  // red LED lying under the board, pointing back (-z) into the prism
  const led = new THREE.Group(); led.position.set(0, 0.68, 2.9); R.add(led);
  const ledMat = new THREE.MeshPhysicalMaterial({ color: 0xd8333a, roughness: 0.05, transparent: true, opacity: 0.8, clearcoat: 1, emissive: 0xff2a20, emissiveIntensity: 0 });
  { const perfil = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.29, 0), new THREE.Vector2(0.29, 0.08), new THREE.Vector2(0.25, 0.08), new THREE.Vector2(0.25, 0.45)];
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * (PI / 2); perfil.push(new THREE.Vector2(0.25 * Math.cos(a) + 0.0005, 0.45 + 0.25 * Math.sin(a))); }
    const c = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40), ledMat); c.rotation.x = -PI / 2; led.add(c);
    for (const x of [-0.1, 0.1]) led.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v3(x, 0, 0.02), v3(x, 0, 0.25), v3(x, 0.05, 0.32), v3(x, PCB0 - 0.68, 0.34)]), 16, 0.025, 6, false), plata)); }
  // switches under the buttons: black body, red plunger, three legs, and inside a snapping metal leaf
  const SWX = [-1.25, 1.25], SWZ = 2.9;
  const lamMat = new THREE.MeshPhysicalMaterial({ color: 0xd9a66b, metalness: 1, roughness: 0.25, side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0 });
  const interruptores = SWX.map((x) => {
    const g = new THREE.Group(); g.position.set(x, PCB1, SWZ); R.add(g);
    const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.34, 1.25, 2, 0.04), negroChip); cuerpo.position.y = 0.17; g.add(cuerpo);
    const boton = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 20), new THREE.MeshPhysicalMaterial({ color: 0xc42a26, roughness: 0.4 })); boton.position.set(0, 0.4, -0.28); g.add(boton);
    for (const z of [-0.45, 0, 0.45]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.1), plata); p.position.set(0, -0.1, z); g.add(p); }
    // the leaf: rest (bowed up) and snapped (bowed down) shapes
    const hoja = (abajo) => { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, z = -0.5 + u, y = 0.12 + (abajo ? -0.07 : 0.07) * Math.sin(PI * u) + (abajo ? -0.04 : 0.03) * u; pts.push(v3(0, y, z)); } const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.022, 6, false), lamMat); g.add(m); return m; };
    const reposo = hoja(false), salta = hoja(true); salta.visible = false;
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.1), plata); c1.position.set(0, 0.26, 0.48); g.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.1), plata); c2.position.set(0, 0.035, 0.48); g.add(c2);
    return { g, boton, reposo, salta };
  });
  const enc = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.55, 0.6, 2, 0.04), negroChip); enc.position.set(0.55, PCB1 + 0.3, 2.2); R.add(enc);
  const eje = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12), plata); eje.rotation.z = PI / 2; eje.position.copy(rueda.position); R.add(eje);
  // cable leaving from the front
  const cableMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1b1e, roughness: 0.55, clearcoat: 0.3 });
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v3(0, 0.95, 5.5), v3(0, 0.95, 6.2), v3(0.2, 0.55, 7.6), v3(1.6, 0.18, 10), v3(4.5, 0.18, 14), v3(8, 0.18, 19)]), 120, 0.17, 12, false), cableMat); R.add(cable);
  const funda = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.8, 20), cableMat); funda.rotation.x = PI / 2; funda.position.set(0, 0.95, 5.85); R.add(funda);

  // light: the LED glow, the lit spot on the table and a red point light that colours the table
  const brilloLed = C.brillo(ROJO); brilloLed.scale.setScalar(1.2); brilloLed.position.set(0, 0, -0.75); led.add(brilloLed);
  const mancha = C.brillo(ROJO); mancha.scale.set(2.6, 2.6, 1); mancha.position.set(0, 0.06, 0.6); R.add(mancha);
  const luzRoja = new THREE.PointLight(0xff3020, 0, 9, 2); luzRoja.position.set(0, 0.25, 1.0); R.add(luzRoja);
  const fuga = C.brillo(ROJO); fuga.scale.set(9, 3, 1); fuga.position.set(0, 0.1, 0.6); R.add(fuga);

  // ---------- cross-sections (flat filled faces), like a diagram ----------
  const secciones = [], seccionesClic = [];
  const secMat = (c, op = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, emissive: c, emissiveIntensity: 0.42, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
  const SM = { pared: secMat(0xa8a39c), base: secMat(0x8e8a84), pcb: secMat(0x2f8f5c), cobre: secMat(0xe2aa52), chip: secMat(0x1b1c1f), lente: secMat(0xbfe0ff, 0.55), led: secMat(0xff5a50, 0.75), goma: secMat(0x6c7380), teflon: secMat(0xece8df), lamina: secMat(0xe9b373), rojo: secMat(0xd8392f) };
  function sec(pts, mat, lista, x, padre = R) {
    const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(-z, y)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); m.rotation.y = PI / 2; m.position.x = x;
    m.userData.noCortar = true; m.userData.sinBordes = true; m.visible = false; padre.add(m); lista.push(m); return m;
  }
  const rect = (z0, z1, y0, y1) => [[z0, y0], [z1, y0], [z1, y1], [z0, y1]];
  // the shell at a given x: outer curve and an inner one 0.16 below
  const perfilCasco = (x) => { const fuera = [], dentro = []; const zm = LZ * Math.sqrt(Math.max(0, 1 - (x / 3.1) ** 2)) * 0.995; for (let i = 0; i <= 80; i++) { const z = -zm + (2 * zm * i) / 80; const y = alto(x, z); fuera.push([z, y]); dentro.push([z, Math.max(BASE, y - 0.16)]); } return [...fuera, ...dentro.reverse()]; };
  {
    const L = secciones, x0 = 0.004;
    // the shell is cut where the wheel's slot is: two pieces
    const pc = perfilCasco(0); const n = pc.length / 2;
    const fuera = pc.slice(0, n), dentro = pc.slice(n).reverse();
    const trozo = (za, zb) => { const f = fuera.filter(([z]) => z >= za && z <= zb), d = dentro.filter(([z]) => z >= za && z <= zb); return [...f, ...d.reverse()]; };
    sec(trozo(-LZ, 1.2), SM.pared, L, x0); sec(trozo(3.2, LZ), SM.pared, L, x0);
    sec(rect(-LZ * 0.985, -0.05, 0.05, BASE), SM.base, L, x0); sec(rect(2.15, LZ * 0.985, 0.05, BASE), SM.base, L, x0);
    sec(rect(4.05, 4.75, 0, 0.05), SM.teflon, L, x0, R); sec(rect(-5.05, -4.35, 0, 0.05), SM.teflon, L, x0);
    sec(rect(-3.9, -0.9, PCB0, PCB1), SM.pcb, L, x0); sec(rect(-0.3, 1.2, PCB0, PCB1), SM.pcb, L, x0); sec(rect(3.2, 3.6, PCB0, PCB1), SM.pcb, L, x0);
    sec(rect(-3.9, 3.6, PCB1 - 0.012, PCB1 + 0.004).map(([z, y]) => [z, y]), SM.cobre, L, 0.006);
    sec(rect(-0.025, 1.225, PCB1, PCB1 + 0.36), SM.chip, L, 0.006);
    // lens: plate, column and the bump, and the prism
    sec(rect(-0.5, 2.6, BASE + 0.07, BASE + 0.17), SM.lente, L, 0.007);
    sec(rect(0.26, 0.94, BASE + 0.17, BASE + 0.59), SM.lente, L, 0.007);
    sec([[0.26, BASE + 0.07], [0.94, BASE + 0.07], [0.8, BASE - 0.02], [0.6, BASE - 0.06], [0.4, BASE - 0.02]], SM.lente, L, 0.007);
    sec([[1.45, 0.5], [2.15, 0.5], [2.15, 0.9], [1.6, 0.9], [1.3, 0.18]], SM.lente, L, 0.007);
    // LED profile, pointing -z
    sec([[2.9, 0.68 - 0.29], [2.82, 0.68 - 0.29], [2.82, 0.68 - 0.25], [2.45, 0.68 - 0.25], ...Array.from({ length: 11 }, (_, i) => { const a = -PI / 2 - (i / 10) * PI; return [2.45 + 0.25 * Math.cos(a), 0.68 + 0.25 * Math.sin(a)]; }), [2.82, 0.68 + 0.25], [2.82, 0.68 + 0.29], [2.9, 0.68 + 0.29]], SM.led, L, 0.008);
    // the wheel: a ring of rubber
    const ang = Array.from({ length: 49 }, (_, i) => (i / 48) * 2 * PI);
    sec([...ang.map((a) => [2.2 + RW * Math.cos(a), rueda.position.y + RW * Math.sin(a)]), ...ang.reverse().map((a) => [2.2 + RW * 0.55 * Math.cos(a), rueda.position.y + RW * 0.55 * Math.sin(a)])], SM.goma, L, 0.006);
  }
  {
    // at x = -1.25: the left switch, cut in half (its leaf moves with clic)
    const L = seccionesClic, xs = SWX[0], x0 = xs + 0.004;
    const pc = perfilCasco(xs); sec(pc, SM.pared, L, x0);
    sec(rect(-LZ * 0.9, LZ * 0.9, 0.05, BASE), SM.base, L, x0);
    sec(rect(-3.9, 3.6, PCB0, PCB1), SM.pcb, L, x0);
    const sw = interruptores[0];
    const cajaS = (pts, mat) => sec(pts.map(([z, y]) => [z + SWZ, y + PCB1]), mat, L, x0);
    cajaS([[-0.625, 0], [0.625, 0], [0.625, 0.34], [-0.625, 0.34], [-0.625, 0.3], [0.58, 0.3], [0.58, 0.04], [-0.58, 0.04], [-0.58, 0.3], [-0.625, 0.3]], SM.chip);
    sec(rect(-0.1, 0.1, -0.08, 0.08), SM.rojo, L, 0.006, sw.boton);
    void sw;
  }

  // ---------- controls ----------
  let kLuz = 0, kClic = 0, rafaga = 0, kHalo = 1;
  const sw0 = interruptores[0], botonY0 = sw0.boton.position.y;
  return {
    grupo: R,
    exterior: [cascoM, base, slot, ...surcos], cortables: [R],
    partes: {
      led: { obj: led, local: [0, 0, -0.4], radio: 0.5 },
      lente: { obj: lente, local: [0, BASE + 0.3, 0.6], radio: 0.7 },
      sensor: { obj: sensor, local: [0, 0.2, 0], radio: 0.8 },
      chip: { obj: sensor, local: [0, 0.36, 0], radio: 0.8 },
      prisma: { obj: lente, local: [0, 0.55, 1.75], radio: 0.6 },
      foco: { obj: R, local: [0, 0.03, 0.6], radio: 0.9 },
      base: { obj: R, local: [0, 0.05, 0], radio: 6 },
      ventana: { obj: R, local: [0, 0.05, 1.05], radio: 1.3 },
      rueda: { obj: rueda, local: [0, RW, 0], radio: 1.0 },
      boton: { obj: R, local: [-1.3, alto(-1.3, 3.2), 3.2], radio: 1.6 },
      interruptor: { obj: sw0.g, local: [0, 0.2, 0], radio: 0.8 },
      lamina: { obj: sw0.g, local: [0, 0.14, 0], radio: 0.6 },
      placa: { obj: placa, local: [0, 0.1, 0], radio: 4 },
      cable: { obj: R, local: [1.6, 0.2, 10], radio: 3 },
      arriba: { obj: R, local: [0, 1.6, 0], radio: 6.5 },
    },
    curvas: {},
    controles: {
      luz: (k) => { kLuz = k; },
      clic: (k) => { kClic = k; },
      avanza: (cm) => { R.position.z = (R.userData.z0 ?? (R.userData.z0 = R.position.z)) + cm; },
      seccion: (k) => { for (const m of secciones) m.visible = k > 0.5; },
      seccionClic: (k) => { for (const m of seccionesClic) m.visible = k > 0.5; },
      rafaga: (k) => { rafaga = k; },
      halo: (k) => { kHalo = k; },
    },
    defecto: { luz: 0, clic: 0, avanza: 0, seccion: 0, seccionClic: 0, rafaga: 0, halo: 1 },
    actualizar(t) {
      const fl = rafaga ? 0.55 + 0.45 * Math.abs(Math.sin(t * 22)) : 1, k = kLuz * fl;
      ledMat.emissiveIntensity = 2.2 * k; brilloLed.material.opacity = 0.8 * k; brilloLed.visible = k > 0.01;
      mancha.material.opacity = 0.9 * k * kHalo; mancha.visible = k * kHalo > 0.01; fuga.material.opacity = 0.35 * k * kHalo; fuga.visible = k * kHalo > 0.01; brilloLed.material.opacity = 0.8 * k * Math.max(0.3, kHalo);
      luzRoja.intensity = 25 * k * kHalo;
      // click: the plunger goes down and, past 60 %, the leaf snaps
      sw0.boton.position.y = botonY0 - 0.06 * kClic;
      const salta = kClic > 0.6; sw0.reposo.visible = !salta; sw0.salta.visible = salta; lamMat.emissiveIntensity = salta ? 0.6 : 0;
      void clamp; void hash;
    },
  };
}

// ======================================================================================================
export function mesa(THREE, C, X, M, { tipo = "madera", ancho = 36, fondo = 26 } = {}) {
  const { hash } = C;
  const g = new THREE.Group();
  if (tipo === "cristal") {
    const vidrio = new THREE.Mesh(new RoundedBoxGeometry(ancho, 0.8, fondo, 3, 0.2), new THREE.MeshPhysicalMaterial({ color: 0xbfe6dc, roughness: 0.04, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6, depthWrite: false }));
    vidrio.position.y = -0.4; g.add(vidrio);
    const canto = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(ancho, 0.8, fondo)), new THREE.LineBasicMaterial({ color: 0x8fd9c4, transparent: true, opacity: 0.55, toneMapped: false })); canto.position.y = -0.4; g.add(canto);
    // a few reflections on the top
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(ancho * 0.9, fondo * 0.9), new THREE.MeshBasicMaterial({ map: X.lienzo(512, 512, (gg, w, h) => { gg.clearRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const gr = gg.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, `rgba(220,245,240,${0.05 + 0.04 * hash(i)})`); gr.addColorStop(1, "rgba(255,255,255,0)"); gg.fillStyle = gr; gg.save(); gg.translate(w * hash(i * 3), 0); gg.rotate(0.5); gg.fillRect(0, -h, 30 + 40 * hash(i), 3 * h); gg.restore(); } }).tex, transparent: true, depthWrite: false, toneMapped: false }));
    refl.rotation.x = -PI_2(); refl.position.y = 0.005; g.add(refl);
    return { grupo: g, partes: { centro: { obj: g, local: [0, 0, 0], radio: ancho / 2 }, canto: { obj: g, local: [ancho / 2 - 2, -0.4, fondo / 2], radio: 2 } } };
  }
  const madera = X.lienzo(1024, 1024, (gg, w, h) => {
    gg.fillStyle = "#6b4a2e"; gg.fillRect(0, 0, w, h);
    for (let i = 0; i < 320; i++) {
      const y = hash(i) * h, a = 0.04 + hash(i + 50) * 0.09;
      gg.strokeStyle = hash(i + 9) > 0.5 ? `rgba(150,105,62,${a})` : `rgba(40,24,12,${a * 1.3})`;
      gg.lineWidth = 1 + hash(i + 3) * 5; gg.beginPath(); gg.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) gg.lineTo(x, y + Math.sin(x * 0.005 + i) * 10 * hash(i + 7));
      gg.stroke();
    }
  });
  X.rep(madera.tex, 1, 1);
  const tablero = new THREE.Mesh(new RoundedBoxGeometry(ancho, 2.4, fondo, 3, 0.3), new THREE.MeshPhysicalMaterial({ map: madera.tex, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }));
  tablero.position.y = -1.2; g.add(tablero);
  return { grupo: g, partes: { centro: { obj: g, local: [0, 0, 0], radio: ancho / 2 }, canto: { obj: g, local: [ancho / 2, -1.2, fondo / 2], radio: 3 } } };
}
const PI_2 = () => Math.PI / 2;

// ======================================================================================================
// a few millimetres of table seen very close: fibres and pores, lit by a grazing red light with real shadows
export function superficie(THREE, C, X, M) {
  const { clamp, hash, lerp } = C;
  const g = new THREE.Group();
  const S = 12, N = 280;
  const altoF = (x, y) => {
    let h = 0.34 * X.ruido(x * 0.3 + 3, y * 3.4, 1) + 0.16 * X.ruido(x * 0.9, y * 9.5, 2) + 0.05 * X.ruido(x * 4, y * 4, 3);
    for (let i = 0; i < 7; i++) { const px = (hash(i * 2.1) - 0.5) * S, py = (hash(i * 3.7) - 0.5) * S, r = 0.14 + 0.16 * hash(i * 5.3), d = Math.hypot((x - px) * 0.6, (y - py) * 1.6); if (d < r) h -= 0.2 * (1 - (d / r) ** 2); }
    return h;
  };
  const geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, H = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) { H[i] = altoF(p.getX(i), p.getZ(i)); p.setY(i, H[i]); }
  geo.computeVertexNormals();
  // shadows of a light coming from -x, 9° above the table: march towards the light on the height grid
  const tan = Math.tan((9 * Math.PI) / 180), paso = S / N, cols = N + 1;
  const base = new Float32Array(p.count * 3), sombra = new Float32Array(p.count);
  for (let j = 0; j < cols; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i; let s = 1;
    for (let d = 1; d < 60 && i - d >= 0; d++) { const hk = H[j * cols + i - d]; if (hk > H[k] + d * paso * tan) { s = 0.12; break; } }
    sombra[k] = s;
    const vx = p.getX(k), vz = p.getZ(k), n = 0.5 + 0.5 * X.ruido(vx * 0.5, vz * 6, 9);
    base[k * 3] = lerp(0.62, 0.8, n); base[k * 3 + 1] = lerp(0.48, 0.62, n); base[k * 3 + 2] = lerp(0.34, 0.45, n);
  }
  const col = new Float32Array(p.count * 3); col.set(base); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 });
  const malla = new THREE.Mesh(geo, mat); g.add(malla);
  const luz = new THREE.DirectionalLight(0xff3a2c, 0); luz.position.set(-30, 30 * tan, 0); luz.target.position.set(0, 0, 0); g.add(luz, luz.target);
  // the square the sensor sees (18 × 18 pixels)
  const marco = new THREE.Group(); g.add(marco);
  const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
  // a textured plane: an 18 × 18 grid with a thick border, floating just above the fibres
  const rejT = X.lienzo(720, 720, (gg, w, h) => { gg.clearRect(0, 0, w, h); gg.strokeStyle = "rgba(255,255,255,0.55)"; gg.lineWidth = 3; for (let k = 1; k < 18; k++) { const u = (k / 18) * w; gg.beginPath(); gg.moveTo(u, 0); gg.lineTo(u, h); gg.stroke(); gg.beginPath(); gg.moveTo(0, u); gg.lineTo(w, u); gg.stroke(); } gg.strokeStyle = "#ffffff"; gg.lineWidth = 14; gg.strokeRect(7, 7, w - 14, h - 14); }).tex;
  const rejM = new THREE.MeshBasicMaterial({ map: rejT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  { const pl = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), rejM); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.75; marco.add(pl); }
  let kL = -1, kM = 0;
  return {
    grupo: g,
    partes: {
      centro: { obj: g, local: [0, 0, 0], radio: S / 2 },
      fibra: { obj: g, local: [-2.2, altoF(-2.2, 1.4) + 0.05, 1.4], radio: 1 },
      grano: { obj: g, local: [(hash(2.1) - 0.5) * S, 0, (hash(3.7) - 0.5) * S], radio: 1 },
      marco: { obj: marco, local: [3, 0.75, -3], radio: 4.5 },
    },
    controles: { luz: (k) => { kL = k; }, marco: (k) => { kM = k; } },
    defecto: { luz: 0, marco: 0 },
    actualizar(t) {
      if (Math.abs(kL - (malla.userData.kHecho ?? -2)) > 1e-3) {
        malla.userData.kHecho = kL;
        for (let k = 0; k < sombra.length; k++) { const s = lerp(1, sombra[k], clamp(kL)) * lerp(1, 0.45, clamp(kL)); col[k * 3] = base[k * 3] * s; col[k * 3 + 1] = base[k * 3 + 1] * s; col[k * 3 + 2] = base[k * 3 + 2] * s; }
        geo.attributes.color.needsUpdate = true;
      }
      luz.intensity = 9 * clamp(kL);
      rejM.opacity = kM; marco.visible = kM > 0.01; void lm;
      void t;
    },
  };
}

// ======================================================================================================
// the photos of the sensor: two 18 × 18 tiles (ANTES and AHORA), 1 unit = 1 pixel
export function fotosRaton(THREE, C, X, M) {
  const { clamp, lerp, ease, hash, v3 } = C;
  const g = new THREE.Group();
  const N = 18, SH = 2; // AHORA = ANTES moved 2 pixels back (down on screen)
  const P = (i, j) => clamp(0.48 + 0.42 * (X.ruido(i * 0.42 + 2, j * 0.24 + 1, 4) - 0.5) * 2 + 0.22 * (X.ruido(i * 1.3, j * 1.1, 6) - 0.5) - (X.ruido(i * 0.8 + 9, j * 0.8, 8) > 0.78 ? 0.35 : 0));
  function loseta(f) {
    const im = new THREE.InstancedMesh(new RoundedBoxGeometry(0.92, 1, 0.92, 2, 0.08), new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }), N * N);
    const vals = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = f(i, j); vals.push(v); im.setColorAt(j * N + i, new THREE.Color().setScalar(0.08 + 0.85 * v * v)); }
    im.instanceColor.needsUpdate = true;
    const grupo = new THREE.Group(); grupo.add(im);
    const marco = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(N + 0.4, N + 0.4, 0.05)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, toneMapped: false }));
    grupo.add(marco);
    return { grupo, im, vals, marco, hecho: -1 };
  }
  const A = loseta((i, j) => P(i, j + SH)), B = loseta((i, j) => P(i, j));
  // glass photos: almost uniform grey
  const Ag = loseta((i, j) => 0.5 + 0.03 * (hash(i * 7.1 + j * 3.3) - 0.5)), Bg = loseta((i, j) => 0.5 + 0.03 * (hash(i * 5.7 + j * 9.1) - 0.5));
  const AX = -11, BX = 11;
  for (const L of [A, Ag]) { L.grupo.position.x = AX; g.add(L.grupo); }
  for (const L of [B, Bg]) { L.grupo.position.x = BX; g.add(L.grupo); }
  const dm = new THREE.Object3D();
  function poner(L, relieve) {
    if (Math.abs(L.hecho - relieve) < 1e-3) return; L.hecho = relieve;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = L.vals[j * N + i], hz = 0.25 + relieve * v * 3.2; dm.position.set(i - (N - 1) / 2, (N - 1) / 2 - j, hz / 2); dm.scale.set(1, 1, 1); dm.rotation.set(Math.PI / 2, 0, 0); dm.scale.set(1, hz, 1); dm.updateMatrix(); L.im.setMatrixAt(j * N + i, dm.matrix); }
    L.im.instanceMatrix.needsUpdate = true;
  }
  // match frame, arrow, burst of photos behind ANTES
  const verde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(N + 1.2, N + 1.2, 0.1)), new THREE.LineBasicMaterial({ color: 0x5cff9a, transparent: true, opacity: 0, toneMapped: false })); g.add(verde);
  const flechaG = new THREE.Group(); g.add(flechaG);
  { const fm = new THREE.MeshBasicMaterial({ color: 0xffb347, toneMapped: false, transparent: true });
    const vara = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 0.3), fm); vara.position.y = 0; flechaG.add(vara);
    const punta = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2, 3), fm); punta.rotation.z = Math.PI; punta.position.y = -4; flechaG.add(punta); flechaG.userData.m = fm; }
  flechaG.position.set(BX + N / 2 + 1.8, 0, 1);
  const pila = new THREE.Group(); g.add(pila);
  const pilaMats = [];
  for (let i = 0; i < 9; i++) { const m = new THREE.MeshBasicMaterial({ color: 0xc8d4e6, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }); const q = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(N, N)), new THREE.LineBasicMaterial({ color: 0xc8d4e6, transparent: true, opacity: 0, toneMapped: false })); const f = new THREE.Mesh(new THREE.PlaneGeometry(N, N), m); const gq = new THREE.Group(); gq.add(f, q); gq.position.set(AX - i * 0.9, i * 0.6, -1.2 - i * 1.6); pila.add(gq); pilaMats.push([m, q.material]); }
  const flash = C.brillo("255,90,70"); flash.scale.set(30, 30, 1); flash.position.set(AX, 0, 2); g.add(flash);
  let kR = 0, kD = 0, kE = 0, kF = 0, igu = 0, kRaf = 0;
  const punto = new THREE.Object3D(); g.add(punto);
  return {
    grupo: g,
    partes: {
      antes: { obj: g, local: [AX, N / 2 + 0.5, 0], radio: N * 0.7 },
      ahora: { obj: B.grupo, local: [0, N / 2 + 0.5, 0], radio: N * 0.7 },
      antesC: { obj: g, local: [AX, 0, 1], radio: N * 0.62 },
      ahoraC: { obj: B.grupo, local: [0, 0, 1], radio: N * 0.62 },
      centro: { obj: g, local: [0, 0, 0], radio: 22 },
      flecha: { obj: flechaG, local: [0, 0, 0], radio: 4 },
      pila: { obj: g, local: [AX - 3.5, 2.5, -6], radio: 16 },
    },
    controles: { relieve: (k) => { kR = k; }, desliza: (k) => { kD = k; }, encaja: (k) => { kE = k; }, flecha: (k) => { kF = k; }, iguales: (k) => { igu = k; }, rafaga: (k) => { kRaf = k; } },
    defecto: { relieve: 0, desliza: 0, encaja: 0, flecha: 0, iguales: 0, rafaga: 0 },
    actualizar(t) {
      const vA = igu ? Ag : A, vB = igu ? Bg : B;
      A.grupo.visible = B.grupo.visible = !igu; Ag.grupo.visible = Bg.grupo.visible = !!igu;
      poner(vA, kR); poner(vB, kR);
      // search: AHORA flies over ANTES, tries a few places and locks 2 pixels down (glass: it never locks)
      const k = ease(clamp(kD)), dest = igu ? v3(AX, 0, 3.6) : v3(AX, SH, 3.6);
      const tanteo = igu ? v3(Math.sin(t * 2.3) * 2.2, Math.cos(t * 1.9) * 2.2, 0) : v3(Math.sin(k * 9) * 2.4 * (1 - k), Math.cos(k * 7) * 2.0 * (1 - k), 0);
      vB.grupo.position.set(lerp(BX, dest.x, k) + tanteo.x * Math.min(1, k * 3), lerp(0, dest.y, k) + tanteo.y * Math.min(1, k * 3), lerp(0, dest.z, k));
      vB.im.material.transparent = kD > 0.01; vB.im.material.opacity = 1 - 0.45 * k;
      verde.material.opacity = kE * (igu ? 0 : 1); verde.position.set(AX, SH / 2, 3.7); verde.visible = kE > 0.01 && !igu;
      flechaG.visible = kF > 0.01; flechaG.userData.m.opacity = kF; flechaG.scale.setScalar(0.6 + 0.4 * kF);
      // burst
      pila.visible = kRaf > 0.01;
      pilaMats.forEach(([m, l], i) => { const f = ((t * 6 - i * 0.35) % 3 + 3) % 3; const a = kRaf * Math.max(0, 1 - f / 3) * 0.6; m.opacity = 0.12 * a; l.opacity = a; });
      flash.visible = kRaf > 0.01; flash.material.opacity = kRaf * 0.35 * Math.max(0, Math.sin(t * 18));
      void punto;
    },
  };
}

// ======================================================================================================
export function monitor(THREE, C, X, M) {
  const { clamp, lerp, ease } = C;
  const g = new THREE.Group();
  const AN = 54, AL = 32, Y0 = 14;
  const marcoM = new THREE.MeshPhysicalMaterial({ color: 0x17181c, roughness: 0.35, metalness: 0.4, clearcoat: 0.6 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(AN, AL, 1.6, 4, 0.4), marcoM); cuerpo.position.set(0, Y0 + AL / 2, -0.8); g.add(cuerpo);
  const pie = new THREE.Mesh(new RoundedBoxGeometry(4, Y0 + 4, 1.4, 3, 0.4), new THREE.MeshPhysicalMaterial({ color: 0xa9adb3, metalness: 1, roughness: 0.3, map: X.rep(X.tex.metal({ color: "#a6aab0" }), 1, 2) })); pie.position.set(0, (Y0 + 4) / 2, -3); pie.rotation.x = -0.12; g.add(pie);
  const peana = new THREE.Mesh(new RoundedBoxGeometry(20, 0.8, 14, 3, 0.35), pie.material); peana.position.set(0, 0.4, -2); g.add(peana);
  const SW = AN - 1.4, SH = AL - 1.4;
  const lz = X.lienzo(1600, 900, () => {});
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: lz.tex, toneMapped: false, color: 0xd8d8d8 })); pant.position.set(0, Y0 + AL / 2, 0.25); pant.userData.sinBordes = true; g.add(pant);
  const ruta = (u) => [lerp(0.28, 0.66, ease(u)), lerp(0.66, 0.38, u) + 0.06 * Math.sin(u * Math.PI)];
  let clave = null, kC = 0, kE = 0;
  function pintar(u, est) {
    const key = `${u.toFixed(3)}|${est.toFixed(2)}`; if (key === clave) return; clave = key;
    const gg = lz.g, w = 1600, h = 900;
    const f = gg.createLinearGradient(0, 0, w, h); f.addColorStop(0, "#1b3a4a"); f.addColorStop(1, "#0e1d2a"); gg.fillStyle = f; gg.fillRect(0, 0, w, h);
    gg.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 6; i++) { gg.beginPath(); gg.arc(w * (0.2 + i * 0.13), h * 0.9, 300 + i * 40, 0, 2 * Math.PI); gg.fill(); }
    // a window with a document
    gg.fillStyle = "#f3f4f6"; gg.beginPath(); gg.roundRect(380, 140, 840, 560, 16); gg.fill();
    gg.fillStyle = "#dfe3e8"; gg.beginPath(); gg.roundRect(380, 140, 840, 54, [16, 16, 0, 0]); gg.fill();
    for (const [x, c] of [[410, "#ef5b5b"], [440, "#f2b84b"], [470, "#5cc46a"]]) { gg.fillStyle = c; gg.beginPath(); gg.arc(x, 167, 9, 0, 2 * Math.PI); gg.fill(); }
    gg.fillStyle = "#3a4048"; gg.font = '700 26px "Inter", sans-serif'; gg.textAlign = "center"; gg.fillText("Documento", 800, 176);
    gg.textAlign = "left"; gg.font = '700 36px "Inter", sans-serif'; gg.fillText("Cómo funciona un ratón", 440, 270);
    gg.fillStyle = "#9aa1aa"; for (let i = 0; i < 9; i++) gg.fillRect(440, 320 + i * 38, 640 - (i % 3) * 90, 12);
    // dock
    gg.fillStyle = "rgba(255,255,255,0.18)"; gg.beginPath(); gg.roundRect(560, 800, 480, 76, 20); gg.fill();
    ["#5aa0f2", "#f2b84b", "#5cc46a", "#ef5b5b", "#b07cf2"].forEach((c, i) => { gg.fillStyle = c; gg.beginPath(); gg.roundRect(584 + i * 90, 812, 56, 52, 12); gg.fill(); });
    // arrow and its trail
    const flecha = (x, y, a) => { gg.save(); gg.globalAlpha = a; gg.translate(x, y); gg.fillStyle = "#ffffff"; gg.strokeStyle = "#111"; gg.lineWidth = 3; gg.beginPath(); gg.moveTo(0, 0); gg.lineTo(0, 46); gg.lineTo(11, 35); gg.lineTo(20, 55); gg.lineTo(28, 51); gg.lineTo(19, 32); gg.lineTo(34, 32); gg.closePath(); gg.fill(); gg.stroke(); gg.restore(); };
    if (est > 0.01) for (let i = 6; i >= 1; i--) { const uu = clamp(u - i * 0.03); const [x, y] = ruta(uu); flecha(x * w, y * h, 0.12 * est * (1 - i / 7)); }
    const [x, y] = ruta(u); flecha(x * w, y * h, 1);
    lz.tex.needsUpdate = true;
  }
  const punta = new THREE.Object3D(); pant.add(punta);
  return {
    grupo: g,
    partes: { pantalla: { obj: pant, local: [0, 0, 0], radio: AN / 2 }, flecha: { obj: punta, local: [0, 0, 0], radio: 4 } },
    controles: { cursor: (k) => { kC = k; }, estela: (k) => { kE = k; } },
    defecto: { cursor: 0, estela: 0 },
    actualizar(t) {
      pintar(clamp(kC), kE);
      const [x, y] = ruta(clamp(kC)); punta.position.set((x - 0.5) * SW + 0.4, (0.5 - y) * SH - 0.6, 0.05);
      void t;
    },
  };
}
