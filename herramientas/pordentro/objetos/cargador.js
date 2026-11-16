// El cargador de pared (hecho con 16-cargador-enchufado, 16 nov). Sin marcas ni letras en los chips. Ilustración
// simplificada: un cargador USB de los de "cubo" con dos clavijas redondas, enchufado en una placa de pared.
//
// cargadorPared(): cuerpo blanco de 4,2 × 4,6 × 3 cm, clavijas hacia -z (entran en la placa de pared), puerto USB arriba.
//   Con rayosX la carcasa se vuelve transparente y se ve la placa verde (cara hacia +z) con: el puente de diodos, el
//   condensador grande, el transformador (núcleo de ferrita con bobinado de cobre y otro dorado), el chip de control, el
//   optoacoplador, el condensador de filtro azul y sus dos resistencias de descarga.
//   Mandos (de 0 a 1):
//     modo     0 = sin móvil (el chip da ráfagas cortas y se calla); 1 = con móvil (el chip conecta sin parar)
//     latido   cuánto se nota la actividad: brillo en el transformador y el chip, y pulsos de luz que van del
//              transformador al puerto
//     traza    el panel flotante con la señal del chip (como un osciloscopio), encima del cargador
//     salida   luz azul en el puerto USB (hay un móvil pidiendo carga)
//   Partes: pines, enchufe, puerto, transformador, condensador, puente, chip, opto, resistencias, filtro, placa,
//           carcasa, traza, centro. Curvas (para flujos): entrada (clavijas -> puente -> condensador -> transformador),
//           salida (transformador -> puerto).
//
// medidorLimite(): un medidor de consumo de enchufe (caja blanca con pantalla y una toma delante) con un mini cargador
//   enchufado. La pantalla enseña un texto (por defecto "MÁX 0,10 W"): es el LÍMITE LEGAL, no una medición.
//   Mandos: texto (cadena), sub (cadena, la línea pequeña de arriba), luz (0..1, brillo de la pantalla).
//   Partes: pantalla, toma, mini, centro.

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PI = Math.PI;

