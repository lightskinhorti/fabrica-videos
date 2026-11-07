// Motor común de los vídeos de Dinero sin lío: estilo plano 2D con los colores de la foto de perfil (papel crema,
// tinta azul marino, oro y rojo). Momentos anclados a la voz, subtítulos arriba con la palabra clave subrayada en
// amarillo, el gancho en grande, piezas que entran y salen, cifras que cuentan y notas honestas abajo.
// Cada vídeo escribe sus piezas en el HTML, mueve lo que quiera con mover() y llama a pintar(t).
//
// En escena (JSON del index.html):
//   momentos: [{ id, clave, fin?, mas? }]  (igual que en Las cosas por dentro: clave = comienzo de una palabra de la
//             voz, buscada en orden; sin palabras de números, que Whisper escribe en cifras)
//   gancho: { texto, clave, tam? }  (el gancho en grande durante los primeros segundos; los subtítulos esperan.
//           tam: tamaño de la letra en px, 104 si no se dice; un gancho largo en dos líneas va mejor a 90)
//   piezas: [{ id, desde, hasta?, entra?, sale?, dura?, alto? }]  (id de un elemento del HTML; desde y hasta =
//           momento o segundos; entra y sale: "sube", "baja", "izq", "der", "escala", "sello", "fundido" o "crece";
//           las que entran antes del segundo 1 ya están en el fotograma 0, que es la portada de TikTok)
//           crece: para columnas que suben desde el suelo. La pieza pasa de 0 a su alto (el height de su style, o
//           alto en px) con el borde de abajo quieto; dura 0,8 s si no se dice. Al salir con "crece", baja.
//           Ejemplo: <div class="pieza barcol" id="b21" style="left:110px; top:650px; width:240px; height:600px">
//           con { "id": "b21", "desde": "GENERAL", "entra": "crece" } (06-iva y 07-cajero lo hacían a mano).
//   cifras: [{ id, desde, a, de?, dura?, formato?: "euros" | "numero" | "pct", dec? }]  (el texto del elemento
//           cuenta de `de` a `a`; varias entradas con el mismo id van una detrás de otra)
//   notas: [{ texto, desde }]  (cada nota dura hasta la siguiente; texto "" la quita)
//   sonidos: los usa sonido_pordentro.py (fondo: "claro" pone una base suave y luminosa en vez del zumbido grave)
// Iconos planos para el HTML: <div class="pieza" id="x" data-icono="moneda" data-args='["€", 220]'></div>
// (moneda, billete, decimo, edificio, oficina, persona, maletin, fabrica, tachado, sello, doc).

export const COLOR = {
  tinta: "#1d2a44", papel: "#f4eee2", oro: "#f2b705", oro2: "#c98f00", rojo: "#e5383b",
  blanco: "#fffaf0", verde: "#2f8f6b", morado: "#8e6bbf", azul: "#4a78c2",
};
const C = COLOR;

