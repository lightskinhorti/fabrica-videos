// Plantillas de planos para Las cosas por dentro (hechas el 3 de noviembre, después de 07-microondas, para que
// un vídeo sea sobre todo una lista JSON de planos en vez de código). Usan el motor (pordentro.js), las piezas
// de detalle.js, las pantallas de pantallas.js y la biblioteca de objetos de objetos/.
//
// ===================================== CÓMO USAR LAS PLANTILLAS =====================================
// En el módulo del vídeo:
//   import { crearPorDentro } from "./comun/pordentro.js";
//   import { crearDetalle } from "./comun/detalle.js";
//   import { crearPlantillas } from "./comun/plantillas.js";
//   const C = crearPorDentro(THREE), X = crearDetalle(THREE, C);
//   const P = crearPlantillas(THREE, C, X);      // construye sets, objetos, flujos y planos desde la escena
//   // (aquí, si hace falta, código propio: P.sets.<set>.grupo, P.obj("<id>"), P.alPintar((t, e, plano) => {...}))
//   P.arrancar();                                // precalienta los sombreadores y arranca el vídeo
// Revisión de cortes: en la consola, __plantillas.tabla() (o P.cortes(), una lista { t, fin, dur, id, tipo }).
//
// En la escena (JSON), además de momentos, etiquetas, notas, leyenda, paneles, gancho y sonidos del motor:
//   "sets": { "<nombre>": { "objetos": [{ "tipo": "microondas", "id": "horno", "pos": [x,y,z], "rot": [°,°,°],
//             "escala": 1, "opciones": {} }], "luz": "anuncio" | "estudio" | "suave", "suelo": true, "motas": true } }
//   "flujos": { "<nombre>": { "set", "ruta": ["horno.magnetron", [x,y,z], { "curva": "nevera.capilar" }], "color",
//             "hebras": 3, "ancho", "separa", "eje" ("x": las hebras se abren en el plano que ve una cámara
//             desde +x, para cortes laterales), "vel", "ondas", "intensidad", "puntos" } }
//             (cintas de luz que siguen la ruta; las coordenadas sueltas van en unidades del set; { curva } sigue
//             un tubo del objeto, con "invertir": true si va al revés; "crece": true lo dibuja al empezar el plano)
//   "planos": [ { "tipo", "desde": "<momento>" | segundos, "mas", ... }, ... ]  (cada plano dura hasta el siguiente)
//   "paneles": los del motor admiten además "valor": "2,45 GHz" o { "de", "a", "decimales", "unidad", "en", "dur" }
//
// Campos de cualquier plano:
//   set, pieza ("horno.magnetron", "magnetron" o "horno") u objetivo ([x,y,z] del set), radio (tamaño a encuadrar),
//   angulo (grados alrededor del objetivo: 0 = de frente, desde +z; 90 = desde +x), altura (grados de elevación),
//   dist (multiplica la distancia automática), fov, apertura (desenfoque; 0 = nada), foco, curva, orbita (grados
//   que gira durante el plano), empuje (fracción que se acerca), desplaza ([x,y,z] que mueve el punto mirado),
//   estado: { "horno.puerta": 1, "rayosX": { "de": 0, "a": 1, "dur": 0.6, "en": 0 } }  (mandos de los objetos del
//   set; "en" = segundos desde que empieza el plano, o un momento), resaltar: ["horno.magnetron"] (brillo dorado;
//   colorResalte: "120,200,255" para algo frío; fuerzaResalte),
//   flujos: ["<nombre>"] (con "crece": true se dibujan desde el principio del plano), lectura (ver cifra),
//   cortar: true | ["id"] (corta los objetos del set como el tipo corte, con eje, en y signo),
//   exposicion, maxDesenfoque (tope del desenfoque; cifra usa 0,035), variar: false (no lo parte), variantes: [{ angulo, altura, dist, pieza, ... }] (cómo partirlo).
//
// Tipos de plano:
//   anuncio     producto limpio, como un anuncio: órbita lenta, empuje, contraluz y poco desenfoque.
//   corte       corte lateral tipo diagrama con teleobjetivo (fov 14): corta los objetos del set por el plano
//               eje ("x" | "y" | "z"), en (posición en unidades del objeto de la pieza), signo; la cámara mira la
//               cara cortada. Rótulos en mayúsculas: en "etiquetas", como siempre.
//   macro       muy cerca de una pieza, con mucho desenfoque delante y detrás.
//   cenital     desde arriba, girando despacio (gira: grados).
//   cifra       una cifra grande que cambia sobre el set desenfocado. lectura: { "de", "a", "decimales", "unidad",
//               "prefijo", "titulo", "dur", "en", "texto" (fija), "y" (px) }.
//   regla       regla de medida entre dos puntos: entre: [pieza|xyz, pieza|xyz], texto ("1,8 M"), aparte ([x,y,z],
//               la separa del objeto), color. Se dibuja creciendo.
//   mapaCalor   mapa de calor o de frío con cifras: mapa: { centro (pieza|xyz), ancho, alto, normal ("z"|"x"|"y"),
//               paleta ("frio"|"calor"), opacidad, puntos: [{ x, y (de -0,5 a 0,5), r, k (0..1 o {de, a}),
//               texto | valor: { de, a, decimales, unidad } }] }.
//   particulas  moléculas en una caja (set propio): clase ("gas" | "liquido" | "cambio" de líquido a gas;
//               con invertir: true, de gas a líquido),
//               n, caja [w,h,d], caja2 (la caja se aprieta hasta aquí: un pistón baja), temp ({ de, a } de 0 frío
//               a 1 caliente: color y velocidad), piston: true, dur (segundos del cambio).
//   flujo       encuadra los flujos del plano (flujos: [...]) y los dibuja creciendo.
//   rayosX      el objeto se vuelve transparente y enseña lo de dentro (objeto: id; de, a, dur).
//   compartir   el cierre: móvil sin manos con la hoja de compartir (elegir: momento, enviar: momento).
//   libre       cámara a mano: de: { p, q, fov }, a: { p, q, fov } en unidades del set.
//
// Regla automática: si un plano dura más de 4 s y no lleva variar: false, se parte en trozos de 1,4–4 s en el
// comienzo de una palabra, y cada trozo es una variación (otro ángulo, un empuje, otro encuadre) a la que la cámara
// llega deslizándose, sin corte. Los estados con rampa siguen contando desde el plano original.
// Transiciones (3 de noviembre, como @speedy_devv): dentro del mismo set la cámara viaja de un encuadre al siguiente
// (0,7 s); al cambiar de set, el plano anterior se funde en el nuevo (0,35 s). En un plano: entrada ("deslizar",
// "fundido" o "corte") y transicion (segundos). Ritmo: un encuadre nuevo cada 2-3 s, alguno de hasta 4 s cuando la
// voz explica algo, nunca una ráfaga de cortes.
// ======================================================================================================

import * as UI from "./pantallas.js";
import { OBJETOS, crearMateriales, crearBase } from "./objetos/index.js";

