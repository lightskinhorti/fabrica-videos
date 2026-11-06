// Diagramas de luz y señales (hechos con 09-mando, 7 nov). Unidades libres.
//
// senalIR(): el código de un botón del mando dibujado como un osciloscopio flotante, sobre una placa de cristal
//   oscuro con rejilla: 1 unidad = 1 ms. Destello inicial de 9, pausa de 4,5, 32 bits (cada uno, un destello de
//   0,5625 y una pausa corta de 0,5625 para el 0 o larga de 1,6875 para el 1) y un destello final (como el
//   protocolo NEC; el código en sí es ilustrativo, el mismo CODIGO de mando.js). Debajo, el 0 o el 1 de cada bit
//   y dos llaves: los 16 primeros (el aparato) y los 16 últimos (el botón). Arriba, una lupa que amplía un
//   destello y enseña que por dentro es un parpadeo rapidísimo. Y una banda dorada fija: la luz del sol.
//   Mandos: crece (0..1, se dibuja de izquierda a derecha), bits (0..1, las cifras), grupos (0..1, las llaves),
//           par (0..1, resalta un 0 y un 1 con sus pausas), lupa (0..1), sol (0..1), barrido (0/1, una luz que
//           recorre la señal).
//   Partes: inicio, aparato, boton, cero, uno, destello, lupa, sol, centro, final.
//
// espectro(): la banda de la luz de 380 a 1.000 nm (1 unidad = 10 nm, centrada en 690): de 380 a 750 nm los
//   colores que ve el ojo; más allá, oscuro con rayado (el infrarrojo). Marcas cada 100 nm y un marcador que se
//   mueve a cualquier longitud de onda.
//   Mandos: marca (nm del marcador), verMarca (0..1), ojo (0..1, la llave de lo que ves), zonaIR (0..1, el tramo
//           infrarrojo se ilumina en rojo rosado).
//   Partes: visible, ir, rojo, marca, ojo, centro.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CODIGO } from "./mando.js";

const IRc = 0xff4d6d;

