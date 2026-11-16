// El móvil mojado y el arroz (hechos con 15-arroz, 16 nov). Sin marcas ni letras en los chips.
//
// movilMojado(): el móvil de movilBateria (tapa hacia +z, largo en y: 7,2 × 15 × 0,8 cm; con rayosX se ve dentro) con lo que
//   le pasa cuando se moja. Ilustración ampliada, no a escala.
//   Mandos (de 0 a 1):
//     agua       el agua entra por el conector (abajo) y se reparte en gotas y capas finas sobre las placas y la batería
//     corrosion  costra verdosa (cardenillo) sobre los contactos del conector y la placa de abajo
//     puente     un hilo de metal crece entre dos contactos y salta una chispa (el cortocircuito)
//     corriente  las pistas de la placa se encienden y por ellas corren pulsos ámbar
//     grano      un grano de arroz se acerca al conector desde fuera y se queda a medio meter
//     capacidad, calor  (los de movilBateria; aquí por defecto 0)
//   Partes (las de movilBateria) más: pines (los contactos del conector), costra (la placa de abajo).
//
// tarroArroz(): un cuenco blanco con arroz y un movilMojado tumbado dentro, medio enterrado (el extremo del conector
//   queda bajo el arroz). Se ve el cuenco entero; con rayosX el móvil enseña lo de dentro. Mandos: los del móvil más
//     vierte     0 = sin arroz, 1 = el arroz ya cubre; entre medias, los granos caen desde arriba
//   Partes: movil, bateria, placa, conector, tarro, granos, centro.
//
// rankingSecado(): ocho barras horizontales (una por puesto, el aire arriba) por orden de la prueba de Gazelle de 2014 con esponjas mojadas (aire, siete materiales):
//   el aire fue lo que más secó y el arroz de cocina quedó el último de los siete. SON POSICIONES, no cantidades: la
//   escena lleva la nota "Orden de la prueba, no cantidades". Las seis del medio no se nombran.
//   Mandos: ver, a (barras que aparecen de arriba abajo), foco (0..1 atenúa todo menos aire y arroz).
//   Partes: colAire, colArroz, medio, centro.

import { movilBateria } from "./bateria.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PI = Math.PI;
const smooth = (k) => k * k * (3 - 2 * k);

