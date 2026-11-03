// Magnetrón (sacado de 07-microondas): ánodo de cobre con 10 aletas y anillos, cátodo de wolframio que brilla,
// piezas polares, imanes de anillo de ferrita, aletas de refrigeración, yugo de acero, salida con aislador
// cerámico y antena, y caja de filtro con dos bobinas. Mide unos 8,4 × 10 cm (esc = 1).
// Mandos: abre (0..1, sube la tapa: imán, yugo, aislador y antena), filamento (brillo del cátodo),
//         electrones (0..1, nube de electrones que gira; anímala con actualizar).
// Partes: anodo, iman, catodo, cavidad, antena, aletas, filtro.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function magnetron(THREE, C, X, M, { esc = 1 } = {}) {
  const { v3, hash } = C;
  const PI = Math.PI, v2 = (x, y) => new THREE.Vector2(x, y), frac = (x) => x - Math.floor(x);
  const g = new THREE.Group(); g.scale.setScalar(esc);
  const tubo = new THREE.Mesh(new THREE.LatheGeometry([v2(1.5, -1.2), v2(2.4, -1.2), v2(2.4, 1.2), v2(1.5, 1.2), v2(1.5, -1.2)], 96), M.cobre); g.add(tubo);
  const alaGeo = new RoundedBoxGeometry(1.05, 2.4, 0.2, 2, 0.04);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * 2 * PI; const m = new THREE.Mesh(alaGeo, M.cobre); m.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02); m.rotation.y = -a; g.add(m); }
  for (const [r, y] of [[0.78, 1.25], [1.18, 1.25], [0.78, -1.25], [1.18, -1.25]]) { const s = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 8, 96), M.cobre); s.rotation.x = PI / 2; s.position.y = y; g.add(s); }
  class Helice extends THREE.Curve { getPoint(u, out = new THREE.Vector3()) { const a = u * 2 * PI * 9; return out.set(Math.cos(a) * 0.2, -1.25 + 2.5 * u, Math.sin(a) * 0.2); } }
  const fil = new THREE.Mesh(new THREE.TubeGeometry(new Helice(), 420, 0.032, 6, false), new THREE.MeshStandardMaterial({ color: 0xffc080, emissive: 0xff7a2a, emissiveIntensity: 1.3, roughness: 0.4 }));
  fil.userData.noCortar = true; g.add(fil);
  for (const y of [-1.33, 1.33]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 40), M.aceroOsc); s.position.y = y; g.add(s); }
  const vara = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 12), M.aceroOsc); vara.position.y = -3.4; g.add(vara);
  const pol1 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.55, 0.9, 64, 1, true), M.aceroOsc); pol1.position.y = 1.7; g.add(pol1);
  const pol2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.5, 0.9, 64, 1, true), M.aceroOsc); pol2.position.y = -1.7; g.add(pol2);
  const anillo = [v2(1.0, -0.5), v2(2.7, -0.5), v2(2.7, 0.5), v2(1.0, 0.5), v2(1.0, -0.5)];
  const imanSup = new THREE.Mesh(new THREE.LatheGeometry(anillo, 96), M.ferrita); imanSup.position.y = 2.7; g.add(imanSup);
  const imanInf = new THREE.Mesh(new THREE.LatheGeometry(anillo, 96), M.ferrita); imanInf.position.y = -2.7; g.add(imanInf);
  const sh = C.rrShape(7.6, 7.6, 0.5); const hole = new THREE.Path(); hole.absarc(0, 0, 2.42, 0, 2 * PI, true); sh.holes.push(hole);
  const aletaGeo = C.slab(sh, 0.07);
  const aletas = new THREE.Group(); g.add(aletas);
  for (let k = 0; k < 5; k++) { const a = new THREE.Mesh(aletaGeo, M.aluminio); a.position.y = -1.05 + k * 0.5; aletas.add(a); }
  const ysup = new THREE.Mesh(new RoundedBoxGeometry(8.4, 0.32, 8.4, 2, 0.1), M.cincado); ysup.position.y = 3.36; g.add(ysup);
  const yinf = new THREE.Mesh(new RoundedBoxGeometry(8.4, 0.32, 8.4, 2, 0.1), M.cincado); yinf.position.y = -3.36; g.add(yinf);
  for (const x of [-4.06, 4.06]) { const s = new THREE.Mesh(new RoundedBoxGeometry(0.3, 6.7, 8.4, 2, 0.1), M.cincado); s.position.x = x; g.add(s); }
  const ais = new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length: 13 }, (_, i) => v2(i % 2 ? 0.66 : 0.74, 3.5 + i * 0.1)).concat([v2(0.001, 4.7)]), 64), M.ceramica); g.add(ais);
  const junta = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.12, 10, 64), M.aluminio); junta.rotation.x = PI / 2; junta.position.y = 3.6; g.add(junta);
  const capu = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.6, 48), M.aluminio); capu.position.y = 5.0; g.add(capu);
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 24, 0, 2 * PI, 0, PI / 2), M.aluminio); cupula.position.y = 0.3; capu.add(cupula);
  const filtro = new THREE.Mesh(new RoundedBoxGeometry(4.6, 2.4, 3.6, 3, 0.2), M.cincado); filtro.position.y = -4.75; g.add(filtro);
  for (const x of [-0.9, 0.9]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.0, 20), M.ceramica); t.rotation.x = PI / 2; t.position.set(x, -4.9, 2.2); g.add(t);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.8), M.aluminio); p.position.set(x, -4.9, 2.9); g.add(p);
    class Bob extends THREE.Curve { getPoint(u, out = new THREE.Vector3()) { const a = u * 2 * PI * 7; return out.set(x + Math.cos(a) * 0.3, -4.2 + Math.sin(a) * 0.3, -1.0 + 2.0 * u); } }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new Bob(), 300, 0.05, 6, false), M.cobre));
  }
  // electrons: five rotating spokes between the cathode and the vane tips
  const NE = 900, ePos = new Float32Array(NE * 3);
  const eGeo = new THREE.BufferGeometry(); eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  const elec = new THREE.Points(eGeo, new THREE.PointsMaterial({ map: M.brilloTex("255,255,255"), size: 0.075, color: 0x9fd0ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  elec.frustumCulled = false; elec.visible = false; g.add(elec);
  const ePunto = new THREE.Object3D(); g.add(ePunto);
  let kElec = 0;
  function electrones(t) {
    const W0 = 1.6;
    for (let i = 0; i < NE; i++) {
      const s = i % 5, u = frac(hash(i * 1.7) + t * 0.45), base = i < 160;
      const r = base ? 0.23 + 0.06 * hash(i * 2.3) : 0.24 + u * 0.27;
      const a = base ? hash(i * 3.1) * 2 * PI + t * W0 : (s / 5) * 2 * PI + t * W0 - 1.5 * u + (hash(i * 3.7) - 0.5) * 0.42 * (1 - 0.4 * u);
      ePos[i * 3] = Math.cos(a) * r; ePos[i * 3 + 1] = (hash(i * 5.9) - 0.5) * 2.3; ePos[i * 3 + 2] = Math.sin(a) * r;
    }
    eGeo.attributes.position.needsUpdate = true;
    const a = t * W0 - 0.7; ePunto.position.set(Math.cos(a) * 0.4, 1.0, Math.sin(a) * 0.4);
  }
  const tapa = [[imanSup, 2.7], [ysup, 3.36], [ais, 0], [junta, 3.6], [capu, 5.0]];
  return {
    grupo: g,
    partes: {
      anodo: { obj: g, local: [2.2, -0.6, -0.4], radio: 2.4 },
      iman: { obj: g, local: [2.0, 2.95, -0.6], radio: 2.7 },
      catodo: { obj: g, local: [0.2, 0.9, 0.1], radio: 0.6 },
      cavidad: { obj: g, local: [Math.cos(0.31) * 1.1, 1.25, Math.sin(0.31) * 1.1], radio: 0.6 },
      antena: { obj: g, local: [0.4, 5.6, 0], radio: 0.8 },
      aletas: { obj: g, local: [3.8, 0, 0], radio: 3.8 },
      filtro: { obj: g, local: [0, -4.75, 1.8], radio: 2.4 },
      electron: { obj: ePunto, local: [0, 0, 0], radio: 0.3 },
    },
    controles: {
      abre: (k) => { for (const [o, y] of tapa) o.position.y = y + k * 4.5; },
      filamento: (k, t) => { fil.material.emissiveIntensity = k + 0.15 * Math.sin((t || 0) * 7); },
      electrones: (k) => { kElec = k; elec.visible = k > 0.01; elec.material.opacity = 0.95 * k; },
    },
    defecto: { abre: 0, filamento: 1.3, electrones: 0 },
    actualizar(t) { if (kElec > 0.01) electrones(t); },
  };
}