export function senalIR(THREE, C, X, M) {
  const { v3, clamp, hash } = C;
  const g = new THREE.Group();
  const tramos = CODIGO.tramos.slice(0, -1); // without the long rest at the end
  const TOT = tramos.reduce((a, x) => a + x[1], 0), X0 = -TOT / 2, ALTO = 3.6;
  // glass plate with an oscilloscope grid
  const rej = X.lienzo(2048, 512, (gg, w, h) => {
    gg.fillStyle = "#0b0f16"; gg.fillRect(0, 0, w, h);
    for (let i = 0; i <= 80; i++) { const x = (i / 80) * w; gg.strokeStyle = i % 10 === 0 ? "rgba(140,170,220,0.22)" : "rgba(140,170,220,0.08)"; gg.lineWidth = i % 10 === 0 ? 3 : 1.5; gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, h); gg.stroke(); }
    for (let j = 0; j <= 20; j++) { const y = (j / 20) * h; gg.strokeStyle = j % 5 === 0 ? "rgba(140,170,220,0.22)" : "rgba(140,170,220,0.08)"; gg.lineWidth = j % 5 === 0 ? 3 : 1.5; gg.beginPath(); gg.moveTo(0, y); gg.lineTo(w, y); gg.stroke(); }
  });
  const PL = { w: TOT + 8, h: 20, y: 1.5 };
  const placa = new THREE.Mesh(new RoundedBoxGeometry(PL.w, PL.h, 0.5, 3, 0.2), [0, 1, 2, 3, 4, 5].map((i) => i === 4 ? new THREE.MeshPhysicalMaterial({ map: rej.tex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.92 }) : new THREE.MeshPhysicalMaterial({ color: 0x1a2230, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.6 })));
  placa.position.set(0, PL.y, -0.7); g.add(placa);
  // bursts: glowing slabs; rests: a thin baseline
  const brillo = new THREE.MeshStandardMaterial({ color: 0x2a050c, emissive: IRc, emissiveIntensity: 0.95, roughness: 0.4 });
  const base = new THREE.MeshBasicMaterial({ color: 0x9a3a4a, toneMapped: false });
  const destellos = [], restos = [];
  let x = X0;
  const bitX = [];
  let bit = -1;
  tramos.forEach(([on, d], i) => {
    if (on) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, ALTO, 0.5), brillo); m.position.set(x + d / 2, ALTO / 2, 0); m.userData = { x0: x, d }; g.add(m); destellos.push(m);
      if (i >= 2 && i < tramos.length - 1) { bit++; bitX[bit] = { x0: x }; }
    } else {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.12), base); m.position.set(x + d / 2, 0.05, 0); m.userData = { x0: x, d }; g.add(m); restos.push(m);
      if (bit >= 0 && bitX[bit] && bitX[bit].x1 === undefined) bitX[bit].x1 = x + d;
    }
    x += d;
  });
  // digits under each bit
  const pts = bitX.map((b) => v3((b.x0 + b.x1) / 2, -1.7, 0.3));
  const F = X.cifras(pts, { tam: 1.25, color: "#c9ced6", fuerte: "#ffffff", ancho: 1.6 });
  g.add(F.grupo);
  CODIGO.bits.forEach((b, i) => F.poner(i, b, false));
  // two braces: device (bits 0-15) and button (16-31)
  const llaveMat = new THREE.MeshBasicMaterial({ color: 0xe8ecf2, transparent: true, opacity: 0, toneMapped: false });
  const llave = (a, b) => {
    const gr = new THREE.Group(), xa = bitX[a].x0 + 0.1, xb = bitX[b].x1 - 0.1, y = -3.3;
    const h = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, 0.14), llaveMat); h.position.set((xa + xb) / 2, y, 0.3); gr.add(h);
    for (const xx of [xa, xb]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.7), llaveMat); v.position.set(xx, y + 0.35, 0.3); gr.add(v); }
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.6), llaveMat); c.position.set((xa + xb) / 2, y - 0.3, 0.3); gr.add(c);
    g.add(gr); return { gr, centro: v3((xa + xb) / 2, y - 0.7, 0.3) };
  };
  const L1 = llave(0, 15), L2 = llave(16, 31);
  // highlight of one 0 and one 1 (their rests)
  const iCero = CODIGO.bits.findIndex((b, i) => i > 16 && b === 0), iUno = CODIGO.bits.findIndex((b, i) => i > 22 && b === 1);
  const marcaMat = new THREE.MeshBasicMaterial({ color: 0x9fc4ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const hueco = (i) => { const b = bitX[i], xa = b.x0 + 0.5625, xb = b.x1; const m = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, ALTO + 0.6), marcaMat); m.position.set((xa + xb) / 2, ALTO / 2, 0.35); g.add(m); return v3((xa + xb) / 2, ALTO + 0.6, 0.35); };
  const pCero = hueco(iCero), pUno = hueco(iUno);
  // magnifier: one burst blown up into its fast flicker (38 kHz: about 21 flashes in 0.5625 ms)
  const sel = destellos[2 + 17];
  const lupa = new THREE.Group(); lupa.position.set(sel.position.x + 6, 17.5, 0.6); g.add(lupa);
  const LW = 26, LH = 7.5;
  const lupaPlaca = new THREE.Mesh(new RoundedBoxGeometry(LW + 2, LH + 2.4, 0.4, 3, 0.3), new THREE.MeshPhysicalMaterial({ color: 0x101622, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.85 })); lupaPlaca.position.z = -0.3; lupa.add(lupaPlaca);
  const lupaBorde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LW + 2, LH + 2.4, 0.4)), new THREE.LineBasicMaterial({ color: 0xe8ecf2, transparent: true, opacity: 0.6, toneMapped: false })); lupaBorde.position.z = -0.3; lupa.add(lupaBorde);
  const NP = 21, per = LW / NP;
  for (let k = 0; k < NP; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(per * 0.36, LH * 0.7, 0.3), brillo); m.position.set(-LW / 2 + (k + 0.3) * per, -LH * 0.15, 0); lupa.add(m); }
  const lupaBase = new THREE.Mesh(new THREE.BoxGeometry(LW, 0.08, 0.1), base); lupaBase.position.set(0, -LH * 0.5, 0); lupa.add(lupaBase);
  const cal = new THREE.LineBasicMaterial({ color: 0xe8ecf2, transparent: true, opacity: 0.55, toneMapped: false });
  const calGeo = new THREE.BufferGeometry().setFromPoints([v3(sel.userData.x0, ALTO, 0.3), v3(lupa.position.x - (LW + 2) / 2, lupa.position.y - (LH + 2.4) / 2, 0.3), v3(sel.userData.x0 + sel.userData.d, ALTO, 0.3), v3(lupa.position.x + (LW + 2) / 2, lupa.position.y - (LH + 2.4) / 2, 0.3)]);
  const callout = new THREE.LineSegments(calGeo, cal); g.add(callout);
  const anillo = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, toneMapped: false })); anillo.position.set(sel.position.x, ALTO + 0.2, 0.4); g.add(anillo);
  // steady sunlight: a golden band that does not blink
  const solMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(TOT + 4, 3.2), solMat); sol.position.set(0, 1.6, -0.2); g.add(sol);
  const solLinea = new THREE.Mesh(new THREE.BoxGeometry(TOT + 4, 0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0xffd38a, transparent: true, opacity: 0, toneMapped: false })); solLinea.position.set(0, 3.2, -0.15); g.add(solLinea);
  // sweeping light
  const cursor = C.brillo("255,200,210"); cursor.scale.set(3, 9, 1); g.add(cursor);
  let kC = 1, kB = 1, kG = 0, kP = 0, kL = 0, kS = 0, barr = 0;
  return {
    grupo: g,
    partes: {
      inicio: { obj: g, local: [X0 + 4.5, ALTO, 0], radio: 6 },
      aparato: { obj: g, local: [L1.centro.x, L1.centro.y, 0.3], radio: 18 },
      boton: { obj: g, local: [L2.centro.x, L2.centro.y, 0.3], radio: 18 },
      cero: { obj: g, local: [pCero.x, 1.6, 0.35], radio: 3 },
      uno: { obj: g, local: [pUno.x, 1.6, 0.35], radio: 3 },
      ceroArriba: { obj: g, local: [pCero.x, pCero.y, 0.35], radio: 1 },
      unoArriba: { obj: g, local: [pUno.x, pUno.y, 0.35], radio: 1 },
      destello: { obj: g, local: [sel.position.x, ALTO / 2, 0.3], radio: 2.5 },
      lupa: { obj: lupa, local: [0, 0, 0], radio: 15 },
      sol: { obj: g, local: [X0 + 8, 3.2, 0], radio: 8 },
      centro: { obj: g, local: [0, 2, 0], radio: TOT / 2 + 2 },
      final: { obj: g, local: [TOT / 2 - 8, 2, 0], radio: 10 },
    },
    controles: {
      crece: (k) => { kC = k; }, bits: (k) => { kB = k; }, grupos: (k) => { kG = k; }, par: (k) => { kP = k; },
      lupa: (k) => { kL = k; }, sol: (k) => { kS = k; }, barrido: (k) => { barr = k; },
    },
    defecto: { crece: 1, bits: 1, grupos: 0, par: 0, lupa: 0, sol: 0, barrido: 0 },
    actualizar(t) {
      const lim = X0 + kC * (TOT + 0.01);
      for (const m of destellos) { const { x0, d } = m.userData, w = clamp((lim - x0) / d) * d; m.visible = w > 0.001; m.scale.x = Math.max(0.001, w); m.position.x = x0 + w / 2; }
      for (const m of restos) { const { x0, d } = m.userData, w = clamp((lim - x0) / d) * d; m.visible = w > 0.001; m.scale.x = Math.max(0.001, w); m.position.x = x0 + w / 2; }
      F.items.forEach((it, i) => { const vis = clamp((lim - bitX[i].x1) / 1.5) * kB; it.mesh.material.opacity = vis * (kP > 0.01 && i !== iCero && i !== iUno ? 1 - 0.6 * kP : 1); it.mesh.visible = vis > 0.01; });
      F.poner(iCero, 0, kP > 0.5); F.poner(iUno, 1, kP > 0.5); F.dibujar();
      llaveMat.opacity = kG; L1.gr.visible = L2.gr.visible = kG > 0.01;
      marcaMat.opacity = 0.16 * kP;
      lupa.visible = callout.visible = kL > 0.01; lupa.scale.setScalar(0.2 + 0.8 * kL); cal.opacity = 0.55 * kL; anillo.visible = kL > 0.01; anillo.material.opacity = 0.8 * kL;
      lupaPlaca.material.opacity = 0.85 * kL;
      solMat.opacity = 0.22 * kS; solLinea.material.opacity = kS; sol.visible = solLinea.visible = kS > 0.01;
      brillo.emissiveIntensity = 0.95 + 0.1 * Math.sin(t * 9);
      cursor.visible = barr > 0.01; if (barr) { const u = (t * 0.45) % 1; cursor.position.set(X0 + u * TOT, 2.5, 0.6); cursor.material.opacity = 0.5 * barr; }
      void hash;
    },
  };
}

