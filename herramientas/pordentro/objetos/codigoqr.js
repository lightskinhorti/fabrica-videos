// Código QR por dentro (hecho con 14-qr, 12 nov). Un QR genérico e inventado: versión 3 (29 × 29 módulos), nivel de
// corrección H, con el texto "Hola desde dentro" (no es una web ni lleva a ninguna parte; se comprobó que un lector
// lo descifra). La matriz es la que dio la librería segno; el reparto de palabras de código (setenta: veintiséis de
// mensaje y cuarenta y cuatro de repuesto) sigue la tabla de la norma (versión 3-H: 26 de datos, dos bloques con
// 22 de corrección cada uno) y el orden en zigzag de la colocación de módulos.
//
// codigoQR(): el código de frente a la cámara (cara hacia +z, 1 unidad = 1 módulo; placa blanca de 33 × 33 con zona
//   de silencio), con debajo el panel de lectura y la cinta de las 70 palabras de código.
//   Mandos (de 0 a 1 salvo donde se dice):
//     tapa        la pegatina gris que tapa un trozo (90 módulos, el 11 % de la superficie, que toca 18 de las 70
//                 palabras, el 26 %); crece desde el centro. Con ella el código se sigue leyendo (comprobado).
//     repara      los módulos que tapa la pegatina reaparecen en ámbar encima: lo que rehace el móvil
//     golpe       una pegatina sobre uno de los tres cuadrados de las esquinas (así no se lee, comprobado)
//     lectura     el marco y el panel de lectura ("LEÍDO") ; lecturaMal: 1 los pone rojos ("NO SE LEE")
//     esquinas    marcos ámbar y brillo en los tres cuadrados de posición
//     proporcion  los tramos 1-1-3-1-1 del cuadrado de arriba a la izquierda y su rótulo
//     escaneo     una barra de luz que cruza el código (0 = a la izquierda, 1 = a la derecha)
//     bits        cada módulo con su 1 (oscuro) o su 0 (claro)
//     reparto     tinte azul en los módulos de mensaje y ámbar en los de repuesto
//     palabra     resalta una palabra de código (8 módulos): el valor es el número de la palabra (1 a 70); 0 = nada
//     cinta       la cinta de 70 palabras (azul mensaje, ámbar repuesto)
//     danadas     las palabras que toca la pegatina, en rojo; corregidas: pasan a verde
//     giro        grados que gira el código sobre sí mismo
//   Partes: centro, plano, esquinaTL, esquinaTR, esquinaBL, hueco, modulos, cinta, panel, razon.
//
// nivelesQR(): cuatro columnas L, M, Q y H con lo que recupera cada nivel (7, 15, 25 y 30 % de las palabras de código,
//   Denso Wave). Mandos: ver, a (crecen), foco (1 a 4: resalta esa columna), usado (rótulo del nivel más usado).
//   Partes: colL, colM, colQ, colH, centro.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const N = 29, Q = 2, P = N + 2 * Q, PX = 32;
const MATRIZ = ["11111110001100011011001111111", "10000010111010010010101000001", "10111010010010001101101011101", "10111010000001110011001011101", "10111010000100100010101011101", "10000010100110011011001000001", "11111110101010101010101111111", "00000000101001100110100000000", "00001111001111110011001100010", "10010001011010011101100010001", "10110110000111101110101100101", "10011001100100011110011101011", "01001111111110100111110000001", "10100001010011011110001110001", "10011011011010011000000101101", "00001100100111111010110101001", "00010011100011111011111011010", "10010101000011000101000010100", "00111011100001000011001010001", "00100100101001001101101011001", "11100111110101011100111110000", "00000000110110101111100010001", "11111110110001101011101010001", "10000010110100011001100011011", "10111010111110111111111111010", "10111010000010000110010001110", "10111010010100110010000100111", "10000010001000010101011001011", "11111110011110011101110011010"];
const HUECO = [[10,14],[10,16],[10,17],[10,18],[10,19],[10,20],[10,21],[11,12],[11,13],[11,14],[11,15],[11,16],[11,17],[11,18],[11,19],[11,20],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],[12,19],[12,20],[12,21],[13,12],[13,13],[13,14],[13,15],[13,16],[13,17],[13,18],[13,19],[13,20],[13,21],[14,13],[14,14],[14,15],[14,16],[14,17],[14,18],[14,19],[14,20],[14,21],[15,13],[15,14],[15,15],[15,16],[15,17],[15,18],[15,19],[15,20],[15,21],[16,13],[16,14],[16,15],[16,16],[16,17],[16,18],[16,19],[16,20],[16,21],[17,13],[17,14],[17,15],[17,16],[17,17],[17,18],[17,19],[17,20],[17,21],[18,12],[18,13],[18,14],[18,15],[18,16],[18,17],[18,18],[18,19],[18,20],[18,21],[19,12],[19,13],[19,15],[19,16],[19,17],[19,18],[19,19],[19,21]];
const esFuncion = (r, c) => (r < 9 && c < 9) || (r < 9 && c >= N - 8) || (r >= N - 8 && c < 9) || r === 6 || c === 6 || (r >= 20 && r < 25 && c >= 20 && c < 25);
// order in which the bits are placed (zigzag in pairs of columns from the bottom right), and the codeword each module belongs to
const PALABRA = Array.from({ length: N }, () => Array(N).fill(-1));
const ORDEN = [];
{
  let col = N - 1, sube = true;
  while (col > 0) {
    if (col === 6) col -= 1;
    for (let k = 0; k < N; k++) {
      const r = sube ? N - 1 - k : k;
      for (const c of [col, col - 1]) if (!esFuncion(r, c)) ORDEN.push([r, c]);
    }
    sube = !sube; col -= 2;
  }
  ORDEN.forEach(([r, c], i) => { PALABRA[r][c] = i < 560 ? Math.floor(i / 8) : -1; });
}
const NP = 70, NDATOS = 26;
const px = (c) => -N / 2 + c + 0.5, py = (r) => N / 2 - r - 0.5;

