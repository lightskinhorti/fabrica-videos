// Motor común de los vídeos de Las cosas por dentro: momentos anclados a la voz, la mesa oscura de madera,
// las luces, el dedo, subtítulos arriba con la palabra clave "seleccionada", etiquetas con línea y notas
// honestas abajo a la izquierda. Cada vídeo construye su objeto, mueve la cámara y llama a pintar(t).
//
// En escena (JSON del index.html):
//   momentos: [{ id, clave, fin?, mas? }]  (clave = comienzo de la palabra de la voz, buscada en orden a partir
//             del momento anterior; el momento es el inicio de la palabra, o su final con fin: true, más `mas` s)
//   etiquetas: [{ texto, pieza, desde, hasta, dx?, dy? }]  (pieza = nombre registrado con pieza(); desde y
//             hasta = id de un momento o segundos)
//   notas: [{ texto, desde }]  (cada nota dura hasta la siguiente; texto "" la quita)
//   iconos: { palabra: "bateria" | "rayo" | "onda" | "candado" | "reloj" }
//   sonidos: los usa sonido_pordentro.py
//   gancho: { texto, clave }  (el gancho en grande durante los primeros segundos; los subtítulos esperan)
// Arranque (10 de noviembre, opcional: sin estas opciones todo se ve como antes). En TikTok el 57 % se iba en los
// 2 primeros segundos: el gancho tapaba el centro y el objeto se quedaba pequeño y quieto debajo.
//   gancho: { texto, clave, y, tam }  y = centro del rótulo en px (por defecto 720); tam = tamaño de letra en px
//             (por defecto 96). Con y: 400 el rótulo va arriba, donde luego salen los subtítulos (debajo de las
//             pestañas de TikTok), y deja el centro de la pantalla para el objeto.
//   arranque: true | { ... }  el rótulo del gancho ya está entero y legible en el fotograma 0 (sirve de portada) y
//             se asienta durante 0,6 s (de un 7 % más grande a su tamaño). El resto del arranque (cámara que ya se
//             mueve y primer cambio de plano antes de 1,5 s) lo hacen las plantillas: ver plantillas.js.
// Opciones del estilo de @speedy_devv (referencias 06 y speedy_devv/), para los vídeos nuevos:
//   estilo: "rejilla"  (fondo negro con rejilla suave y los objetos flotando, sin mesa)
//   leyenda: [{ color, forma: "flecha" | "onda" | "punto", texto, desde?, hasta? }]  (fija abajo, como en un mapa)
//   paneles: [{ id, titulo, desde, hasta, x, y }]  (cifra grande con un rótulo; el vídeo pone la cifra con panel(id, texto))
//   desenfoque: { apertura, max }  (profundidad de campo: enfoca a la distancia del punto que mira la cámara)
//   y en la cámara, una clave con corte: true empieza un plano nuevo de golpe, sin movimiento desde el anterior

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export function crearPorDentro(THREE) {
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
  // 0 before a, 1 between a and b, 0 after b, with fades of f seconds
  const ventana = (t, a, b, f = 0.3) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
  const UP = v3(0, 1, 0);

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

  // ---------- geometry helpers ----------
  function rrShape(w, h, r, holes = []) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    for (const [cx, cy, hw, hh, hr] of holes) {
      const p = new THREE.Path();
      const hx = cx - hw / 2, hy = cy - hh / 2;
      p.moveTo(hx + hr, hy); p.lineTo(hx + hw - hr, hy); p.quadraticCurveTo(hx + hw, hy, hx + hw, hy + hr);
      p.lineTo(hx + hw, hy + hh - hr); p.quadraticCurveTo(hx + hw, hy + hh, hx + hw - hr, hy + hh);
      p.lineTo(hx + hr, hy + hh); p.quadraticCurveTo(hx, hy + hh, hx, hy + hh - hr);
      p.lineTo(hx, hy + hr); p.quadraticCurveTo(hx, hy, hx + hr, hy);
      s.holes.push(p);
    }
    return s;
  }
  // a flat slab lying on the desk (the shape is drawn from above)
  function slab(shape, depth) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 18 });
    g.rotateX(-Math.PI / 2);
    return g;
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); draw(g, w, h);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return { tex, c, g };
  }
  // point on a rounded rectangle perimeter, s in [0,1), starting at the middle of the left edge, clockwise seen from above
  function rrPoint(w, h, r, s) {
    const straightW = w - 2 * r, straightH = h - 2 * r, arc = (Math.PI / 2) * r;
    const segs = [straightH / 2, arc, straightW, arc, straightH, arc, straightW, arc, straightH / 2];
    const total = segs.reduce((a, b) => a + b, 0);
    let d = (((s % 1) + 1) % 1) * total;
    const x0 = -w / 2, x1 = w / 2, z0 = -h / 2, z1 = h / 2;
    const pts = [
      (k) => v3(x0, 0, lerp(0, z0 + r, k)),
      (k) => { const a = Math.PI + (Math.PI / 2) * k; return v3(x0 + r + r * Math.cos(a), 0, z0 + r + r * Math.sin(a)); },
      (k) => v3(lerp(x0 + r, x1 - r, k), 0, z0),
      (k) => { const a = -Math.PI / 2 + (Math.PI / 2) * k; return v3(x1 - r + r * Math.cos(a), 0, z0 + r + r * Math.sin(a)); },
      (k) => v3(x1, 0, lerp(z0 + r, z1 - r, k)),
      (k) => { const a = (Math.PI / 2) * k; return v3(x1 - r + r * Math.cos(a), 0, z1 - r + r * Math.sin(a)); },
      (k) => v3(lerp(x1 - r, x0 + r, k), 0, z1),
      (k) => { const a = Math.PI / 2 + (Math.PI / 2) * k; return v3(x0 + r + r * Math.cos(a), 0, z1 - r + r * Math.sin(a)); },
      (k) => v3(x0, 0, lerp(z1 - r, 0, k)),
    ];
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) return pts[i](segs[i] > 0 ? clamp(d / segs[i]) : 0);
      d -= segs[i];
    }
  }
  // flat copper spiral (a coil seen from above), from radius r0 out to r1, lying at height y
  function espiral(r0, r1, vueltas, y = 0, porVuelta = 120) {
    const pts = [];
    for (let k = 0; k <= vueltas * porVuelta; k++) {
      const u = k / porVuelta, r = r0 + (r1 - r0) * (u / vueltas), a = 2 * Math.PI * u;
      pts.push(v3(r * Math.cos(a), y, r * Math.sin(a)));
    }
    return new THREE.CatmullRomCurve3(pts, false, "centripetal");
  }
  // a device "talking" by load modulation: P-A-G-O in morse from t0, 0.09 s per unit, 1 = on
  // (sonido_pordentro.py plays the same pattern)
  const UNIDADES = [];
  for (const ch of ".--. .- --. ---") UNIDADES.push(...(ch === "." ? [1, 0] : ch === "-" ? [1, 1, 1, 0] : [0, 0]));
  UNIDADES.push(0, 0, 0, 0);
  const morse = (t, t0) => { const u = Math.floor((t - t0) / 0.09); return u < 0 ? 0 : UNIDADES[u % UNIDADES.length]; };
  // soft additive glow (copper, amber, gold), for what lights up
  function brillo(rgb = "255,150,60") {
    const tex = canvasTex(256, 256, (g, w, h) => {
      const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(0.25, `rgba(${rgb},0.55)`); r.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    }).tex;
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  }

  // ---------- renderer ----------
  // drawn at 2x and shown at 1080x1920, so thin copper wires do not shimmer
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050403);
  scene.fog = new THREE.Fog(0x050403, 26, 58);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);

  // warm key from the top left, cold rim behind, a warm fill
  const hemi = new THREE.HemisphereLight(0x3a2c22, 0x080504, 0.35); scene.add(hemi);
  const key = new THREE.SpotLight(0xffd6ae, 2600, 0, 0.42, 0.85, 2);
  key.position.set(-14, 30, 16); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 6;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xa9c2ff, 0.9); rim.position.set(12, 9, -20); scene.add(rim);
  const warm = new THREE.PointLight(0xff9a55, 30, 22, 2); warm.position.set(6, 4, 6); scene.add(warm);

  // ---------- dark wooden desk ----------
  const wood = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#26170e"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const y = hash(i) * h, a = 0.03 + hash(i + 50) * 0.07;
      g.strokeStyle = hash(i + 9) > 0.5 ? `rgba(70,42,24,${a})` : `rgba(10,6,3,${a * 1.4})`;
      g.lineWidth = 1 + hash(i + 3) * 5;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 9 * hash(i + 7));
      g.stroke();
    }
  });
  wood.tex.wrapS = wood.tex.wrapT = THREE.RepeatWrapping; wood.tex.repeat.set(5, 5);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshPhysicalMaterial({ map: wood.tex, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.35 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  // ---------- "rejilla" style: black backdrop with a faint grid, objects floating (no desk, no fog) ----------
  if (ESC.estilo === "rejilla") {
    desk.visible = false; scene.fog = null;
    const bg = canvasTex(1080, 1920, (g, w, h) => {
      g.fillStyle = "#08080a"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2;
      for (let x = 30; x < w; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y < h; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      const v = g.createRadialGradient(w / 2, h * 0.55, h * 0.2, w / 2, h * 0.55, h * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.75)");
      g.fillStyle = v; g.fillRect(0, 0, w, h);
    });
    scene.background = bg.tex;
    hemi.color.setHex(0x9aa4b4); hemi.groundColor.setHex(0x0a0a0c); hemi.intensity = 0.6;
    key.color.setHex(0xfff1e6); warm.intensity = 12;
    scene.environmentIntensity = 0.55;
  }

  // ---------- post: (depth of field), bloom on what glows ----------
  const composer = new EffectComposer(renderer); composer.setPixelRatio(2); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = ESC.desenfoque ? new BokehPass(scene, camera, { focus: 20, aperture: ESC.desenfoque.apertura ?? 0.002, maxblur: ESC.desenfoque.max ?? 0.008 }) : null;
  if (bokeh) composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.55, 0.86));
  composer.addPass(new OutputPass());

  // ---------- the finger ----------
  // colocar(contacto, dirección, distancia): the pad touches `contacto`, the finger points back along
  // `dirección` (from the tip to the hand) and moves away along it by `distancia`
  function dedo() {
    const prof = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * (Math.PI / 2); prof.push(new THREE.Vector2(0.82 * Math.sin(a) + 0.0001, 0.82 * (1 - Math.cos(a)))); }
    prof.push(new THREE.Vector2(0.86, 1.8), new THREE.Vector2(0.88, 3.0), new THREE.Vector2(0.93, 3.4), new THREE.Vector2(0.92, 4.4), new THREE.Vector2(0.97, 7), new THREE.Vector2(1.02, 12));
    const geo = new THREE.LatheGeometry(prof, 64); geo.scale(1, 1, 0.84);
    const skin = new THREE.MeshPhysicalMaterial({ color: 0xd9ad98, roughness: 0.62, sheen: 0.45, sheenRoughness: 0.7, sheenColor: new THREE.Color(0xffd2bd), clearcoat: 0.08, clearcoatRoughness: 0.7, emissive: 0x3a1408, emissiveIntensity: 0.18 });
    const finger = new THREE.Group();
    finger.add(new THREE.Mesh(geo, skin));
    const nail = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), new THREE.MeshPhysicalMaterial({ color: 0xe3b4a6, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.2 }));
    nail.scale.set(0.5, 0.78, 0.085); nail.position.set(0, 1.12, 0.61); nail.rotation.x = -0.12;
    finger.add(nail);
    scene.add(finger);
    function colocar(contact, dir, away) {
      const d = dir.clone().normalize();
      const z = UP.clone().sub(d.clone().multiplyScalar(d.dot(UP))).normalize();
      const x = new THREE.Vector3().crossVectors(d, z).normalize();
      finger.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, d, z));
      finger.position.copy(contact.clone().add(UP.clone().multiplyScalar(0.72)).sub(d.clone().multiplyScalar(0.8)).add(d.clone().multiplyScalar(away)));
      finger.visible = away < 11.5;
    }
    return { finger, colocar };
  }

  // ---------- camera by keyframes ----------
  // claves: [{ t, p, q, corte? }] with t in seconds or a moment id (+ mas); two keys of the same shot make a slow
  // drift; a key with corte: true starts a new shot at once (the previous shot holds until then)
  function camara(claves) {
    const K = claves.map((k) => ({ ...k, t: cuando(k.t) + (k.mas || 0) })).sort((a, b) => a.t - b.t);
    return (t) => {
      let i = 0;
      while (i < K.length - 2 && t >= K[i + 1].t) i++;
      const a = K[i], b = K[i + 1];
      if (b.corte && t < b.t) return { p: a.p.clone(), q: a.q.clone() };
      if (t >= b.t) return { p: b.p.clone(), q: b.q.clone() };
      const k = ease(clamp((t - a.t) / (b.t - a.t)));
      return { p: a.p.clone().lerp(b.p, k), q: a.q.clone().lerp(b.q, k) };
    };
  }
  function mirar(c) {
    camera.position.copy(c.p); camera.lookAt(c.q); camera.updateMatrixWorld();
    key.target.position.copy(c.q);
    if (bokeh) bokeh.uniforms.focus.value = c.p.distanceTo(c.q);
  }

  // ---------- captions: up to 4 words cut at punctuation, never leaving one word alone ----------
  const ICONOS = {
    bateria: '<svg class="ico" viewBox="0 0 34 18"><rect x="1.5" y="1.5" width="27" height="15" rx="3" fill="none" stroke="#fff" stroke-width="3"/><rect x="30" y="6" width="3" height="6" rx="1" fill="#fff"/><rect x="5" y="5" width="5" height="8" rx="1" fill="#ff5a4a"/></svg>',
    rayo: '<svg class="ico" viewBox="0 0 14 22"><path d="M8.5 0 0 12.5h5.5L4.5 22 14 8.8H8.2z" fill="#ffb347"/></svg>',
    onda: '<svg class="ico" viewBox="0 0 24 22"><g fill="none" stroke="#ffb347" stroke-width="2.6" stroke-linecap="round"><path d="M4 7a10 10 0 0 1 0 8"/><path d="M9 4a15 15 0 0 1 0 14"/><path d="M14 1a20 20 0 0 1 0 20"/></g></svg>',
    candado: '<svg class="ico" viewBox="0 0 18 22"><path d="M4.5 9V6a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="#fff" stroke-width="2.6"/><rect x="1" y="9" width="16" height="12" rx="2.5" fill="#ffb347"/></svg>',
    reloj: '<svg class="ico" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9.2" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M11 5.5V11l3.8 2.4" fill="none" stroke="#ffb347" stroke-width="2.6" stroke-linecap="round"/></svg>',
  };
  const ICON_FOR = Object.fromEntries(Object.entries(ESC.iconos || {}).map(([w, i]) => [norm(w), i]));
  const PUNTO = /[.,:;?!]$/;
  const chunks = [];
  for (const L of VOZ.lines) {
    let cur = [];
    L.words.forEach((w, i) => {
      cur.push(w);
      // words left until the next punctuation: with exactly one, it joins this group instead of standing alone
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
      const ico = ICONOS[ICON_FOR[norm(w.w)]] || "";
      span.innerHTML = (w.key ? '<span class="box"></span><span class="h1"></span><span class="h2"></span>' : "") + ico + '<span class="txt">' + w.w + "</span>";
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
      if (w.key) {
        const ks = ease(clamp((t - w.s) / 0.14));
        for (const c of span.querySelectorAll(".box,.h1,.h2")) c.style.opacity = ks;
        span.querySelector(".box").style.transform = `scale(${0.9 + 0.1 * ks})`;
      }
    });
  }

  // ---------- labels: uppercase text with a thin line to the part ----------
  const PIEZAS = {};
  // pieza(nombre, objeto3D, puntoLocal): where the labels of that part point to
  const pieza = (nombre, obj, local) => (PIEZAS[nombre] = { obj, local });
  const svgNS = "http://www.w3.org/2000/svg", leaders = document.getElementById("leaders");
  const labs = (ESC.etiquetas || []).map((e) => {
    const el = document.createElement("div"); el.className = "lab"; el.textContent = e.texto;
    document.getElementById("labels").appendChild(el);
    const ln = document.createElementNS(svgNS, "line"); ln.setAttribute("stroke", "rgba(255,255,255,0.75)"); ln.setAttribute("stroke-width", "2"); leaders.appendChild(ln);
    const dot = document.createElementNS(svgNS, "circle"); dot.setAttribute("r", "6"); dot.setAttribute("fill", "#fff"); leaders.appendChild(dot);
    return { e, el, ln, dot };
  });
  const toScreen = (p) => { const v = p.clone().project(camera); return { x: (v.x + 1) * 0.5 * W, y: (1 - v.y) * 0.5 * H, z: v.z }; };
  function drawLabels(t) {
    for (const { e, el, ln, dot } of labs) {
      const a = ventana(t, cuando(e.desde), cuando(e.hasta), 0.3);
      const P = PIEZAS[e.pieza];
      const p = P && a > 0.001 ? toScreen(P.obj.localToWorld(P.local.clone())) : null;
      const ok = p && p.z < 1;
      el.style.opacity = ok ? a : 0; ln.setAttribute("opacity", ok ? a : 0); dot.setAttribute("opacity", ok ? a : 0);
      if (!ok) continue;
      // the text goes to the side with more room, below the captions and above TikTok's description
      const dx = e.dx ?? 70, dy = e.dy ?? -220;
      const izq = p.x > W * 0.55;
      const lx = clamp(p.x + (izq ? -Math.abs(dx) : Math.abs(dx)), 60, W - 60), ly = clamp(p.y + dy, 470, 1380);
      ln.setAttribute("x1", p.x); ln.setAttribute("y1", p.y); ln.setAttribute("x2", lx); ln.setAttribute("y2", ly + 14);
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y);
      el.style.left = clamp(lx - (izq ? el.offsetWidth : 0), 40, W - 40 - el.offsetWidth) + "px";
      el.style.top = ly - 18 + "px";
    }
  }

  // ---------- honest notes, small, bottom left ----------
  const noteEl = document.getElementById("note");
  const notas = (ESC.notas || []).map((n) => ({ ...n, t: cuando(n.desde) })).sort((a, b) => a.t - b.t);
  function drawNote(t) {
    let n = null;
    for (const x of notas) if (t >= x.t) n = x;
    noteEl.textContent = n ? n.texto : "";
    noteEl.style.opacity = n ? ramp(t, n.t, n.t + 0.4) : 0;
  }

  // ---------- legend, fixed at the bottom like a map key ----------
  const FORMAS = {
    flecha: (c) => `<svg viewBox="0 0 34 14"><path d="M1 7h26M21 2l7 5-7 5" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    onda: (c) => `<svg viewBox="0 0 34 14"><path d="M2 7q4-6 8 0t8 0t8 0t8 0" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    punto: (c) => `<svg viewBox="0 0 34 14"><circle cx="17" cy="7" r="5" fill="${c}"/></svg>`,
  };
  const leyendaEl = document.createElement("div"); leyendaEl.className = "leyenda";
  document.getElementById("labels").appendChild(leyendaEl);
  const leyenda = (ESC.leyenda || []).map((l) => {
    const row = document.createElement("div"); row.className = "fila";
    row.innerHTML = (FORMAS[l.forma || "flecha"] || FORMAS.flecha)(l.color || "#ffb347") + `<span>${l.texto}</span>`;
    leyendaEl.appendChild(row);
    return { l, row };
  });
  function drawLegend(t) {
    for (const { l, row } of leyenda) row.style.opacity = ventana(t, l.desde !== undefined ? cuando(l.desde) : 0, l.hasta !== undefined ? cuando(l.hasta) : D + 1, 0.4);
  }

  // ---------- data panels: a big figure with a small title, set by the video with panel(id, texto) ----------
  const panelEls = {};
  for (const p of ESC.paneles || []) {
    const el = document.createElement("div"); el.className = "panel";
    el.innerHTML = `<div class="cifra"></div><div class="titulo">${p.titulo}</div>`;
    el.style.left = (p.x ?? 70) + "px"; el.style.top = (p.y ?? 520) + "px";
    document.getElementById("labels").appendChild(el);
    panelEls[p.id] = { p, el, cifra: el.querySelector(".cifra") };
  }
  const panel = (id, texto) => { if (panelEls[id]) panelEls[id].cifra.textContent = texto; };
  function drawPanels(t) {
    for (const { p, el } of Object.values(panelEls)) {
      const a = ventana(t, cuando(p.desde), cuando(p.hasta), 0.3);
      el.style.opacity = a; el.style.transform = `translateY(${(1 - a) * 12}px)`;
    }
  }

  // ---------- hook title: the hook in big words for the first seconds, the captions wait for it ----------
  // gancho: { texto, clave }  (clave = the word with the selection box); it stays until the first sentence ends
  const G = ESC.gancho;
  const ganchoEl = document.createElement("div"); ganchoEl.className = "gancho";
  document.getElementById("labels").appendChild(ganchoEl);
  if (G) ganchoEl.innerHTML = G.texto.split(" ").map((w) => (norm(w) === norm(G.clave || "") ? `<span class="sel">${w}</span>` : w)).join(" ");
  if (G && G.y !== undefined) ganchoEl.style.top = G.y + "px";
  if (G && G.tam !== undefined) ganchoEl.style.fontSize = G.tam + "px";
  const ganchoFin = G ? Math.max(2.4, VOZ.lines[0] ? VOZ.lines[0].e + 0.3 : 0) : 0;
  function drawGancho(t) {
    if (!G) return 0;
    const k = 1 - ramp(t, ganchoFin - 0.35, ganchoFin);
    // with "arranque" the title settles during the first 0.6 s (already whole and readable at frame 0)
    const asienta = ESC.arranque ? 0.07 * Math.pow(1 - clamp(t / 0.6), 3) : 0;
    ganchoEl.style.opacity = k; ganchoEl.style.transform = `translateY(-50%) scale(${0.96 + 0.04 * k + asienta})`;
    return k;
  }

  // draws the 3D scene (camera already placed) and every overlay for time t
  function pintar(t) {
    composer.render();
    capsEl.style.opacity = 1 - drawGancho(t);
    drawCaps(t);
    drawLabels(t);
    drawNote(t);
    drawLegend(t);
    drawPanels(t);
  }

  async function arrancar(renderAt) {
    // solid objects cast and receive shadows; glows, rings and glass do not
    scene.traverse((o) => {
      if (o.isMesh && o !== desk) {
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        const solid = !m.transparent && !m.isMeshBasicMaterial;
        o.castShadow = solid; o.receiveShadow = solid;
      }
    });
    window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
    await document.fonts.ready;
    renderAt(0);
    window.__escenaReady();
  }

  return {
    VOZ, ESC, W, H, D, T, cuando, words,
    clamp, lerp, ease, smooth, ramp, ventana, v3, hash, norm, UP,
    rrShape, slab, canvasTex, rrPoint, espiral, morse, brillo,
    renderer, composer, scene, camera, hemi, key, rim, warm, desk,
    dedo, camara, mirar, pieza, toScreen, panel, pintar, arrancar,
  };
}