export function movilMojado(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const base = movilBateria(THREE, C, X, M);
  const R = base.grupo;
  const interior = base.interior.slice();
  const BY = -1.7, BH = 8.6;

  // the scale of 12 bars of the battery is not used here
  R.traverse((m) => { if (m.isMesh && m.geometry && m.geometry.parameters && m.geometry.parameters.width === 4.5 && m.geometry.parameters.height === 0.45) m.scale.set(0, 0, 0); });

  // ---------- water: drops that spread from the connector upwards ----------
  const aguaM = new THREE.MeshPhysicalMaterial({ color: 0x7cc4ff, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.5, emissive: 0x1b5a96, emissiveIntensity: 0.4, depthWrite: false, envMapIntensity: 1.4 });
  const NG = 130;
  const gotas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), aguaM, NG);
  gotas.frustumCulled = false; gotas.userData.noCortar = true; R.add(gotas); interior.push(gotas);
  const G = [];
  for (let i = 0; i < NG; i++) {
    const y = -7.4 + 14.9 * Math.pow(hash(i * 3.3 + 1), 0.8), x = (hash(i * 5.1 + 2) - 0.5) * 6.0;
    const tam = 0.08 + 0.26 * Math.pow(hash(i * 7.7 + 3), 2.2);
    G.push({ x, y, z: 0.27 + 0.02 * hash(i + 9), tam, nivel: (y + 7.5) / 15 + 0.08 * hash(i * 2.1) });
  }
  // thin films over the boards: wide flat blobs
  const NF = 16;
  const peliculas = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 8), aguaM, NF);
  peliculas.frustumCulled = false; peliculas.userData.noCortar = true; R.add(peliculas); interior.push(peliculas);
  const F = [];
  for (let i = 0; i < NF; i++) {
    const y = -6.8 + 13.2 * (i / (NF - 1)) + (hash(i * 4.4) - 0.5) * 0.8;
    F.push({ x: (hash(i * 6.2 + 5) - 0.5) * 3.4, y, w: 0.5 + 0.8 * hash(i * 1.7), h: 0.25 + 0.4 * hash(i * 9.1), nivel: (y + 7.5) / 15 });
  }
  // the stream entering at the connector (outside, below the frame): a few drops falling and shrinking
  const NC = 7;
  const chorro = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 8), aguaM, NC);
  chorro.frustumCulled = false; chorro.userData.noCortar = true; R.add(chorro);

  // ---------- corrosion: verdigris crust on the pins and the lower board ----------
  const costraM = new THREE.MeshStandardMaterial({ color: 0x39b394, roughness: 0.9, flatShading: true, emissive: 0x0c4a3a, emissiveIntensity: 0.4 });
  const parduzcoM = new THREE.MeshStandardMaterial({ color: 0x7a5a2a, roughness: 0.95, flatShading: true });
  const NK = 46;
  const croutas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), costraM, NK);
  croutas.frustumCulled = false; croutas.userData.noCortar = true; R.add(croutas); interior.push(croutas);
  const K = [];
  for (let i = 0; i < NK; i++) {
    const pin = i < 16;
    const x = pin ? (i % 2 ? 1 : -1) * (1.6 + Math.floor(i / 2) * 0.3) : (hash(i * 3.9) - 0.5) * 6.0;
    const y = pin ? -7.0 + (hash(i) - 0.5) * 0.2 : -7.0 + (hash(i * 2.3) - 0.5) * 1.2;
    K.push({ x, y, z: pin ? 0.17 : 0.1, tam: pin ? 0.07 + 0.06 * hash(i * 1.3) : 0.08 + 0.16 * hash(i * 6.1), umbral: hash(i * 8.8) * 0.8, rot: hash(i * 4.1) * 6 });
  }

  // ---------- bridge: a metal thread grows between two contacts and sparks ----------
  const hiloM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd27a).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0 });
  const PX = [1.6 + 4 * 0.3, 1.6 + 5 * 0.3];
  const NH = 8, hilo = [];
  const hiloG = new THREE.Group(); hiloG.userData.noCortar = true; R.add(hiloG); interior.push(hiloG);
  for (let i = 0; i < NH; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.05), hiloM);
    const f = i / (NH - 1); s.position.set(PX[0] + 0.06 + (PX[1] - PX[0] - 0.12) * f, -7.0 + 0.1 * Math.sin(i * 2.3) * 0.5, 0.2); s.userData.noCortar = true; s.userData.sinBordes = true; hiloG.add(s); hilo.push(s);
  }
  const chispa = C.brillo("255,170,70"); chispa.scale.setScalar(1.3); chispa.position.set((PX[0] + PX[1]) / 2, -7.0, 0.3); chispa.userData.noCortar = true; R.add(chispa);

  // ---------- current: amber traces on the boards with pulses running along ----------
  const pistaM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb22e).multiplyScalar(1.3), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const ruta = [[-1.8, -7.0], [-1.8, -5.7], [1.8, -5.7], [1.8, -1.2], [0.0, -1.2], [0.0, 3.4], [-1.65, 3.4], [-1.65, 4.6]];
  const pistaG = new THREE.Group(); pistaG.userData.noCortar = true; R.add(pistaG); interior.push(pistaG);
  const largos = [0]; for (let i = 1; i < ruta.length; i++) largos.push(largos[i - 1] + Math.hypot(ruta[i][0] - ruta[i - 1][0], ruta[i][1] - ruta[i - 1][1]));
  const LT = largos[largos.length - 1];
  for (let i = 1; i < ruta.length; i++) {
    const [x0, y0] = ruta[i - 1], [x1, y1] = ruta[i];
    const l = Math.hypot(x1 - x0, y1 - y0);
    const s = new THREE.Mesh(new THREE.BoxGeometry(l + 0.1, 0.09, 0.04), pistaM); s.rotation.z = Math.atan2(y1 - y0, x1 - x0); s.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.14); s.userData.noCortar = true; s.userData.sinBordes = true; pistaG.add(s);
  }
  const pulsos = [];
  for (let i = 0; i < 6; i++) { const p = C.brillo("255,200,90"); p.scale.setScalar(0.7); p.userData.noCortar = true; R.add(p); pulsos.push(p); }
  const enRuta = (d, out) => { d = clamp(d, 0, LT); let i = 1; while (i < largos.length - 1 && largos[i] < d) i++; const k = (d - largos[i - 1]) / (largos[i] - largos[i - 1]); return out.set(ruta[i - 1][0] + (ruta[i][0] - ruta[i - 1][0]) * k, ruta[i - 1][1] + (ruta[i][1] - ruta[i - 1][1]) * k, 0.16); };

  // ---------- a grain of rice at the connector ----------
  const granoM = new THREE.MeshPhysicalMaterial({ color: 0xece4cf, roughness: 0.42, clearcoat: 0.2 });
  const grano = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.5, 4, 10), granoM);
  grano.userData.noCortar = true; grano.visible = false; R.add(grano);

  const st = { agua: 0, corrosion: 0, puente: 0, corriente: 0, grano: 0 };
  const dm = new THREE.Object3D();
  const col = new THREE.Color();
  function actualizar(t) {
    base.actualizar(t);
    // water
    for (let i = 0; i < NG; i++) {
      const g = G[i], k = clamp((st.agua * 1.2 - g.nivel) * 7);
      const s = g.tam * smooth(k) * (1 + 0.05 * Math.sin(t * 2.2 + i));
      dm.position.set(g.x, g.y, g.z); dm.scale.set(s, s * 0.95, s * 0.5); dm.rotation.set(0, 0, 0); dm.updateMatrix(); gotas.setMatrixAt(i, dm.matrix);
    }
    gotas.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NF; i++) {
      const f = F[i], k = clamp((st.agua * 1.2 - f.nivel) * 5);
      dm.position.set(f.x, f.y, 0.2); dm.scale.set(f.w * smooth(k), f.h * smooth(k), 0.06); dm.rotation.set(0, 0, 0.3 * Math.sin(i * 2.1)); dm.updateMatrix(); peliculas.setMatrixAt(i, dm.matrix);
    }
    peliculas.instanceMatrix.needsUpdate = true;
    aguaM.opacity = 0.5 + 0.05 * Math.sin(t * 2.0);
    chorro.visible = st.agua > 0.005 && st.agua < 0.98;
    for (let i = 0; i < NC; i++) {
      const ph = (t * 1.1 + i / NC) % 1;
      dm.position.set(0.35 * Math.sin(i * 2.7), -11.2 + 4.0 * ph, 0.2); const s = 1.0 - 0.7 * ph; dm.scale.set(s, s * 1.5, s); dm.rotation.set(0, 0, 0); dm.updateMatrix(); chorro.setMatrixAt(i, dm.matrix);
    }
    chorro.instanceMatrix.needsUpdate = true;
    // corrosion
    for (let i = 0; i < NK; i++) {
      const k = K[i], g = smooth(clamp((st.corrosion - k.umbral * 0.8) * 4));
      dm.position.set(k.x, k.y, k.z); dm.scale.set(k.tam * g, k.tam * g * 0.8, k.tam * g * 0.6); dm.rotation.set(0.4, 0.2, k.rot); dm.updateMatrix(); croutas.setMatrixAt(i, dm.matrix);
    }
    croutas.instanceMatrix.needsUpdate = true;
    // bridge
    const pk = st.puente, chis = pk > 0.55 ? 0.6 + 0.4 * Math.sin(t * 38) * Math.sin(t * 23) : 0;
    hiloM.opacity = clamp(pk * 3);
    hilo.forEach((s, i) => { s.visible = pk * (NH + 1) > i; });
    chispa.material.opacity = clamp(chis) * (pk > 0.55 ? 1 : 0); chispa.visible = pk > 0.55;
    // current
    pistaM.opacity = 0.5 * st.corriente * (0.85 + 0.15 * Math.sin(t * 6));
    pulsos.forEach((p, i) => { p.visible = st.corriente > 0.02; enRuta(((t * 5 + i * (LT / 6)) % LT), p.position); p.material.opacity = st.corriente; });
    // grain
    grano.visible = st.grano > 0.001;
    const k = smooth(st.grano);
    grano.position.set(1.1 * (1 - k) + 0.05 * k, -10.6 * (1 - k) + -7.45 * k, 0.55 * (1 - k) + 0.12 * k);
    grano.rotation.set(0.1 * (1 - k), 0, 0.5 * (1 - k));
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  const partes = { ...base.partes, pines: pl([0, -7.0, 0.15], 2.2), costra: pl([0, -7.0, 0.1], 3.4) };
  const mando = (n) => (v) => { st[n] = v; };
  return {
    grupo: R,
    exterior: base.exterior, semi: base.semi, interior,
    partes,
    caja: base.caja,
    controles: { ...base.controles, ...Object.fromEntries(Object.keys(st).map((n) => [n, mando(n)])) },
    defecto: { capacidad: 0, calor: 0, agua: 0, corrosion: 0, puente: 0, corriente: 0, grano: 0 },
    actualizar,
  };
}