// flat icons: a navy silhouette offset behind each shape, like the profile picture's coin
const sombra = (forma) => `<g transform="translate(12 12)" fill="${C.tinta}" stroke="none">${forma(true)}</g>${forma(false)}`;
export const ICONOS = {
  moneda: (texto = "€", tam = 220) => `<svg width="${tam}" height="${tam}" viewBox="0 0 240 240">${sombra((s) => `<circle cx="116" cy="116" r="104" ${s ? "" : `fill="${C.oro}" stroke="${C.tinta}" stroke-width="10"`}/>`)}<circle cx="116" cy="116" r="80" fill="none" stroke="${C.oro2}" stroke-width="7"/><text x="116" y="122" text-anchor="middle" dominant-baseline="central" font-family="Archivo Black" font-size="${String(texto).length > 2 ? 58 : 112}" fill="${C.tinta}">${texto}</text></svg>`,

  billete: (valor = "500", color = C.morado, w = 520) => {
    const h = Math.round(w * 0.5125);
    return `<svg width="${w + 20}" height="${h + 20}" viewBox="0 0 ${w + 20} ${h + 20}">${sombra((s) => `<rect x="4" y="4" width="${w}" height="${h}" rx="${w * 0.035}" ${s ? "" : `fill="${color}" stroke="${C.tinta}" stroke-width="8"`}/>`)}
      <rect x="${4 + w * 0.05}" y="${4 + h * 0.1}" width="${w * 0.9}" height="${h * 0.8}" rx="${w * 0.02}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="${w * 0.008}"/>
      <circle cx="${4 + w * 0.73}" cy="${4 + h * 0.5}" r="${h * 0.27}" fill="rgba(255,255,255,0.22)"/>
      <text x="${4 + w * 0.73}" y="${4 + h * 0.52}" text-anchor="middle" dominant-baseline="central" font-family="Archivo Black" font-size="${h * 0.26}" fill="${C.tinta}" opacity="0.45">€</text>
      <text x="${4 + w * 0.1}" y="${4 + h * 0.27}" dominant-baseline="central" font-family="Archivo Black" font-size="${h * 0.15}" fill="#fff">${valor}</text>
      <text x="${4 + w * 0.09}" y="${4 + h * 0.66}" dominant-baseline="central" font-family="Archivo Black" font-size="${h * 0.34}" fill="#fff">${valor}</text></svg>`;
  },

  decimo: (numero = "27418", w = 600) => {
    const h = Math.round(w * 0.56), r = h / 26;
    const dientes = Array.from({ length: 11 }, (_, i) => `<circle cx="4" cy="${4 + (h * (i + 0.5)) / 11}" r="${r}" fill="${C.papel}"/>`).join("");
    return `<svg width="${w + 20}" height="${h + 20}" viewBox="0 0 ${w + 20} ${h + 20}">${sombra((s) => `<rect x="4" y="4" width="${w}" height="${h}" rx="14" ${s ? "" : `fill="${C.blanco}" stroke="${C.tinta}" stroke-width="8"`}/>`)}
      <rect x="8" y="8" width="${w - 8}" height="${h * 0.2}" rx="8" fill="${C.tinta}"/>
      <text x="${4 + w / 2}" y="${8 + h * 0.1}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="${h * 0.085}" letter-spacing="4" fill="${C.oro}">SORTEO DE NAVIDAD</text>
      <text x="${4 + w / 2}" y="${4 + h * 0.52}" text-anchor="middle" dominant-baseline="central" font-family="Archivo Black" font-size="${h * 0.3}" letter-spacing="10" fill="${C.tinta}">${numero}</text>
      <line x1="${4 + w * 0.08}" y1="${4 + h * 0.72}" x2="${4 + w * 0.92}" y2="${4 + h * 0.72}" stroke="${C.tinta}" stroke-width="3" stroke-dasharray="10 8" opacity="0.4"/>
      <text x="${4 + w * 0.08}" y="${4 + h * 0.85}" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="${h * 0.085}" letter-spacing="3" fill="${C.tinta}">DÉCIMO</text>
      <text x="${4 + w * 0.92}" y="${4 + h * 0.85}" text-anchor="end" dominant-baseline="central" font-family="Archivo Black" font-size="${h * 0.11}" fill="${C.rojo}">20 €</text>${dientes}</svg>`;
  },

  edificio: (rotulo = "HACIENDA", color = C.blanco, w = 420) => {
    const h = Math.round(w * 0.86), cols = [0.2, 0.36, 0.52, 0.68, 0.84];
    const forma = (s) => {
      const f = s ? "" : `fill="${color}" stroke="${C.tinta}" stroke-width="8" stroke-linejoin="round"`;
      return `<path d="M${w * 0.04} ${h * 0.3} L${w * 0.52} ${h * 0.04} L${w * 1.0} ${h * 0.3} Z" ${f}/>
        <rect x="${w * 0.07}" y="${h * 0.3}" width="${w * 0.9}" height="${h * 0.13}" ${f}/>
        ${cols.map((x) => `<rect x="${w * (x - 0.045)}" y="${h * 0.43}" width="${w * 0.09}" height="${h * 0.4}" ${f}/>`).join("")}
        <rect x="${w * 0.04}" y="${h * 0.83}" width="${w * 0.96}" height="${h * 0.1}" ${f}/>`;
    };
    return `<svg width="${w + 24}" height="${h + 24}" viewBox="0 0 ${w + 24} ${h + 24}">${sombra(forma)}
      <text x="${w * 0.52}" y="${h * 0.37}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="${h * 0.075}" letter-spacing="3" fill="${C.tinta}">${rotulo}</text></svg>`;
  },

  oficina: (rotulo = "TU EMPRESA", w = 360) => {
    const h = Math.round(w * 1.1);
    const ventanas = [];
    for (let f = 0; f < 4; f++) for (let c = 0; c < 3; c++) ventanas.push(`<rect x="${w * (0.17 + c * 0.24)}" y="${h * (0.3 + f * 0.13)}" width="${w * 0.16}" height="${h * 0.08}" rx="4" fill="${(f + c) % 3 ? C.azul : C.oro}" stroke="${C.tinta}" stroke-width="5"/>`);
    return `<svg width="${w + 24}" height="${h + 24}" viewBox="0 0 ${w + 24} ${h + 24}">${sombra((s) => `<rect x="${w * 0.06}" y="${h * 0.18}" width="${w * 0.88}" height="${h * 0.78}" rx="10" ${s ? "" : `fill="${C.blanco}" stroke="${C.tinta}" stroke-width="8"`}/>`)}
      <rect x="${w * 0.14}" y="${h * 0.04}" width="${w * 0.72}" height="${h * 0.11}" rx="8" fill="${C.tinta}"/>
      <text x="${w / 2}" y="${h * 0.095}" text-anchor="middle" dominant-baseline="central" font-family="Inter" font-weight="800" font-size="${h * 0.055}" letter-spacing="3" fill="${C.oro}">${rotulo}</text>
      ${ventanas.join("")}<rect x="${w * 0.4}" y="${h * 0.82}" width="${w * 0.2}" height="${h * 0.14}" fill="${C.tinta}"/></svg>`;
  },

  persona: (color = C.azul, tam = 200) => `<svg width="${tam}" height="${tam * 1.3}" viewBox="0 0 200 260">${sombra((s) => {
    const f = s ? "" : `fill="${color}" stroke="${C.tinta}" stroke-width="8"`;
    return `<circle cx="100" cy="62" r="46" ${s ? "" : `fill="${C.blanco}" stroke="${C.tinta}" stroke-width="8"`}/><path d="M24 244 v-56 a76 76 0 0 1 152 0 v56 z" ${f}/>`;
  })}</svg>`,

  maletin: (tam = 300) => `<svg width="${tam}" height="${tam * 0.8}" viewBox="0 0 300 240">${sombra((s) => `<path d="M105 70 v-28 a12 12 0 0 1 12 -12 h66 a12 12 0 0 1 12 12 v28" fill="none" stroke="${C.tinta}" stroke-width="14"/><rect x="16" y="66" width="268" height="160" rx="18" ${s ? "" : `fill="#7a4b2a" stroke="${C.tinta}" stroke-width="8"`}/>`)}<rect x="16" y="120" width="268" height="12" fill="${C.tinta}" opacity="0.5"/><rect x="132" y="108" width="36" height="36" rx="6" fill="${C.oro}" stroke="${C.tinta}" stroke-width="6"/></svg>`,

  fabrica: (tam = 320) => `<svg width="${tam}" height="${tam * 0.85}" viewBox="0 0 320 272">${sombra((s) => {
    const f = s ? "" : `fill="${C.blanco}" stroke="${C.tinta}" stroke-width="8" stroke-linejoin="round"`;
    return `<rect x="226" y="20" width="44" height="120" ${f}/><path d="M20 250 V120 l70 -45 v45 l70 -45 v45 l70 -45 v175 z" ${f}/>`;
  })}<rect x="50" y="170" width="44" height="40" fill="${C.oro}" stroke="${C.tinta}" stroke-width="6"/><rect x="128" y="170" width="44" height="40" fill="${C.oro}" stroke="${C.tinta}" stroke-width="6"/><rect x="206" y="170" width="44" height="40" fill="${C.oro}" stroke="${C.tinta}" stroke-width="6"/></svg>`,

  tachado: (tam = 360) => `<svg width="${tam}" height="${tam}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" fill="none" stroke="${C.rojo}" stroke-width="18"/><line x1="40" y1="40" x2="160" y2="160" stroke="${C.rojo}" stroke-width="18" stroke-linecap="round"/></svg>`,

  sello: (texto = "SÍ", color = C.verde) => `<div class="sello" style="color:${color};border-color:${color}">${texto}</div>`,

  // a document: title plus rows [label, value, id?, clase?]; a row with id lets cifras drive its value
  doc: (titulo = "NÓMINA", filas = []) => `<div class="doc"><div class="doc-tit">${titulo}</div>${filas
    .map(([a, b, id, cls]) => `<div class="fila ${cls || ""}"><span>${a}</span><b${id ? ` id="${id}"` : ""}>${b}</b></div>`)
    .join("")}</div>`,
};

