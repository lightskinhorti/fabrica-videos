// Microondas (sacado de 07-microondas), en cm: 52 × 31 × 40, con la puerta en z = +20 y el plato a la izquierda.
// Fuera: carcasa de acero, frente de grafito, puerta con bisagra (marco negro, chapa perforada y cristal oscuro),
// asa, panel de mando (pantalla ámbar con la cuenta atrás, pomo moleteado y dos teclas), rejillas y patas.
// Dentro (se ven con rayosX): guía de ondas, magnetrón pequeño, transformador, condensador, ventilador, placa,
// cables y motor del plato. La cavidad esmaltada se aclara con rayosX; el plato de cristal lleva un cuenco.
// Mandos: puerta (0..1, abre la puerta), luz (lámpara de dentro), gira (0/1, el plato da vueltas), vapor (0..1),
//         reloj (segundos que muestra la pantalla; por defecto cuenta atrás desde 1:30), ventilador (0/1).
// Partes: puerta, rejilla, panel, pomo, pantalla, cavidad, plato, cuenco, magnetron, guia, transformador,
//         ventilador, placa, condensador.
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { magnetron } from "./magnetron.js";
import { cuenco } from "./menaje.js";

export function microondas(THREE, C, X, M) {
  const { v3, hash } = C;
  const PI = Math.PI;
  const HO = new THREE.Group();
  const W = 52, H = 31, D = 40, ZF = 20;
  const CAV = { x0: -22.5, x1: 8.5, y0: 4.5, y1: 26.5, z0: -16, z1: 19.2 };
  const exterior = new THREE.Group(); HO.add(exterior);
  const losa = (w, h, d, mat, x, y, z, r = 0.42, padre = exterior) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); padre.add(m); return m; };
  losa(W, 0.9, D, M.acero, 0, H - 0.45, 0);
  losa(0.9, H, D, M.acero, -W / 2 + 0.45, H / 2, 0);
  losa(0.9, H, D, M.acero, W / 2 - 0.45, H / 2, 0);
  losa(W, H, 0.9, M.aceroOsc, 0, H / 2, -D / 2 + 0.45);
  losa(W, 0.9, D, M.grafito, 0, 0.45, 0);
  const frente = new THREE.Mesh(new THREE.ExtrudeGeometry(C.rrShape(W, H, 1.2, [[(CAV.x0 + CAV.x1) / 2, (CAV.y0 + CAV.y1) / 2 - H / 2, CAV.x1 - CAV.x0, CAV.y1 - CAV.y0, 0.8]]), { depth: 0.8, bevelEnabled: false, curveSegments: 8 }), M.grafito);
  frente.position.set(0, H / 2, ZF - 0.8); exterior.add(frente);
  const vents = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6, 0.32), new THREE.MeshBasicMaterial({ color: 0x050506 }), 48);
  { const dm = new THREE.Object3D(); let k = 0; for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) { dm.position.set(W / 2 + 0.02, 17 + r * 0.95, -15 + c * 3.4); dm.rotation.set(0, PI / 2, 0); dm.updateMatrix(); vents.setMatrixAt(k++, dm.matrix); } }
  exterior.add(vents);
  for (const [x, z] of [[-22, -16], [22, -16], [-22, 16], [22, 16]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.8, 24), M.grafito); p.position.set(x, -0.4, z); exterior.add(p); }
  // door on its hinge
  const puertaG = new THREE.Group(); puertaG.position.set(-W / 2, 0, ZF); exterior.add(puertaG);
  const PW = 37.6, PH = 30.4, VEN = { w: 27.5, h: 19.5, cx: -2.2 };
  const marco = new THREE.Mesh(new THREE.ExtrudeGeometry(C.rrShape(PW, PH, 1.0, [[VEN.cx, 0.3, VEN.w, VEN.h, 0.9]]), { depth: 1.5, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 2, curveSegments: 8 }), M.negro);
  marco.position.set(PW / 2 + 0.1, H / 2, 0.05); puertaG.add(marco);
  const rejTex = X.tex.perforada({ cols: 12, filas: 12, radio: 0.34 }); X.rep(rejTex, (VEN.w + 0.6) / 0.26 / 12, (VEN.h + 0.6) / 0.26 / 12);
  const rejH = new THREE.Mesh(new THREE.PlaneGeometry(VEN.w + 0.6, VEN.h + 0.6), new THREE.MeshStandardMaterial({ color: 0x101215, metalness: 0.6, roughness: 0.45, alphaMap: rejTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  rejH.position.set(PW / 2 + 0.1 + VEN.cx, H / 2 + 0.3, 0.6); rejH.userData.sinBordes = true; puertaG.add(rejH);
  const vidrioH = new THREE.Mesh(new THREE.PlaneGeometry(VEN.w + 1.2, VEN.h + 1.2), new THREE.MeshPhysicalMaterial({ color: 0x14171c, roughness: 0.04, transparent: true, opacity: 0.26, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.8, depthWrite: false }));
  vidrioH.position.set(PW / 2 + 0.1 + VEN.cx, H / 2 + 0.3, 1.63); vidrioH.userData.sinBordes = true; puertaG.add(vidrioH);
  const asa = new THREE.Mesh(new RoundedBoxGeometry(1.3, 22, 1.6, 3, 0.55), M.acero); asa.position.set(PW - 2.0, H / 2, 3.2); puertaG.add(asa);
  for (const y of [H / 2 - 9.5, H / 2 + 9.5]) { const s = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.4, 1.8, 2, 0.3), M.acero); s.position.set(PW - 2.0, y, 2.0); puertaG.add(s); }
  // control panel
  const PX = 18.9;
  losa(13.9, H - 0.6, 1.4, M.negro, PX, H / 2, ZF + 0.7, 0.5);
  const relojL = X.lienzo(384, 160, () => {});
  const reloj = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 3.9), new THREE.MeshBasicMaterial({ map: relojL.tex, toneMapped: false, transparent: true })); reloj.position.set(PX, 25.0, ZF + 1.43); exterior.add(reloj);
  let relojClave = null;
  function pintaReloj(txt) {
    if (txt === relojClave) return; relojClave = txt;
    const g = relojL.g; g.clearRect(0, 0, 384, 160); g.fillStyle = "#040506"; g.beginPath(); g.roundRect(0, 0, 384, 160, 18); g.fill();
    g.font = '700 100px "JetBrains Mono", monospace'; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(255,160,60,0.08)"; g.fillText("8:88", 200, 86);
    g.shadowColor = "rgba(255,150,50,0.9)"; g.shadowBlur = 14; g.fillStyle = "#ffb54a"; g.fillText(txt, 200, 86); g.shadowBlur = 0;
    g.strokeStyle = "#ffb54a"; g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 30; k++) g.lineTo(22 + k * 1.2, 40 + Math.sin(k * 0.6) * 9); g.stroke();
    relojL.tex.needsUpdate = true;
  }
  const pomo = new THREE.Group(); pomo.position.set(PX, 15.6, ZF + 1.4); exterior.add(pomo);
  { const b = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.3, 64), M.aceroOsc); b.rotation.x = PI / 2; pomo.add(b);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.9, 2.0, 64), M.acero); c.rotation.x = PI / 2; c.position.z = 1.15; pomo.add(c);
    const est = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 0.2, 1.7), M.aceroOsc, 72); const dm = new THREE.Object3D();
    for (let i = 0; i < 72; i++) { const a = (i / 72) * 2 * PI; dm.position.set(Math.cos(a) * 2.85, Math.sin(a) * 2.85, 1.15); dm.rotation.set(0, 0, a); dm.updateMatrix(); est.setMatrixAt(i, dm.matrix); }
    pomo.add(est);
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.6), M.basica(0xffb54a, 1)); marca.position.set(0, 1.6, 2.17); pomo.add(marca); }
  const teclaL = X.lienzo(256, 128, (g, w, h) => { g.fillStyle = "#16181c"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9ecef"; g.beginPath(); g.moveTo(98, 34); g.lineTo(98, 94); g.lineTo(148, 64); g.closePath(); g.fill(); });
  const teclaL2 = X.lienzo(256, 128, (g, w, h) => { g.fillStyle = "#16181c"; g.fillRect(0, 0, w, h); g.fillStyle = "#e9ecef"; g.fillRect(104, 40, 48, 48); });
  [[teclaL, 7.6], [teclaL2, 4.6]].forEach(([lz, y]) => { const k = new THREE.Mesh(new RoundedBoxGeometry(9.0, 2.2, 0.6, 3, 0.25), M.grafito); k.position.set(PX, y, ZF + 1.6); exterior.add(k); const f = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 2.0), new THREE.MeshBasicMaterial({ map: lz.tex, transparent: true, color: 0xb0b0b0 })); f.position.set(PX, y, ZF + 1.91); exterior.add(f); });
  // cavity, mica, lamp, turntable with a bowl
  const esmalte = new THREE.MeshStandardMaterial({ color: 0x8c8579, roughness: 0.6, metalness: 0.05, emissive: 0x241f18, side: THREE.BackSide, transparent: true, opacity: 1 });
  const cavidad = new THREE.Mesh(new THREE.BoxGeometry(CAV.x1 - CAV.x0, CAV.y1 - CAV.y0, CAV.z1 - CAV.z0), esmalte);
  cavidad.position.set((CAV.x0 + CAV.x1) / 2, (CAV.y0 + CAV.y1) / 2, (CAV.z0 + CAV.z1) / 2); cavidad.userData.sinBordes = true; HO.add(cavidad);
  const mica = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0xcbb07a, roughness: 0.6, transparent: true })); mica.rotation.y = -PI / 2; mica.position.set(CAV.x1 - 0.03, 21, -6); HO.add(mica);
  const luzCav = new THREE.PointLight(0xffc88a, 0, 50, 2); luzCav.position.set(-7, 24.5, 6); HO.add(luzCav);
  const PLX = -7, PLZ = 1.5, PLY = CAV.y0 + 0.9;
  const platoG = new THREE.Group(); platoG.position.set(PLX, PLY, PLZ); HO.add(platoG);
  platoG.add(new THREE.Mesh(new THREE.CylinderGeometry(13, 12.6, 0.5, 96), M.vidrio));
  const rodillo = new THREE.Mesh(new THREE.TorusGeometry(8, 0.32, 12, 64), M.grafito); rodillo.rotation.x = PI / 2; rodillo.position.set(PLX, PLY - 0.55, PLZ); HO.add(rodillo);
  const bowl = cuenco(THREE, C, X, M); bowl.grupo.scale.setScalar(0.82); bowl.grupo.position.y = 0.25; platoG.add(bowl.grupo);
  // inside parts (x-ray)
  const comp = new THREE.Group(); HO.add(comp);
  const guiaH = new THREE.Mesh(new RoundedBoxGeometry(5.6, 9.2, 7.2, 2, 0.3), M.acero); guiaH.position.set(11.8, 21, -6); comp.add(guiaH);
  const magH = magnetron(THREE, C, X, M, { esc: 0.8 }); magH.grupo.rotation.z = PI / 2; magH.grupo.position.set(19.6, 21, -6); comp.add(magH.grupo);
  const transf = new THREE.Group(); transf.position.set(17.8, 5.6, 6); comp.add(transf);
  { transf.add(new THREE.Mesh(new THREE.BoxGeometry(9.6, 7.6, 6.4), M.laminas));
    transf.add(new THREE.Mesh(new RoundedBoxGeometry(4.4, 6.0, 9.4, 3, 0.9), M.bobinado));
    for (const x of [-4.9, 4.9]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8.0, 7.0), M.aceroOsc); s.position.x = x; transf.add(s); } }
  const cond = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 6.6, 40), M.aluminio); cond.position.set(12.6, 4.4, 15.2); comp.add(cond);
  const vent = new THREE.Group(); vent.position.set(19.0, 12.5, -15.6); comp.add(vent);
  { vent.add(new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.35, 10, 64), M.plastico));
    const cubo = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.4, 32), M.plastico); cubo.rotation.x = PI / 2; vent.add(cubo);
    for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new RoundedBoxGeometry(1.8, 3.2, 0.14, 2, 0.06), M.plastico); const a = (i / 7) * 2 * PI; p.position.set(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0); p.rotation.set(0, 0.5, a - PI / 2); vent.add(p); } }
  const pcb = new THREE.Mesh(new THREE.PlaneGeometry(11, 20), M.pcb); pcb.position.set(PX, 16, ZF - 1.4); comp.add(pcb);
  const cableMat = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, clearcoat: 0.6 });
  for (const [pts, c] of [[[v3(14, 8.8, 4), v3(13, 12, 0), v3(15, 17, -4), v3(16.5, 18.5, -6)], 0xcc2a22], [[v3(13, 7.7, 15), v3(13.5, 11, 10), v3(16, 16, 2), v3(18, 17.6, -2.5)], 0x1a1a1a], [[v3(20, 9.4, 8), v3(21.5, 13, 12), v3(20.5, 18, 16), v3(19.5, 22, 17.5)], 0xe8e8e8]])
    comp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.2, 8, false), cableMat(c)));
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 2.2, 32), M.aceroOsc); motor.position.set(PLX, 2.4, PLZ); comp.add(motor);
  let gira = 1, ventOn = 1, relojFijo = null;
  return {
    grupo: HO, dimensiones: { W, H, D, ZF, CAV },
    exterior: [exterior], semi: [[cavidad, 0.15], [mica, 0.4]], interior: [comp],
    cortables: [exterior, cavidad],
    partes: {
      puerta: { obj: puertaG, local: [PW * 0.5, H / 2, 1], radio: PW / 2 }, rejilla: { obj: rejH, local: [4, -2, 0], radio: 6 },
      panel: { obj: HO, local: [PX, H / 2, ZF + 1.4], radio: 9 }, pomo: { obj: pomo, local: [0, 0, 2.2], radio: 3.4 },
      pantalla: { obj: reloj, local: [0, 0, 0.05], radio: 4.7 }, cavidad: { obj: cavidad, local: [0, 0, 0], radio: 16 },
      plato: { obj: platoG, local: [9, 0.3, 0], radio: 13 }, cuenco: { obj: bowl.grupo, local: [0, 5.4, 0], radio: 7 },
      magnetron: { obj: magH.grupo, local: [0, 0, 4.2], radio: 5 }, guia: { obj: guiaH, local: [-1, 4.6, 0], radio: 5 },
      transformador: { obj: transf, local: [0, -2, 4.7], radio: 6 }, ventilador: { obj: vent, local: [0, 4.3, 0], radio: 4.3 },
      placa: { obj: pcb, local: [0, 0, 0.1], radio: 10 }, condensador: { obj: cond, local: [0, 0, 1.9], radio: 3.3 },
    },
    controles: {
      puerta: (k) => { puertaG.rotation.y = -k * 1.95; },
      luz: (k) => { luzCav.intensity = 120 * k; },
      gira: (k) => { gira = k; },
      vapor: (k) => bowl.controles.vapor(k),
      reloj: (s) => { relojFijo = s; },
      ventilador: (k) => { ventOn = k; },
    },
    defecto: { puerta: 0, luz: 1, gira: 1, vapor: 1, reloj: null, ventilador: 1 },
    actualizar(t) {
      platoG.rotation.y = gira ? t * 0.55 : 0.3;
      vent.rotation.z = ventOn ? -t * 9 : 0;
      bowl.actualizar(t);
      const s = relojFijo ?? Math.max(0, 90 - t);
      pintaReloj(`${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`);
      magH.actualizar(t);
    },
  };
}
