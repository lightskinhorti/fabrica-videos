// Motor común de los vídeos de El contador loco: anclas a la voz, marcador, subtítulos,
// etiquetas de los hitos, el personaje de bloques y lo básico de three.js.
// Cada vídeo construye su mundo, mueve la cámara y llama a pintar(t, y) en cada fotograma.
//
// En escena (JSON del index.html):
//   formato: "altura" | "pila" | "estatura" | "temperatura" | "peso" | "horas" | "gramos"   (cómo se escribe la cifra)
//            horas: el valor va en horas; sale en minutos la primera hora, luego "4 h 05 min" y desde 100 h, horas
//                   enteras ("1.461 h"). En las etiquetas, "4 h 5 min".
//            gramos: el valor va en kilos; sale en gramos por debajo de 1 kg, con un decimal hasta 100 kg ("23,5 kg"),
//                    en kilos enteros hasta 10 t y luego en toneladas. Así lo hacían a mano 07-comida y 10-refresco.
//   inicio, ritmo: valor de partida y unidades por segundo (crecimiento lineal), o
//   crecimiento: "doble" + periodo: el valor se duplica cada `periodo` segundos
//   desde: texto bajo la cifra ("SUBIENDO DESDE HACE")
//   hitos: [{ clave, v, etiqueta?, solo_etiqueta? }]  (clave = comienzo de la palabra de la voz que lo ancla;
//          solo_etiqueta: sale la etiqueta pero el contador no va a ese valor)
//   extra: { clave, texto }  (línea extra del marcador que aparece con esa palabra)
//   etiquetas_bajo_marcador: true  (las etiquetas nunca se meten debajo del marcador: se colocan 18 px por debajo
//          de su altura real, medida en cada fotograma. Con nota, el marcador acaba a los 577 px; con línea extra y
//          nota, a los 638 (medido en 09-movil). Sin él, como hasta el 7 de noviembre: la etiqueta, como poco, a
//          590 px, y el marcador la puede tapar. Los vídeos nuevos lo llevan; los de antes no, para que no cambien.)
//   arranque: true | { dur?, zoom?, giro?, adelanto? }  (11 de noviembre. En TikTok Studio, el 46 % se iba en los 2
//          primeros segundos: el plano era casi fijo. Con esta opción hay movimiento desde el fotograma 0, y el
//          fotograma 0 sigue sirviendo de portada: título entero y legible, personaje a la vista. Sin ella, el
//          vídeo sale igual que antes, fotograma a fotograma; los de antes del 11 de noviembre no la llevan.)
//          - La cámara ya viene en marcha: empieza con el plano un `zoom` más abierto (0.3 = un 30 %) y ladeada
//            `giro` grados (5), y se cierra y se endereza en `dur` segundos (1.8), rápido al principio y frenando.
//            Lo hace pintar() sobre la cámara que haya puesto el vídeo, así que el vídeo no tiene que hacer nada;
//            eso sí, los puntos que el vídeo pase a la pantalla (tarjetas) se calculan DESPUÉS de pintar().
//          - C.impulso(t) da lo que queda de ese arranque (1 en el fotograma 0, 0 al acabar), por si el vídeo
//            quiere sumar su propio giro alrededor del personaje ("az += 20 * C.impulso(t)") o una acción.
//          - El título entra con un golpe (un 10 % más grande y torcido 3 grados, y se asienta en medio segundo)
//            y se va cuando acaba el gancho hablado (entre 1,8 y 2,9 s), no siempre a los 2,9: los subtítulos
//            empiezan antes.
//          - adelanto: { cifra, rotulo?, pie?, dur?, top?, vuelve?, dur_vuelve? }  un sello amarillo a la derecha,
//            bajo el marcador, con la cifra del final borrosa (se adivina, no se lee), para abrir la pregunta.
//            rotulo: "AL FINAL"; pie: "¿?"; dur: 1.6 s en pantalla; top: 700 px. Está ya en el fotograma 0.
//            vuelve: comienzo de una palabra de la voz con la que el sello sale otra vez, dur_vuelve segundos (2.2):
//            para cuando el guion dice "y el final no es el que esperas". La cifra tiene que estar en fuentes.md.
//          - Lo que el motor no puede hacer solo: que el personaje ya esté haciendo la acción del vídeo en el
//            fotograma 0 (en 12-cafe, a medio sorbo y con las tazas cayendo a la mesa). Eso va en cada vídeo.

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";


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
    // the value is in hours: minutes during the first hour, then "4 h 05 min" (two units in the HUD), then hours
    horas: (v) => {
      const m = Math.floor(v * 60 + 1e-6), h = Math.floor(m / 60), mm = m % 60;
      if (v < 1) return [String(mm), "min"];
      if (v < 100) return [`${h}<small>h</small> ${String(mm).padStart(2, "0")}`, "min"];
      return [miles(v), "h"];
    },
    // the value is in kilos: grams under 1 kg and one decimal under 100 kg (peso only writes whole kilos)
    gramos: (v) => (v < 0.9995 ? [String(Math.round(v * 1000)), "g"] : v < 99.95 ? [coma(v, 1).replace(/,0$/, ""), "kg"]
      : v < 10000 ? [miles(v), "kg"] : [miles(v / 1000), "t"]),
  };
  const fmtValor = FORMATOS[ESC.formato || "altura"];
  if (!fmtValor) throw new Error(`No hay ningún formato "${ESC.formato}" en contador.js`);
  // a label's figure is plain text: "4 h 5 min", without the HUD's small units (the rest, as in the HUD)
  const ETIQUETA = {
    horas: (v) => {
      const m = Math.round(v * 60), h = Math.floor(m / 60), mm = m % 60;
      return v < 1 ? `${mm} min` : v < 100 ? `${h} h${mm ? ` ${mm} min` : ""}` : `${miles(v)} h`;
    },
  };
  const fmtEtiqueta = ETIQUETA[ESC.formato] || ((v) => fmtValor(v).join(" "));
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
  // the moving start (ESC.arranque): what is left of it, 1 at frame 0 and 0 after `dur`; fastest at frame 0
  const ARR = ESC.arranque ? { dur: 1.8, zoom: 0.3, giro: 5, ...(ESC.arranque === true ? {} : ESC.arranque) } : null;
  const impulso = (t) => (ARR ? Math.pow(1 - clamp(t / ARR.dur), 3) : 0);
  const inicio = ESC.inicio ?? 0;
  const tiempoDe = (v) => (ESC.crecimiento === "doble" ? ESC.periodo * Math.log2(Math.max(v, inicio) / inicio) : (v - inicio) / (ESC.ritmo ?? ESC.velocidad ?? 1));

  // ---------- renderer ----------
  // drawn at 2x (2160x3840) and shown at 1080x1920, so thin and far details do not shimmer
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 400);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x2a4fae, 1.3); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4); scene.add(key); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0003;
  const rim = new THREE.DirectionalLight(0x9fe4ff, 1.2); rim.position.set(6, 3, -6); scene.add(rim);

  // the sky gradient is painted inside the scene, so tone mapping and post treat it like the rest
  const skyCanvas = document.createElement("canvas"); skyCanvas.width = 4; skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext("2d");
  const skyTex = new THREE.CanvasTexture(skyCanvas); skyTex.colorSpace = THREE.SRGBColorSpace; scene.background = skyTex;

  // post: render -> soft bloom on lights -> tone mapping
  const composer = new EffectComposer(renderer); composer.setPixelRatio(2); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.2, 0.5, 0.95));
  composer.addPass(new OutputPass());

  // camera clipping, sun and shadow box follow the size of the shot (centimetres or kilometres):
  // a near plane far from the camera is what keeps distant faces from fighting each other (flicker)
  function escala(centro, dist) {
    camera.near = Math.max(0.05, dist * 0.03); camera.far = Math.max(400, dist * 14); camera.updateProjectionMatrix();
    key.position.set(centro.x - 0.45 * dist, centro.y + 0.75 * dist, centro.z + 0.55 * dist); key.target.position.copy(centro);
    const sc = key.shadow.camera, r = dist * 0.55;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = dist * 0.05; sc.far = dist * 3; sc.updateProjectionMatrix();
    key.shadow.normalBias = dist * 0.0015;
  }

  const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...extra });
  const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false });
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  // ---------- the account's block character (same as the profile picture) ----------
  // animar(t) gives it life: it blinks, breathes and reacts to every landmark (eyebrows up, mouth open,
  // arms out), then settles back into a smile.
  function personaje() {
    const SKIN = mat(0xf2b98d), HAT = mat(0xff6a2b), HOODIE = mat(0xffcf2e), HOOD2 = mat(0xe8b81f), PANTS = mat(0x2b3a6b);
    const SHOE = mat(0xf4efe2), DARK = mat(0x2b1d1a), WHITE = mat(0xffffff, { roughness: 0.4 }), MOUTH = mat(0x5a1f1a);
    const kid = new THREE.Group();
    for (const sx of [-1, 1]) {
      kid.add(at(box(0.62, 1.45, 0.8, PANTS), sx * 0.36, 0.9, 0));
      kid.add(at(box(0.72, 0.32, 1.05, SHOE), sx * 0.36, 0.16, 0.1));
    }
    const body = new THREE.Group(); body.position.y = 1.6; kid.add(body);
    body.add(at(box(2.3, 2.35, 1.55, HOODIE), 0, 1.18, 0));
    body.add(at(box(1.5, 0.55, 0.06, HOOD2), 0, 0.6, 0.79));
    body.add(at(box(1.9, 0.5, 0.5, HOOD2), 0, 2.2, -0.62));
    for (const sx of [-0.3, 0.3]) body.add(at(box(0.08, 0.7, 0.06, WHITE), sx, 1.75, 0.8));
    const arms = [-1, 1].map((sx) => {
      const sh = new THREE.Group(); sh.position.set(sx * 1.47, 2.15, 0); body.add(sh);
      sh.add(at(box(0.62, 1.55, 0.72, HOODIE), 0, -0.72, 0));
      sh.add(at(box(0.66, 0.2, 0.76, HOOD2), 0, -1.45, 0));
      sh.add(at(box(0.5, 0.5, 0.55, SKIN), 0, -1.8, 0));
      return sh;
    });
    const head = new THREE.Group(); head.position.set(0, 5.1, 0.1); kid.add(head);
    head.add(box(2.4, 2.4, 2.2, SKIN));
    head.add(at(box(2.55, 0.8, 2.35, HAT), 0, 1.22, 0));
    head.add(at(box(2.62, 0.3, 2.42, mat(0xd94e17)), 0, 0.82, 0));
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mat(0xffe3d1)), 0, 1.85, 0));
    const lids = [], brows = [], pupils = [];
    for (const sx of [-1, 1]) {
      head.add(at(box(0.28, 0.55, 0.45, SKIN), sx * 1.32, -0.05, 0));
      head.add(at(box(0.6, 0.66, 0.1, WHITE), sx * 0.52, 0.08, 1.1));
      const pu = at(box(0.3, 0.36, 0.08, DARK), sx * 0.5, 0.06, 1.16); head.add(pu); pupils.push(pu);
      pu.add(at(box(0.1, 0.1, 0.02, glow(0xffffff)), 0.06, 0.09, 0.05));
      const lid = new THREE.Group(); lid.position.set(sx * 0.52, 0.43, 1.215); head.add(lid);
      lid.add(at(box(0.66, 0.72, 0.04, SKIN), 0, -0.36, 0)); lids.push(lid);
      const brow = at(box(0.62, 0.14, 0.1, DARK), sx * 0.52, 0.5, 1.13); head.add(brow); brows.push(brow);
    }
    head.add(at(box(0.3, 0.34, 0.3, mat(0xe8a57a)), 0, -0.22, 1.22));
    // mouth: a smile line with raised corners that opens into an "O" with teeth
    const mouth = new THREE.Group(); mouth.position.set(0, -0.72, 1.11); head.add(mouth);
    const lips = box(0.5, 0.5, 0.06, MOUTH); mouth.add(lips);
    const teeth = at(box(0.4, 0.1, 0.02, WHITE), 0, 0.17, 0.035); mouth.add(teeth);
    const corners = [-1, 1].map((sx) => { const c = at(box(0.16, 0.09, 0.06, MOUTH), sx * 0.3, 0.05, 0); c.rotation.z = sx * 0.6; mouth.add(c); return c; });
    const reacciones = anchors.slice(1).map((a) => a.t);
    function animar(t) {
      let s = 0;
      for (const ta of reacciones) {
        const d = t - ta;
        if (d > -0.2 && d < 4) s = Math.max(s, d < 0.05 ? ease((d + 0.2) / 0.25) : Math.exp(-(d - 0.05) / 0.7));
      }
      // a blink every 3.4 s (not while surprised)
      const k = (t + 0.7) % 3.4, blink = k < 0.14 ? Math.sin((Math.PI * k) / 0.14) : 0;
      lids.forEach((l) => (l.scale.y = Math.max(0.001, (0.12 + 0.88 * blink) * (1 - s))));
      brows.forEach((b, i) => { b.position.y = 0.5 + 0.12 * s; b.rotation.z = (i ? -1 : 1) * 0.12 * s; });
      pupils.forEach((pu) => pu.scale.setScalar(1 + 0.15 * s));
      lips.scale.set(1 - 0.25 * s, 0.16 + 0.84 * s, 1); lips.position.y = -0.2 * s;
      teeth.visible = s > 0.35; corners.forEach((c) => (c.visible = s < 0.35));
      arms.forEach((a, i) => { const sx = i ? 1 : -1; a.rotation.z = sx * (0.08 + 0.9 * s + 0.03 * Math.sin(t * 1.3 + i)); a.rotation.x = -0.25 * s; });
      body.scale.y = 1 + 0.012 * Math.sin(t * 2.2);
    }
    return { kid, head, body, arms, animar };
  }

  // ---------- background gradient by scene height ----------
  const skyEl = document.getElementById("sky");
  function fondo(stops, y) {
    let i = 0; while (i < stops.length - 2 && y > stops[i + 1][0]) i++;
    const a = stops[i], b = stops[i + 1], k = clamp((y - a[0]) / (b[0] - a[0]));
    const mix = (p, q) => "#" + new THREE.Color(p).lerp(new THREE.Color(q), k).getHexString();
    const top = mix(a[1], b[1]), bot = mix(a[2], b[2]);
    skyEl.style.background = `linear-gradient(${top}, ${bot})`;
    const g = skyCtx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, top); g.addColorStop(1, bot);
    skyCtx.fillStyle = g; skyCtx.fillRect(0, 0, 4, 256); skyTex.needsUpdate = true;
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
      el.innerHTML = `${a.hito.etiqueta} · <b>${fmtEtiqueta(a.v)}</b>`;
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
  // with etiquetas_bajo_marcador the labels stay 18 px under the HUD, measured every frame (the extra line can
  // change its height); the dot keeps pointing at its object, and never goes under the HUD either
  const bajoMarcador = !!ESC.etiquetas_bajo_marcador;
  function drawLabels(t, y) {
    const hud = document.getElementById("hud");
    const tope = bajoMarcador && hud ? hud.offsetTop + hud.offsetHeight + 18 : 0;
    for (const [a, L] of labEls) {
      const near = clamp(1 - Math.abs(y - a.y) / 2.2) * clamp((t - a.t + 1.2) / 0.4) * (t < a.hasta ? 1 : clamp(1 - (t - a.hasta) / 0.4));
      const [obj, local] = LAB_POS[a.hito.etiqueta] || LAB_DEF;
      const p = toScreen(obj.localToWorld(local.clone()));
      const ok = near > 0.01 && p.z < 1;
      L.el.style.opacity = ok ? near : 0; L.ln.setAttribute("opacity", ok ? near : 0); L.dot.setAttribute("opacity", ok ? near : 0);
      if (!ok) continue;
      const px = clamp(p.x, 60, W - 60), py = clamp(p.y, Math.max(700, tope), Math.max(1080, tope));
      const lx = px > W / 2 ? px - 40 - L.el.offsetWidth : px + 40, ly = Math.max(py - 110, tope);
      L.el.style.left = clamp(lx, 40, W - 40 - L.el.offsetWidth) + "px"; L.el.style.top = ly + "px";
      // the leader ends at the middle of the label (its height with etiquetas_bajo_marcador; 30 px as before without)
      const medio = bajoMarcador ? L.el.offsetHeight / 2 : 30;
      L.ln.setAttribute("x1", px); L.ln.setAttribute("y1", py); L.ln.setAttribute("x2", clamp(lx, 40, W - 40) + (px > W / 2 ? L.el.offsetWidth : 0)); L.ln.setAttribute("y2", ly + medio);
      L.dot.setAttribute("cx", px); L.dot.setAttribute("cy", py);
    }
  }

  // ---------- HUD, title, captions ----------
  const altEl = document.getElementById("alt"), clockEl = document.getElementById("clock"), extraEl = document.getElementById("extra");
  const titleEl = document.getElementById("title");
  titleEl.textContent = ESC.titulo;
  document.getElementById("note").textContent = ESC.nota || "";
  document.getElementById("since").textContent = ESC.desde || "SUBIENDO DESDE HACE";

  // the teaser of the moving start: a stamp with the final figure, blurred
  let adelEl = null;
  if (ARR && ARR.adelanto) {
    const a = ARR.adelanto;
    adelEl = document.createElement("div"); adelEl.className = "adelanto"; adelEl.style.top = (a.top ?? 700) + "px";
    adelEl.innerHTML = `<div class="rot">${a.rotulo ?? "AL FINAL"}</div><div class="cifra">${a.cifra}</div><div class="pie">${a.pie ?? "¿?"}</div>`;
    document.getElementById("labels").appendChild(adelEl);
  }
  // it shows from frame 0 for `dur` seconds and, with `vuelve`, again from that word of the voice
  const ventanas = [];
  if (adelEl) {
    const a = ARR.adelanto, w = a.vuelve ? words.find((x) => norm(x.w).startsWith(a.vuelve)) : null;
    ventanas.push([0, a.dur ?? 1.6]); if (w) ventanas.push([w.s - 0.1, a.dur_vuelve ?? 2.2]);
  }
  function drawAdelanto(t) {
    const v = ventanas.find(([t0, d]) => t >= t0 && t <= t0 + d + 0.3);
    if (!v) { adelEl.style.opacity = 0; return; }
    const u = t - v[0], kin = 1 - Math.pow(1 - clamp(u / 0.3), 3), kout = ease(clamp((u - v[1]) / 0.3));
    adelEl.style.opacity = 1 - kout;
    adelEl.style.transform = `translateX(${kout * 240}px) rotate(${2 + 4 * kin + 8 * kout}deg) scale(${0.74 + 0.26 * kin + 0.07 * Math.sin(Math.PI * clamp(u / 0.5)) - 0.2 * kout})`;
    adelEl.querySelector(".cifra").style.filter = `blur(${(11 + 4 * Math.sin(t * 8)).toFixed(1)}px)`;
  }

  // draws the 3D scene (camera already placed) and every overlay for time t at scene height y
  const FOV0 = camera.fov;
  function pintar(t, y) {
    if (ARR) {
      // the camera the video has placed, opened and tilted by what is left of the start
      const r = impulso(t);
      camera.fov = FOV0 * (1 + ARR.zoom * r); camera.updateProjectionMatrix();
      camera.rotateZ((ARR.giro * Math.PI / 180) * r); camera.updateMatrixWorld();
    }
    composer.render();
    const v = V(y);
    const [num, unit] = fmtValor(v);
    altEl.innerHTML = `${num}<small>${unit}</small>`;
    clockEl.textContent = fmtTime(tiempoDe(v));
    if (extraWord) { const k = ramp(t, extraWord.s, extraWord.s + 0.4); extraEl.style.opacity = k; extraEl.textContent = ESC.extra.texto; extraEl.style.transform = `scale(${0.8 + 0.2 * k})`; }
    // the title card (the hook) stays until the first text line in text mode, at least 2.9 s
    // (with the moving start it leaves when the spoken hook ends, and it comes in with a punch)
    const tFin = ARR && VOZ.modo !== "texto" ? clamp(VOZ.lines[0].e + 0.3, 1.8, 2.9) : Math.max(2.9, VOZ.modo === "texto" ? VOZ.lines[0].s : 0);
    const tk = 1 - ramp(t, tFin - 0.5, tFin); titleEl.style.opacity = tk; titleEl.style.transform = `scale(${0.96 + 0.04 * tk})`;
    if (ARR) { const q = Math.pow(1 - clamp(t / 0.5), 3); titleEl.style.transform = `scale(${(0.96 + 0.04 * tk) * (1 + 0.1 * q)}) rotate(${-3 * q}deg)`; }
    if (adelEl) drawAdelanto(t);
    capsEl.style.opacity = 1 - tk;
    drawLabels(t, y);
    drawCaps(t);
  }

  async function arrancar(renderAt) {
    // every solid object casts and receives the sun's shadow; lights, glass and glows do not
    scene.traverse((o) => { if (o.isMesh) { const solid = !o.material.transparent && !o.material.isMeshBasicMaterial; o.castShadow = solid; o.receiveShadow = !o.material.isMeshBasicMaterial; } });
    window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
    await document.fonts.ready;
    renderAt(0);
    window.__escenaReady();
  }

  return {
    VOZ, ESC, W, H, D, words, anchors, extraWord,
    clamp, lerp, ease, smooth, ramp, v3, hash, norm, miles, Y, V, yAt, fmtValor, fmtEtiqueta, fmtTime, tiempoDe,
    renderer, composer, scene, camera, hemi, key, rim, mat, glow, box, at,
    personaje, fondo, escala, etiquetas, pintar, arrancar, impulso,
  };
}