export function tarroArroz(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();

  // ---------- bowl ----------
  const perfil = [[0.01, 0], [9, 0], [14.5, 3], [15.5, 6.6], [14.7, 6.7], [13.6, 3.5], [8, 1.0], [0.01, 1.0]].map(([x, y]) => new THREE.Vector2(x, y));
  const cuencoM = new THREE.MeshPhysicalMaterial({ color: 0x2c3442, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2, side: THREE.DoubleSide, envMapIntensity: 0.6 });
  const cuenco = new THREE.Mesh(new THREE.LatheGeometry(perfil, 72), cuencoM); R.add(cuenco);

  // ---------- phone lying in it ----------
  const movil = movilMojado(THREE, C, X, M);
  const mg = movil.grupo; mg.rotation.set(-PI / 2, 0, 0.0); mg.rotation.order = "YXZ"; mg.rotation.y = 0.22; mg.position.set(0, 2.25, 0); R.add(mg);

  // ---------- rice: long grains, deterministic ----------
  const N = 4800, ZC = 3.5;
  const arrozM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.46, clearcoat: 0.18, clearcoatRoughness: 0.5, sheen: 0.1, sheenColor: new THREE.Color(0xd8c9a0), envMapIntensity: 0.5 });
  const granos = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.16, 0.56, 3, 7), arrozM, N);
  granos.frustumCulled = false; R.add(granos);
  const suelo = (r) => (r < 8 ? 1.0 : 1.0 + (r - 8) * 0.4545);
  const A = [];
  const ca = Math.cos(0.22), sa = Math.sin(0.22);
  for (let i = 0; i < N; i++) {
    for (let intento = 0; intento < 12; intento++) {
      const h = (n) => hash(i * 12.9898 + intento * 78.233 + n * 4.1);
      const r = 11.4 * Math.sqrt(h(1)), a = 2 * PI * h(2);
      const x = r * Math.cos(a), z = r * Math.sin(a);
      const cima = Math.max(suelo(r) + 0.5, 3.7 - 1.0 * (r / 11.4) * (r / 11.4) + 0.35 * Math.sin(x * 0.9 + z * 0.7));
      const y = suelo(r) + 0.2 + (cima - suelo(r) - 0.2) * Math.pow(h(3), 0.4);
      // phone footprint (rotated 0.22 rad about y): no grain through it, nor over it except over the buried end
      const lx = x * ca - z * sa, lz = x * sa + z * ca;
      const dentro = Math.abs(lx) < 4.1 && Math.abs(lz) < 8.0;
      if (dentro && (y < 3.0 && y > 1.5)) continue;
      if (dentro && y >= 3.0 && lz < ZC) continue;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(PI / 2 + (h(4) - 0.5) * 0.9, h(5) * 2 * PI, (h(6) - 0.5) * 0.5, "YXZ"));
      A.push({ x, y, z, q, tono: h(8), alto: 7 + 7 * h(9), orden: h(10) });
      break;
    }
  }
  const NA = A.length;
  granos.count = NA;
  const c = new THREE.Color();
  for (let i = 0; i < NA; i++) { c.setRGB(0.5 + 0.1 * A[i].tono, 0.46 + 0.1 * A[i].tono, 0.34 + 0.1 * A[i].tono); granos.setColorAt(i, c); }
  granos.instanceColor.needsUpdate = true;
  const dm = new THREE.Object3D();
  let kV = -1;
  function pintarGranos(v) {
    if (v === kV) return; kV = v;
    for (let i = 0; i < NA; i++) {
      const a = A[i], p = clamp(v * 1.7 - a.orden * 0.7), e = 1 - (1 - p) * (1 - p) * (1 - p);
      dm.position.set(a.x, a.y + (1 - e) * a.alto, a.z); dm.quaternion.copy(a.q);
      const s = p > 0 ? 1 : 0; dm.scale.set(s, s, s); dm.updateMatrix(); granos.setMatrixAt(i, dm.matrix);
    }
    granos.instanceMatrix.needsUpdate = true;
  }
  pintarGranos(1);

  let vierte = 1;
  function actualizar(t) { movil.actualizar(t); pintarGranos(vierte); }

  const phoneP = (n) => movil.partes[n];
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  const partes = {
    movil: { obj: mg, local: [0, 0, 0], radio: 8.6 }, bateria: phoneP("bateria"), placa: phoneP("placa"), chip: phoneP("chip"), conector: phoneP("conector"),
    tarro: pl([0, 3, 0], 15), granos: pl([0, 3, 0], 12), centro: pl([0, 2.5, 0], 15.5),
  };
  return {
    grupo: R,
    exterior: movil.exterior, semi: movil.semi, interior: movil.interior,
    partes,
    caja: [[-15.5, 0, -15.5], [15.5, 7, 15.5]],
    controles: { ...movil.controles, vierte: (v) => { vierte = v; } },
    defecto: { ...movil.defecto, vierte: 1 },
    actualizar,
  };
}