export function codigoQR(THREE, C, X, M) {
  const { v3, clamp, lerp, hash } = C;
  const RAD = Math.PI / 180;
  const sm = (k) => k * k * (3 - 2 * k);
  const R = new THREE.Group(), G = new THREE.Group(); R.add(G);

  // ---------- plate and modules ----------
  const respaldo = new THREE.Mesh(new RoundedBoxGeometry(P + 0.9, P + 0.9, 0.5, 3, 0.5), new THREE.MeshPhysicalMaterial({ color: 0x23262d, metalness: 0.6, roughness: 0.4 })); respaldo.position.z = -0.38; G.add(respaldo);
  const papelM = new THREE.MeshStandardMaterial({ color: 0xa9a69f, roughness: 0.85 });
  const placa = new THREE.Mesh(new RoundedBoxGeometry(P, P, 0.5, 3, 0.4), papelM); G.add(placa);
  const oscuros = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (MATRIZ[r][c] === "1") oscuros.push([r, c]);
  const tintaM = new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.8 });
  const tinta = new THREE.InstancedMesh(new THREE.BoxGeometry(0.97, 0.97, 0.3), tintaM, oscuros.length);
  const dm = new THREE.Object3D();
  oscuros.forEach(([r, c], i) => { dm.position.set(px(c), py(r), 0.4); dm.updateMatrix(); tinta.setMatrixAt(i, dm.matrix); });
  G.add(tinta);

  // overlays drawn on a canvas, one cell per module
  const basica = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const lienzoMod = (dibuja) => X.lienzo(N * PX, N * PX, (g) => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) dibuja(g, r, c, c * PX, r * PX); }).tex;
  const bitsTex = lienzoMod((g, r, c, x, y) => {
    const oscuro = MATRIZ[r][c] === "1";
    g.fillStyle = oscuro ? "#f5f1e8" : "#2a2f3a"; g.font = `700 ${PX * 0.62}px "JetBrains Mono", monospace`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(oscuro ? "1" : "0", x + PX / 2, y + PX / 2 + 1);
  });
  const repartoTex = lienzoMod((g, r, c, x, y) => {
    if (esFuncion(r, c)) return;
    const k = PALABRA[r][c];
    g.fillStyle = k < 0 ? "rgba(150,150,160,0.5)" : k < NDATOS ? "rgba(60,190,255,0.66)" : "rgba(255,160,30,0.72)";
    g.fillRect(x, y, PX, PX);
    g.strokeStyle = "rgba(0,0,0,0.22)"; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, PX - 2, PX - 2);
  });
  const mkPlano = (tex, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(N, N), basica(tex)); m.position.z = z; m.userData.noCortar = true; m.userData.sinBordes = true; G.add(m); return m; };
  const bitsP = mkPlano(bitsTex, 0.6), repartoP = mkPlano(repartoTex, 0.58);

  // ---------- the sticker over the hole, its ghost modules and the sticker over a corner ----------
  const hueco = HUECO.map(([r, c]) => ({ r, c }));
  let sx = 0, sy = 0; hueco.forEach((h) => { sx += px(h.c); sy += py(h.r); }); sx /= hueco.length; sy /= hueco.length;
  let dmax = 0; hueco.forEach((h) => { h.d = Math.hypot(px(h.c) - sx, py(h.r) - sy); dmax = Math.max(dmax, h.d); });
  const pegM = new THREE.MeshStandardMaterial({ color: 0x8e9299, roughness: 0.7 });
  const pegatina = new THREE.InstancedMesh(new THREE.BoxGeometry(1.04, 1.04, 0.5), pegM, hueco.length); pegatina.frustumCulled = false; G.add(pegatina);
  const fantasmas = hueco.filter((h) => MATRIZ[h.r][h.c] === "1");
  const fantM = new THREE.MeshBasicMaterial({ color: 0xffb22e, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const fant = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.9, 0.2), fantM, fantasmas.length); fant.frustumCulled = false; G.add(fant);
  const golpeM = new THREE.Mesh(new RoundedBoxGeometry(9.6, 9.6, 0.5, 3, 0.35), pegM); golpeM.position.set(px(3.5) - 0.0, py(3.5), 0.62); golpeM.scale.setScalar(0.0001); G.add(golpeM);

  // ---------- the three position squares: frames and glow ----------
  const cuadrados = [[3.5, 3.5], [3.5, N - 3.5], [N - 3.5, 3.5]].map(([r, c]) => ({ x: -N / 2 + c, y: N / 2 - r }));
  const marcoM = new THREE.MeshBasicMaterial({ color: 0xffb22e, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const marcos = [], haloes = [];
  for (const q of cuadrados) {
    const g = new THREE.Group(); g.position.set(q.x, q.y, 0.9);
    for (const [w, h, dx, dy] of [[8.2, 0.42, 0, 4.0], [8.2, 0.42, 0, -4.0], [0.42, 8.2, 4.0, 0], [0.42, 8.2, -4.0, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), marcoM); b.position.set(dx, dy, 0); g.add(b); }
    G.add(g); marcos.push(g);
    const h = C.brillo("255,170,60"); h.scale.setScalar(13); h.position.set(q.x, q.y, 1.1); h.material.opacity = 0; h.visible = false; G.add(h); haloes.push(h);
  }

  // ---------- the 1:1:3:1:1 stripes above the top-left square and its caption ----------
  function rotulo(ancho, alto, tam, color, mono = false, alinea = "center") {
    const pxu = 48, cv = document.createElement("canvas"); cv.width = Math.round(ancho * pxu); cv.height = Math.round(alto * pxu);
    const g = cv.getContext("2d"); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    let ultimo = null;
    m.userData.poner = (txt, col = color) => {
      const clave = txt + col; if (clave === ultimo) return; ultimo = clave;
      g.clearRect(0, 0, cv.width, cv.height); g.fillStyle = col; g.textAlign = alinea; g.textBaseline = "middle";
      g.font = `700 ${Math.round(tam * pxu)}px ${mono ? '"JetBrains Mono"' : '"Inter"'}, sans-serif`;
      g.fillText(txt, alinea === "left" ? 0 : alinea === "right" ? cv.width : cv.width / 2, cv.height / 2 + 2); tex.needsUpdate = true;
    };
    m.userData.noCortar = true; m.userData.sinBordes = true; return m;
  }
  const tramos = [], tramoM = [];
  { let x = px(0) - 0.5; const anchos = [1, 1, 3, 1, 1];
    anchos.forEach((a, i) => {
      const m = new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf1eee7 : 0xffb22e, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }); tramoM.push(m);
      const b = new THREE.Mesh(new THREE.BoxGeometry(a - 0.12, 0.3, 0.08), m); b.position.set(x + a / 2, N / 2 + 0.85, 0.7); G.add(b); tramos.push(b);
      const n = rotulo(1.2, 1.2, 0.95, i % 2 ? "#f1eee7" : "#ffb22e", true); n.position.set(x + a / 2, N / 2 + 1.75, 0.7); n.userData.poner(String(a)); G.add(n); tramos.push(n);
      x += a;
    }); }
  const razon = rotulo(18, 2.6, 1.05, "#ffffff", true); razon.position.set(px(0) - 0.5 + 3.5 + 4.2, P / 2 + 2.6, 0.3); razon.userData.poner("1 : 1 : 3 : 1 : 1"); G.add(razon);

  // ---------- scan beam ----------
  const hazM = new THREE.MeshBasicMaterial({ color: 0x6fdcff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const haz = new THREE.Mesh(new THREE.BoxGeometry(0.28, P - 0.6, 0.1), hazM); haz.position.z = 1.0; G.add(haz);
  const hazAncho = new THREE.Mesh(new THREE.PlaneGeometry(3.4, P - 0.6), new THREE.MeshBasicMaterial({ map: M.brilloTex("111,220,255"), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })); hazAncho.position.z = 1.0; G.add(hazAncho);

  // ---------- word highlight (8 modules) ----------
  const palM = new THREE.MeshBasicMaterial({ color: 0xffd25a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const palabras8 = Array.from({ length: 8 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), palM); m.position.z = 0.7; m.userData.noCortar = true; m.userData.sinBordes = true; m.visible = false; G.add(m); return m; });
  const palMarco = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); palMarco.visible = false;

  // ---------- read-out frame and panel ----------
  const lecM = { ok: new THREE.MeshBasicMaterial({ color: 0x4cf2a0, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }), mal: new THREE.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }) };
  const esquinasL = [];
  const L = P / 2 + 1.1, LL = 5.2, T = 0.45;
  for (const sxx of [-1, 1]) for (const syy of [-1, 1]) {
    for (const [w, h, dx, dy] of [[LL, T, -sxx * LL / 2 * -1, 0], [T, LL, 0, -syy * LL / 2 * -1]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), lecM.ok); b.position.set(sxx * L + (w > h ? -sxx * (LL / 2 - T / 2) : 0), syy * L + (h > w ? -syy * (LL / 2 - T / 2) : 0), 0.4); b.userData.noCortar = true; b.userData.sinBordes = true; G.add(b); esquinasL.push(b);
    }
  }
  const PY0 = -(P / 2) - 2.9;
  const panel = rotulo(30, 3.6, 1.5, "#ffffff", true); panel.position.set(0, PY0, 0.2); R.add(panel);
  const pcv = panel.material.map.image, pg = pcv.getContext("2d"); let panelEstado = "";
  function dibujaPanel(mal) {
    const clave = mal ? "mal" : "ok"; if (clave === panelEstado) return; panelEstado = clave;
    const w = pcv.width, h = pcv.height, col = mal ? "#ff5a4a" : "#4cf2a0";
    pg.clearRect(0, 0, w, h); pg.fillStyle = mal ? "rgba(34,10,8,0.94)" : "rgba(8,26,18,0.94)"; pg.strokeStyle = col; pg.lineWidth = 4;
    pg.beginPath(); pg.roundRect(3, 3, w - 6, h - 6, 28); pg.fill(); pg.stroke();
    pg.lineWidth = 9; pg.lineCap = "round"; pg.lineJoin = "round"; pg.strokeStyle = col; pg.beginPath();
    if (mal) { pg.moveTo(60, h / 2 - 22); pg.lineTo(104, h / 2 + 22); pg.moveTo(104, h / 2 - 22); pg.lineTo(60, h / 2 + 22); }
    else { pg.moveTo(56, h / 2 + 2); pg.lineTo(80, h / 2 + 26); pg.lineTo(116, h / 2 - 22); }
    pg.stroke();
    pg.fillStyle = col; pg.textAlign = "left"; pg.textBaseline = "middle"; pg.font = '700 52px "JetBrains Mono", monospace';
    pg.fillText(mal ? "NO SE LEE" : "LEÍDO", 150, h / 2 + 3);
    if (!mal) { pg.fillStyle = "#e9efe9"; pg.font = '400 46px "JetBrains Mono", monospace'; pg.textAlign = "right"; pg.fillText("Hola desde dentro", w - 44, h / 2 + 3); }
    panel.material.map.needsUpdate = true;
  }

  // ---------- strip of 70 codewords ----------
  const bloques = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 1.4, 0.3), new THREE.MeshBasicMaterial({ toneMapped: false }), NP);
  const paso = P / 35, YS = [PY0 - 4.9, PY0 - 6.8];
  const pos = (i) => ({ x: -P / 2 + paso * ((i % 35) + 0.5), y: YS[i < 35 ? 0 : 1] });
  const tocadas = new Set(); hueco.forEach((h) => { if (PALABRA[h.r][h.c] >= 0) tocadas.add(PALABRA[h.r][h.c]); });
  const cAzul = new THREE.Color(0x3fbfe6), cAmbar = new THREE.Color(0xe89a22), cRojo = new THREE.Color(0xff4d3d), cVerde = new THREE.Color(0x44e08f), tmpC = new THREE.Color();
  bloques.frustumCulled = false; R.add(bloques);
  const rotMsg = rotulo(15, 1.6, 1.05, "#6fdcff", true, "left"), rotRep = rotulo(15, 1.6, 1.05, "#ffb22e", true, "right");
  rotMsg.position.set(-P / 2 + 7.5, YS[0] + 1.4, 0.2); rotMsg.userData.poner("26 · MENSAJE"); rotRep.position.set(P / 2 - 7.5, YS[0] + 1.4, 0.2); rotRep.userData.poner("44 · REPUESTO"); R.add(rotMsg, rotRep);

  // ---------- state and per-frame update ----------
  const defecto = { tapa: 0, repara: 0, golpe: 0, lectura: 0, lecturaMal: 0, esquinas: 0, proporcion: 0, escaneo: 0, bits: 0, reparto: 0, palabra: 0, cinta: 0, danadas: 0, corregidas: 0, giro: 0 };
  const st = { ...defecto };
  function actualizar(t) {
    G.rotation.z = st.giro * RAD;
    bitsP.material.opacity = clamp(st.bits); bitsP.visible = st.bits > 0.003;
    repartoP.material.opacity = clamp(st.reparto) * 0.9; repartoP.visible = st.reparto > 0.003;
    hueco.forEach((h, i) => { const k = clamp(st.tapa * 1.6 - (h.d / dmax) * 0.6); const s = Math.max(0.0001, sm(k)); dm.position.set(px(h.c), py(h.r), 0.6); dm.scale.set(s, s, s); dm.updateMatrix(); pegatina.setMatrixAt(i, dm.matrix); });
    pegatina.instanceMatrix.needsUpdate = true; pegatina.visible = st.tapa > 0.003;
    fantasmas.forEach((h, i) => { const k = clamp(st.repara * 1.6 - (h.d / dmax) * 0.6); const s = Math.max(0.0001, sm(k)); dm.position.set(px(h.c), py(h.r), 0.99); dm.scale.set(s, s, s); dm.updateMatrix(); fant.setMatrixAt(i, dm.matrix); });
    fant.instanceMatrix.needsUpdate = true; fant.visible = st.repara > 0.003; fantM.opacity = 0.96;
    const g = Math.max(0.0001, sm(clamp(st.golpe))); golpeM.scale.setScalar(g); golpeM.visible = st.golpe > 0.003;
    marcoM.opacity = clamp(st.esquinas); marcos.forEach((m) => { m.visible = st.esquinas > 0.003; m.scale.setScalar(1 + 0.03 * Math.sin(t * 5)); });
    haloes.forEach((h) => { h.visible = st.esquinas > 0.003; h.material.opacity = 0.55 * clamp(st.esquinas) * (0.75 + 0.25 * Math.sin(t * 4)); });
    tramoM.forEach((m) => { m.opacity = clamp(st.proporcion); }); tramos.forEach((o) => { o.visible = st.proporcion > 0.003; if (o.userData.poner) o.material.opacity = clamp(st.proporcion); });
    razon.material.opacity = clamp(st.proporcion); razon.visible = st.proporcion > 0.003;
    const e = st.escaneo, vis = e > 0.003 && e < 0.997;
    haz.visible = hazAncho.visible = vis; haz.position.x = hazAncho.position.x = lerp(-P / 2 - 1, P / 2 + 1, e); hazM.opacity = 0.95; hazAncho.material.opacity = 0.85;
    const w = Math.round(st.palabra);
    palabras8.forEach((m, i) => { const ok = w >= 1 && ORDEN[(w - 1) * 8 + i]; m.visible = !!ok; if (ok) { const [r, c] = ORDEN[(w - 1) * 8 + i]; m.position.x = px(c); m.position.y = py(r); } });
    palM.opacity = w >= 1 ? 0.85 : 0;
    const mal = st.lecturaMal > 0.5; dibujaPanel(mal);
    const kL = clamp(st.lectura);
    esquinasL.forEach((b) => { b.material = mal ? lecM.mal : lecM.ok; b.visible = kL > 0.003; });
    lecM.ok.opacity = lecM.mal.opacity = kL; panel.material.opacity = kL; panel.visible = kL > 0.003;
    // strip
    for (let i = 0; i < NP; i++) {
      const k = sm(clamp(st.cinta * 1.4 - (i / NP) * 0.4)); const s = Math.max(0.0001, k);
      const p = pos(i); dm.position.set(p.x, p.y, 0); dm.scale.set(s, s, s); dm.updateMatrix(); bloques.setMatrixAt(i, dm.matrix);
      tmpC.copy(i < NDATOS ? cAzul : cAmbar);
      if (tocadas.has(i)) { tmpC.lerp(cRojo, clamp(st.danadas) * (0.65 + 0.35 * Math.sin(t * 7 + i))); tmpC.lerp(cVerde, clamp(st.corregidas)); }
      bloques.setColorAt(i, tmpC);
    }
    bloques.instanceMatrix.needsUpdate = true; if (bloques.instanceColor) bloques.instanceColor.needsUpdate = true; bloques.visible = st.cinta > 0.003;
    rotMsg.material.opacity = rotRep.material.opacity = clamp(st.cinta); rotMsg.visible = rotRep.visible = st.cinta > 0.003;
  }
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    partes: {
      centro: pl([0, -4, 0], 26), plano: pl([0, 0, 0], 18), esquinaTL: pl([cuadrados[0].x, cuadrados[0].y, 0.5], 4.6), esquinaTR: pl([cuadrados[1].x, cuadrados[1].y, 0.5], 4.6),
      esquinaBL: pl([cuadrados[2].x, cuadrados[2].y, 0.5], 4.6), hueco: pl([sx, sy, 0.6], 7.4), modulos: pl([5, -9, 0.5], 7), cinta: pl([0, YS[0] - 0.9, 0], 17), panel: pl([0, PY0, 0.2], 10),
      razon: pl([px(0) + 7, P / 2 + 2.6, 0.3], 9),
    },
    caja: [[-17.2, YS[1] - 1.2, -1], [17.2, P / 2 + 0.6, 1.6]],
    controles: Object.fromEntries(Object.keys(defecto).map((n) => [n, (v) => { st[n] = v; }])),
    defecto,
    actualizar,
  };
}

