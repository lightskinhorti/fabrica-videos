// Menaje genérico (unidades en cm): cuenco con sopa (sacado de 07-microondas), plato llano y vaso.
//   cuenco({ medio, sopa: true|false })  16 cm de diámetro; medio: solo la mitad de atrás (para cortes)
//   plato({ radio })                     plato llano de cerámica con ala
//   vaso({ radio, alto, lleno })         vaso de cristal con agua (lleno de 0 a 1)
// Partes: cuenco → borde, sopa, base; plato → centro, ala; vaso → agua, borde.
// Mandos: cuenco → vapor (0..1); vaso → lleno (0..1).

export function cuenco(THREE, C, X, M, { medio = false, sopa = true } = {}) {
  const { hash, clamp } = C;
  const PI = Math.PI, v2 = (x, y) => new THREE.Vector2(x, y), frac = (x) => x - Math.floor(x);
  const curva = (pts, n) => new THREE.SplineCurve(pts.map(([x, y]) => v2(x, y))).getPoints(n).map((p) => [p.x, p.y]);
  const OUT = curva([[4.1, 0.45], [5.8, 2.0], [7.3, 4.2], [7.9, 6.1], [8.0, 6.6]], 18);
  const INN = curva([[7.6, 6.6], [7.4, 6.0], [6.9, 4.3], [5.4, 2.4], [3.5, 1.25], [0, 1.05]], 24);
  const PERFIL = [[0, 0.5], [3.3, 0.5], [3.4, 0], [4.0, 0], ...OUT, [7.85, 6.75], ...INN];
  const sopaTex = X.lienzo(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "#bf5f2c"); gr.addColorStop(1, "#8c3c1a");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      const x = hash(i * 1.3) * w, y = hash(i * 2.9) * h, r = 3 + hash(i * 4.1) * 11;
      g.fillStyle = ["#d9772f", "#eaa24c", "#5d7d2c", "#c4502a", "#f2c27a", "#7a3216"][i % 6]; g.globalAlpha = 0.3 + 0.45 * hash(i * 5.3);
      g.beginPath(); g.ellipse(x, y, r, r * (0.5 + 0.5 * hash(i * 6.7)), hash(i) * 3, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 110; i++) { const x = hash(i * 7.7) * w, y = hash(i * 8.3) * h, r = 2 + hash(i * 9.1) * 7; g.strokeStyle = "rgba(255,225,160,0.55)"; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); }
  }).tex;
  const sopaMat = new THREE.MeshPhysicalMaterial({ map: sopaTex, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 });
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.LatheGeometry(PERFIL.map(([x, y]) => v2(x, y)), 128, medio ? PI / 2 : 0, medio ? PI : 2 * PI), M.ceramica); g.add(m);
  const linea = new THREE.Mesh(new THREE.TorusGeometry(7.93, 0.06, 8, 160, medio ? PI : 2 * PI), new THREE.MeshPhysicalMaterial({ color: 0x24476f, roughness: 0.3, clearcoat: 1 }));
  linea.rotation.x = -PI / 2; linea.position.y = 6.45; g.add(linea);
  const s = new THREE.Mesh(new THREE.CircleGeometry(7.22, 128, 0, medio ? PI : 2 * PI), sopaMat); s.rotation.x = -PI / 2; s.position.y = 5.4; s.visible = sopa; g.add(s);
  // steam: soft sprites rising and fading, deterministic in t
  const vaporTex = X.lienzo(128, 128, (gg, w, h) => { const img = gg.createImageData(w, h), d = img.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (x - 64) / 64, dy = (y - 64) / 64, r = Math.hypot(dx, dy); const n = 0.6 * X.ruido(x / 12, y / 12, 3) + 0.4 * X.ruido(x / 5, y / 5, 4); const a = clamp(1 - r) ** 1.7 * (0.4 + 0.8 * n); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 240; d[i + 3] = clamp(a) * 255; } gg.putImageData(img, 0, 0); }).tex;
  const vapor = new THREE.Group(); vapor.position.y = 5.8; g.add(vapor);
  const items = []; for (let i = 0; i < 7; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: vaporTex, transparent: true, depthWrite: false, opacity: 0 })); vapor.add(sp); items.push(sp); }
  let kv = 0;
  return {
    grupo: g, perfil: { OUT, INN, PERFIL },
    partes: { borde: { obj: g, local: [7.6, 6.6, 0], radio: 1.5 }, sopa: { obj: g, local: [0, 5.4, 0], radio: 7.2 }, base: { obj: g, local: [0, 0.3, 0], radio: 4 } },
    controles: { vapor: (k) => { kv = k; vapor.visible = k > 0.01; } },
    defecto: { vapor: 0 },
    actualizar(t) {
      if (kv < 0.01) return;
      items.forEach((sp, i) => { const f = frac(t * 0.22 + hash(i * 3.3)); sp.position.set((hash(i * 5.1) - 0.5) * 7 + Math.sin(t * 0.7 + i) * 0.8, f * 11, (hash(i * 7.3) - 0.5) * 5); sp.scale.setScalar(3 + f * 6); sp.material.opacity = 0.16 * Math.sin(PI * f) * kv; sp.material.rotation = i + t * 0.15; });
    },
  };
}

export function plato(THREE, C, X, M, { radio = 13 } = {}) {
  const v2 = (x, y) => new THREE.Vector2(x, y), r = radio;
  const g = new THREE.Group();
  const perfil = [[0, 0.05], [r * 0.45, 0.05], [r * 0.5, 0], [r * 0.56, 0], [r * 0.62, 0.35], [r * 0.95, 1.3], [r, 1.45], [r * 0.99, 1.6], [r * 0.93, 1.45], [r * 0.6, 0.62], [r * 0.55, 0.5], [0, 0.5]];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(perfil.map(([x, y]) => v2(x, y)), 128), M.ceramica));
  return { grupo: g, partes: { centro: { obj: g, local: [0, 0.5, 0], radio: r * 0.55 }, ala: { obj: g, local: [r * 0.8, 1.1, 0], radio: r * 0.2 } } };
}

export function vaso(THREE, C, X, M, { radio = 3.6, alto = 11, lleno = 0.7 } = {}) {
  const v2 = (x, y) => new THREE.Vector2(x, y);
  const g = new THREE.Group();
  const cristal = new THREE.MeshPhysicalMaterial({ color: 0xdfe8f5, metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.4, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 1 });
  const perfil = [[0, 0], [radio * 0.92, 0], [radio, alto], [radio - 0.18, alto], [radio * 0.92 - 0.18, 0.6], [0, 0.6]];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(perfil.map(([x, y]) => v2(x, y)), 96), cristal));
  const agua = new THREE.Mesh(new THREE.CylinderGeometry(radio - 0.2, radio * 0.92 - 0.2, 1, 64), new THREE.MeshPhysicalMaterial({ color: 0xbfd8f0, roughness: 0.05, transmission: 0.9, thickness: 2, ior: 1.33, transparent: true, opacity: 0.85 }));
  g.add(agua);
  const llenar = (k) => { const h = Math.max(0.01, (alto - 0.8) * k); agua.scale.y = h; agua.position.y = 0.6 + h / 2; agua.visible = k > 0.01; };
  llenar(lleno);
  return { grupo: g, partes: { agua: { obj: agua, local: [0, 0, 0], radio: radio }, borde: { obj: g, local: [radio, alto, 0], radio: 1 } }, controles: { lleno: llenar }, defecto: { lleno } };
}