export function crearDinero() {
  const VOZ = JSON.parse(document.getElementById("vozdata").textContent);
  const ESC = JSON.parse(document.getElementById("escena").textContent);
  const W = 1080, H = 1920;
  const D = Math.max(VOZ.duration + 1.2, 3);

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const ramp = (t, a, b) => ease(clamp((t - a) / (b - a)));
  // 0 before a, 1 between a and b, back to 0 after b (f = fade length)
  const ventana = (t, a, b, f = 0.3) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));
  const backOut = (k) => 1 + 2.6 * Math.pow(k - 1, 3) + 1.6 * Math.pow(k - 1, 2);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  const miles = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const coma = (n, d = 0) => { const [a, b] = Math.abs(n).toFixed(d).split("."); return (n < 0 ? "-" : "") + miles(+a) + (b ? "," + b : ""); };

  // ---------- moments anchored to the voice ----------
  const words = VOZ.lines.flatMap((l) => l.words);
  const T = {};
  let from = 0;
  for (const m of ESC.momentos || []) {
    const i = words.findIndex((w, k) => k >= from && norm(w.w).startsWith(norm(m.clave)));
    if (i < 0) throw new Error(`No encuentro la palabra "${m.clave}" del momento ${m.id} en la voz`);
    T[m.id] = (m.fin ? words[i].e : words[i].s) + (m.mas || 0);
    from = i + 1;
  }
  const cuando = (x) => (typeof x === "number" ? x : T[x]);

  // ---------- icons written in the HTML ----------
  for (const el of document.querySelectorAll("[data-icono]")) {
    const f = ICONOS[el.dataset.icono];
    if (!f) throw new Error(`Icono desconocido: ${el.dataset.icono}`);
    el.innerHTML = f(...JSON.parse(el.dataset.args || "[]"));
  }

  // ---------- captions: up to 4 words, cut at punctuation, never one word alone (as in pordentro.js) ----------
  const PUNTO = /[.,:;?!]$/;
  const chunks = [];
  for (const L of VOZ.lines) {
    let cur = [];
    L.words.forEach((w, i) => {
      cur.push(w);
      let resto = 0;
      for (let j = i + 1; j < L.words.length; j++) { resto++; if (PUNTO.test(L.words[j].w)) break; }
      if (PUNTO.test(w.w) || i === L.words.length - 1 || (cur.length >= 4 && resto !== 1)) { chunks.push(cur); cur = []; }
    });
  }
  const capsEl = document.getElementById("caps");
  const chunkEls = chunks.map((ws) => {
    const line = document.createElement("div"); line.className = "line"; line.style.display = "none";
    for (const w of ws) {
      const span = document.createElement("span");
      span.className = "w" + (w.key ? " key" : "");
      span.innerHTML = (w.key ? '<span class="box"></span>' : "") + '<span class="txt">' + w.w + "</span>";
      line.appendChild(span);
    }
    capsEl.appendChild(line); return line;
  });
  function drawCaps(t) {
    let active = -1;
    for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.06) active = i;
    if (active >= 0 && t > chunks[active][chunks[active].length - 1].e + 1.2) active = -1;
    chunkEls.forEach((el, i) => (el.style.display = i === active ? "block" : "none"));
    if (active < 0) return;
    const ws = chunks[active];
    let last = -1;
    ws.forEach((w, i) => { if (t >= w.s - 0.04) last = i; });
    [...chunkEls[active].children].forEach((span, i) => {
      const w = ws[i], k = clamp((t - (w.s - 0.04)) / 0.12);
      span.style.opacity = k;
      span.style.transform = `translateY(${(1 - ease(k)) * 10}px)`;
      span.classList.toggle("now", i === last);
      if (w.key) span.querySelector(".box").style.transform = `scaleX(${ease(clamp((t - w.s) / 0.18))})`;
    });
  }

  // ---------- the hook in big words ----------
  const G = ESC.gancho;
  const ganchoEl = document.getElementById("gancho");
  if (G && ganchoEl) ganchoEl.innerHTML = G.texto.split(" ").map((w) => (norm(w) === norm(G.clave || "") ? `<span class="sel">${w}</span>` : w)).join(" ");
  if (G && ganchoEl && G.tam) ganchoEl.style.fontSize = G.tam + "px";
  const ganchoFin = G ? Math.max(2.4, VOZ.lines[0] ? VOZ.lines[0].e + 0.3 : 0) : 0;
  function drawGancho(t) {
    if (!G || !ganchoEl) return 0;
    const k = 1 - ramp(t, ganchoFin - 0.35, ganchoFin);
    ganchoEl.style.opacity = k;
    ganchoEl.style.transform = `translateY(-50%) scale(${0.96 + 0.04 * k})`;
    return k;
  }

  // ---------- pieces that come in and go out ----------
  const piezas = (ESC.piezas || []).map((p) => {
    const el = document.getElementById(p.id);
    if (!el) throw new Error(`No hay ningún elemento con id="${p.id}" para la pieza`);
    return { ...p, el };
  });
  const EXTRA = {};
  // extra movement for a piece this frame: { x, y, s, r, o }
  const mover = (id, m) => (EXTRA[id] = m);
  function desplaza(tipo, k) {
    switch (tipo) {
      case "sube": return { y: (1 - k) * 90 };
      case "baja": return { y: -(1 - k) * 90 };
      case "izq": return { x: -(1 - k) * 180 };
      case "der": return { x: (1 - k) * 180 };
      case "escala": return { s: 0.4 + 0.6 * k };
      case "sello": return { s: 1 + 0.9 * (1 - k) * (1 - k) };
      default: return {};
    }
  }
  // pieces that come in during the first second are already there in frame 0: TikTok takes frame 0 as the
  // cover, and the hook needs its picture next to the text (Javier, 3 Nov)
  const PORTADA = 1.0;
  function drawPiezas(t) {
    for (const p of piezas) {
      const a = cuando(p.desde), b = p.hasta !== undefined ? cuando(p.hasta) : Infinity;
      const d = p.dura ?? (p.entra === "sello" ? 0.22 : p.entra === "crece" ? 0.8 : 0.45), tin = p.entra || "sube", tout = p.sale || "fundido";
      const kin = a < PORTADA ? 1 : clamp((t - a) / d), kout = 1 - clamp((t - (b - 0.35)) / 0.35);
      const ki = tin === "escala" ? backOut(kin) : tin === "sello" ? kin : ease(kin);
      const A = desplaza(tin, ki), B = desplaza(tout, ease(kout)), X = EXTRA[p.id] || {};
      let x = (A.x || 0) + (B.x || 0) + (X.x || 0), y = (A.y || 0) + (B.y || 0) + (X.y || 0);
      // crece: the height goes from 0 to the full one and the piece moves down by what is missing, so its bottom
      // edge stays on the floor (the full height is read once, before the first change)
      if (tin === "crece" || tout === "crece") {
        if (p.alto === undefined) p.alto = parseFloat(p.el.style.height) || p.el.offsetHeight;
        const k = (tin === "crece" ? ki : 1) * (tout === "crece" ? ease(kout) : 1);
        p.el.style.height = p.alto * k + "px";
        y += p.alto * (1 - k);
      }
      const s = (A.s ?? 1) * (B.s ?? 1) * (X.s ?? 1);
      const o = Math.min(clamp(kin * (tin === "sello" || tin === "crece" ? 4 : 2.5)), clamp(kout * 2.5)) * (X.o ?? 1);
      p.el.style.opacity = o;
      p.el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${X.r || 0}deg)`;
    }
  }

  // ---------- figures that count ----------
  const cifras = (ESC.cifras || []).map((c) => {
    const el = document.getElementById(c.id);
    if (!el) throw new Error(`No hay ningún elemento con id="${c.id}" para la cifra`);
    return { ...c, el };
  }).sort((a, b) => cuando(a.desde) - cuando(b.desde));
  const formatea = (c, v) => {
    const n = coma(v, c.dec || 0);
    return c.formato === "pct" ? n + " %" : c.formato === "numero" ? n : n + " €";
  };
  function drawCifras(t) {
    const actual = {};
    for (const c of cifras) if (t >= cuando(c.desde) || !(c.id in actual)) actual[c.id] = c;
    for (const c of Object.values(actual)) {
      const k = ease(clamp((t - cuando(c.desde)) / (c.dura ?? 1.2)));
      c.el.textContent = (c.prefijo || "") + formatea(c, lerp(c.de ?? 0, c.a, k)) + (c.sufijo || "");
    }
  }

  // ---------- honest notes at the bottom ----------
  const noteEl = document.getElementById("note");
  const notas = (ESC.notas || []).map((n) => ({ ...n, t: cuando(n.desde) })).sort((a, b) => a.t - b.t);
  function drawNote(t) {
    if (!noteEl) return;
    let n = null;
    for (const x of notas) if (t >= x.t) n = x;
    noteEl.textContent = n ? n.texto : "";
    noteEl.style.opacity = n ? ramp(t, n.t, n.t + 0.4) : 0;
  }

  // draws every layer for time t (call mover() before, for this frame's extra movement)
  function pintar(t) {
    capsEl.style.opacity = 1 - drawGancho(t);
    drawCaps(t);
    drawPiezas(t);
    drawCifras(t);
    drawNote(t);
  }

  async function arrancar(renderAt) {
    window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
    await document.fonts.ready;
    renderAt(0);
    window.__escenaReady();
  }

  return {
    VOZ, ESC, W, H, D, T, cuando, words, C,
    clamp, lerp, ease, ramp, ventana, backOut, norm, miles, coma,
    mover, pintar, arrancar,
  };
}
