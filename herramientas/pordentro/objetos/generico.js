// Piezas genéricas que salen en muchos aparatos (unidades libres; en los de cocina, 1 = 1 cm):
//   placa({ ancho, alto, chips })                placa de circuito verde con pistas doradas y chips negros
//   bobina({ radio, largo, vueltas, hilo, nucleo })  bobina de cobre en hélice, con núcleo de ferrita opcional
//   serpentin({ ancho, alto, filas, radio, alambres, material })  tubo en zigzag en un plano (condensador,
//                                                 evaporador, radiador); alambres: varillas finas cruzadas
//   tubo({ puntos, radio, material })            un tubo que sigue una lista de puntos [x, y, z]
// Partes: placa → chip, centro; bobina → hilo, centro; serpentin → entrada, salida, centro, arriba, abajo;
//         tubo → inicio, fin, medio.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function placa(THREE, C, X, M, { ancho = 11, alto = 20, chips = 6 } = {}) {
  const { hash } = C;
  const g = new THREE.Group();
  const p = new THREE.Mesh(new RoundedBoxGeometry(ancho, 0.16, alto, 2, 0.05), M.pcb); g.add(p);
  const chipMat = new THREE.MeshPhysicalMaterial({ color: 0x141518, roughness: 0.45, clearcoat: 0.4 });
  const pata = new THREE.MeshPhysicalMaterial({ color: 0xc8ccd2, metalness: 1, roughness: 0.3 });
  let primero = null;
  for (let i = 0; i < chips; i++) {
    const w = 1.2 + hash(i * 3.1) * 2.4, d = 1.0 + hash(i * 5.3) * 2, x = (hash(i * 7.7) - 0.5) * (ancho - w - 1), z = (hash(i * 9.9) - 0.5) * (alto - d - 1);
    const c = new THREE.Mesh(new RoundedBoxGeometry(w, 0.35, d, 2, 0.05), chipMat); c.position.set(x, 0.26, z); g.add(c);
    for (let k = 0; k < Math.floor(w / 0.35); k++) for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.3), pata); l.position.set(x - w / 2 + 0.2 + k * 0.35, 0.12, z + s * (d / 2 + 0.12)); g.add(l); }
    if (!primero) primero = c;
  }
  return { grupo: g, partes: { chip: { obj: primero || p, local: [0, 0.2, 0], radio: 1.5 }, centro: { obj: g, local: [0, 0, 0], radio: Math.max(ancho, alto) / 2 } } };
}

export function bobina(THREE, C, X, M, { radio = 1.2, largo = 3, vueltas = 14, hilo = 0.09, nucleo = true } = {}) {
  const g = new THREE.Group();
  class Helice extends THREE.Curve { getPoint(u, out = new THREE.Vector3()) { const a = u * 2 * Math.PI * vueltas; return out.set(Math.cos(a) * radio, -largo / 2 + largo * u, Math.sin(a) * radio); } }
  const h = new THREE.Mesh(new THREE.TubeGeometry(new Helice(), vueltas * 40, hilo, 8, false), M.cobre); g.add(h);
  if (nucleo) { const n = new THREE.Mesh(new THREE.CylinderGeometry(radio - hilo * 1.6, radio - hilo * 1.6, largo * 1.15, 40), M.ferrita); g.add(n); }
  return { grupo: g, partes: { hilo: { obj: g, local: [radio, 0, 0], radio: radio }, centro: { obj: g, local: [0, 0, 0], radio: Math.max(radio, largo / 2) } } };
}

// a serpentine in the XY plane, centred: horizontal runs joined by half-circle bends; rows go from the bottom up
export function serpentin(THREE, C, X, M, { ancho = 40, alto = 60, filas = 12, radio = 0.32, alambres = 0, material = null, grosorAlambre = 0.07 } = {}) {
  const g = new THREE.Group();
  const paso = alto / (filas - 1 || 1), r = paso / 2;
  const pts = [];
  for (let i = 0; i < filas; i++) {
    const y = -alto / 2 + i * paso, dir = i % 2 ? -1 : 1;
    const x0 = -dir * (ancho / 2 - r), x1 = dir * (ancho / 2 - r);
    for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(x0 + (x1 - x0) * (k / 8), y, 0));
    if (i < filas - 1) for (let k = 1; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * Math.PI; pts.push(new THREE.Vector3(x1 + dir * Math.cos(a) * r, y + r + Math.sin(a) * r, 0)); }
  }
  const curva = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.1);
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, filas * 60, radio, 10, false), material || M.cobre); g.add(tubo);
  let varillas = null;
  if (alambres > 0) {
    const geo = new THREE.CylinderGeometry(grosorAlambre, grosorAlambre, alto + paso * 0.6, 6);
    varillas = new THREE.InstancedMesh(geo, M.aceroOsc, alambres * 2);
    const dm = new THREE.Object3D();
    for (let i = 0; i < alambres; i++) for (const z of [-1, 1]) { dm.position.set(-ancho / 2 + r * 0.5 + (i + 0.5) * ((ancho - r) / alambres), 0, z * (radio + grosorAlambre)); dm.updateMatrix(); varillas.setMatrixAt(i * 2 + (z > 0 ? 1 : 0), dm.matrix); }
    g.add(varillas);
  }
  const p0 = pts[0], p1 = pts[pts.length - 1];
  return {
    grupo: g, curva, puntos: pts, tubo,
    partes: {
      entrada: { obj: g, local: [p0.x, p0.y, p0.z], radio: radio * 6 }, salida: { obj: g, local: [p1.x, p1.y, p1.z], radio: radio * 6 },
      centro: { obj: g, local: [0, 0, 0], radio: Math.max(ancho, alto) / 2 }, arriba: { obj: g, local: [0, alto / 2, 0], radio: ancho / 3 }, abajo: { obj: g, local: [0, -alto / 2, 0], radio: ancho / 3 },
    },
  };
}

export function tubo(THREE, C, X, M, { puntos = [[0, 0, 0], [0, 10, 0]], radio = 0.3, material = null, tension = 0.2 } = {}) {
  const g = new THREE.Group();
  const P = puntos.map((p) => new THREE.Vector3(...p));
  const curva = new THREE.CatmullRomCurve3(P, false, "catmullrom", tension);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, Math.max(32, P.length * 24), radio, 10, false), material || M.cobre));
  const m = curva.getPoint(0.5);
  return { grupo: g, curva, partes: { inicio: { obj: g, local: puntos[0], radio: radio * 6 }, fin: { obj: g, local: puntos[puntos.length - 1], radio: radio * 6 }, medio: { obj: g, local: [m.x, m.y, m.z], radio: radio * 8 } } };
}
