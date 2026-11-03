// Pantallas de móvil dibujadas con canvas, en español, para el móvil de detalle.js (X.movil().pantalla).
// Son genéricas: sin logos ni marcas de nadie. Cada función recibe (g, w, h, opciones) y pinta la pantalla entera.
//   bloqueo({ hora, fecha, aviso })          pantalla de bloqueo; aviso = { nombre, texto } (llamada perdida)
//   llamada({ nombre, tipo, desliza, toque }) llamada entrante con "desliza para responder"; toque = 0..1 anillo verde
//   enLlamada({ nombre, tiempo })            llamada en curso con los botones y el botón rojo
//   inicio({ toques })                       pantalla de inicio (tiempo, iconos sin marca, dock); toques = [{ x, y, r, a }]
//   mapa()                                   un mapa claro con el punto azul
//   foto({ zoom })                           foto de una calle nevada de noche (para el gesto de pellizcar)
//   videoApp({ seguir, enviado })            una app de vídeos cortos genérica con un corte lateral dibujado
//   compartir({ elegido, enviado, sube })    la hoja de compartir: contactos, mensaje y botón Enviar
//   anillos(g, lista)                        anillos de toque encima de cualquier pantalla
// Todo depende solo de las opciones (nada de reloj ni azar): vale para HyperFrames.

