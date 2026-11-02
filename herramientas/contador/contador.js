// Motor común de los vídeos de El contador loco: anclas a la voz, marcador, subtítulos,
// etiquetas de los hitos, el personaje de bloques y lo básico de three.js.
// Cada vídeo construye su mundo, mueve la cámara y llama a pintar(t, y) en cada fotograma.
//
// En escena (JSON del index.html):
//   formato: "altura" | "pila" | "estatura" | "temperatura" | "peso"   (cómo se escribe la cifra)
//   inicio, ritmo: valor de partida y unidades por segundo (crecimiento lineal), o
//   crecimiento: "doble" + periodo: el valor se duplica cada `periodo` segundos
//   desde: texto bajo la cifra ("SUBIENDO DESDE HACE")
//   hitos: [{ clave, v, etiqueta?, solo_etiqueta? }]  (clave = comienzo de la palabra de la voz que lo ancla;
//          solo_etiqueta: sale la etiqueta pero el contador no va a ese valor)
//   extra: { clave, texto }  (línea extra del marcador que aparece con esa palabra)

export function crearContador(THREE) {
  const VOZ = JSON.parse(document.getElementById("vozdata").textContent);
  const ESC = JSON.parse(document.getElementById("escena").textContent);
  const W = 1080, H = 1920;
  const D = Math.max(VOZ.duration + 1.2, 3);

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const smooth = (k) => k * k * k * (k * (k * 6 - 15) + 10);
  const ramp = (t, a, b) => ease(clamp((t - a) / (b - a)));
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

  // value <-> scene height (log scale: every ×10 is 10 units)
  const Y = (v) => 10 * Math.log10(1 + v);
  const V = (y) => Math.pow(10, y / 10) - 1;

  // ---------- anchors from the voice ----------
  const words = VOZ.lines.flatMap((l) => l.words);
  const lineEnd = VOZ.lines.flatMap((l) => l.words.map(() => l.e));
  const anchors = [];
  let from = 0;
  for (const hito of ESC.hitos) {
    const i = words.findIndex((w, k) => k >= from && norm(w.w).startsWith(hito.clave));
    if (i < 0) continue;
    const v = hito.v ?? hito.h;
    anchors.push({ t: words[i].s, fin: lineEnd[i], y: Y(v), v, hito });
    from = i + 1;
  }
  const extraWord = ESC.extra ? words.find((w) => norm(w.w).startsWith(ESC.extra.clave)) : null;
  const curva = anchors.filter((a) => !a.hito.solo_etiqueta);
  function yAt(t) {
    if (!curva.length || t <= curva[0].t) return curva.length ? curva[0].y : 0;
    for (let i = 1; i < curva.length; i++) {
      const a = curva[i - 1], b = curva[i];
      if (t < b.t) {
        // hold each landmark until its sentence ends, leaving at least 1.5 s to climb to the next (0.9 s in text mode)
        const start = Math.max(a.t + 0.25, b.t - 3.2, Math.min(a.fin, b.t - (VOZ.modo === "texto" ? 0.9 : 1.5)));
        return lerp(a.y, b.y, smooth(clamp((t - start) / (b.t - start))));
      }
    }
    return curva[curva.length - 1].y;
  }

  // ---------- formatting (Spanish) ----------
  const miles = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const coma = (n, d) => n.toFixed(d).replace(".", ",");
  const FORMATOS = {
    altura: (v) => (v < 100000 ? [miles(v), "m"] : [miles(v / 1000), "km"]),
    // like altura, with centimetres while it is small (a pile that starts at 2 cm)
    pila: (v) => (v < 10 ? [coma(v, 2).replace(/,0+$/, ""), "m"] : v < 100000 ? [miles(v), "m"] : [miles(v / 1000), "km"]),
    estatura: (v) => [(v < 10 ? coma(v, 2) : v < 1000 ? coma(v, 1) : miles(v)).replace(/,0+$/, ""), "m"],
    temperatura: (v) => [miles(v), "°C"],
    peso: (v) => (v < 10000 ? [miles(v), "kg"] : [miles(v / 1000), "t"]),
  };
  const fmtValor = FORMATOS[ESC.formato || "altura"];
  function fmtTime(s) {
    // round to the second first: V(Y(249)) is 248.9999… and a rate like 1/60 is stored inexactly
    s = Math.max(0, Math.round(s));
    if (s < 60) return `${Math.floor(s)} s`;
    if (s < 3600) return `${Math.floor(s / 60)} min ${Math.floor(s % 60)} s`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
    if (s < 86400 * 365) { const d = Math.floor(s / 86400); return `${d} ${d === 1 ? "día" : "días"} ${Math.floor((s % 86400) / 3600)} h`; }
    const y = s / (86400 * 365.25), a = Math.floor(y), m = Math.floor((y - a) * 12);
    return `${a} ${a === 1 ? "año" : "años"}${m ? ` ${m} ${m === 1 ? "mes" : "meses"}` : ""}`;
  }
  const inicio = ESC.inicio ?? 0;
  const tiempoDe = (v) => (ESC.crecimiento === "doble" ? ESC.periodo * Math.log2(Math.max(v, inicio) / inicio) : (v - inicio) / (ESC.ritmo ?? ESC.velocidad ?? 1));

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 400);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x2a4fae, 1.3); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4); scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0x9fe4ff, 1.2); rim.position.set(6, 3, -6); scene.add(rim);

  const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...extra });
  const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false });
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  // ---------- the account's block character (same as the profile picture) ----------
  function personaje() {
    const SKIN = mat(0xf2b98d), HAT = mat(0xff6a2b), HOODIE = mat(0xffcf2e), DARK = mat(0x2b1d1a), WHITE = mat(0xffffff, { roughness: 0.4 });
    const kid = new THREE.Group();
    const legs = at(box(1.0, 1.6, 0.9, mat(0x2b3a6b)), 0, 0.8, 0); kid.add(legs);
    const body = at(box(3.0, 2.2, 1.9, HOODIE), 0, 2.7, 0); kid.add(body);
    for (const sx of [-0.4, 0.4]) kid.add(at(box(0.1, 0.9, 0.1, WHITE), sx, 3.2, 0.97));
    const head = new THREE.Group(); head.position.set(0, 5.1, 0.1); kid.add(head);
    head.add(box(2.4, 2.4, 2.2, SKIN));
    head.add(at(box(2.55, 0.85, 2.35, HAT), 0, 1.15, 0));
    head.add(at(box(2.62, 0.32, 2.42, mat(0xd94e17)), 0, 0.72, 0));
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mat(0xffe3d1)), 0, 1.8, 0));
    for (const sx of [-1, 1]) {
      head.add(at(box(0.28, 0.55, 0.45, SKIN), sx * 1.32, -0.05, 0));
      head.add(at(box(0.62, 0.72, 0.12, WHITE), sx * 0.52, 0.1, 1.11));
      head.add(at(box(0.28, 0.32, 0.08, DARK), sx * 0.52, 0.18, 1.19));
      const brow = at(box(0.66, 0.15, 0.12, DARK), sx * 0.52, 0.55, 1.14); brow.rotation.z = sx * -0.22; head.add(brow);
    }
    head.add(at(box(0.3, 0.32, 0.3, mat(0xe8a57a)), 0, -0.22, 1.22));
    const mouth = at(box(0.48, 0.52, 0.1, mat(0x5a1f1a)), 0, -0.72, 1.11); head.add(mouth);
    return { kid, head, body, legs, mouth };
  }

  // ---------- background gradient by scene height ----------
  const skyEl = document.getElementById("sky");
  function fondo(stops, y) {
    let i = 0; while (i < stops.length - 2 && y > stops[i + 1][0]) i++;
    const a = stops[i], b = stops[i + 1], k = clamp((y - a[0]) / (b[0] - a[0]));
    const mix = (p, q) => "#" + new THREE.Color(p).lerp(new THREE.Color(q), k).getHexString();
    const top = mix(a[1], b[1]), bot = mix(a[2], b[2]);
    skyEl.style.background = `linear-gradient(${top}, ${bot})`;
    return [top, bot];
  }

  // ---------- captions: groups of up to 4 words, cut at punctuation (text mode: the whole line) ----------
  const chunks = [];
  for (const L of VOZ.lines) {
    if (VOZ.modo === "texto") { chunks.push(L.words); continue; }
    let cur = [];
    L.words.forEach((w, i) => { cur.push(w); if (cur.length >= 4 || /[.,:;?!]$/.test(w.w) || i === L.words.length - 1) { chunks.push(cur); cur = []; } });
  }
  const capsEl = document.getElementById("caps");
  const chunkEls = chunks.map((ws) => {
    const line = document.createElement("div"); line.className = "line"; line.style.display = "none";
    for (const w of ws) { const s = document.createElement("span"); s.className = "w" + (w.key ? " key" : ""); s.innerHTML = (w.key ? '<span class="pill"></span>' : "") + w.w; line.appendChild(s); }
    capsEl.appendChild(line); return line;
  });
  function drawCaps(t) {
    let active = -1;
    for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.05) active = i;
    if (active >= 0 && t > chunks[active][chunks[active].length - 1].e + 0.9) active = -1;
    chunkEls.forEach((el, i) => (el.style.display = i === active ? "block" : "none"));
    if (active < 0) return;
    let last = -1; chunks[active].forEach((w, i) => { if (t >= w.s - 0.03) last = i; });
    [...chunkEls[active].children].forEach((span, i) => {
      const w = chunks[active][i], k = clamp((t - (w.s - 0.03)) / 0.1);
      span.style.opacity = k;
      span.style.transform = `translateY(${(1 - ease(k)) * 14}px) scale(${i === last && !w.key ? 1.06 : 1})`;
      span.classList.toggle("now", i === last);
      if (w.key) { const kk = ease(clamp((t - w.s) / 0.14)); span.querySelector(".pill").style.opacity = kk; span.style.transform += ` scale(${1 + 0.08 * Math.sin(Math.PI * kk)})`; }
    });
  }

  // ---------- labels for each landmark ----------
  // posiciones: { ETIQUETA: [objeto3D, puntoLocal] }; sin entrada, se usa porDefecto
  const labEls = new Map();
  const svgNS = "http://www.w3.org/2000/svg", leaders = document.getElementById("leaders");
  let LAB_POS = {}, LAB_DEF = null;
  function etiquetas(posiciones, porDefecto) {
    LAB_POS = posiciones; LAB_DEF = porDefecto;
    for (const a of anchors) {
      if (!a.hito.etiqueta) continue;
      const el = document.createElement("div"); el.className = "lab";
      const [num, unit] = fmtValor(a.v); el.innerHTML = `${a.hito.etiqueta} · <b>${num} ${unit}</b>`;
      document.getElementById("labels").appendChild(el);
      const ln = document.createElementNS(svgNS, "line"); ln.setAttribute("stroke", "rgba(255,255,255,0.85)"); ln.setAttribute("stroke-width", "3"); leaders.appendChild(ln);
      const dot = document.createElementNS(svgNS, "circle"); dot.setAttribute("r", "7"); dot.setAttribute("fill", "#ffcf2e"); leaders.appendChild(dot);
      labEls.set(a, { el, ln, dot });
    }
    // each label leaves before the next one fades in, so two never overlap
    const conEtiqueta = [...labEls.keys()];
    conEtiqueta.forEach((a, i) => (a.hasta = Math.min(a.t + 5, conEtiqueta[i + 1] ? conEtiqueta[i + 1].t - 1.6 : Infinity)));
  }
  const toScreen = (p) => { const v = p.clone().project(camera); return { x: (v.x + 1) * 0.5 * W, y: (1 - v.y) * 0.5 * H, z: v.z }; };
  function drawLabels(t, y) {
    for (const [a, L] of labEls) {
      const near = clamp(1 - Math.abs(y - a.y) / 2.2) * clamp((t - a.t + 1.2) / 0.4) * (t < a.hasta ? 1 : clamp(1 - (t - a.hasta) / 0.4));
      const [obj, local] = LAB_POS[a.hito.etiqueta] || LAB_DEF;
      const p = toScreen(obj.localToWorld(local.clone()));
      const ok = near > 0.01 && p.z < 1;
      L.el.style.opacity = ok ? near : 0; L.ln.setAttribute("opacity", ok ? near : 0); L.dot.setAttribute("opacity", ok ? near : 0);
      if (!ok) continue;
      const px = clamp(p.x, 60, W - 60), py = clamp(p.y, 700, 1080);
      const lx = px > W / 2 ? px - 40 - L.el.offsetWidth : px + 40, ly = py - 110;
      L.el.style.left = clamp(lx, 40, W - 40 - L.el.offsetWidth) + "px"; L.el.style.top = ly + "px";
      L.ln.setAttribute("x1", px); L.ln.setAttribute("y1", py); L.ln.setAttribute("x2", clamp(lx, 40, W - 40) + (px > W / 2 ? L.el.offsetWidth : 0)); L.ln.setAttribute("y2", ly + 30);
      L.dot.setAttribute("cx", px); L.dot.setAttribute("cy", py);
    }
  }

  // ---------- HUD, title, captions ----------
  const altEl = document.getElementById("alt"), clockEl = document.getElementById("clock"), extraEl = document.getElementById("extra");
  const titleEl = document.getElementById("title");
  titleEl.textContent = ESC.titulo;
  document.getElementById("note").textContent = ESC.nota || "";
  document.getElementById("since").textContent = ESC.desde || "SUBIENDO DESDE HACE";

  // draws the 3D scene (camera already placed) and every overlay for time t at scene height y
  function pintar(t, y) {
    renderer.render(scene, camera);
    const v = V(y);
    const [num, unit] = fmtValor(v);
    altEl.innerHTML = `${num}<small>${unit}</small>`;
    clockEl.textContent = fmtTime(tiempoDe(v));
    if (extraWord) { const k = ramp(t, extraWord.s, extraWord.s + 0.4); extraEl.style.opacity = k; extraEl.textContent = ESC.extra.texto; extraEl.style.transform = `scale(${0.8 + 0.2 * k})`; }
    // the title card (the hook) stays until the first text line in text mode, at least 2.9 s
    const tFin = Math.max(2.9, VOZ.modo === "texto" ? VOZ.lines[0].s : 0);
    const tk = 1 - ramp(t, tFin - 0.5, tFin); titleEl.style.opacity = tk; titleEl.style.transform = `scale(${0.96 + 0.04 * tk})`;
    capsEl.style.opacity = 1 - tk;
    drawLabels(t, y);
    drawCaps(t);
  }

  async function arrancar(renderAt) {
    window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
    await document.fonts.ready;
    renderAt(0);
    window.__escenaReady();
  }

  return {
    VOZ, ESC, W, H, D, words, anchors, extraWord,
    clamp, lerp, ease, smooth, ramp, v3, hash, norm, miles, Y, V, yAt, fmtValor, fmtTime, tiempoDe,
    renderer, scene, camera, hemi, key, rim, mat, glow, box, at,
    personaje, fondo, etiquetas, pintar, arrancar,
  };
}
