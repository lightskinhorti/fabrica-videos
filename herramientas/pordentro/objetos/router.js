// El router de casa (hecho con 18-router-noche, 20 nov). Sin marcas ni letras en los chips. Ilustración simplificada:
// un router blanco de pie, con dos antenas y tres luces delante; con rayosX se ve la placa verde.
//
// routerCasa(): cuerpo de 11 × 15 × 3,6 cm (cara delantera hacia +z), antenas arriba, luces delante. Con rayosX la
//   carcasa se vuelve transparente y se ve la placa (cara hacia +z) con: el chip principal con disipador de aletas,
//   el chip del wifi, dos memorias, los puertos de red abajo, la clavija de la corriente, condensadores y los cables
//   que suben a las antenas.
//   Mandos (de 0 a 1):
//     encendido  1 = luces encendidas y chip activo; 0 = todo apagado (luces, brillo del chip y ondas)
//     actividad  cuánto se nota el chip trabajando (brillo y pulsos de luz de la clavija al chip)
//     ondas      las ondas del wifi que salen de las antenas (aros que crecen y se apagan)
//   Partes: antenaI, antenaD, chip, wifi, memorias, puertos, clavija, luces, placa, carcasa, centro.
//   Curvas (para flujos): corriente (clavija -> chip).

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PI = Math.PI;