export function cargadorPared(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const R = new THREE.Group();
  const exterior = [], interior = [];
  const smooth = (k) => k * k * (3 - 2 * k);

  const blanco = new THREE.MeshPhysicalMaterial({ color: 0xa9afb9, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.4 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(4.2, 4.6, 3.0, 5, 0.32), blanco); R.add(cuerpo); exterior.push(cuerpo);

  // ---------- wall plate and pins (the pins stay in the plate) ----------
  const placaPared = new THREE.Mesh(new RoundedBoxGeometry(6.6, 6.6, 0.5, 3, 0.4), new THREE.MeshPhysicalMaterial({ color: 0x2a313c, roughness: 0.6, clearcoat: 0.2 }));
  placaPared.position.set(0, 0, -1.78); R.add(placaPared);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.07, 8, 48), M.aceroOsc); aro.position.set(0, 0, -1.5); R.add(aro);
  const pines = new THREE.Group(); R.add(pines);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 14), M.acero); p.rotation.x = PI / 2; p.position.set(s * 0.95, -0.2, -2.05); pines.add(p);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 14), M.aceroOsc); base.rotation.x = PI / 2; base.position.set(s * 0.95, -0.2, -1.55); pines.add(base);
  }

  // ---------- USB port on top ----------
  const puerto = new THREE.Group(); R.add(puerto);
  const hierro = [[1.25, 0.9, 0.04, 0, 2.0, 0.2], [1.25, 0.9, 0.04, 0, 2.0, -0.2], [0.04, 0.9, 0.44, 0.62, 2.0, 0], [0.04, 0.9, 0.44, -0.62, 2.0, 0]];
  for (const [w, h, d, x, y, z] of hierro) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.acero); m.position.set(x, y, z); puerto.add(m); }
  const lengueta = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.12), M.grafito); lengueta.position.set(0, 2.0, -0.05); puerto.add(lengueta);
  const oro = new THREE.MeshPhysicalMaterial({ color: 0xdcaa4e, metalness: 1, roughness: 0.22 });
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.03), oro); c.position.set(-0.375 + i * 0.25, 2.02, 0.03); puerto.add(c); }

  // ---------- board ----------
  const W = 600, H = 660, X0 = -1.75, X1 = 1.75, Y0 = -1.9, Y1 = 1.9;
  const px = (x) => ((x - X0) / (X1 - X0)) * W, py = (y) => ((Y1 - y) / (Y1 - Y0)) * H;
  const tex = X.lienzo(W, H, (g) => {
    g.fillStyle = "#14523b"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + 0.03 * hash(i)})`; g.fillRect(hash(i * 1.7) * W, hash(i * 2.9) * H, 1 + hash(i) * 3, 1); }
    g.strokeStyle = "rgba(150,215,170,0.55)"; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round";
    const linea = (...p) => { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(px(x), py(y)) : g.moveTo(px(x), py(y)))); g.stroke(); };
    linea([-0.95, -1.5], [-0.95, -1.1], [-1.0, -0.8]); linea([0.95, -1.5], [0.95, -1.1], [0.2, -1.1], [-0.6, -0.8]);
    linea([-1.0, -0.5], [-0.95, 0.2]); linea([-0.6, -0.5], [-0.3, 0.0], [0.0, 0.1]);
    linea([0.6, 0.3], [1.1, 0.7], [1.1, 1.1]); linea([0.2, 0.8], [0.2, 1.7], [0.0, 1.8]);
    linea([-0.3, 0.9], [0.4, 0.9]); linea([1.15, 0.2], [1.15, -0.2]);
    g.fillStyle = "rgba(220,190,120,0.8)"; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(px(-1.6 + hash(i * 3.3) * 3.2), py(-1.7 + hash(i * 5.1) * 3.4), 3.2, 0, 7); g.fill(); }
  }).tex;
  const placa = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.8, 0.1), new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: tex, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
  placa.position.set(0, 0, 0); R.add(placa); interior.push(placa);
  const Z = 0.05;
  const put = (m, x, y, z) => { m.position.set(x, y, Z + z); R.add(m); interior.push(m); return m; };

  const negro = new THREE.MeshPhysicalMaterial({ color: 0x131419, roughness: 0.42, clearcoat: 0.5 });
  // bridge of diodes: a small black chip
  const puente = put(new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.55, 0.26, 2, 0.04), negro), -0.8, -0.65, 0.13);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) put(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.04), M.acero), -1.05 + i * 0.17 + 0.08, -0.65 + s * 0.34, 0.03);
  // big electrolytic capacitor (axis towards the viewer)
  const cap = new THREE.Group();
  const lata = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 28), new THREE.MeshPhysicalMaterial({ color: 0x1b2a55, roughness: 0.4, clearcoat: 0.6 })); lata.rotation.x = PI / 2; lata.position.z = 0.6; cap.add(lata);
  const tapa = new THREE.Mesh(new THREE.CircleGeometry(0.46, 28), M.aluminio); tapa.position.z = 1.205; cap.add(tapa);
  const marca = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.02), new THREE.MeshBasicMaterial({ color: 0xb6c4ee })); marca.position.set(-0.36, 0, 0.9); cap.add(marca);
  cap.position.set(-0.95, 0.75, Z); R.add(cap); interior.push(cap);
  // transformer: ferrite core with two windings
  const trafo = new THREE.Group();
  const nucleo = new THREE.Mesh(new RoundedBoxGeometry(1.75, 1.55, 0.9, 2, 0.06), M.ferrita); nucleo.position.z = 0.45; trafo.add(nucleo);
  const bobP = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.1, 32), M.bobinado); bobP.position.set(0, 0, 0.7); bobP.scale.set(1.25, 1, 0.8); trafo.add(bobP);
  const bobS = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, 32), new THREE.MeshPhysicalMaterial({ color: 0xe5c26a, metalness: 0.9, roughness: 0.3, clearcoat: 0.5 })); bobS.position.set(0, 0, 0.7); bobS.scale.set(1.25, 1, 0.8); trafo.add(bobS);
  trafo.position.set(0.3, 0.05, Z); R.add(trafo); interior.push(trafo);
  // control chip with legs and the optocoupler
  const chip = put(new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.8, 0.2, 2, 0.04), negro), 1.1, 1.15, 0.1);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    put(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.03), M.acero), 1.1 + s * 0.46, 0.95 + i * 0.13, 0.03);
    put(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.03), M.acero), 0.93 + i * 0.12, 1.15 + s * 0.46, 0.03);
  }
  const opto = put(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.75, 0.2, 2, 0.04), negro), 1.2, 0.0, 0.1);
  // film capacitor (blue box) and two discharge resistors
  const filtro = put(new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.45, 0.7, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x3e86c9, roughness: 0.45, clearcoat: 0.5 })), 0.2, -1.15, 0.35);
  const resis = new THREE.Group();
  const resM = new THREE.MeshPhysicalMaterial({ color: 0xcdb98a, roughness: 0.55 });
  for (const [x, y] of [[-0.45, -1.62], [0.15, -1.62]]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 12), resM); r.rotation.z = PI / 2; r.position.set(x, y, 0.1); resis.add(r);
    for (const bx of [-0.12, 0.0, 0.12]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 12), new THREE.MeshBasicMaterial({ color: [0x7a3b1a, 0x1a1a1a, 0xb8860b][Math.abs(Math.round(bx * 8)) % 3] })); b.rotation.z = PI / 2; b.position.set(x + bx, y, 0.1); resis.add(b); }
  }
  resis.position.z = Z; R.add(resis); interior.push(resis);
  // output filter capacitor
  const capS = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 20), new THREE.MeshPhysicalMaterial({ color: 0x8a3a30, roughness: 0.45, clearcoat: 0.5 })); capS.rotation.x = PI / 2; put(capS, 0.2, 1.55, 0.3);

  // ---------- glows ----------
  const halo = (rgb, tam, x, y, z) => { const h = C.brillo(rgb); h.scale.setScalar(tam); h.position.set(x, y, Z + z); h.userData.noCortar = true; R.add(h); interior.push(h); return h; };
  const haloT = halo("255,170,70", 3.4, 0.3, 0.05, 1.0), haloC = halo("120,200,255", 1.8, 1.1, 1.15, 0.3);
  const salidaLuz = C.brillo("90,170,255"); salidaLuz.scale.setScalar(2.2); salidaLuz.position.set(0, 2.75, 0.1); salidaLuz.userData.noCortar = true; R.add(salidaLuz);

  // ---------- routes of the flows (local to R) ----------
  const curvas = {
    entrada: { obj: R, puntos: [v3(-0.95, -0.2, -1.55), v3(-0.95, -1.1, Z + 0.1), v3(-0.9, -0.85, Z + 0.1), v3(-0.95, 0.2, Z + 0.15), v3(-0.5, 0.0, Z + 0.1), v3(0.3, 0.05, Z + 0.5)] },
    salida: { obj: R, puntos: [v3(0.3, 0.05, Z + 0.5), v3(0.2, 0.8, Z + 0.15), v3(0.2, 1.7, Z + 0.15), v3(0.0, 1.9, Z + 0.15), v3(0.0, 2.6, 0.1)] },
  };
  const NPul = 6, pulsos = [];
  const bola = new THREE.SphereGeometry(0.07, 10, 8);
  for (let i = 0; i < NPul; i++) {
    const m = new THREE.Mesh(bola, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.25, 0.45), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    m.userData.noCortar = true; m.visible = false; R.add(m); interior.push(m); pulsos.push(m);
  }
  const curvaSalida = new THREE.CatmullRomCurve3(curvas.salida.puntos, false, "catmullrom", 0.1);

  // ---------- floating scope: the gate signal of the chip ----------
  const PW = 720, PH = 270;
  const pan = document.createElement("canvas"); pan.width = PW; pan.height = PH;
  const pg = pan.getContext("2d");
  const panTex = new THREE.CanvasTexture(pan); panTex.colorSpace = THREE.SRGBColorSpace; panTex.anisotropy = 8;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.7), new THREE.MeshBasicMaterial({ map: panTex, transparent: true, depthWrite: false, toneMapped: false }));
  panel.position.set(0, -4.9, 0.6); panel.userData.noCortar = true; panel.visible = false; R.add(panel);
  let ultimoPan = "";
  const CEL = 16; // px per pulse cell
  function pintarPanel(t, modo) {
    const pasoV = 300, hueco = Math.round((1 - modo) * 18), ciclo = (4 + hueco) * CEL; // 4 pulses then a gap
    const clave = `${modo.toFixed(2)}|${(t * 30) | 0}`;
    if (clave === ultimoPan) return; ultimoPan = clave;
    pg.clearRect(0, 0, PW, PH);
    pg.fillStyle = "rgba(8,12,20,0.92)"; pg.beginPath(); pg.roundRect(0, 0, PW, PH, 18); pg.fill();
    pg.strokeStyle = "rgba(111,220,255,0.55)"; pg.lineWidth = 3; pg.beginPath(); pg.roundRect(2, 2, PW - 4, PH - 4, 17); pg.stroke();
    pg.strokeStyle = "rgba(111,220,255,0.12)"; pg.lineWidth = 1;
    for (let x = 40; x < PW; x += 80) { pg.beginPath(); pg.moveTo(x, 60); pg.lineTo(x, PH - 20); pg.stroke(); }
    pg.font = '700 30px "JetBrains Mono", monospace'; pg.fillStyle = "#6fdcff"; pg.textAlign = "left"; pg.fillText("SEÑAL DEL CHIP", 26, 44);
    pg.textAlign = "right"; pg.fillStyle = modo > 0.5 ? "#ffb22e" : "#ffffff"; pg.fillText(modo > 0.5 ? "CON MÓVIL" : "SIN MÓVIL", PW - 26, 44);
    const yA = 92, yB = PH - 38;
    pg.strokeStyle = "#ffb22e"; pg.lineWidth = 5; pg.lineJoin = "miter"; pg.beginPath();
    const off = t * pasoV;
    let alto = false; pg.moveTo(20, yB);
    for (let x = 20; x <= PW - 20; x += 2) {
      const u = (((x + off) % ciclo) + ciclo) % ciclo, c = Math.floor(u / CEL), enRafaga = c < 8 && c % 2 === 0; // 4 pulses of 1 cell, spaced
      const hi = modo > 0.995 ? Math.floor((x + off) / (CEL / 2)) % 2 === 0 : enRafaga;
      pg.lineTo(x, hi ? yA : yB);
    }
    pg.stroke();
    panTex.needsUpdate = true;
  }

  // ---------- animation ----------
  const st = { modo: 0, latido: 1, traza: 0, salida: 0 };
  function actividad(t) {
    // 1 while the chip is switching: always with a phone; in short bursts without one
    if (st.modo > 0.995) return 1;
    const P = 1.3, ph = (t % P) / P, ancho = 0.12 + 0.88 * st.modo;
    const enc = ph < ancho ? 1 : 0;
    return enc * (0.75 + 0.25 * Math.sin(t * 60));
  }
  function actualizar(t) {
    const a = actividad(t) * st.latido;
    haloT.material.opacity = 0.75 * a; haloT.visible = a > 0.02;
    haloC.material.opacity = 0.6 * a; haloC.visible = a > 0.02;
    for (let i = 0; i < NPul; i++) {
      const m = pulsos[i], u = (t * 0.7 + i / NPul) % 1;
      m.visible = a > 0.05 && (st.modo > 0.5 || actividad(t) > 0.5);
      if (!m.visible) continue;
      m.position.copy(curvaSalida.getPoint(u)); m.material.opacity = st.latido * Math.sin(PI * u) ** 0.6;
    }
    salidaLuz.material.opacity = 0.8 * st.salida * (0.85 + 0.15 * Math.sin(t * 5)); salidaLuz.visible = st.salida > 0.01;
    panel.visible = st.traza > 0.01;
    if (panel.visible) { pintarPanel(t, st.modo); panel.material.opacity = clamp(st.traza); panel.scale.setScalar(0.94 + 0.06 * smooth(clamp(st.traza))); }
  }

  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    exterior, semi: [[puerto, 0.55]], interior,
    partes: {
      pines: pl([0, -0.2, -1.9], 1.6), enchufe: pl([0, 0, -1.78], 4.2), puerto: pl([0, 2.1, 0], 1.0), transformador: pl([0.3, 0.05, 0.45], 1.25),
      condensador: pl([-0.95, 0.75, 0.6], 0.85), puente: pl([-0.8, -0.65, 0.2], 0.6), chip: pl([1.1, 1.15, 0.2], 0.7), opto: pl([1.2, 0.0, 0.2], 0.55),
      resistencias: pl([-0.15, -1.62, 0.15], 0.7), filtro: pl([0.2, -1.15, 0.4], 0.8), placa: pl([0, 0, 0], 2.4), carcasa: pl([0, 0, 0], 3.0),
      traza: pl([0, -4.9, 0.6], 3.2), centro: pl([0, 0.4, 0], 3.2),
    },
    caja: [[-2.1, -2.3, -2.1], [2.1, 2.9, 1.5]],  // the floating scope (below) is not counted
    curvas,
    controles: Object.fromEntries(Object.keys(st).map((n) => [n, (v) => { st[n] = v; }])),
    defecto: { modo: 0, latido: 1, traza: 0, salida: 0 },
    actualizar,
  };
}

export function medidorLimite(THREE, C, X, M) {
  const { clamp } = C;
  const R = new THREE.Group();
  const cuerpoM = new THREE.MeshPhysicalMaterial({ color: 0xa9afb9, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.4 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(5.2, 8.2, 3.2, 5, 0.4), cuerpoM); R.add(cuerpo);
  // screen
  const PW = 560, PH = 400;
  const cv = document.createElement("canvas"); cv.width = PW; cv.height = PH; const g = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const pantallaM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.0), pantallaM); pantalla.position.set(0, 2.1, 1.62); R.add(pantalla);
  let txt = "MÁX 0,10 W", sub = "LÍMITE LEGAL", luz = 1, ultimo = "";
  function pintar() {
    const clave = `${txt}|${sub}|${luz.toFixed(2)}`; if (clave === ultimo) return; ultimo = clave;
    g.fillStyle = "#101a14"; g.fillRect(0, 0, PW, PH);
    g.globalAlpha = 0.35 + 0.65 * luz; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#8fffb0"; g.font = '700 46px "JetBrains Mono", monospace'; g.fillText(sub, PW / 2, 78);
    g.font = '700 84px "JetBrains Mono", monospace'; g.fillText(txt, PW / 2, 250);
    g.globalAlpha = 1; tex.needsUpdate = true;
  }
  pintar();
  // socket in front, with a mini charger plugged in
  const toma = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 36), new THREE.MeshPhysicalMaterial({ color: 0x8d949e, roughness: 0.55 })); toma.rotation.x = PI / 2; toma.position.set(0, -2.1, 1.65); R.add(toma);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 14), new THREE.MeshBasicMaterial({ color: 0x0a0a0c })); h.rotation.x = PI / 2; h.position.set(s * 0.65, -2.1, 1.76); R.add(h); }
  const mini = new THREE.Group(); R.add(mini);
  const mc = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.8, 1.9, 4, 0.25), cuerpoM); mc.position.set(0, -2.1, 2.8); mini.add(mc);
  const mp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.7), M.acero); mp.position.set(0, -0.55, 2.8); mini.add(mp);
  const pl = (l, r) => ({ obj: R, local: l, radio: r });
  return {
    grupo: R,
    exterior: [], interior: [],
    partes: { pantalla: pl([0, 2.1, 1.7], 2.4), toma: pl([0, -2.1, 1.7], 1.4), mini: pl([0, -2.1, 2.8], 1.8), centro: pl([0, 0, 1.5], 4.6) },
    caja: [[-2.6, -4.1, -1.6], [2.6, 4.1, 3.75]],
    controles: { texto: (v) => { txt = String(v); pintar(); }, sub: (v) => { sub = String(v); pintar(); }, luz: (v) => { luz = clamp(v); pintar(); } },
    defecto: { texto: "MÁX 0,10 W", sub: "LÍMITE LEGAL", luz: 1 },
    actualizar() {},
  };
}