export function nivelesQR(THREE, C, X, M) {
  const { clamp } = C;
  const R = new THREE.Group();
  const sm = (k) => k * k * (3 - 2 * k);
  const ESC = 1.05, AN = 5.2, FON = 3.2;
  const datos = [
    { letra: "L", v: 7, x: -11.4, col: 0x6fdcff }, { letra: "M", v: 15, x: -3.8, col: 0xffb22e },
    { letra: "Q", v: 25, x: 3.8, col: 0xff9a4a }, { letra: "H", v: 30, x: 11.4, col: 0xff6a5a },
  ];
  const base = new THREE.Mesh(new RoundedBoxGeometry(30, 0.5, 5.6, 2, 0.12), new THREE.MeshPhysicalMaterial({ color: 0x141b27, roughness: 0.4, clearcoat: 0.6 })); base.position.y = -0.25; R.add(base);
  function rotulo(ancho, alto, tam, color, mono = false) {
    const pxu = 64, cv = document.createElement("canvas"); cv.width = Math.round(ancho * pxu); cv.height = Math.round(alto * pxu);
    const g = cv.getContext("2d"); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    let ultimo = null;
    m.userData.poner = (txt) => { if (txt === ultimo) return; ultimo = txt; g.clearRect(0, 0, cv.width, cv.height); g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${Math.round(tam * pxu)}px ${mono ? '"JetBrains Mono"' : '"Inter"'}, sans-serif`; g.fillText(txt, cv.width / 2, cv.height / 2 + 2); tex.needsUpdate = true; };
    m.userData.noCortar = true; m.userData.sinBordes = true; return m;
  }
  const cols = datos.map((d) => {
    const m = new THREE.MeshPhysicalMaterial({ color: d.col, roughness: 0.12, transparent: true, opacity: 0.6, clearcoat: 1, emissive: d.col, emissiveIntensity: 0.5, depthWrite: false });
    const b = new THREE.Mesh(new RoundedBoxGeometry(AN, 1, FON, 3, 0.2), m); R.add(b);
    const tope = new THREE.Mesh(new RoundedBoxGeometry(AN + 0.1, 0.14, FON + 0.1, 2, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(d.col).multiplyScalar(1.7), toneMapped: false })); R.add(tope);
    const val = rotulo(6, 1.8, 1.25, "#ffffff", true); R.add(val);
    const letra = rotulo(4, 2.4, 1.9, "#ffffff"); letra.position.set(d.x, -1.7, FON / 2 + 0.3); letra.userData.poner(d.letra); R.add(letra);
    return { d, b, m, tope, val, letra };
  });
  const usado = rotulo(11, 1.5, 0.95, "#ffb22e"); usado.userData.poner("EL MÁS USADO"); R.add(usado);
  const st = { ver: 1, a: 0, foco: 0, usado: 0 };
  function actualizar(t) {
    R.visible = st.ver > 0.003; if (!R.visible) return;
    cols.forEach((c, i) => {
      const k = sm(clamp(st.a * 1.5 - i * 0.18)) * st.ver, alto = Math.max(0.0001, c.d.v * ESC * k);
      c.b.scale.y = alto; c.b.position.set(c.d.x, alto / 2, 0); c.tope.position.set(c.d.x, alto, 0); c.tope.visible = k > 0.01;
      c.val.position.set(c.d.x, alto + 1.5, FON / 2 + 0.3); c.val.visible = k > 0.01; c.val.userData.poner(`${Math.round(c.d.v * k)} %`);
      const f = st.foco > 0 && st.foco !== i + 1;
      c.m.opacity = f ? 0.28 : 0.6; c.m.emissiveIntensity = f ? 0.18 : st.foco === i + 1 ? 0.95 : 0.5;
    });
    const cm = cols[1], alt = cm.d.v * ESC * sm(clamp(st.a * 1.5 - 0.18));
    usado.position.set(cm.d.x, alt + 3.6, FON / 2 + 0.3); usado.material.opacity = clamp(st.usado); usado.visible = st.usado > 0.003;
  }
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    partes: { colL: pl([-11.4, 4, 0], 5), colM: pl([-3.8, 8, 0], 6), colQ: pl([3.8, 13, 0], 7), colH: pl([11.4, 15, 0], 8), centro: pl([0, 14, 0], 17) },
    caja: [[-15.5, -3.2, -2.8], [15.5, 36.5, 2.8]],
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { ver: 1, a: 0, foco: 0, usado: 0 },
    actualizar,
  };
}