// ======================================================================================================
export function espectro(THREE, C, X, M) {
  const { v3, clamp, lerp } = C;
  const PI = Math.PI;
  const g = new THREE.Group();
  const NM0 = 380, NM1 = 1000, xDe = (nm) => (nm - 690) / 10, AN = (NM1 - NM0) / 10, AL = 7;
  // approximate colour of a wavelength (visible range), as r,g,b 0..1
  function color(nm) {
    let r = 0, gg = 0, b = 0;
    if (nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { gg = (nm - 440) / 50; b = 1; } else if (nm < 510) { gg = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; gg = 1; } else if (nm < 645) { r = 1; gg = -(nm - 645) / 65; } else { r = 1; }
    let f = 1; if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40; else if (nm > 700) f = 0.3 + 0.7 * (750 - nm) / 50;
    return [r * f, gg * f, b * f].map((v) => Math.max(0, v) ** 0.8);
  }
  const banda = X.lienzo(2048, 128, (gg, w, h) => {
    for (let px = 0; px < w; px++) {
      const nm = NM0 + (px / w) * (NM1 - NM0);
      if (nm <= 750) { const c = color(nm); gg.fillStyle = `rgb(${c.map((v) => Math.round(v * 235)).join(",")})`; }
      else { const k = clamp((nm - 750) / 120); gg.fillStyle = `rgb(${Math.round(lerp(70, 22, k))},${Math.round(lerp(6, 8, k))},${Math.round(lerp(10, 14, k))})`; }
      gg.fillRect(px, 0, 1, h);
    }
    const x750 = ((750 - NM0) / (NM1 - NM0)) * w;
    gg.strokeStyle = "rgba(255,120,140,0.16)"; gg.lineWidth = 3;
    for (let x = x750 - h; x < w; x += 14) { gg.beginPath(); gg.moveTo(x, h); gg.lineTo(x + h, 0); gg.stroke(); }
  });
  const bandaM = new THREE.Mesh(new THREE.PlaneGeometry(AN, AL), new THREE.MeshBasicMaterial({ map: banda.tex, toneMapped: false, color: 0xd8d8d8 }));
  bandaM.position.set(0, AL / 2, 0.26); g.add(bandaM);
  const vidrio = new THREE.Mesh(new RoundedBoxGeometry(AN + 1.2, AL + 1.2, 0.5, 3, 0.25), new THREE.MeshPhysicalMaterial({ color: 0x1a2232, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false })); vidrio.position.set(0, AL / 2, 0); g.add(vidrio);
  // the infrared zone, lit up on demand
  const zonaMat = new THREE.MeshBasicMaterial({ color: IRc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const zona = new THREE.Mesh(new THREE.PlaneGeometry(xDe(NM1) - xDe(750), AL), zonaMat); zona.position.set((xDe(NM1) + xDe(750)) / 2, AL / 2, 0.3); g.add(zona);
  // scale: ticks every 50 nm, numbers every 100
  const escala = X.lienzo(2048, 160, (gg, w, h) => {
    gg.fillStyle = "rgba(230,234,240,0.8)"; gg.strokeStyle = "rgba(230,234,240,0.8)"; gg.lineWidth = 3;
    gg.font = '400 46px "JetBrains Mono", monospace'; gg.textAlign = "center"; gg.textBaseline = "top";
    for (let nm = 400; nm <= 1000; nm += 50) { const x = ((nm - NM0) / (NM1 - NM0)) * w; gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, nm % 100 === 0 ? 34 : 18); gg.stroke(); if (nm % 100 === 0) gg.fillText(String(nm), Math.min(w - 70, x), 50); }
    gg.textAlign = "right"; gg.font = '700 40px "JetBrains Mono", monospace'; gg.fillText("nm", w - 4, 112);
  });
  const esc = new THREE.Mesh(new THREE.PlaneGeometry(AN, AN * (160 / 2048)), new THREE.MeshBasicMaterial({ map: escala.tex, transparent: true, depthWrite: false, toneMapped: false })); esc.position.set(0, -0.4 - (AN * (160 / 2048)) / 2, 0.3); g.add(esc);
  // the "what you see" brace over 380-750
  const llaveMat = new THREE.MeshBasicMaterial({ color: 0xe8ecf2, transparent: true, opacity: 0, toneMapped: false });
  const llave = new THREE.Group(); g.add(llave);
  { const xa = xDe(380), xb = xDe(750), y = AL + 1.3; const h = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, 0.14), llaveMat); h.position.set((xa + xb) / 2, y, 0.3); llave.add(h); for (const xx of [xa, xb]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.7), llaveMat); v.position.set(xx, y - 0.35, 0.3); llave.add(v); } const c = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.6), llaveMat); c.position.set((xa + xb) / 2, y + 0.3, 0.3); llave.add(c); }
  // marker
  const marca = new THREE.Group(); g.add(marca);
  const mMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true });
  const linea = new THREE.Mesh(new THREE.BoxGeometry(0.16, AL + 2.6, 0.16), mMat); linea.position.set(0, AL / 2, 0.5); marca.add(linea);
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 3), mMat); tri.rotation.z = PI; tri.position.set(0, AL + 2.2, 0.5); marca.add(tri);
  const halo = C.brillo("255,255,255"); halo.scale.set(3, 9, 1); halo.position.set(0, AL / 2, 0.6); marca.add(halo);
  let nm = 700, kV = 0, kO = 0, kZ = 0;
  return {
    grupo: g,
    partes: {
      visible: { obj: g, local: [(xDe(380) + xDe(750)) / 2, AL / 2, 0.3], radio: 19 },
      ir: { obj: g, local: [(xDe(750) + xDe(1000)) / 2, AL / 2, 0.3], radio: 13 },
      rojo: { obj: g, local: [xDe(700), AL / 2, 0.3], radio: 6 },
      marca: { obj: tri, local: [0, 0.3, 0], radio: 3 },
      ojo: { obj: g, local: [(xDe(380) + xDe(750)) / 2, AL + 1.6, 0.3], radio: 19 },
      centro: { obj: g, local: [0, AL / 2, 0], radio: AN / 2 + 1 },
    },
    controles: { marca: (v) => { nm = v; }, verMarca: (k) => { kV = k; }, ojo: (k) => { kO = k; }, zonaIR: (k) => { kZ = k; } },
    defecto: { marca: 700, verMarca: 0, ojo: 0, zonaIR: 0 },
    actualizar(t) {
      marca.visible = kV > 0.01; marca.position.x = xDe(nm);
      const c = nm <= 750 ? color(nm) : [1, 0.3, 0.43];
      mMat.color.setRGB(0.6 + 0.4 * c[0], 0.6 + 0.4 * c[1], 0.6 + 0.4 * c[2]); mMat.opacity = kV; halo.material.opacity = 0.5 * kV;
      llaveMat.opacity = kO; llave.visible = kO > 0.01;
      zonaMat.opacity = kZ * (0.1 + 0.04 * Math.sin(t * 5)); zona.visible = kZ > 0.01;
      void v3;
    },
  };
}