export function crearPlantillas(THREE, C, X, opciones = {}) {
  const { v3, clamp, lerp, ramp, hash } = C;
  const PI = Math.PI, RAD = PI / 180;
  const ESC = C.ESC;
  const M = crearMateriales(THREE, C, X);
  const B = crearBase(THREE, C, X, M);
  const REG = { ...OBJETOS, ...(opciones.objetos || {}) };
  const frac = (x) => x - Math.floor(x);
  const tri = (x) => 1 - Math.abs((((x % 2) + 2) % 2) - 1);

  // ---------- look (the same as 07-microondas): blue-black backdrop, own light rig per set ----------
  X.fondo(ESC.fondo || { arriba: "#07080c", medio: "#131a26", abajo: "#090b0f" });
  C.key.castShadow = false; C.key.intensity = 0; C.warm.intensity = 0; C.rim.intensity = 0; C.hemi.intensity = 0.3;
  C.renderer.shadowMap.enabled = false; C.renderer.localClippingEnabled = true; C.scene.environmentIntensity = 0.5;
  // near plane at 1 unit (1 cm in kitchen scenes): with 0.1 the depth buffer z-fights on layers 5 mm apart seen from 6 m
  C.camera.near = opciones.cerca ?? 1; C.camera.far = 8000; C.camera.updateProjectionMatrix();
  const bloom = C.composer.passes.find((x) => x.threshold !== undefined); if (bloom) { bloom.threshold = 0.9; bloom.strength = 0.5; }

  // ---------- number format (Spanish): 1.234,5 and a real minus sign ----------
  function formato(v, { decimales = 0, miles = true, unidad = "", prefijo = "" } = {}) {
    const neg = v < 0; let s = Math.abs(v).toFixed(decimales);
    let [e, d] = s.split(".");
    if (miles && e.length > 4) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    s = e + (d ? "," + d : "");
    return `${prefijo}${neg && +s.replace(/\./g, "").replace(",", ".") !== 0 ? "−" : ""}${s}${unidad ? " " + unidad : ""}`;
  }
  const valorEn = (spec, t, t0) => {
    if (spec === undefined || spec === null) return null;
    if (typeof spec !== "object") return spec;
    const a0 = (spec.en !== undefined ? (typeof spec.en === "string" ? C.cuando(spec.en) : t0 + spec.en) : t0);
    const k = ramp(t, a0, a0 + (spec.dur ?? 0.6));
    if (typeof spec.de === "number") return lerp(spec.de, spec.a, k);
    return k < 0.5 ? spec.de : spec.a;
  };

  // ===================================== sets and objects =====================================
  const SETS = {}, INST = {};
  let nSet = 0;
  function nuevoSet(nombre, cfg = {}) {
    const centro = v3((nSet % 4) * 3000, 0, Math.floor(nSet / 4) * 3000);
    const g = new THREE.Group(); g.position.copy(centro); C.scene.add(g); g.updateMatrixWorld(true);
    const S = { nombre, grupo: g, centro, cfg, objetos: [], R: cfg.radio || 30, foco: v3(0, 0, 0), extras: [] };
    SETS[nombre] = S; nSet++;
    return S;
  }
  function crearObjeto(S, o) {
    const f = REG[o.tipo]; if (!f) throw new Error(`No hay ningún objeto "${o.tipo}" en la biblioteca (objetos/index.js)`);
    const def = f(THREE, C, X, M, o.opciones || {});
    const g = def.grupo;
    if (o.pos) g.position.set(...o.pos);
    if (o.rot) g.rotation.set(...o.rot.map((a) => a * RAD));
    if (o.escala) g.scale.multiplyScalar(o.escala);
    S.grupo.add(g); S.grupo.updateMatrixWorld(true);
    const id = o.id || o.tipo;
    const inst = B.envolver(def, { id, tipo: o.tipo }); inst.set = S.nombre;
    S.objetos.push(inst); INST[id] = inst;
    return inst;
  }
  // the same trio of lights in every set, scaled to its size (as in 07: no shader recompiles between sets)
  function rig(S, preset = "estudio") {
    const P = { anuncio: [2.0, 1.8, 1.0], estudio: [1.5, 1.4, 0.7], suave: [1.0, 1.0, 0.5] }[preset] || [1.5, 1.4, 0.7];
    const s = S.R / 35, f = S.foco;
    const k = new THREE.DirectionalLight(0xfff3e6, P[0]); k.position.set(f.x - 60 * s, f.y + 90 * s, f.z + 110 * s); k.target.position.copy(f); S.grupo.add(k, k.target);
    const r = new THREE.DirectionalLight(0xa9c2ff, P[1]); r.position.set(f.x + 80 * s, f.y + 50 * s, f.z - 90 * s); r.target.position.copy(f); S.grupo.add(r, r.target);
    const l = new THREE.PointLight(0xffdcb8, 3800 * P[2] * s * s, 320 * s, 2); l.position.set(f.x - 40 * s, f.y + 30 * s, f.z + 90 * s); S.grupo.add(l);
    S.luces = { k, r, l };
  }
  const sueloMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: "varying vec2 vUv; void main(){ vec2 p = (vUv - 0.5) * 2.0; float r = length(p); float a = 1.0 - smoothstep(0.2, 1.0, r); float sh = smoothstep(0.32, 0.06, length(p * vec2(1.0, 1.25))); vec3 c = mix(vec3(0.020, 0.022, 0.028), vec3(0.006, 0.007, 0.009), sh * 0.9); gl_FragColor = vec4(c, a * 0.96); }" });
  function terminarSet(S) {
    const cfg = S.cfg;
    if (S.objetos.length) {
      const b = new THREE.Box3(); for (const o of S.objetos) b.expandByObject(o.grupo);
      const sp = b.getBoundingSphere(new THREE.Sphere());
      S.foco = sp.center.clone().sub(S.centro); S.R = cfg.radio || sp.radius; S.suelo = b.min.y - S.centro.y;
    }
    rig(S, cfg.luz);
    if (cfg.motas !== false) S.grupo.add(X.motas({ n: 600, caja: [10 * S.R, 6 * S.R, 5 * S.R], centro: S.foco.clone().add(v3(0, S.R, -3.4 * S.R)), tam: 0.02 * S.R, opacidad: 0.5 }).grupo);
    if (cfg.suelo) { const m = new THREE.Mesh(new THREE.PlaneGeometry(7 * S.R, 7 * S.R), sueloMat); m.rotation.x = -PI / 2; m.position.set(S.foco.x, (S.suelo ?? 0) - 0.02 * S.R, S.foco.z); S.grupo.add(m); }
  }
  for (const [nombre, cfg] of Object.entries(ESC.sets || {})) {
    const S = nuevoSet(nombre, cfg);
    for (const o of cfg.objetos || []) crearObjeto(S, o);
    terminarSet(S);
  }
  const primerSet = () => Object.values(SETS)[0];

  // where a piece is: "id.parte", "id" or just "parte" (preferring the given set); or [x, y, z] in set units
  function resolver(ref, setNombre) {
    if (Array.isArray(ref)) return { set: setNombre, p: v3(...ref), r: 10 };
    const [a, b] = ref.split(".");
    let inst = null, parte = "_todo";
    if (b !== undefined) { inst = INST[a]; parte = b; }
    else if (INST[a]) inst = INST[a];
    else { const cs = Object.values(INST).filter((o) => o.partes[a]); inst = cs.find((o) => o.set === setNombre) || cs[0]; parte = a; }
    if (!inst || !inst.partes[parte]) throw new Error(`No encuentro la pieza "${ref}"`);
    const S = SETS[inst.set];
    S.grupo.updateMatrixWorld(true);
    return { set: inst.set, p: inst.punto(parte).sub(S.centro), r: inst.radio(parte), inst, parte };
  }
  function objetivo(s) {
    const S0 = s.set ? SETS[s.set] : null;
    if (s.set && !S0) throw new Error(`No hay ningún set "${s.set}"`);
    const ref = s.objetivo ?? s.pieza ?? null;
    if (Array.isArray(ref)) { const S = S0 || primerSet(); return { S, q: v3(...ref), r: s.radio ?? S.R * 0.3 }; }
    if (typeof ref === "string") { const R = resolver(ref, S0 && S0.nombre); return { S: S0 || SETS[R.set], q: R.p, r: s.radio ?? R.r, inst: R.inst, parte: R.parte }; }
    const S = S0 || primerSet(); return { S, q: S.foco.clone(), r: s.radio ?? S.R };
  }

  // ===================================== flows: glowing ribbons along a route =====================================
  const FLUJOS = {};
  for (const [nombre, f] of Object.entries(ESC.flujos || {})) {
    const curvaDe = (ref) => { const [a, b] = ref.split("."); const o = INST[a]; const w = o && o.curva(b); if (!w) throw new Error(`No encuentro la curva "${ref}"`); return { o, w }; };
    const ref0 = f.ruta.find((r) => typeof r === "string"), cur0 = f.ruta.find((r) => r && r.curva);
    const S = f.set ? SETS[f.set] : ref0 ? SETS[resolver(ref0).set] : cur0 ? SETS[curvaDe(cur0.curva).o.set] : primerSet();
    // each stop: a piece, [x,y,z], or { curva: "nevera.condensador", invertir } = all the points of that tube
    const tramos = f.ruta.map((r) => {
      if (r && r.curva) { const q = curvaDe(r.curva).w.map((p) => p.sub(S.centro)); return { pts: r.invertir ? q.reverse() : q, denso: true }; }
      return { pts: [resolver(r, S.nombre).p], denso: false };
    });
    const base = tramos.flatMap((x) => x.pts);
    // extra points near each corner keep the straight runs straight and round the corners a little
    const pts = [];
    let prev = null;
    for (const tr of tramos) for (const p of tr.pts) {
      if (prev && !tr.denso && prev.distanceTo(p) > 1e-6) pts.push(prev.clone().lerp(p, 0.18), prev.clone().lerp(p, 0.82));
      if (!prev || prev.distanceTo(p) > 1e-6) pts.push(p.clone());
      prev = p;
    }
    const curva = new THREE.CatmullRomCurve3(pts, !!f.cerrado, "centripetal");
    const NP = f.puntos || 160, NH = f.hebras || 3, sep = f.separa ?? S.R * 0.012;
    const cin = X.cinta({ hebras: NH, puntos: NP, ancho: f.ancho ?? S.R * 0.006, minPx: f.minPx ?? 2.2, color: new THREE.Color(f.color || "#ffb22e").getHex(), intensidad: f.intensidad ?? 1.2, ondas: f.ondas ?? 2.4, vel: f.vel ?? 0.8 });
    cin.malla.visible = false; S.grupo.add(cin.malla);
    const muestras = [];
    const Z = v3(0, 0, 1), Y = v3(0, 1, 0), E = f.eje ? { x: v3(1, 0, 0), y: Y, z: Z }[f.eje] : null;
    for (let h = 0; h < NH; h++) {
      const arr = [];
      for (let j = 0; j < NP; j++) {
        const u = j / (NP - 1), p = curva.getPointAt(u), tg = curva.getTangentAt(u);
        // the strands spread in the plane seen by the camera: perpendicular to `eje` if given
        let n = new THREE.Vector3().crossVectors(tg, E || (Math.abs(tg.dot(Z)) > 0.9 ? Y : Z)).normalize();
        arr.push(p.addScaledVector(n, (h - (NH - 1) / 2) * sep + Math.sin(u * 40 + h * 2.1) * sep * 0.15));
      }
      muestras.push(arr);
    }
    const caja = new THREE.Box3().setFromPoints(base);
    FLUJOS[nombre] = { nombre, f, S, cin, muestras, NP, NH, caja, kHecho: -1 };
  }
  function pintarFlujo(F, k, t) {
    F.cin.malla.visible = k > 0.001;
    if (!F.cin.malla.visible) return;
    if (Math.abs(k - F.kHecho) > 1e-4) {
      F.kHecho = k;
      for (let h = 0; h < F.NH; h++) F.cin.poner(h, (u) => F.muestras[h][Math.round(u * (F.NP - 1))], { peso: (u) => clamp((k * 1.04 - u) / 0.04), fase: hash(h * 3.3) });
    }
    F.cin.tiempo(t);
  }

  // ===================================== big readout (DOM) =====================================
  const estilo = document.createElement("style");
  estilo.textContent = `
    .lectura-p { position: absolute; left: 60px; right: 60px; text-align: center; opacity: 0; transform: translateY(-50%); }
    .lectura-p .v { font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 150px; letter-spacing: -0.04em; color: #fff; line-height: 1;
      white-space: nowrap; text-shadow: 0 4px 30px rgba(0,0,0,0.75); font-variant-numeric: tabular-nums; }
    .lectura-p .t { margin-top: 18px; font-family: "Inter", sans-serif; font-weight: 700; font-size: 26px; letter-spacing: 0.16em; color: rgba(255,255,255,0.72);
      text-shadow: 0 1px 8px rgba(0,0,0,0.9); }
    .lectura-p .l { width: 120px; height: 3px; margin: 22px auto 0; background: #ffb347; }
    .leyenda { display: block; } .leyenda .fila { position: absolute; left: 0; white-space: nowrap; }`;
  document.head.appendChild(estilo);
  const lecEl = document.createElement("div"); lecEl.className = "lectura-p";
  lecEl.innerHTML = '<div class="v"></div><div class="l"></div><div class="t"></div>';
  document.getElementById("labels").appendChild(lecEl);
  const lecV = lecEl.querySelector(".v"), lecT = lecEl.querySelector(".t");
  function textoLectura(L, t, t0) {
    if (L.texto !== undefined) return L.texto;
    const a0 = L.en !== undefined ? (typeof L.en === "string" ? C.cuando(L.en) : t0 + L.en) : t0 + 0.1;
    const k = ramp(t, a0, a0 + (L.dur ?? 1.0));
    return formato(lerp(L.de ?? 0, L.a ?? 0, k), L);
  }
  function pintarLectura(L, t, t0, a) {
    lecEl.style.opacity = a; if (a < 0.001) return;
    const tx = textoLectura(L, t, t0);
    if (lecV.textContent !== tx) lecV.textContent = tx;
    if (lecT.textContent !== (L.titulo || "")) lecT.textContent = L.titulo || "";
    lecV.style.fontSize = (L.tam || (tx.length > 9 ? 120 : 150)) + "px";
    lecEl.style.top = (L.y ?? 900) + "px";
    lecEl.style.transform = `translateY(-50%) translateY(${(1 - a) * 14}px)`;
  }
  // panels of the engine with a "valor" in the scene
  const panelesValor = (ESC.paneles || []).filter((p) => p.valor !== undefined);

  // ===================================== camera helpers =====================================
  const ASP = C.W / C.H;
  const ajuste = (r, fov, margen = 1.1) => { const vf = fov * RAD, hf = 2 * Math.atan(Math.tan(vf / 2) * ASP); return (r * margen) / Math.sin(Math.min(vf, hf) / 2); };
  const orbitaP = (q, az, el, d) => v3(q.x + d * Math.sin(az * RAD) * Math.cos(el * RAD), q.y + d * Math.sin(el * RAD), q.z + d * Math.cos(az * RAD) * Math.cos(el * RAD));
  // variations used when a long shot is split: [change of angle, of elevation, distance factor, orbit direction]
  const VAR_ORB = [[0, 0, 1, 1], [26, 7, 0.8, -1], [-8, -3, 0.58, 1], [-28, 4, 0.9, -1], [14, 12, 0.68, 1]];
  function orbital(s, o, d0) {
    const v = VAR_ORB[(s.variante || 0) % VAR_ORB.length];
    const fov = s.fov ?? d0.fov;
    const az = (s.angulo ?? d0.angulo) + v[0], el = clamp((s.altura ?? d0.altura) + v[1], -80, 85);
    const d = ajuste(o.r, fov, d0.margen ?? 1.1) * (s.dist ?? 1) * v[2];
    const q = o.q.clone().add(v3(...(s.desplaza || [0, 0, 0])));
    const orb = (s.orbita ?? d0.orbita) * v[3], emp = s.empuje ?? d0.empuje;
    return {
      de: { p: orbitaP(q, az - orb / 2, el, d), q: q.clone(), fov },
      a: { p: orbitaP(q, az + orb / 2, el + (d0.subir || 0), d * (1 - emp)), q: q.clone(), fov },
      apertura: s.apertura ?? (d0.desenfoque ? d0.desenfoque / (o.r * v[2]) : 0), foco: s.foco, curva: s.curva ?? "suave",
    };
  }

  // ===================================== shot types =====================================
  const regla = {}, mapas = {};
  let campo = null, movilF = null;
  const TIPOS = {
    anuncio: {
      camara: (s) => orbital(s, objetivo(s), { fov: 28, angulo: 32, altura: 10, orbita: 10, empuje: 0.06, margen: 1.12, desenfoque: 0.0016 }),
    },
    macro: {
      camara: (s) => orbital(s, objetivo(s), { fov: 24, angulo: 25, altura: 14, orbita: 6, empuje: 0.12, margen: 0.95, desenfoque: 0.008 }),
    },
    rayosX: {
      camara: (s) => orbital(s, objetivo(s), { fov: 28, angulo: 35, altura: 14, orbita: 8, empuje: 0.05, margen: 1.12, desenfoque: 0.001 }),
      aplicar(t, s) {
        const o = s.objeto ? INST[s.objeto] : objetivo(s).inst || SETS[s._set].objetos[0];
        if (o) o.rayosX(lerp(s.de ?? 0, s.a ?? 1, ramp(t, s._tb0 + 0.1, s._tb0 + 0.1 + (s.dur ?? 0.7))));
      },
    },
    cifra: {
      camara: (s) => { const o = objetivo(s), c = orbital(s, o, { fov: 28, angulo: 20, altura: 8, orbita: 8, empuje: 0.05, margen: 1.0 }); c.foco = s.foco ?? c.de.p.distanceTo(c.de.q) * 0.3; c.apertura = s.apertura ?? 0.05 / o.r; return c; },
      aplicar(t, s) { if (s.lectura) pintarLectura(s.lectura, t, s._tb0, ramp(t, s._tb0, s._tb0 + 0.25)); },
    },
    cenital: {
      camara(s) {
        const o = objetivo(s), v = [[0, 1], [35, 0.7], [-25, 0.85], [60, 0.62]][(s.variante || 0) % 4];
        const fov = s.fov ?? 30, d = ajuste(o.r, fov, 1.05) * (s.dist ?? 1) * v[1], q = o.q.clone().add(v3(...(s.desplaza || [0, 0, 0])));
        const g0 = ((s.angulo ?? 0) + v[0]) * RAD, g1 = g0 + (s.gira ?? 8) * RAD, e = d * 0.002;
        return { de: { p: v3(q.x + Math.sin(g0) * e, q.y + d, q.z + Math.cos(g0) * e), q: q.clone(), fov }, a: { p: v3(q.x + Math.sin(g1) * e, q.y + d * (1 - (s.empuje ?? 0.08)), q.z + Math.cos(g1) * e), q: q.clone(), fov }, apertura: s.apertura ?? 0, foco: s.foco, curva: s.curva ?? "suave" };
      },
    },
    corte: {
      camara(s) {
        const o = objetivo(s), eje = s.eje || "z", sg = s.signo || 1;
        const az = s.angulo ?? (eje === "x" ? 90 * sg : eje === "z" ? (sg > 0 ? 0 : 180) : 0), el = s.altura ?? (eje === "y" ? 88 : 2);
        const v = [[0, 0, 1], [0.26, 0.1, 0.62], [-0.24, -0.12, 0.7], [0.05, 0.22, 0.5]][(s.variante || 0) % 4];
        const fov = s.fov ?? 14, h = v3(Math.cos(az * RAD), 0, -Math.sin(az * RAD));
        const q = o.q.clone().addScaledVector(h, v[0] * o.r).add(v3(0, v[1] * o.r, 0)).add(v3(...(s.desplaza || [0, 0, 0])));
        const d = ajuste(o.r, fov, 1.08) * (s.dist ?? 1) * v[2], dr = (s.deriva ?? 0.03) * o.r;
        const q0 = q.clone().addScaledVector(h, -dr), q1 = q.clone().addScaledVector(h, dr);
        return { de: { p: orbitaP(q0, az, el, d), q: q0, fov }, a: { p: orbitaP(q1, az, el, d * (1 - (s.empuje ?? 0.04))), q: q1, fov }, apertura: s.apertura ?? 0, foco: s.foco, curva: s.curva ?? "lineal" };
      },
    },
    regla: {
      camara(s) { const R = regla[s._uid0]; return orbital(s, { q: R.medio.clone(), r: R.largo * 0.62 }, { fov: 24, angulo: s._az ?? 0, altura: 4, orbita: 4, empuje: 0.04, margen: 1.15 }); },
      aplicar(t, s) { const R = regla[s._uid0]; R.poner(ramp(t, s._tb0 + 0.1, s._tb0 + 0.75)); },
    },
    mapaCalor: {
      camara(s) {
        const Mp = mapas[s._uid0], r = s.radio ?? Math.max(Mp.ancho, Mp.alto) * 0.55;
        if (Mp.normal === "y") return TIPOS.cenital.camara({ ...s, objetivo: Mp.centro.toArray(), radio: r, set: Mp.S.nombre });
        return orbital(s, { q: Mp.centro.clone(), r }, { fov: s.fov ?? 22, angulo: Mp.normal === "x" ? 90 : 0, altura: 3, orbita: 5, empuje: 0.05, margen: 1.05 });
      },
      aplicar(t, s) { mapas[s._uid0].pintar(t, s._tb0, ramp(t, s._tb0, s._tb0 + 0.35)); },
    },
    particulas: {
      camara(s) { const c0 = s.caja || [30, 40, 20], c1 = s.caja2 || c0, c = c1[0] * c1[1] > c0[0] * c0[1] ? c1 : c0; return orbital(s, { q: v3(0, 0, 0), r: Math.hypot(c[0], c[1]) * 0.42 }, { fov: 28, angulo: 0, altura: 4, orbita: 8, empuje: 0.06, margen: 1.0, desenfoque: 0.01 }); },
      aplicar(t, s) { campo.pintar(t, s); },
    },
    flujo: {
      camara(s) {
        const b = new THREE.Box3(); for (const n of s.flujos || []) b.union(FLUJOS[n].caja);
        const sp = b.getBoundingSphere(new THREE.Sphere());
        return orbital(s, { q: sp.center, r: s.radio ?? sp.radius }, { fov: 22, angulo: 0, altura: 4, orbita: 6, empuje: 0.05, margen: 1.08 });
      },
    },
    compartir: {
      camara(s) {
        const v = [[[0, 0.6, 42], [0, -0.4, 0], [0, 0.5, 39], [0, -0.4, 0]], [[1.2, -0.6, 32], [0.4, -1.6, 0], [1.0, -0.6, 30], [0.4, -1.6, 0]]][(s.variante || 0) % 2];
        return { de: { p: v3(...v[0]), q: v3(...v[1]), fov: 24 }, a: { p: v3(...v[2]), q: v3(...v[3]), fov: 24 }, apertura: 0, curva: "suave" };
      },
      aplicar(t, s) { movilF.pintar(t, s); },
    },
    libre: {
      camara: (s) => ({ de: { p: v3(...s.de.p), q: v3(...s.de.q), fov: s.de.fov ?? s.fov ?? 30 }, a: { p: v3(...(s.a || s.de).p), q: v3(...(s.a || s.de).q), fov: (s.a || s.de).fov ?? s.fov ?? 30 }, apertura: s.apertura ?? 0, foco: s.foco, curva: s.curva ?? "suave" }),
    },
    ...(opciones.tipos || {}),
  };
  // the cut plane goes through the shot's piece (or the set's first object) and cuts every object of the set
  function cortarSet(s) {
    const S = SETS[s._set], o = s.pieza ? objetivo(s).inst : null, ref = o || S.objetos[0];
    if (!ref) return;
    const eje = s.eje || "z", sg = s.signo || 1;
    ref.cortar(1, { eje, en: s.en ?? 0, signo: sg });
    const plano = ref.plano.clone();
    const lista = s.cortar === true || s.cortar === undefined ? S.objetos : S.objetos.filter((x) => [].concat(s.cortar).includes(x.id));
    for (const x of lista) x.cortar(1, { plano });
  }

  // ---------- builders for the shot types that need their own pieces ----------
  function hacerRegla(s, uid) {
    const o0 = s.set ? SETS[s.set] : null;
    const A = resolver(s.entre[0], o0 && o0.nombre), Bp = resolver(s.entre[1], o0 && o0.nombre);
    const S = o0 || SETS[A.set];
    const ap = v3(...(s.aparte || [0, 0, 0])), a = A.p.clone().add(ap), b = Bp.p.clone().add(ap);
    const L = a.distanceTo(b), medio = a.clone().lerp(b, 0.5);
    const az = s.angulo ?? 0, n = v3(Math.sin(az * RAD), 0, Math.cos(az * RAD));
    const ex = b.clone().sub(a).normalize(), ez = n.clone().addScaledVector(ex, -n.dot(ex)).normalize(), ey = new THREE.Vector3().crossVectors(ez, ex);
    const g = new THREE.Group(); g.position.copy(a); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, ey, ez)); S.grupo.add(g);
    const col = new THREE.Color(s.color || "#ffffff").getHex(), th = L * 0.006, mat = M.basica(col, 0.95);
    const linea = new THREE.Mesh(new THREE.PlaneGeometry(1, th), mat); g.add(linea);
    const t0 = new THREE.Mesh(new THREE.PlaneGeometry(th, L * 0.05), mat); g.add(t0);
    const t1 = new THREE.Mesh(new THREE.PlaneGeometry(th, L * 0.05), mat); t1.position.x = L; g.add(t1);
    const marcas = []; for (let i = 1; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(th * 0.6, L * 0.018), M.basica(col, 0.5)); m.position.set((L * i) / 10, -L * 0.006, 0); g.add(m); marcas.push(m); }
    // dashed guides from the measured points to the ruler
    const guias = new THREE.Group(); S.grupo.add(guias);
    if (ap.lengthSq() > 1e-6) for (const [p, q] of [[A.p, a], [Bp.p, b]]) {
      const geo = new THREE.BufferGeometry().setFromPoints([p, q]);
      const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: col, dashSize: L * 0.02, gapSize: L * 0.015, transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false })); l.computeLineDistances(); guias.add(l);
    }
    let rotulo = null;
    if (s.texto) {
      const lz = X.lienzo(512, 128, (gg) => { gg.font = '700 74px "JetBrains Mono", monospace'; gg.textAlign = "center"; gg.textBaseline = "middle"; gg.fillStyle = "rgba(8,10,14,0.72)"; gg.beginPath(); gg.roundRect(6, 10, 500, 108, 18); gg.fill(); gg.fillStyle = s.color || "#ffffff"; gg.fillText(s.texto, 256, 68); });
      rotulo = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.36, L * 0.09), new THREE.MeshBasicMaterial({ map: lz.tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
      rotulo.position.set(L / 2, L * (s.rotuloY ?? 0.07), 0.01); rotulo.renderOrder = 10; g.add(rotulo);
    }
    const R = {
      medio, largo: L, S, grupo: g, guias,
      poner(k) {
        g.visible = guias.visible = k > 0.001; const l = L * clamp(k);
        linea.scale.x = Math.max(1e-3, l); linea.position.x = l / 2; t1.visible = k > 0.98;
        marcas.forEach((m, i) => (m.visible = (i + 1) / 10 <= k));
        if (rotulo) rotulo.material.opacity = clamp((k - 0.6) / 0.3);
      },
    };
    R.poner(0); S.extras.push(() => R.poner(0));
    C.pieza(`regla.${uid}`, g, v3(L / 2, 0, 0));
    regla[uid] = R; s._az = az;
    return S;
  }
  const GLSL_PALETAS = `
    vec3 calor(float k) { k = clamp(k, 0.0, 1.0);
      vec3 a = vec3(0.010, 0.022, 0.060), b = vec3(0.030, 0.060, 0.120), c = vec3(0.50, 0.11, 0.015), d = vec3(1.0, 0.42, 0.06), e = vec3(1.0, 0.86, 0.52);
      if (k < 0.3) return mix(a, b, k / 0.3); if (k < 0.6) return mix(b, c, (k - 0.3) / 0.3); if (k < 0.85) return mix(c, d, (k - 0.6) / 0.25); return mix(d, e, (k - 0.85) / 0.15); }
    vec3 frio(float k) { k = clamp(k, 0.0, 1.0);
      vec3 a = vec3(0.015, 0.02, 0.04), b = vec3(0.03, 0.09, 0.22), c = vec3(0.10, 0.36, 0.78), d = vec3(0.50, 0.80, 1.0), e = vec3(0.90, 0.97, 1.0);
      if (k < 0.3) return mix(a, b, k / 0.3); if (k < 0.6) return mix(b, c, (k - 0.3) / 0.3); if (k < 0.85) return mix(c, d, (k - 0.6) / 0.25); return mix(d, e, (k - 0.85) / 0.15); }`;
  function hacerMapa(s, uid) {
    const m = s.mapa, o0 = s.set ? SETS[s.set] : null;
    const Rc = typeof m.centro === "string" ? resolver(m.centro, o0 && o0.nombre) : { p: v3(...(m.centro || [0, 0, 0])), set: (o0 || primerSet()).nombre };
    const S = o0 || SETS[Rc.set];
    const ancho = m.ancho || 40, alto = m.alto || 40, normal = m.normal || "z", pts = m.puntos || [], N = 12;
    const U = { uP: { value: Array.from({ length: N }, () => new THREE.Vector3()) }, uK: { value: new Array(N).fill(0) }, uA: { value: 0 }, uPal: { value: m.paleta === "calor" ? 1 : 0 }, uOp: { value: m.opacidad ?? 0.93 } };
    pts.slice(0, N).forEach((p, i) => U.uP.value[i].set(p.x * ancho, p.y * alto, (p.r ?? 0.18) * Math.min(ancho, alto)));
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: `varying vec2 vP; uniform vec3 uP[${N}]; uniform float uK[${N}]; uniform float uA, uPal, uOp; ${GLSL_PALETAS}
        void main(){
          float I = 0.0;
          for (int i = 0; i < ${N}; i++) { vec2 d = vP - uP[i].xy; float r = max(uP[i].z, 0.001); I = max(I, uK[i] * exp(-dot(d, d) / (2.0 * r * r))); }
          vec2 g = abs(fract(vP / ${(Math.min(ancho, alto) / 12).toFixed(3)} + 0.5) - 0.5); float rej = 1.0 - smoothstep(0.0, 0.05, min(g.x, g.y));
          vec3 col = (uPal > 0.5 ? calor(0.1 + 0.9 * I) : frio(0.1 + 0.9 * I)) + rej * 0.03;
          gl_FragColor = vec4(col, uA * uOp);
        }` });
    const g = new THREE.Group(); g.position.copy(Rc.p).add(v3(...(m.mover || [0, 0, 0])));
    if (normal === "x") g.rotation.y = PI / 2; else if (normal === "y") g.rotation.x = -PI / 2; else if (normal === "-x") g.rotation.y = -PI / 2;
    S.grupo.add(g);
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), mat));
    // light figures on dark spots, dark figures on bright spots (destacada = bright)
    const F = X.cifras(pts.map((p) => v3(p.x * ancho, p.y * alto + (p.dy ?? 0), 0.3)), { tam: m.tam ?? Math.min(ancho, alto) * 0.055, ancho: 3.4, color: "#eef3fa", fuerte: "#07101e" });
    g.add(F.grupo);
    const Mp = {
      S, centro: g.position.clone(), ancho, alto, normal, grupo: g,
      pintar(t, t0, a) {
        g.visible = a > 0.001; U.uA.value = a;
        pts.slice(0, N).forEach((p, i) => {
          const k = valorEn(p.k ?? 1, t, t0 + 0.1); U.uK.value[i] = k;
          const tx = p.valor ? formato(valorEn({ dur: 1.0, ...p.valor }, t, t0 + 0.1), p.valor) : p.texto ?? "";
          F.poner(i, tx, p.destacada ?? k > 0.55);
        });
        F.dibujar(); F.items.forEach((it) => (it.mesh.material.opacity = a));
      },
    };
    g.visible = false; S.extras.push(() => (g.visible = false));
    mapas[uid] = Mp;
    return S;
  }
  // molecules in a box (own set): gas, liquid, or liquid boiling into gas; the box can be squeezed by a piston
  function hacerCampo() {
    const S = nuevoSet("_particulas", { radio: 30 }); S.foco = v3(0, 0, 0); S.R = 30;
    rig(S, "estudio");
    S.grupo.add(X.motas({ n: 500, caja: [140, 120, 80], centro: v3(0, 10, -60), tam: 0.35, opacidad: 0.45 }).grupo);
    const NM = 260;
    const mc = new THREE.MeshPhysicalMaterial({ color: 0xbcd2ff, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1, emissive: 0x3a7cff, emissiveIntensity: 0.2, envMapIntensity: 0.8 });
    const ms = new THREE.MeshPhysicalMaterial({ color: 0xe8ecf2, roughness: 0.3, clearcoat: 0.7, emissive: 0x3a7cff, emissiveIntensity: 0.1, envMapIntensity: 0.7 });
    const cG = new THREE.SphereGeometry(0.62, 28, 18), sG = new THREE.SphereGeometry(0.4, 20, 14);
    const cI = new THREE.InstancedMesh(cG, mc, NM), sI = new THREE.InstancedMesh(sG, ms, NM * 2); S.grupo.add(cI, sI);
    const bordes = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: 0x9fb6d8, transparent: true, opacity: 0.35, toneMapped: false })); S.grupo.add(bordes);
    const piston = new THREE.Group(); S.grupo.add(piston);
    { const pl = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M.aceroD); pl.scale.set(1, 0.8, 1); piston.add(pl); const vara = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 40, 24), M.acero); vara.position.y = 20; piston.add(vara); piston.userData.pl = pl; }
    const frio = new THREE.Color(0x4f8dff), cal = new THREE.Color(0xffa040), tmp = new THREE.Color();
    const dm = new THREE.Object3D(), q = new THREE.Quaternion(), UPY = v3(0, 1, 0), dir = new THREE.Vector3();
    const HA = (52 * PI) / 180, HL = 0.82;
    const P = Array.from({ length: NM }, (_, i) => ({ u: v3(hash(i * 1.3), hash(i * 2.7), hash(i * 4.1)), d: v3(hash(i * 5.3) - 0.5, hash(i * 6.1) - 0.5, hash(i * 7.9) - 0.5).normalize(), s: 0.6 + 0.8 * hash(i * 8.7), f: hash(i * 9.3) * 6.28, sale: hash(i * 3.9) }));
    const gas = new THREE.Vector3(), liq = new THREE.Vector3();
    campo = {
      S,
      pintar(t, s) {
        const t0 = s._tb0, c0 = s.caja || [30, 40, 20], c1 = s.caja2 || c0;
        const kc = ramp(t, t0 + 0.2, t0 + 0.2 + (s.dur ?? 1.4));
        const cw = lerp(c0[0], c1[0], kc), ch = lerp(c0[1], c1[1], kc), cd = lerp(c0[2], c1[2], kc);
        const temp = valorEn(s.temp ?? 0.3, t, t0 + 0.2) ?? 0.3;
        const n = Math.min(NM, s.n ?? 160), vel = 0.05 + 0.5 * temp;
        let cambio = s.clase === "cambio" ? ramp(t, t0 + 0.2, t0 + 0.2 + (s.dur ?? 1.6)) : s.clase === "liquido" ? 0 : 1;
        if (s.clase === "cambio" && s.invertir) cambio = 1 - cambio;
        tmp.copy(frio).lerp(cal, temp);
        mc.color.copy(tmp).lerp(new THREE.Color(0xffffff), 0.35); mc.emissive.copy(tmp); mc.emissiveIntensity = 0.25 + 0.5 * Math.abs(temp - 0.5);
        ms.emissive.copy(tmp); ms.emissiveIntensity = 0.12;
        bordes.scale.set(cw, ch, cd); bordes.visible = s.pared !== false;
        piston.visible = !!s.piston; piston.position.y = ch / 2 + 0.4; piston.userData.pl.scale.set(cw - 0.3, 0.8, cd - 0.3);
        for (let i = 0; i < NM; i++) {
          const m = P[i];
          if (i >= n) { dm.position.set(0, -1e4, 0); dm.scale.setScalar(0.001); dm.updateMatrix(); cI.setMatrixAt(i, dm.matrix); for (let k = 0; k < 2; k++) sI.setMatrixAt(i * 2 + k, dm.matrix); continue; }
          // gas: straight flights bouncing off the walls; liquid: packed at the bottom, jiggling
          const tt = t * vel * m.s;
          gas.set((tri(m.u.x * 2 + m.d.x * tt) - 0.5) * (cw - 1.4), (tri(m.u.y * 2 + m.d.y * tt) - 0.5) * (ch - 1.4), (tri(m.u.z * 2 + m.d.z * tt) - 0.5) * (cd - 1.4));
          const cols = Math.max(1, Math.floor((cw - 1.4) / 1.7)), fil = Math.max(1, Math.floor((cd - 1.4) / 1.7)), capa = Math.floor(i / (cols * fil));
          const j = i % (cols * fil);
          liq.set(((j % cols) + 0.5) / cols * (cw - 1.4) - (cw - 1.4) / 2 + (capa % 2) * 0.5, -ch / 2 + 1.0 + capa * 1.35, (Math.floor(j / cols) + 0.5) / fil * (cd - 1.4) - (cd - 1.4) / 2);
          liq.x += 0.18 * Math.sin(t * 3 + m.f); liq.y += 0.15 * Math.sin(t * 2.6 + m.f * 2); liq.z += 0.18 * Math.cos(t * 2.8 + m.f);
          const ki = s.clase === "cambio" ? clamp((cambio - m.sale * 0.75) / 0.25) : cambio;
          const pos = liq.clone().lerp(gas, C.smooth(ki));
          dir.set(Math.sin(t * 0.7 * (1 + temp) + m.f), Math.cos(t * 0.6 + m.f * 2), Math.sin(t * 0.5 + m.f * 3)).normalize(); q.setFromUnitVectors(UPY, dir);
          dm.position.copy(pos); dm.quaternion.copy(q); dm.scale.setScalar(1); dm.updateMatrix(); cI.setMatrixAt(i, dm.matrix);
          for (let k = 0; k < 2; k++) { dm.position.copy(pos).add(v3((k ? 1 : -1) * Math.sin(HA) * HL, Math.cos(HA) * HL, 0).applyQuaternion(q)); dm.updateMatrix(); sI.setMatrixAt(i * 2 + k, dm.matrix); }
        }
        cI.instanceMatrix.needsUpdate = sI.instanceMatrix.needsUpdate = true;
      },
    };
  }
  function hacerMovil() {
    const S = nuevoSet("_final", { radio: 10 }); S.foco = v3(0, 0, 0); S.R = 10;
    rig(S, "estudio");
    S.grupo.add(X.motas({ n: 300, caja: [90, 90, 60], centro: v3(0, 0, -35), tam: 0.3, opacidad: 0.45 }).grupo);
    const MF = X.movil(); S.grupo.add(MF.grupo); MF.grupo.rotation.set(0.05, -0.2, 0.04);
    movilF = {
      S,
      pintar(t, s) {
        const P = MF.pantalla, t0 = s._tb0;
        const sube = ramp(t, t0 + 0.15, t0 + 0.55);
        const tE = s.elegir !== undefined ? C.cuando(s.elegir) : t0 + 1.0, tS = s.enviar !== undefined ? C.cuando(s.enviar) : t0 + 2.2;
        const elegido = t >= tE ? 0 : -1, enviado = t >= tS;
        const tap = (ta) => C.ventana(t, ta - 0.05, ta + 0.35, 0.08);
        const an = elegido >= 0 && !enviado ? [{ x: 0.15, y: 0.44, r: 0.09, a: tap(tE) }] : enviado ? [{ x: 0.5, y: 0.672, r: 0.1, a: tap(tS) }] : [];
        P.dibujar((g, w, h) => { UI.videoApp(g, w, h, { seguir: true }); if (sube > 0.001) UI.compartir(g, w, h, { sube, elegido, enviado }); UI.anillos(g, an.map((a) => ({ x: a.x * w, y: a.y * h, r: a.r * w, a: a.a }))); }, `${sube.toFixed(3)}|${elegido}|${enviado}|${an.map((a) => a.a.toFixed(2)).join()}`);
      },
    };
  }

  // ===================================== the shot list =====================================
  const palabras = C.words.map((w) => w.s);
  const ORIG = (ESC.planos || []).map((s, i) => ({ ...s, _uid0: s.id || `${s.tipo}-${i + 1}`, _tb0: C.cuando(s.desde) + (s.mas || 0) }));
  for (const s of ORIG) if (!TIPOS[s.tipo]) throw new Error(`El plano ${s._uid0} tiene un tipo que no existe: "${s.tipo}"`);
  ORIG.sort((a, b) => a._tb0 - b._tb0);
  ORIG.forEach((s, i) => (s._tb1 = i < ORIG.length - 1 ? ORIG[i + 1]._tb0 : C.D));
  // pieces each type needs, and its set
  for (const s of ORIG) {
    if (s.tipo === "regla") s._set = hacerRegla(s, s._uid0).nombre;
    else if (s.tipo === "mapaCalor") s._set = hacerMapa(s, s._uid0).nombre;
    else if (s.tipo === "particulas") { if (!campo) hacerCampo(); s._set = "_particulas"; }
    else if (s.tipo === "compartir") { if (!movilF) hacerMovil(); s._set = "_final"; }
    else if (s.tipo === "flujo" && !s.set && !s.pieza && s.flujos && s.flujos.length) s._set = FLUJOS[s.flujos[0]].S.nombre;
    else s._set = s.set || objetivo(s).S.nombre;
    for (const n of s.flujos || []) if (!FLUJOS[n]) throw new Error(`El plano ${s._uid0} usa el flujo "${n}", que no existe`);
  }
  // automatic rule: a framing longer than ~4 s becomes a slow camera move through 2 or more framings
  const LARGO = opciones.largo ?? 3.2;
  const L = [];
  for (const s of ORIG) {
    const dur = s._tb1 - s._tb0;
    const n = s.variar === false || dur <= LARGO + 0.8 ? 1 : Math.ceil(dur / LARGO);
    const cortes = [s._tb0];
    for (let i = 1; i < n; i++) {
      const ideal = s._tb0 + (i * dur) / n, prev = cortes[cortes.length - 1], sig = i < n - 1 ? s._tb0 + ((i + 1) * dur) / n : s._tb1;
      let best = ideal, bd = 0.36;
      // snap to the start of a word, as long as no piece goes under 1.4 s or over 4 s
      for (const w of palabras) { const d = Math.abs(w - ideal); if (d < bd && w - prev > 1.4 && w - prev <= 4 && sig - w > 1.4 && sig - w <= 4) { bd = d; best = w; } }
      cortes.push(best);
    }
    cortes.forEach((t0, i) => {
      const extra = i > 0 && s.variantes ? s.variantes[(i - 1) % s.variantes.length] : {};
      L.push({ ...s, ...extra, variante: i > 0 && s.variantes ? 0 : i, _uid: n > 1 ? `${s._uid0}·${i + 1}` : s._uid0, _t0: t0, _t1: i < n - 1 ? cortes[i + 1] : s._tb1 });
    });
  }
  const lista = L.map((s) => { const c = TIPOS[s.tipo].camara(s); return { id: s._uid, desde: s._t0, set: s._set, de: c.de, a: c.a, apertura: c.apertura, foco: c.foco, curva: c.curva, _p: s }; });
  const PLN = X.planos(lista, SETS);

  // ===================================== drawing =====================================
  const hooks = [];
  const leyendaFilas = [...document.querySelectorAll(".leyenda .fila")];
  const bokehP = C.composer.passes.find((x) => x.uniforms && x.uniforms.maxblur), maxBase = bokehP ? bokehP.uniforms.maxblur.value : 0;
  // everything but the camera, for shot e (PLN.pintar places the camera and calls it twice during a cross-fade)
  function dibujar(t, e) {
    const s = e.plano._p, S = SETS[s._set];
    for (const o of S.objetos) o.reiniciar(t);
    for (const f of S.extras) f();
    for (const F of Object.values(FLUJOS)) if (F.S === S) F.cin.malla.visible = false;
    lecEl.style.opacity = 0;
    // object controls of this shot (numbers, texts or ramps that count from the original shot's start)
    for (const [k, v] of Object.entries(s.estado || {})) {
      const [a, b] = k.split("."), val = valorEn(v, t, s._tb0);
      if (b !== undefined) { if (INST[a] && INST[a].set === S.nombre) INST[a].poner(b, val, t); }
      else for (const o of S.objetos) o.poner(a, val, t);
    }
    if (s.tipo === "corte" || s.cortar) cortarSet(s);
    for (const r of [].concat(s.resaltar || [])) { const R = resolver(r, S.nombre); if (R.inst.set === S.nombre) R.inst.resaltar(R.parte, ramp(t, s._tb0, s._tb0 + 0.4) * (0.8 + 0.2 * Math.sin(t * 6)) * (s.fuerzaResalte ?? 1), s.colorResalte); }
    for (const n of s.flujos || []) { const F = FLUJOS[n]; pintarFlujo(F, s.crece || F.f.crece ? ramp(t, s._tb0 + 0.05, s._tb0 + (F.f.dur ?? 0.9)) : 1, t); }
    if (TIPOS[s.tipo].aplicar) TIPOS[s.tipo].aplicar(t, s, e);
    if (s.lectura && s.tipo !== "cifra") pintarLectura(s.lectura, t, s._tb0, ramp(t, s._tb0, s._tb0 + 0.25));
    for (const o of S.objetos) o.actualizar(t);
    for (const h of hooks) h(t, e, s);
    for (const p of panelesValor) C.panel(p.id, typeof p.valor === "object" ? formato(valorEn({ dur: 1, ...p.valor, en: p.valor.en ?? p.desde }, t, 0), p.valor) : p.valor);
    if (bokehP) bokehP.uniforms.maxblur.value = s.maxDesenfoque ?? (s.tipo === "cifra" ? 0.035 : maxBase);
    C.renderer.toneMappingExposure = s.exposicion ?? 1.05;
    C.pintar(t);
    // legend rows: only the visible ones, one under the other
    let y = 0; for (const f of leyendaFilas) { f.style.top = y + "px"; if (parseFloat(f.style.opacity || "0") > 0.01) y += 36; }
  }
  const renderAt = (t) => PLN.pintar(t, dibujar);

  // cut list for review: __plantillas.tabla() in the browser console
  function cortes() { return PLN.lista.map((p) => ({ t: +p.t0.toFixed(2), fin: +p.t1.toFixed(2), dur: +(p.t1 - p.t0).toFixed(2), id: p.id, tipo: p._p.tipo, set: p.set, entrada: p._entrada })); }
  function tabla() {
    const c = cortes(), largo = Math.max(...c.map((x) => x.dur));
    return c.map((x) => `${x.t.toFixed(2).padStart(6)}  ${x.dur.toFixed(2)}s${x.dur > 4.5 ? " LARGO" : x.dur < 1.2 ? " CORTO" : ""}  ${x.entrada.padEnd(9)} ${x.tipo.padEnd(10)} ${x.id}`).join("\n") + `\n${c.length} planos, el más largo ${largo.toFixed(2)} s`;
  }

  function arrancar() {
    // warm-up: draw every set once with all its parts visible, so no shader compiles in the middle of the video
    const bok = C.composer.passes.find((x) => x.uniforms && x.uniforms.aperture);
    for (const F of Object.values(FLUJOS)) pintarFlujo(F, 1, 0);
    for (const k in SETS) {
      for (const j in SETS) SETS[j].grupo.visible = j === k;
      const ocultos = [];
      SETS[k].grupo.traverse((o) => { if (!o.visible) { ocultos.push(o); o.visible = true; } });
      C.camera.position.copy(SETS[k].centro).add(SETS[k].foco).add(v3(0, SETS[k].R * 0.3, SETS[k].R * 3)); C.camera.lookAt(SETS[k].centro.clone().add(SETS[k].foco)); C.camera.updateMatrixWorld();
      C.renderer.compile(C.scene, C.camera);
      if (bok) { bok.enabled = true; bok.uniforms.aperture.value = 0.0002; }
      C.composer.render();
      for (const o of ocultos) o.visible = false;
    }
    window.__plantillas = API;
    C.arrancar(renderAt);
  }

  const API = {
    M, B, sets: SETS, flujos: FLUJOS, tipos: TIPOS, planos: PLN, lista: L, formato, resolver,
    obj: (id) => INST[id], alPintar: (fn) => hooks.push(fn), renderAt, cortes, tabla, arrancar,
  };
  return API;
}