const F = (peso, px) => `${peso} ${px}px "Inter", sans-serif`;
const h1 = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function texto(g, t, x, y, { f = F(400, 28), c = "#fff", a = "left", b = "alphabetic" } = {}) { g.font = f; g.fillStyle = c; g.textAlign = a; g.textBaseline = b; g.fillText(t, x, y); }
function barraEstado(g, w, h, { hora = "7:42", oscuro = false } = {}) {
  const c = oscuro ? "#111" : "#fff";
  texto(g, hora, w * 0.13, h * 0.034, { f: F(700, w * 0.04), c, a: "center" });
  // signal bars, wifi, battery
  const x0 = w * 0.74, y0 = h * 0.034;
  for (let i = 0; i < 4; i++) { g.fillStyle = c; rr(g, x0 + i * w * 0.012, y0 - (i + 1) * w * 0.006, w * 0.008, (i + 1) * w * 0.006, 2); g.fill(); }
  g.strokeStyle = c; g.lineWidth = w * 0.004;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w * 0.83, y0, w * (0.006 + i * 0.008), -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); }
  rr(g, w * 0.86, y0 - w * 0.022, w * 0.06, w * 0.026, w * 0.008); g.stroke();
  g.fillStyle = c; rr(g, w * 0.866, y0 - w * 0.016, w * 0.042, w * 0.014, 2); g.fill();
}
function indicador(g, w, h, c = "rgba(255,255,255,0.9)") { g.fillStyle = c; rr(g, w * 0.34, h * 0.975, w * 0.32, h * 0.0045, 6); g.fill(); }
function icoTel(g, x, y, s, c = "#fff") {
  g.save(); g.translate(x, y); g.rotate(-0.25); g.fillStyle = c;
  g.beginPath(); g.moveTo(-0.42 * s, -0.5 * s); g.quadraticCurveTo(-0.62 * s, -0.1 * s, -0.25 * s, 0.32 * s); g.quadraticCurveTo(0.1 * s, 0.62 * s, 0.45 * s, 0.5 * s);
  g.lineTo(0.5 * s, 0.25 * s); g.lineTo(0.22 * s, 0.12 * s); g.lineTo(0.08 * s, 0.24 * s); g.quadraticCurveTo(-0.15 * s, 0.1 * s, -0.25 * s, -0.12 * s);
  g.lineTo(-0.12 * s, -0.25 * s); g.lineTo(-0.2 * s, -0.52 * s); g.closePath(); g.fill(); g.restore();
}
// a drawn avatar (illustration, nobody real): coloured disc, shoulders, head and hair
function avatar(g, x, y, r, i = 0) {
  const fondos = ["#d98c5f", "#7b8fd1", "#c9a26b", "#6fb39a", "#b97ab5"], pieles = ["#f0c6a8", "#8d5a3b", "#e8b48f", "#c58c62", "#f3d2b8"], pelos = ["#3b2416", "#111", "#6b3b1f", "#2a1a10", "#c99a4a"];
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  const gr = g.createLinearGradient(x, y - r, x, y + r); gr.addColorStop(0, fondos[i % 5]); gr.addColorStop(1, "#2a2a30");
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.fillStyle = ["#2d3a55", "#e9e9ee", "#7a2e3a", "#2f5d4a", "#444"][i % 5]; g.beginPath(); g.ellipse(x, y + r * 0.95, r * 0.85, r * 0.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = pieles[i % 5]; g.beginPath(); g.ellipse(x, y - r * 0.02, r * 0.36, r * 0.44, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = pelos[i % 5]; g.beginPath(); g.ellipse(x, y - r * 0.3, r * 0.42, r * 0.26, 0, Math.PI, Math.PI * 2); g.fill();
  if (i % 2 === 0) { g.beginPath(); g.ellipse(x - r * 0.33, y + r * 0.05, r * 0.12, r * 0.42, 0.1, 0, Math.PI * 2); g.ellipse(x + r * 0.33, y + r * 0.05, r * 0.12, r * 0.42, -0.1, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

export function bloqueo(g, w, h, { hora = "7:42", fecha = "sábado, 17 de enero", aviso = null, nieve = 0 } = {}) {
  const gr = g.createLinearGradient(0, 0, w * 0.3, h);
  gr.addColorStop(0, "#22252c"); gr.addColorStop(0.45, "#0e1015"); gr.addColorStop(1, "#060709");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const s = g.createRadialGradient(w * 0.75, h * 0.15, 0, w * 0.75, h * 0.15, w * 0.9); s.addColorStop(0, "rgba(120,130,150,0.18)"); s.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = s; g.fillRect(0, 0, w, h);
  barraEstado(g, w, h, { hora });
  texto(g, fecha, w / 2, h * 0.135, { f: F(700, w * 0.046), c: "rgba(225,230,240,0.78)", a: "center" });
  texto(g, hora, w / 2, h * 0.27, { f: F(700, w * 0.27), c: "rgba(232,236,244,0.93)", a: "center" });
  for (let i = 0; i < nieve; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * h1(i)})`; g.beginPath(); g.arc(h1(i * 3) * w, h1(i * 5) * h, 2 + 5 * h1(i * 7), 0, Math.PI * 2); g.fill(); }
  if (aviso) {
    const y = h * 0.74;
    g.fillStyle = "rgba(60,64,72,0.72)"; rr(g, w * 0.05, y, w * 0.9, h * 0.075, w * 0.05); g.fill();
    g.fillStyle = "#33c75a"; rr(g, w * 0.08, y + h * 0.017, w * 0.085, w * 0.085, w * 0.02); g.fill();
    icoTel(g, w * 0.122, y + h * 0.037, w * 0.05);
    texto(g, aviso.nombre || "Sofía", w * 0.2, y + h * 0.032, { f: F(700, w * 0.04) });
    texto(g, aviso.texto || "Llamada perdida", w * 0.2, y + h * 0.058, { f: F(400, w * 0.036), c: "rgba(255,255,255,0.8)" });
    texto(g, "ahora", w * 0.9, y + h * 0.032, { f: F(400, w * 0.032), c: "rgba(255,255,255,0.6)", a: "right" });
  }
  for (const [x, i] of [[w * 0.16, 0], [w * 0.84, 1]]) {
    g.fillStyle = "rgba(255,255,255,0.13)"; g.beginPath(); g.arc(x, h * 0.915, w * 0.068, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)";
    if (i === 0) { rr(g, x - w * 0.012, h * 0.9, w * 0.024, h * 0.03, 4); g.fill(); }
    else { rr(g, x - w * 0.03, h * 0.905, w * 0.06, h * 0.022, 5); g.fill(); g.fillStyle = "#222"; g.beginPath(); g.arc(x, h * 0.916, w * 0.01, 0, Math.PI * 2); g.fill(); }
  }
  indicador(g, w, h);
}

export function llamada(g, w, h, { nombre = "Sofía", tipo = "móvil", desliza = 0, toque = 0, tenue = 0 } = {}) {
  const gr = g.createLinearGradient(0, 0, w * 0.4, h);
  gr.addColorStop(0, "#c9b5a4"); gr.addColorStop(0.5, "#a8958a"); gr.addColorStop(1, "#5e5149");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const s = g.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w); s.addColorStop(0, "rgba(255,240,225,0.25)"); s.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = s; g.fillRect(0, 0, w, h);
  barraEstado(g, w, h);
  avatar(g, w * 0.13, h * 0.1, w * 0.06, 0);
  texto(g, tipo, w * 0.225, h * 0.088, { f: F(400, w * 0.032), c: "rgba(255,255,255,0.75)" });
  texto(g, nombre, w * 0.225, h * 0.118, { f: F(700, w * 0.058) });
  g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 3; g.beginPath(); g.arc(w * 0.88, h * 0.1, w * 0.03, 0, Math.PI * 2); g.stroke();
  texto(g, "i", w * 0.88, h * 0.1 + w * 0.012, { f: F(700, w * 0.034), c: "rgba(255,255,255,0.8)", a: "center" });
  // two quiet buttons and the slider
  for (const [x, t] of [[w * 0.22, "Recordar"], [w * 0.78, "Mensaje"]]) {
    g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.arc(x, h * 0.74, w * 0.055, 0, Math.PI * 2); g.fill();
    texto(g, t, x, h * 0.785, { f: F(400, w * 0.03), c: "rgba(255,255,255,0.8)", a: "center" });
  }
  const y = h * 0.84, H = h * 0.074, x0 = w * 0.08, W = w * 0.84, R = H / 2 - h * 0.006;
  g.fillStyle = "rgba(255,255,255,0.22)"; rr(g, x0, y, W, H, H / 2); g.fill();
  const kx = x0 + H / 2 + desliza * (W - H);
  const sh = g.createLinearGradient(x0 + W * 0.3, 0, x0 + W, 0); sh.addColorStop(0, "rgba(255,255,255,0.55)"); sh.addColorStop(0.5, "rgba(255,255,255,0.95)"); sh.addColorStop(1, "rgba(255,255,255,0.55)");
  texto(g, "desliza para responder", x0 + W * 0.58, y + H * 0.62, { f: F(400, w * 0.04), c: sh, a: "center" });
  g.fillStyle = "#34c759"; g.beginPath(); g.arc(kx, y + H / 2, R, 0, Math.PI * 2); g.fill();
  icoTel(g, kx, y + H / 2, R * 1.0);
  if (toque > 0) {
    g.strokeStyle = `rgba(110,255,150,${0.9 * (1 - toque * 0.5)})`; g.lineWidth = 6;
    g.beginPath(); g.arc(kx, y + H / 2, R * (1.2 + toque * 0.9), 0, Math.PI * 2); g.stroke();
  }
  if (tenue > 0) { g.fillStyle = `rgba(0,0,0,${tenue})`; g.fillRect(0, 0, w, h); }
  indicador(g, w, h);
}

export function enLlamada(g, w, h, { nombre = "Sofía", tiempo = "00:01" } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#4a4b4f"); gr.addColorStop(1, "#1d1e21");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  barraEstado(g, w, h);
  texto(g, tiempo, w / 2, h * 0.115, { f: F(400, w * 0.036), c: "rgba(255,255,255,0.7)", a: "center" });
  texto(g, nombre, w / 2, h * 0.16, { f: F(700, w * 0.065), a: "center" });
  const et = ["altavoz", "vídeo", "silencio", "añadir", "fin", "teclado"];
  et.forEach((t, i) => {
    const x = w * (0.22 + (i % 3) * 0.28), y = h * (0.58 + Math.floor(i / 3) * 0.14);
    if (t === "fin") { g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(x, y, w * 0.085, 0, Math.PI * 2); g.fill(); g.save(); g.translate(x, y); g.rotate(2.2); icoTel(g, 0, 0, w * 0.07); g.restore(); }
    else { g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.arc(x, y, w * 0.085, 0, Math.PI * 2); g.fill(); g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(x, y, w * 0.022, 0, Math.PI * 2); g.fill(); }
    texto(g, t, x, y + w * 0.13, { f: F(400, w * 0.03), c: "rgba(255,255,255,0.75)", a: "center" });
  });
  indicador(g, w, h);
}

const APPS = [["#3d8bfd", "#1e5fd8", "nube"], ["#ff9f0a", "#ff6a00", "sol"], ["#30d158", "#14a03c", "chat"], ["#ff375f", "#d70f45", "nota"], ["#64d2ff", "#2a9fd6", "ola"], ["#bf5af2", "#8a2be2", "foto"], ["#ffd60a", "#e0b000", "nota2"], ["#5e5ce6", "#3a37c4", "ajuste"]];
function icono(g, x, y, s, i) {
  const [a, b, tipo] = APPS[i % APPS.length];
  const gr = g.createLinearGradient(x, y, x, y + s); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; rr(g, x, y, s, s, s * 0.23); g.fill();
  g.fillStyle = "rgba(255,255,255,0.92)"; g.strokeStyle = "rgba(255,255,255,0.92)"; g.lineWidth = s * 0.07;
  const cx = x + s / 2, cy = y + s / 2;
  if (tipo === "nube") { g.beginPath(); g.arc(cx - s * 0.12, cy + s * 0.04, s * 0.15, 0, 7); g.arc(cx + s * 0.08, cy - s * 0.03, s * 0.2, 0, 7); g.fill(); }
  else if (tipo === "sol") { g.beginPath(); g.arc(cx, cy, s * 0.17, 0, 7); g.fill(); }
  else if (tipo === "chat") { g.beginPath(); g.ellipse(cx, cy, s * 0.26, s * 0.2, 0, 0, 7); g.fill(); }
  else if (tipo === "foto") { for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(cx + Math.cos(k) * s * 0.12, cy + Math.sin(k) * s * 0.12, s * 0.1, s * 0.05, k, 0, 7); g.fill(); } }
  else if (tipo === "ola") { g.beginPath(); g.moveTo(x + s * 0.2, cy); g.quadraticCurveTo(cx - s * 0.1, cy - s * 0.2, cx, cy); g.quadraticCurveTo(cx + s * 0.1, cy + s * 0.2, x + s * 0.8, cy); g.stroke(); }
  else { rr(g, cx - s * 0.2, cy - s * 0.22, s * 0.4, s * 0.44, s * 0.06); g.stroke(); }
}
export function inicio(g, w, h, { toques = [] } = {}) {
  const gr = g.createLinearGradient(0, 0, w * 0.2, h); gr.addColorStop(0, "#6b5a50"); gr.addColorStop(0.5, "#4a3e38"); gr.addColorStop(1, "#2a2420");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  barraEstado(g, w, h);
  // weather widget
  const wg = g.createLinearGradient(0, h * 0.06, 0, h * 0.2); wg.addColorStop(0, "#3a6fb5"); wg.addColorStop(1, "#5b8fd0");
  g.fillStyle = wg; rr(g, w * 0.07, h * 0.065, w * 0.4, w * 0.4, w * 0.07); g.fill();
  texto(g, "Madrid", w * 0.11, h * 0.1, { f: F(700, w * 0.035) });
  texto(g, "1°", w * 0.11, h * 0.155, { f: F(400, w * 0.11) });
  texto(g, "Nieve", w * 0.11, h * 0.2, { f: F(700, w * 0.03) });
  const s = w * 0.17;
  for (let i = 0; i < 4; i++) icono(g, w * (0.54 + (i % 2) * 0.21), h * 0.065 + Math.floor(i / 2) * (s + w * 0.065), s, i);
  for (let i = 0; i < 8; i++) icono(g, w * (0.07 + (i % 4) * 0.225), h * (0.3 + Math.floor(i / 4) * 0.12), s, i + 4);
  g.fillStyle = "rgba(40,40,44,0.55)"; rr(g, w * 0.38, h * 0.865, w * 0.24, h * 0.03, h * 0.015); g.fill();
  texto(g, "Buscar", w * 0.5, h * 0.886, { f: F(700, w * 0.03), c: "rgba(255,255,255,0.85)", a: "center" });
  g.fillStyle = "rgba(255,255,255,0.18)"; rr(g, w * 0.04, h * 0.905, w * 0.92, h * 0.07, w * 0.08); g.fill();
  for (const [x, t] of [[0.3, 0], [0.55, 1]]) { g.fillStyle = "#30d158"; rr(g, w * x, h * 0.912, s * 0.95, s * 0.95, s * 0.22); g.fill(); if (t === 0) icoTel(g, w * x + s * 0.47, h * 0.912 + s * 0.47, s * 0.5); else { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(w * x + s * 0.47, h * 0.912 + s * 0.45, s * 0.28, s * 0.22, 0, 0, 7); g.fill(); } }
  anillos(g, toques.map((t) => ({ ...t, x: t.x * w, y: t.y * h, r: t.r * w })));
  indicador(g, w, h);
}
export function anillos(g, lista) {
  for (const t of lista) {
    if (!(t.a > 0)) continue;
    g.strokeStyle = `rgba(255,255,255,${0.75 * t.a})`; g.lineWidth = 3;
    g.beginPath(); g.arc(t.x, t.y, t.r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(255,255,255,${0.12 * t.a})`; g.fill();
  }
}

export function mapa(g, w, h) {
  g.fillStyle = "#efebe4"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#cfe5c4"; rr(g, w * 0.55, h * 0.16, w * 0.35, h * 0.12, 20); g.fill();
  g.fillStyle = "#b6d6f2"; g.beginPath(); g.moveTo(0, h * 0.62); g.quadraticCurveTo(w * 0.4, h * 0.56, w, h * 0.66); g.lineTo(w, h * 0.7); g.quadraticCurveTo(w * 0.4, h * 0.6, 0, h * 0.66); g.fill();
  g.lineCap = "round";
  for (let i = 0; i < 16; i++) {
    g.strokeStyle = "#ffffff"; g.lineWidth = 10 + 6 * h1(i);
    const a = i < 8, p = (i % 8) / 8 + 0.06 * h1(i * 3);
    g.beginPath();
    if (a) { g.moveTo(-20, p * h); g.lineTo(w + 20, p * h + (h1(i) - 0.5) * 120); } else { g.moveTo(p * w, -20); g.lineTo(p * w + (h1(i) - 0.5) * 140, h + 20); }
    g.stroke();
  }
  g.strokeStyle = "#f7d36b"; g.lineWidth = 22; g.beginPath(); g.moveTo(-20, h * 0.42); g.lineTo(w + 20, h * 0.36); g.stroke();
  g.strokeStyle = "#f7d36b"; g.beginPath(); g.moveTo(w * 0.36, -20); g.lineTo(w * 0.44, h + 20); g.stroke();
  for (let i = 0; i < 18; i++) { g.fillStyle = "#c6c2bb"; g.beginPath(); g.arc(h1(i * 2) * w, h1(i * 4) * h * 0.8, 5, 0, 7); g.fill(); }
  g.fillStyle = "rgba(66,133,244,0.22)"; g.beginPath(); g.arc(w * 0.5, h * 0.45, w * 0.09, 0, 7); g.fill();
  g.fillStyle = "#fff"; g.beginPath(); g.arc(w * 0.5, h * 0.45, w * 0.032, 0, 7); g.fill();
  g.fillStyle = "#3478f6"; g.beginPath(); g.arc(w * 0.5, h * 0.45, w * 0.024, 0, 7); g.fill();
  barraEstado(g, w, h, { oscuro: true });
  g.fillStyle = "#ffffff"; rr(g, 0, h * 0.8, w, h * 0.2, 40); g.fill();
  g.fillStyle = "#e9e9ee"; rr(g, w * 0.05, h * 0.825, w * 0.9, h * 0.045, 22); g.fill();
  texto(g, "Buscar un sitio", w * 0.12, h * 0.855, { f: F(400, w * 0.04), c: "#8a8a8e" });
  for (let i = 0; i < 4; i++) { g.fillStyle = ["#5ac8fa", "#ff9500", "#34c759", "#af52de"][i]; g.beginPath(); g.arc(w * (0.14 + i * 0.24), h * 0.92, w * 0.05, 0, 7); g.fill(); }
  indicador(g, w, h, "#222");
}

export function foto(g, w, h, { zoom = 1 } = {}) {
  g.save();
  g.translate(w / 2, h * 0.42); g.scale(zoom, zoom); g.translate(-w / 2, -h * 0.42);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b1018"); gr.addColorStop(0.5, "#1b2230"); gr.addColorStop(1, "#141820");
  g.fillStyle = gr; g.fillRect(-w, -h, 3 * w, 3 * h);
  for (let i = 0; i < 9; i++) { const x = i * w * 0.13 - 20, bh = h * (0.18 + 0.12 * h1(i)); g.fillStyle = "#151a24"; g.fillRect(x, h * 0.45 - bh, w * 0.12, bh); for (let k = 0; k < 6; k++) if (h1(i * 9 + k) > 0.55) { g.fillStyle = "rgba(255,190,110,0.7)"; g.fillRect(x + w * 0.02 + (k % 2) * w * 0.05, h * 0.45 - bh + 20 + Math.floor(k / 2) * 40, w * 0.025, 18); } }
  for (const [x, y] of [[0.22, 0.28], [0.8, 0.24]]) { const r = g.createRadialGradient(w * x, h * y, 0, w * x, h * y, w * 0.4); r.addColorStop(0, "rgba(255,170,90,0.85)"); r.addColorStop(0.2, "rgba(255,140,60,0.3)"); r.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.fillRect(w * x - 3, h * y, 6, h * 0.25); }
  const sg = g.createLinearGradient(0, h * 0.4, 0, h); sg.addColorStop(0, "#f2b47c"); sg.addColorStop(0.5, "#d9945e"); sg.addColorStop(1, "#8a5a3a");
  g.fillStyle = sg; g.beginPath(); g.moveTo(-50, h * 0.62); g.quadraticCurveTo(w * 0.3, h * 0.42, w * 0.62, h * 0.5); g.quadraticCurveTo(w * 0.9, h * 0.56, w + 50, h * 0.48); g.lineTo(w + 50, h + 50); g.lineTo(-50, h + 50); g.fill();
  g.strokeStyle = "#1a1410"; g.lineCap = "round";
  for (let i = 0; i < 3; i++) { const x = w * (0.35 + i * 0.15); g.lineWidth = 9; g.beginPath(); g.moveTo(x, h * 0.55); g.lineTo(x + 10, h * 0.2); g.stroke(); g.lineWidth = 4; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x + 5, h * (0.25 + k * 0.05)); g.lineTo(x + (k % 2 ? 60 : -60), h * (0.2 + k * 0.05)); g.stroke(); } }
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * h1(i)})`; g.beginPath(); g.arc(h1(i * 3) * w, h1(i * 5) * h * 0.7, 1.5 + 2.5 * h1(i * 7), 0, 7); g.fill(); }
  g.restore();
  g.fillStyle = "#000"; g.fillRect(0, h * 0.9, w, h * 0.1);
  for (let i = 0; i < 4; i++) { g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 4; g.beginPath(); g.arc(w * (0.15 + i * 0.23), h * 0.935, w * 0.025, 0, 7); g.stroke(); }
  indicador(g, w, h);
}

// a short-video app (generic): our own cutaway drawn flat as the video, icons on the right, info at the bottom
export function videoApp(g, w, h, { seguir = false, enviado = null, t = 0 } = {}) {
  g.fillStyle = "#07080b"; g.fillRect(0, 0, w, h);
  const fg = g.createRadialGradient(w * 0.42, h * 0.05, 0, w * 0.42, h * 0.05, w * 0.5); fg.addColorStop(0, "#f6c37a"); fg.addColorStop(0.6, "#b98a5a"); fg.addColorStop(1, "rgba(60,40,30,0)");
  g.fillStyle = fg; g.beginPath(); g.ellipse(w * 0.38, h * 0.06, w * 0.48, h * 0.14, -0.15, 0, 7); g.fill();
  g.fillStyle = "rgba(150,170,200,0.12)"; g.fillRect(0, h * 0.2, w, h * 0.12);
  g.strokeStyle = "rgba(230,240,255,0.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w, h * 0.2); g.stroke();
  for (let i = 0; i < 9; i++) {
    const x = w * (0.05 + i * 0.12);
    for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,185,80,${0.5 + 0.2 * k})`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x + w * 0.06, h * 0.32, w * (0.03 + k * 0.012), h * (0.03 + k * 0.03), 0, Math.PI, 2 * Math.PI); g.stroke(); }
    g.fillStyle = "#f2f5fa"; rr(g, x + w * 0.04, h * 0.318, w * 0.04, 6, 3); g.fill();
  }
  for (let i = 0; i < 60; i++) { g.fillStyle = ["#ff3b30", "#34c759", "#3478f6"][i % 3]; rr(g, i * w / 60 + 2, h * 0.335, w / 60 - 5, 10, 2); g.fill(); }
  g.fillStyle = "#14171c"; g.fillRect(0, h * 0.35, w, h * 0.45);
  // right column icons
  const ic = (y, tipo) => {
    g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = 4; const x = w * 0.9;
    if (tipo === 0) { g.beginPath(); g.moveTo(x, y + 14); g.bezierCurveTo(x - 30, y - 6, x - 14, y - 26, x, y - 10); g.bezierCurveTo(x + 14, y - 26, x + 30, y - 6, x, y + 14); g.stroke(); }
    else if (tipo === 1) { g.beginPath(); g.ellipse(x, y - 4, 22, 18, 0, 0, 7); g.stroke(); }
    else if (tipo === 2) { g.beginPath(); g.arc(x, y - 4, 16, 0.3, 5.8); g.stroke(); }
    else { g.beginPath(); g.moveTo(x - 20, y + 10); g.lineTo(x + 20, y - 18); g.lineTo(x + 4, y + 18); g.lineTo(x - 2, y + 2); g.closePath(); g.stroke(); }
  };
  [0, 1, 2, 3].forEach((k) => ic(h * (0.4 + k * 0.07), k));
  avatar(g, w * 0.08, h * 0.72, w * 0.04, 3);
  texto(g, "lascosaspordentro", w * 0.14, h * 0.728, { f: F(700, w * 0.032) });
  g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2; rr(g, w * 0.55, h * 0.705, w * 0.2, h * 0.032, 10); g.stroke();
  texto(g, seguir ? "Siguiendo" : "Seguir", w * 0.65, h * 0.727, { f: F(700, w * 0.03), a: "center" });
  texto(g, "♪ sonido original", w * 0.06, h * 0.77, { f: F(400, w * 0.028), c: "rgba(255,255,255,0.8)" });
  g.fillStyle = "#000"; g.fillRect(0, h * 0.8, w, h * 0.2);
  for (let i = 0; i < 5; i++) { g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.arc(w * (0.1 + i * 0.2), h * 0.84, w * 0.025, 0, 7); g.stroke(); }
  if (enviado) { avatar(g, w * 0.3, h * 0.25, w * 0.07, 0); texto(g, enviado, w * 0.3, h * 0.31, { f: F(700, w * 0.03), a: "center" }); texto(g, "Enviado", w * 0.3, h * 0.335, { f: F(400, w * 0.028), a: "center" }); }
  indicador(g, w, h);
}
export function compartir(g, w, h, { elegido = -1, enviado = false, sube = 1, nombres = ["Lucía", "Daniel", "Marta", "Hugo"] } = {}) {
  const y0 = h * (0.3 + (1 - sube) * 0.7);
  g.fillStyle = `rgba(0,0,0,${0.45 * sube})`; g.fillRect(0, 0, w, h);
  g.fillStyle = "#26272b"; rr(g, 0, y0, w, h - y0 + 40, 36); g.fill();
  g.fillStyle = "rgba(255,255,255,0.3)"; rr(g, w * 0.44, y0 + 14, w * 0.12, 8, 4); g.fill();
  g.fillStyle = "#38393e"; rr(g, w * 0.05, y0 + h * 0.03, w * 0.9, h * 0.042, 18); g.fill();
  texto(g, "Buscar", w * 0.12, y0 + h * 0.058, { f: F(400, w * 0.035), c: "rgba(255,255,255,0.55)" });
  nombres.forEach((n, i) => {
    const x = w * (0.15 + i * 0.235), y = y0 + h * 0.14;
    avatar(g, x, y, w * 0.075, i);
    if (i === elegido) { g.strokeStyle = "#3d8bff"; g.lineWidth = 6; g.beginPath(); g.arc(x, y, w * 0.085, 0, 7); g.stroke(); g.fillStyle = "#3d8bff"; g.beginPath(); g.arc(x + w * 0.055, y + w * 0.055, w * 0.022, 0, 7); g.fill(); }
    texto(g, n, x, y + w * 0.13, { f: F(i === elegido ? 700 : 400, w * 0.032), c: "rgba(255,255,255,0.85)", a: "center" });
  });
  texto(g, "Escribe un mensaje…", w * 0.07, y0 + h * 0.3, { f: F(400, w * 0.034), c: "rgba(255,255,255,0.45)" });
  g.fillStyle = enviado ? "#2b2d33" : "#2f86ff"; rr(g, w * 0.05, y0 + h * 0.35, w * 0.9, h * 0.05, 14); g.fill();
  texto(g, enviado ? "✓ Enviado" : "Enviar", w / 2, y0 + h * 0.383, { f: F(700, w * 0.04), a: "center" });
  indicador(g, w, h);
}