export function rankingSecado(THREE, C, X, M) {
  const { clamp } = C;
  const R = new THREE.Group();
  // horizontal bars, one row per place (air on top, rice at the bottom), so the chart fills a vertical screen
  const NC = 8, PASO = 3.0, ESPESOR = 2.2, FON = 2.0, UNI = 1.75, X0 = -7;
  const baseM = new THREE.MeshPhysicalMaterial({ color: 0x141b27, roughness: 0.4, clearcoat: 0.6 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.4, (NC - 1) * PASO + ESPESOR + 1.2, 3.4, 2, 0.1), baseM); base.position.set(X0 - 0.2, (NC - 1) * PASO / 2, 0); R.add(base);

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
  const cols = [];
  for (let i = 0; i < NC; i++) {
    const y = (NC - 1 - i) * PASO, largo = (NC - i) * UNI;
    const color = i === 0 ? 0x6fdcff : i === NC - 1 ? 0xffb22e : 0x5b6b85;
    const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.12, transparent: true, opacity: 0.55, clearcoat: 1, emissive: color, emissiveIntensity: 0.5, depthWrite: false });
    const b = new THREE.Mesh(new RoundedBoxGeometry(1, ESPESOR, FON, 3, 0.16), m); R.add(b);
    const tope = new THREE.Mesh(new RoundedBoxGeometry(0.12, ESPESOR + 0.1, FON + 0.1, 2, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.7), toneMapped: false })); R.add(tope);
    cols.push({ i, y, largo, m, b, tope, color });
  }
  const yAire = cols[0].y, yArroz = cols[NC - 1].y;
  const etqAire = rotulo(5.6, 1.2, 0.8, "#ffffff"); etqAire.position.set(X0 + 3.2, yAire, FON / 2 + 0.2); etqAire.userData.poner("AIRE"); R.add(etqAire);
  const etqArroz = rotulo(6, 1.2, 0.8, "#ffb22e"); etqArroz.position.set(X0 + UNI + 0.6 + 3.0, yArroz, FON / 2 + 0.2); etqArroz.userData.poner("ARROZ"); R.add(etqArroz);
  const etqMed = rotulo(7.4, 1.0, 0.5, "#c9d3e3"); etqMed.position.set(X0 + 9.2 + 2.2, (cols[3].y + cols[4].y) / 2, FON / 2 + 0.2); etqMed.userData.poner("OTROS SEIS MATERIALES"); R.add(etqMed);
  const mas = rotulo(6, 1.0, 0.6, "#6fdcff"); mas.position.set(X0 + 3.0, yAire + ESPESOR / 2 + 0.9, FON / 2 + 0.2); mas.userData.poner("MÁS SECO"); R.add(mas);
  const menos = rotulo(6.6, 1.0, 0.6, "#ffb22e"); menos.position.set(X0 + 3.3, yArroz - ESPESOR / 2 - 0.9, FON / 2 + 0.2); menos.userData.poner("MENOS SECO"); R.add(menos);

  const st = { ver: 1, a: 0, foco: 0 };
  function actualizar() {
    R.visible = st.ver > 0.003; if (!R.visible) return;
    for (const c of cols) {
      const k = smooth(clamp(st.a * (NC + 1) - c.i)) * st.ver;
      const largo = Math.max(0.0001, c.largo * k);
      c.b.scale.x = largo; c.b.position.set(X0 + largo / 2, c.y, 0);
      c.tope.position.set(X0 + largo, c.y, 0); c.tope.visible = k > 0.01;
      const es = c.i === 0 || c.i === NC - 1;
      c.m.opacity = 0.55 - (es ? 0 : 0.3 * st.foco);
      c.m.emissiveIntensity = es ? 0.5 + 0.4 * st.foco : 0.5 * (1 - 0.6 * st.foco);
    }
    const kA = smooth(clamp(st.a * (NC + 1))) * st.ver, kZ = smooth(clamp(st.a * (NC + 1) - (NC - 1))) * st.ver;
    for (const [r, k] of [[etqAire, kA], [mas, kA], [etqArroz, kZ], [menos, kZ], [etqMed, smooth(clamp(st.a * (NC + 1) - 3)) * st.ver]]) { r.visible = k > 0.3 && st.ver > 0.5; r.material.opacity = clamp((k - 0.3) * 3); }
  }
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    partes: { colAire: pl([X0 + cols[0].largo / 2, yAire, 0], 6), colArroz: pl([X0 + cols[NC - 1].largo / 2 + 1.5, yArroz, 0], 4), medio: pl([X0 + 6, (cols[3].y + cols[4].y) / 2, 0], 9), centro: pl([X0 + 7, (NC - 1) * PASO / 2, 0], 12) },
    caja: [[X0 - 0.6, -2.2, -1.8], [X0 + 14.6, (NC - 1) * PASO + 2.4, 1.8]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { ver: 1, a: 0, foco: 0 },
    actualizar,
  };
}