export function routerCasa(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const exterior = [], interior = [];

  const blanco = new THREE.MeshPhysicalMaterial({ color: 0xb4bac4, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.45 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(11, 15, 3.6, 5, 0.7), blanco); R.add(cuerpo); exterior.push(cuerpo);
  // ventilation slots on the front (thin dark boxes)
  const ranura = new THREE.MeshBasicMaterial({ color: 0x1b1e24 });
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.14, 0.06), ranura); s.position.set(0, 4.6 - i * 0.55, 1.82); R.add(s); exterior.push(s); }
  // feet
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.7, 4.4, 2, 0.2), M.caucho); p.position.set(s * 3.4, -7.7, 0); R.add(p); }

  // ---------- antennas (they stay visible in x-ray) ----------
  const antM = new THREE.MeshPhysicalMaterial({ color: 0x23262c, roughness: 0.5, clearcoat: 0.4 });
  const antenas = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(s * 3.6, 7.2, -0.4); g.rotation.z = -s * 0.14; R.add(g);
    const bisagra = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), antM); g.add(bisagra);
    const varilla = new THREE.Mesh(new RoundedBoxGeometry(0.9, 10.5, 0.5, 3, 0.22), antM); varilla.position.y = 5.6; g.add(varilla);
    antenas.push(g);
  }

  // ---------- front lights ----------
  const luces = [];
  const colores = [0x6dff9a, 0x6dff9a, 0x6fc8ff];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: colores[i], toneMapped: false, transparent: true }));
    m.position.set(-1.6 + i * 1.6, -5.4, 1.85); m.userData.noCortar = true; R.add(m); luces.push(m);
    const h = C.brillo(i === 2 ? "111,200,255" : "109,255,154"); h.scale.setScalar(2.4); h.position.copy(m.position); h.position.z += 0.1; h.userData.noCortar = true; R.add(h); m.userData.halo = h;
  }

  // ---------- board ----------
  const W = 520, H = 640, X0 = -4.5, X1 = 4.5, Y0 = -5.7, Y1 = 5.7;
  const px = (x) => ((x - X0) / (X1 - X0)) * W, py = (y) => ((Y1 - y) / (Y1 - Y0)) * H;
  const tex = X.lienzo(W, H, (g) => {
    g.fillStyle = "#14523b"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + 0.03 * hash(i)})`; g.fillRect(hash(i * 1.7) * W, hash(i * 2.9) * H, 1 + hash(i) * 3, 1); }
    g.strokeStyle = "rgba(150,215,170,0.5)"; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round";
    const linea = (...p) => { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(px(x), py(y)) : g.moveTo(px(x), py(y)))); g.stroke(); };
    linea([-2.2, 0.8], [-2.2, -1.6], [-3.4, -2.6]); linea([-0.4, 1.2], [0.8, 0.2], [2.6, 0.2]); linea([1.3, 2.6], [3.2, 2.6], [3.2, 4.4]);
    linea([-1.3, 3.2], [-1.3, 4.8], [-2.8, 4.8]); linea([2.4, -0.6], [2.4, -3.6]); linea([-1.0, -0.4], [-1.0, -3.8], [0.4, -3.8]);
    g.fillStyle = "rgba(220,190,120,0.8)"; for (let i = 0; i < 34; i++) { g.beginPath(); g.arc(px(-4.1 + hash(i * 3.3) * 8.2), py(-5.2 + hash(i * 5.1) * 10.4), 3.2, 0, 7); g.fill(); }
  }).tex;
  const placa = new THREE.Mesh(new THREE.BoxGeometry(9, 11.4, 0.14), new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: tex, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
  placa.position.set(0, 0, -0.5); R.add(placa); interior.push(placa);
  const Z = -0.43;
  const put = (m, x, y, z) => { m.position.set(x, y, Z + z); R.add(m); interior.push(m); return m; };
  const negro = new THREE.MeshPhysicalMaterial({ color: 0x131419, roughness: 0.42, clearcoat: 0.5 });

  // main chip with aluminium heatsink (fins)
  const chip = new THREE.Group(); chip.position.set(-0.6, 1.6, Z); R.add(chip); interior.push(chip);
  const baseChip = new THREE.Mesh(new RoundedBoxGeometry(3.4, 3.4, 0.3, 2, 0.05), negro); baseChip.position.z = 0.15; chip.add(baseChip);
  for (let i = 0; i < 8; i++) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.0, 0.9), M.aluminio); a.position.set(-1.3 + i * 0.37, 0, 0.75); chip.add(a); }
  // wifi chip, two memories
  const wifi = put(new THREE.Mesh(new RoundedBoxGeometry(1.9, 1.9, 0.22, 2, 0.04), negro), 2.6, 3.9, 0.11);
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) put(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), M.acero), 2.6 - 0.8 + i * 0.4, 3.9 + s * 1.02, 0.03);
  const mem = new THREE.Group(); mem.position.z = Z; R.add(mem); interior.push(mem);
  for (const [x, y] of [[-3.0, -0.6], [-3.0, -2.0]]) { const m = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.0, 0.2, 2, 0.03), negro); m.position.set(x, y, 0.1); mem.add(m); }
  // network ports along the bottom edge
  const puertos = new THREE.Group(); puertos.position.z = Z; R.add(puertos); interior.push(puertos);
  for (let i = 0; i < 4; i++) {
    const caja = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.2), M.acero); caja.position.set(-3.1 + i * 1.7, -4.6, 0.6); puertos.add(caja);
    const hueco = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.1), M.grafito); hueco.position.set(-3.1 + i * 1.7, -4.55, 1.2); puertos.add(hueco);
  }
  // power jack (bottom right), capacitors
  const clavija = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 20), M.grafito); clavija.rotation.x = PI / 2; put(clavija, 3.6, -2.2, 0.7);
  for (const [x, y, r] of [[1.6, -1.0, 0.45], [2.7, -1.4, 0.4], [0.7, -2.6, 0.38]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.9, 20), new THREE.MeshPhysicalMaterial({ color: 0x1b2a55, roughness: 0.4, clearcoat: 0.6 })); c.rotation.x = PI / 2; put(c, x, y, 0.45);
  }
  // little copper wires from the wifi chip up to each antenna (inside the shell)
  const cobreM = M.cobre;
  for (const s of [-1, 1]) {
    const cur = new THREE.CatmullRomCurve3([v3(s * 1.6 + 1.0, 4.9, Z + 0.2), v3(s * 3.2, 6.2, Z + 0.1), v3(s * 3.6, 7.0, -0.4)]);
    const tubo = new THREE.Mesh(new THREE.TubeGeometry(cur, 16, 0.08, 6), cobreM); R.add(tubo); interior.push(tubo);
  }

  // ---------- glows and waves ----------
  const haloChip = C.brillo("255,170,70"); haloChip.scale.setScalar(5.5); haloChip.position.set(-0.6, 1.6, Z + 1.3); haloChip.userData.noCortar = true; R.add(haloChip); interior.push(haloChip);
  const NPul = 5, pulsos = [];
  const bola = new THREE.SphereGeometry(0.1, 10, 8);
  for (let i = 0; i < NPul; i++) {
    const m = new THREE.Mesh(bola, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.25, 0.45), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    m.userData.noCortar = true; m.visible = false; R.add(m); interior.push(m); pulsos.push(m);
  }
  const curvas = { corriente: { obj: R, puntos: [v3(3.6, -2.2, Z + 0.7), v3(3.0, -1.2, Z + 0.3), v3(1.6, 0.0, Z + 0.3), v3(0.2, 1.2, Z + 0.4), v3(-0.6, 1.6, Z + 0.9)] } };
  const curvaC = new THREE.CatmullRomCurve3(curvas.corriente.puntos, false, "catmullrom", 0.1);

  const aros = [], NA = 4;
  const geoAro = new THREE.RingGeometry(0.93, 1, 48);
  for (let a = 0; a < 2; a++) for (let i = 0; i < NA; i++) for (let o = 0; o < 2; o++) {
    const m = new THREE.Mesh(geoAro, new THREE.MeshBasicMaterial({ color: 0x6fdcff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    if (o) m.rotation.y = PI / 2;
    m.userData.noCortar = true; m.visible = false; R.add(m); aros.push({ m, a, i });
  }
  const punta = (a) => v3((a ? 1 : -1) * (3.6 + 11.0 * Math.sin(0.14)), 7.2 + 11.0 * Math.cos(0.14) - 0.4, -0.4);

  // ---------- animation ----------
  const st = { encendido: 1, actividad: 1, ondas: 0 };
  function actualizar(t) {
    const e = st.encendido, act = st.actividad * e;
    const parpadeo = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 3.1);
    luces.forEach((m, i) => {
      const k = e * (i === 1 ? parpadeo : 1);
      m.material.opacity = k; m.visible = k > 0.02; m.userData.halo.material.opacity = 0.7 * k; m.userData.halo.visible = k > 0.02;
    });
    haloChip.material.opacity = 0.7 * act * (0.8 + 0.2 * Math.sin(t * 7)); haloChip.visible = act > 0.02;
    for (let i = 0; i < NPul; i++) {
      const m = pulsos[i], u = (t * 0.6 + i / NPul) % 1;
      m.visible = act > 0.05; if (!m.visible) continue;
      m.position.copy(curvaC.getPoint(u)); m.material.opacity = act * Math.sin(PI * u) ** 0.6;
    }
    const vo = st.ondas * e;
    for (const { m, a, i } of aros) {
      const u = (t * 0.55 + i / NA) % 1;
      m.visible = vo > 0.02; if (!m.visible) continue;
      m.position.copy(punta(a)); m.scale.setScalar(0.8 + u * 8.5); m.material.opacity = vo * 0.8 * (1 - u) * (1 - u);
    }
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    exterior, interior,
    partes: {
      antenaI: pl([punta(0).x * 0.8, 12.5, -0.4], 3.2), antenaD: pl([punta(1).x * 0.8, 12.5, -0.4], 3.2), chip: pl([-0.6, 1.6, Z + 0.7], 2.3), wifi: pl([2.6, 3.9, Z + 0.15], 1.5),
      memorias: pl([-3.0, -1.3, Z + 0.1], 1.6), puertos: pl([-1.2, -4.6, Z + 0.6], 3.8), clavija: pl([3.6, -2.2, Z + 0.7], 1.1), luces: pl([0, -5.4, 1.85], 3.0),
      placa: pl([0, 0, -0.5], 6.0), carcasa: pl([0, 0, 0], 8.5), centro: pl([0, 2.5, 0], 9.5),
    },
    caja: [[-5.6, -8.1, -2.0], [5.6, 13.0, 2.0]],
    curvas,
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { encendido: 1, actividad: 1, ondas: 0 },
    actualizar,
  };
}
