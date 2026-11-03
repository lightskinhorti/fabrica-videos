// Materiales comunes de la biblioteca de objetos (Las cosas por dentro). Los mismos que usó 07-microondas,
// sacados aquí para que cada objeto los reutilice. Se crean una vez por vídeo: crearMateriales(THREE, C, X).
// Cada objeto que necesite cambiar opacidad o corte hace su propia copia (base.js lo hace solo).

export function crearMateriales(THREE, C, X) {
  const { hash } = C;
  const metalTex = (c, rx = 2, ry = 2) => X.rep(X.tex.metal({ color: c }), rx, ry);
  const bobTex = X.lienzo(256, 256, (g, w, h) => {
    g.fillStyle = "#b8653a"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(255,220,180,${0.15 + 0.1 * hash(y)})`; g.fillRect(0, y, w, 1.5); g.fillStyle = "rgba(60,20,5,0.35)"; g.fillRect(0, y + 2.5, w, 1); }
  }).tex;
  const pcbTex = X.lienzo(256, 512, (g, w, h) => {
    g.fillStyle = "#1a4a35"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(210,170,90,0.6)"; g.lineWidth = 3;
    for (let i = 0; i < 40; i++) { g.beginPath(); let x = hash(i) * w, y = hash(i + 1) * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) y += (hash(i * 3 + k) - 0.5) * 200; else x += (hash(i * 5 + k) - 0.5) * 160; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 14; i++) { g.fillStyle = "#111"; g.fillRect(hash(i * 7) * (w - 60), hash(i * 9) * (h - 40), 30 + hash(i) * 40, 20 + hash(i * 2) * 30); }
  }).tex;
  const M = {
    metalTex,
    acero: new THREE.MeshPhysicalMaterial({ color: 0xc6cad0, metalness: 1, roughness: 0.33, map: metalTex("#b6bac0"), clearcoat: 0.25, clearcoatRoughness: 0.3 }),
    aceroOsc: new THREE.MeshPhysicalMaterial({ color: 0x6a6e75, metalness: 1, roughness: 0.38, map: metalTex("#72767d") }),
    aceroD: new THREE.MeshPhysicalMaterial({ color: 0xbfc4ca, metalness: 1, roughness: 0.32, map: metalTex("#b3b8bf", 3, 1), clearcoat: 0.3 }),
    grafito: new THREE.MeshPhysicalMaterial({ color: 0x17191d, metalness: 0.35, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    negro: X.mat.negro(),
    cobre: new THREE.MeshPhysicalMaterial({ color: 0xd27b4b, metalness: 1, roughness: 0.27, clearcoat: 0.35, side: THREE.DoubleSide }),
    aluminio: new THREE.MeshPhysicalMaterial({ color: 0xd9dce0, metalness: 1, roughness: 0.36, map: metalTex("#cfd2d6", 1, 1), side: THREE.DoubleSide }),
    ferrita: new THREE.MeshPhysicalMaterial({ color: 0x4a4c51, metalness: 0.15, roughness: 0.8, map: X.rep(X.tex.rayado({ fondo: "#55575c", linea: "rgba(0,0,0,0.12)", paso: 5 }), 2, 1), side: THREE.DoubleSide }),
    cincado: new THREE.MeshPhysicalMaterial({ color: 0xaeb6c0, metalness: 1, roughness: 0.3, map: metalTex("#a7afba", 1, 1), side: THREE.DoubleSide }),
    ceramica: new THREE.MeshPhysicalMaterial({ color: 0xe4dfd6, roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.15, envMapIntensity: 0.7 }),
    ceramicaMate: new THREE.MeshPhysicalMaterial({ color: 0xbdb6ab, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.45 }),
    plastico: X.mat.plastico(0x2a2d33),
    plasticoBlanco: new THREE.MeshPhysicalMaterial({ color: 0xeef0f2, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.6 }),
    caucho: new THREE.MeshPhysicalMaterial({ color: 0x1b1c1f, roughness: 0.85, clearcoat: 0.05 }),
    bobinado: new THREE.MeshPhysicalMaterial({ color: 0xe08a55, metalness: 0.9, roughness: 0.3, map: X.rep(bobTex, 1, 3), clearcoat: 0.6 }),
    laminas: new THREE.MeshPhysicalMaterial({ color: 0x5d6067, metalness: 0.8, roughness: 0.42, map: X.rep(X.tex.rayado({ fondo: "#5a5d63", linea: "rgba(0,0,0,0.35)", paso: 4, diagonal: false }), 1, 2) }),
    pcb: new THREE.MeshPhysicalMaterial({ color: 0x0f3b2a, roughness: 0.5, clearcoat: 0.6, map: pcbTex }),
    vidrio: new THREE.MeshPhysicalMaterial({ color: 0x9fb8ae, roughness: 0.06, transparent: true, opacity: 0.26, clearcoat: 1, clearcoatRoughness: 0.04, depthWrite: false, envMapIntensity: 1.0 }),
    vidrioOscuro: new THREE.MeshPhysicalMaterial({ color: 0x2c3a36, roughness: 0.08, transparent: true, opacity: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.05, depthWrite: false, envMapIntensity: 0.5 }),
    corteCara: new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.9 }),
    espuma: new THREE.MeshStandardMaterial({ color: 0xe9dc9a, roughness: 0.95, map: X.rep(X.tex.trama({ fondo: "#e2d18a", punto: "rgba(120,100,40,0.35)", paso: 5 }).tex, 3, 3) }),
  };
  // flat material that ignores lights (lines, rulers, marks)
  M.basica = (color, op = 1, extra = {}) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, toneMapped: false, ...extra });
  // soft round glow texture of a colour "r,g,b"
  M.brilloTex = (rgb) => X.lienzo(128, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(0.35, `rgba(${rgb},0.4)`); r.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = r; g.fillRect(0, 0, w, h); }).tex;
  return M;
}
