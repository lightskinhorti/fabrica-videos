// Piezas de alto detalle para Las cosas por dentro (hechas el 3 de noviembre en el estudio
// estudio/pantalla-speedy, que recrea plano a plano el estilo de @speedy_devv). Todo se dibuja con código:
// texturas de canvas, geometría y shaders. No sale ni un píxel de vídeos de otros.
//
// Uso, dentro del módulo de un vídeo, después del motor:
//   import { crearDetalle } from "./comun/detalle.js";
//   const C = crearPorDentro(THREE);
//   const X = crearDetalle(THREE, C);
// Cada objeto devuelve { grupo, ... } y NO se añade solo a la escena: se mete en el grupo del set que toque.
// Todas las medidas van en "unidades de escena" (en los ejemplos, 1 unidad = 1 cm para el móvil y la mano, y
// 1 unidad = la distancia entre electrodos en el corte lateral).
//
// Texturas (canvas, devuelven { map, normalMap } o una textura):
//   X.tex.lana({ color, fondo, cols, filas })  punto de media (columnas de uves) con relieve y pelusa
//   X.tex.metal({ color })                       metal cepillado (vetas finas)
//   X.tex.rayado({ fondo, linea, paso })         trama fina de las capas oscuras de la pantalla
//   X.tex.cristal()                              motas de polvo y una huella sobre cristal (para emissiveMap/alphaMap)
//   X.tex.trama({ fondo, punto })                cristal oscuro con puntitos (las celdas en macro)
// Materiales:
//   X.mat.piel({ huella })  piel con huella dactilar procedural: crestas en la yema y a los lados, que solo se ven
//                           cuando el dedo está cerca (en planos lejanos se apagan solas, sin parpadeo), poros, punta
//                           más rosada y un falso translúcido en el borde. material.userData.brillo.value (0..1)
//                           la ilumina por dentro en dorado ("la electricidad de tu cuerpo").
//   X.mat.unya(), X.mat.lana(opciones de tex.lana), X.mat.cristal({ tinte, opacidad }), X.mat.oro(),
//   X.mat.titanio(), X.mat.negro(), X.mat.plastico(color)
// Objetos:
//   X.dedo({ radio, guante, lazos }) yema realista (geometría paramétrica, uña que sigue la curva del dedo, huella).
//                               colocar(contacto, dir, distancia, rodar, normal): la yema toca `contacto` exactamente
//                               (dir = de la punta a la mano; normal = la de la superficie tocada: arriba para el cristal
//                               del corte, la normal de la pantalla para un móvil de pie); brillo(k) lo ilumina por
//                               dentro; rayosX(k) lo vuelve un corte translúcido con borde rosa (para los iones).
//                               guante: true lo forra de lana; lazos: n pone n lazos de lana por el borde de la yema.
//   X.boli()                    boli: caña hexagonal transparente, tubo de tinta azul, cono dorado y bola.
//                               colocar(contacto, dir, distancia) con la bola en el contacto.
//   X.movil()                   móvil: cuerpo redondeado, marco de titanio, cristal con reflejo, isla, botones y
//                               pantalla de canvas: pantalla.dibujar(fn, clave) la repinta solo si cambia la clave
//                               (fn(g, w, h) dibuja; las pantallas hechas están en pantallas.js).
//                               punto(u, v) = punto local de la pantalla (u, v de 0 a 1 desde arriba a la izquierda).
//   X.manoGuante()              mano izquierda con guante de lana que sujeta el móvil (pulgar a la izquierda, cuatro
//                               dedos asomando por la derecha, puño de canalé). Se añade al grupo del móvil.
//   X.manoSenala({ guante })    mano que señala con el índice (con guante o desnuda); colocar() como el dedo.
//   X.corte({ n, paso, alto })  corte lateral de la pantalla visto de lado: cristal con grosor y brillo en el borde,
//                               electrodos blancos, fila de subpíxeles RGB, capas oscuras con trama y los arcos de
//                               campo. Devuelve { grupo, xs (x de cada electrodo), yE, yC (cara de arriba del
//                               cristal), arcos, cifras, ... }.
//   X.arcos({ lista, ancho, ... }) arcos de campo dorados con luz que fluye (shader propio, cinta que siempre mira a
//                               la cámara, con un grosor mínimo en píxeles para que no parpadeen de lejos).
//                               lista = [{ a, b, h, fase, peso }]; actualizar(t, objetivos) dobla hacia cada
//                               objetivo { p, r, k, abre } (el dedo: k = 1; el boli o la lana: k = 0, no los dobla).
//   X.cifras(puntos, { tam })   cifras monoespaciadas (JetBrains Mono) en 3D bajo cada punto; poner(i, valor,
//                               destacada); corchete(i0, i1, k) dibuja la llave bajo un tramo.
//   X.iones({ n, caja })        esferas Na⁺ y Cl⁻ con su rótulo; brillo(k) las enciende.
//   X.motas({ n, caja })        motas de luz flotando (polvo en el aire, fondo negro azulado).
//   X.particulas({ tipo })      "nieve", "lluvia" o "chispas" en una caja; actualizar(t).
//   X.vaho()                    nube de vaho (aliento en invierno); actualizar(k).
//   X.diamantes({ cols, filas, paso, borde }) rejilla de electrodos en rombos (filas y columnas cruzadas) con capa
//                               de resalte: fila(j, k), columna(i, k), punto(i, j, k), cruces(k).
//   X.celdas({ n, lado })       celdas grandes de cristal oscuro en rombo con puentes blancos en los cruces.
//   X.tejido({ cols, filas })   punto de lana en 3D (hilo con torsión), con una fila de hilo conductor plateado
//                               que se puede encender en dorado.
// Planos (una composición nueva cada 2-3 s, unidas con transiciones; sin cortes secos desde el 3 de noviembre):
//   X.planos(lista, sets, { deslizar, fundido }) con lista = [{ id, desde, set, de: { p, q }, a: { p, q }, fov,
//     foco, apertura, curva, entrada, transicion }]
//     desde: segundos o id de momento; cada plano se desliza despacio de `de` a `a` (p = cámara, q = punto al que
//     mira, en coordenadas del set); fov en grados (14 = teleobjetivo, casi sin perspectiva); foco = distancia
//     enfocada (por defecto la de p a q); apertura = desenfoque (0 = nada).
//     entrada: cómo llega el plano. Por defecto "deslizar" si el set es el mismo que el del plano anterior (la cámara
//     viaja de un encuadre al otro en `deslizar` = 0,7 s, girando alrededor del objeto, y lo que cambie en el objeto
//     se funde a la vez) y "fundido" si cambia (el plano anterior se funde en el nuevo en `fundido` = 0,35 s, los
//     dos en movimiento); "corte" = corte seco.
//     transicion: segundos de esa entrada (nunca más de la mitad del plano).
//     sets = { nombre: { grupo, centro } }. P.en(t) dice qué plano toca. P.pintar(t, dibujar) coloca la cámara y
//     llama a dibujar(t, e), que pinta todo lo demás (objetos, rótulos y C.pintar); en un fundido lo llama dos
//     veces. P.aplicar(t) solo coloca la cámara (un fundido se ve como corte). Hace falta "desenfoque" en la
//     escena para que haya BokehPass.
// Fondo:
//   X.fondo({ arriba, medio, abajo })  negro azulado con viñeta y motas finas (sustituye scene.background).
// Añadido el 3 de noviembre con 07-microondas (no cambia nada de lo anterior):
//   X.cinta({ hebras, puntos, ancho, color, ondas, vel })  cintas de luz por cualquier camino (ondas, rayos que
//                               rebotan, flujos): poner(i, f, { peso, fase }) con f(u, out) para u de 0 a 1; tiempo(t).
//   X.tex.perforada({ cols, filas, radio })  chapa perforada para alphaMap (rejilla de la puerta, rejillas de ventilación).

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

export function crearDetalle(THREE, C) {
  const { clamp, lerp, ease, smooth, v3, hash } = C;
  const PI = Math.PI;
  const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

  // ---------- canvas helpers ----------
  function lienzo(w, h, draw, color = true) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); draw(g, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = 8;
    return { tex, c, g };
  }
  // value noise on a lattice, deterministic
  function ruido(x, y, s = 0) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const r = (a, b) => hash(a * 57.31 + b * 113.7 + s * 7.13);
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(r(xi, yi), r(xi + 1, yi), u), lerp(r(xi, yi + 1), r(xi + 1, yi + 1), u), v);
  }
  // normal map (tangent space, OpenGL convention) from a grey height canvas
  function normalDesde(alto, fuerza = 2) {
    const w = alto.width, h = alto.height;
    const src = alto.getContext("2d").getImageData(0, 0, w, h).data;
    return lienzo(w, h, (g) => {
      const img = g.createImageData(w, h), d = img.data;
      const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const nx = -(H(x + 1, y) - H(x - 1, y)) * fuerza, ny = (H(x, y + 1) - H(x, y - 1)) * fuerza;
        const l = Math.hypot(nx, ny, 1), i = (y * w + x) * 4;
        d[i] = (nx / l * 0.5 + 0.5) * 255; d[i + 1] = (ny / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    }, false).tex;
  }
  const rep = (tex, x, y) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(x, y); return tex; };

  // ---------- textures ----------
  // knitted wool: columns of V stitches, each leg a twisted ply; returns { map, normalMap }
  function texLana({ color = [74, 77, 83], fondo = [30, 31, 35], cols = 8, filas = 10, w = 512, h = 512, pelusa = 0.18 } = {}) {
    const cw = w / cols, rh = h / filas;
    const alto = lienzo(w, h, (g) => {
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      for (let r = -1; r <= filas; r++) for (let c = 0; c <= cols; c++) {
        const x = c * cw + cw / 2, y = r * rh + rh / 2;
        for (const s of [-1, 1]) {
          g.save(); g.translate(x + s * cw * 0.24, y); g.rotate(s * 0.55);
          const rx = cw * 0.21, ry = rh * 0.66;
          g.scale(1, ry / rx);
          const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
          gr.addColorStop(0, "rgb(255,255,255)"); gr.addColorStop(0.55, "rgb(200,200,200)"); gr.addColorStop(0.9, "rgb(60,60,60)"); gr.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, PI * 2); g.fill();
          // twisted plies: slanted grooves across the leg
          g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = rx * 0.16;
          for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(-rx, k * rx * 0.34 - rx * 0.5); g.lineTo(rx, k * rx * 0.34 + rx * 0.5); g.stroke(); }
          g.restore();
        }
      }
    }, false);
    const nmap = normalDesde(alto.c, 3.2);
    const src = alto.g.getImageData(0, 0, w, h).data;
    const map = lienzo(w, h, (g) => {
      const img = g.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, a = src[i] / 255;
        const n = 0.82 + 0.36 * ruido(x / 3, y / 3, 1) * (0.5 + 0.5 * ruido(x / 40, y / 40, 2));
        const fuzz = hash(x * 13.1 + y * 7.7) > 1 - pelusa * 0.08 ? 1.6 : 1;
        for (let k = 0; k < 3; k++) d[i + k] = clamp(lerp(fondo[k], color[k], Math.pow(a, 0.8)) * n * fuzz, 0, 255);
        d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    }).tex;
    return { map, normalMap: nmap };
  }
  function texMetal({ color = "#8a8d93", w = 512, h = 512 } = {}) {
    return lienzo(w, h, (g) => {
      g.fillStyle = color; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const y = hash(i) * h, a = 0.02 + hash(i + 3) * 0.06;
        g.strokeStyle = hash(i + 7) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
        g.lineWidth = 0.5 + hash(i + 5) * 1.5;
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (hash(i + 9) - 0.5) * 3); g.stroke();
      }
    }).tex;
  }
  function texRayado({ fondo = "#161b22", linea = "rgba(120,140,170,0.07)", paso = 6, w = 512, h = 512, diagonal = true } = {}) {
    return lienzo(w, h, (g) => {
      g.fillStyle = fondo; g.fillRect(0, 0, w, h);
      g.strokeStyle = linea; g.lineWidth = 1.2;
      if (diagonal) {
        for (let x = -h; x < w + h; x += paso) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
      } else for (let y = 0; y < h; y += paso) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + hash(i) * 0.03})`; g.fillRect(hash(i + 1) * w, hash(i + 2) * h, 1, 1); }
    }).tex;
  }
  function texCristal({ w = 1024, h = 1024 } = {}) {
    return lienzo(w, h, (g) => {
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 700; i++) {
        const r = 0.6 + hash(i + 4) * 2.2;
        g.fillStyle = `rgba(255,255,255,${0.1 + hash(i + 5) * 0.4})`;
        g.beginPath(); g.arc(hash(i) * w, hash(i + 1) * h, r, 0, PI * 2); g.fill();
      }
      // one faint fingerprint smudge
      g.save(); g.translate(w * 0.62, h * 0.35); g.rotate(0.4); g.scale(1, 1.35);
      g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2;
      for (let k = 4; k < 90; k += 4.5) { g.beginPath(); g.ellipse(0, 0, k, k * 0.8, 0, 0.2, PI * 2 - 0.4); g.stroke(); }
      g.restore();
      // long soft reflection streak
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0.3, "rgba(255,255,255,0)"); gr.addColorStop(0.42, "rgba(255,255,255,0.08)"); gr.addColorStop(0.5, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
  }
  function texTrama({ fondo = "#24262b", punto = "rgba(255,255,255,0.06)", w = 512, h = 512, paso = 7 } = {}) {
    return lienzo(w, h, (g) => {
      g.fillStyle = fondo; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += paso) for (let x = (y / paso) % 2 ? paso / 2 : 0; x < w; x += paso) {
        g.fillStyle = punto; g.fillRect(x, y, 1.6, 1.6);
      }
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, "rgba(255,255,255,0.05)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,0.15)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
  }

  // ---------- materials ----------
  const GLSL_PERTURBA = `
    vec3 perturbaX(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection) {
      vec3 vSigmaX = normalize(dFdx(surf_pos.xyz));
      vec3 vSigmaY = normalize(dFdy(surf_pos.xyz));
      vec3 vN = surf_norm;
      vec3 R1 = cross(vSigmaY, vN);
      vec3 R2 = cross(vN, vSigmaX);
      float fDet = dot(vSigmaX, R1) * faceDirection;
      vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
      return normalize(abs(fDet) * surf_norm - vGrad);
    }
    float hashX(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float ruidoX(vec3 x) {
      vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hashX(i), hashX(i + vec3(1,0,0)), f.x), mix(hashX(i + vec3(0,1,0)), hashX(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hashX(i + vec3(0,0,1)), hashX(i + vec3(1,0,1)), f.x), mix(hashX(i + vec3(0,1,1)), hashX(i + vec3(1,1,1)), f.x), f.y), f.z);
    }`;
  // skin with a procedural fingerprint (object space, finger of radius 1 along +Y, nail on +Z, pad on -Z)
  function matPiel({ color = 0xe6ad9f, huella = 1, rosa = 0xdc8a82 } = {}) {
    const m = new THREE.MeshPhysicalMaterial({
      color, roughness: 0.55, metalness: 0, sheen: 0.22, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffcfc0), envMapIntensity: 0.6,
      clearcoat: 0.12, clearcoatRoughness: 0.6, specularIntensity: 0.45,
    });
    const U = { brillo: { value: 0 }, huella: { value: huella }, rosa: { value: new THREE.Color(rosa) }, radio: { value: 1 } };
    m.userData = U;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uBrillo: U.brillo, uHuella: U.huella, uRosa: U.rosa });
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>
          varying vec3 vObj; uniform float uBrillo; uniform float uHuella; uniform vec3 uRosa;
          ${GLSL_PERTURBA}
          // ridge phase: loops centred on the pad, drifting into arches on the sides
          float faseHuella(vec3 p) {
            float w = 0.05 * sin(p.y * 7.0 + p.x * 3.0) + 0.04 * ruidoX(p * 3.0);
            float d = length(vec2(p.x * 1.05, (p.y - 1.25) * 0.72)) + 0.22 * p.z + w;
            return d * 220.0;
          }
          float pesoHuella(vec3 p) { return smoothstep(0.55, -0.15, p.z) * smoothstep(3.6, 2.6, p.y) * uHuella; }`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          {
            float fh = faseHuella(vObj);
            float aa = 1.0 - smoothstep(0.03, 0.055, fwidth(fh) / 6.2831);
            float surco = pow(0.5 + 0.5 * cos(fh), 5.0);
            float ph = pesoHuella(vObj) * aa;
            diffuseColor.rgb *= 1.0 - 0.3 * ph * surco;
            // pinker, slightly darker tip; pores
            float punta = smoothstep(1.6, 0.0, vObj.y);
            diffuseColor.rgb = mix(diffuseColor.rgb, uRosa, 0.25 * punta);
            diffuseColor.rgb *= 0.93 + 0.1 * ruidoX(vObj * 22.0);
            // flexion creases at the first joint (pad side)
            float pliegue = exp(-pow((vObj.y - 3.35 - 0.05 * sin(vObj.x * 4.0)) * 22.0, 2.0)) + 0.6 * exp(-pow((vObj.y - 3.55) * 30.0, 2.0));
            diffuseColor.rgb *= 1.0 - 0.25 * pliegue * smoothstep(0.4, -0.4, vObj.z);
          }`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          {
            float fh = faseHuella(vObj);
            float aa = 1.0 - smoothstep(0.03, 0.055, fwidth(fh) / 6.2831);
            float hh = (0.5 + 0.5 * cos(fh)) * pesoHuella(vObj) * aa * 0.0035;
            hh += ruidoX(vObj * 40.0) * 0.0012;
            normal = perturbaX(-vViewPosition, normal, vec2(dFdx(hh), dFdy(hh)), faceDirection);
          }`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          {
            float fres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.5);
            totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.45, 0.35) * 0.16 * fres;
            totalEmissiveRadiance += vec3(1.0, 0.68, 0.22) * uBrillo * (0.55 + 0.9 * fres + 0.35 * smoothstep(1.5, 0.0, vObj.y));
          }`);
    };
    return m;
  }
  const matUnya = () => new THREE.MeshPhysicalMaterial({ color: 0xe8b0a2, roughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.4, specularIntensity: 0.3, envMapIntensity: 0.2 });
  function matLana(o = {}) {
    const t = texLana(o);
    rep(t.map, o.rx ?? 3, o.ry ?? 3); rep(t.normalMap, o.rx ?? 3, o.ry ?? 3);
    return new THREE.MeshPhysicalMaterial({ map: t.map, normalMap: t.normalMap, normalScale: new THREE.Vector2(1.4, 1.4), roughness: 0.95, sheen: 1, sheenRoughness: 0.85, sheenColor: new THREE.Color(0x9aa0aa) });
  }
  const matCristal = ({ tinte = 0xb8c6d8, opacidad = 0.14 } = {}) => new THREE.MeshPhysicalMaterial({ color: tinte, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: opacidad, depthWrite: false, side: THREE.DoubleSide });
  const matOro = () => new THREE.MeshPhysicalMaterial({ color: 0xd8a64a, metalness: 1, roughness: 0.22, clearcoat: 0.4 });
  const matTitanio = () => new THREE.MeshPhysicalMaterial({ color: 0x8c8f95, metalness: 1, roughness: 0.32, map: rep(texMetal({ color: "#9a9da3" }), 1, 4) });
  const matNegro = () => new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const matPlastico = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.5 });

  // ---------- the fingertip ----------
  // surface of a finger of radius 1 along +Y (tip at y = 0), pad on -Z, nail on +Z; phi = 0 points to +Z
  const LARGO = 12, PUNTA = 1.12;
  function perfil(y) {
    // radius along the finger: slight bulge at the first joint, slowly wider to the hand
    return 1 + 0.03 * Math.exp(-((y - 3.4) ** 2) / 0.5) + 0.012 * Math.max(0, y - 3.5);
  }
  function superficie(phi, v, out = new THREE.Vector3(), infla = 0) {
    const vt = 0.16;
    let r, y;
    if (v < vt) { const a = (v / vt) * (PI / 2); r = Math.sin(a); y = PUNTA * (1 - Math.cos(a)); r *= perfil(PUNTA); }
    else { y = PUNTA + ((v - vt) / (1 - vt)) * (LARGO - PUNTA); r = perfil(y); }
    r += infla;
    const x = r * Math.sin(phi);
    let z = r * Math.cos(phi);
    z *= z < 0 ? 0.8 : 0.9;
    return out.set(x, y, z);
  }
  const UPV = v3(0, 1, 0);
  // candidate points of the tip region (local, radius 1): the lowest one after rotating is the contact
  const CANDIDATOS = [];
  for (let i = 0; i < 48; i++) for (let j = 0; j <= 30; j++) CANDIDATOS.push(superficie((i / 48) * 2 * PI, Math.pow(j / 30, 1.35) * 0.4));
  // the pad touches `contacto` exactly; the finger points back along `dir` (tip to hand), moved away by `dist`
  // (`rodar` turns it around its own axis, in radians; `normal` is the touched surface's normal, UP for the glass
  // of the cutaway, the screen's normal for a phone held upright)
  function colocador(grupo, cand = CANDIDATOS) {
    const R = new THREE.Matrix4(), tmp = new THREE.Vector3();
    return (contacto, dir, dist = 0, rodar = 0, normal = UPV) => {
      const d = dir.clone().normalize(), N = normal.clone().normalize();
      let z = N.clone().sub(d.clone().multiplyScalar(d.dot(N)));
      if (z.lengthSq() < 1e-6) z.set(0, 0, 1);
      z.normalize();
      if (rodar) z.applyAxisAngle(d, rodar);
      const x = new THREE.Vector3().crossVectors(d, z).normalize();
      R.makeBasis(x, d, z);
      grupo.quaternion.setFromRotationMatrix(R);
      const s = grupo.scale.x;
      let best = null, by = Infinity;
      for (const c of cand) { tmp.copy(c).applyMatrix4(R); const h = tmp.dot(N); if (h < by) { by = h; best = c; } }
      tmp.copy(best).applyMatrix4(R).multiplyScalar(s);
      grupo.position.copy(contacto).sub(tmp).add(d.clone().multiplyScalar(dist));
    };
  }
  // average the normals along the seam (u = 0 and u = 1) and at the tip pole of a parametric surface
  function soldar(geo, slices, stacks) {
    const n = geo.attributes.normal, c = slices + 1;
    for (let i = 0; i <= stacks; i++) {
      const a = i * c, b = i * c + slices;
      const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
      n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
    }
    for (let j = 0; j <= slices; j++) n.setXYZ(j, 0, -1, 0);
    n.needsUpdate = true;
  }
  function dedo({ radio = 1, guante = false, lana = {}, lazos = 0, colorLazo = 0x6c7179 } = {}) {
    const grupo = new THREE.Group();
    const geo = new ParametricGeometry((u, v, out) => superficie(u * 2 * PI, Math.pow(v, 1.35), out, guante ? 0.06 : 0), 128, 160);
    geo.computeVertexNormals(); soldar(geo, 128, 160);
    const piel = guante ? matLana({ rx: 5, ry: 9, ...lana }) : matPiel();
    const malla = new THREE.Mesh(geo, piel);
    grupo.add(malla);
    let unya = null;
    if (!guante) {
      // the nail follows the finger's curve: a shell over phi in [-0.95, 0.95], y from 0.35 to 2.3
      const y0 = 0.32, y1 = 2.25;
      const ngeo = new ParametricGeometry((s, t, out) => {
        const y = lerp(y0, y1, t);
        const borde = t < 0.22 ? Math.sqrt(1 - Math.pow(1 - t / 0.22, 2)) : t > 0.9 ? Math.sqrt(1 - Math.pow((t - 0.9) / 0.1, 2) * 0.6) : 1;
        const phi = (s * 2 - 1) * 0.92 * borde;
        // find v for this y on the shaft
        const v = y < PUNTA ? 0.16 * Math.acos(clamp(1 - y / PUNTA, -1, 1)) / (PI / 2) : 0.16 + ((y - PUNTA) / (LARGO - PUNTA)) * 0.84;
        superficie(phi, v, out, 0.012 + 0.012 * Math.cos(phi * 1.6) * (1 - Math.abs(s * 2 - 1)));
        return out;
      }, 40, 40);
      ngeo.computeVertexNormals();
      const nm = matUnya();
      nm.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vObjN;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvObjN = position;");
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vObjN;").replace("#include <color_fragment>", `#include <color_fragment>
          float libre = smoothstep(0.62, 0.42, vObjN.y);
          float lunula = smoothstep(1.95, 2.15, vObjN.y) * smoothstep(0.55, 0.2, abs(vObjN.x));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.88, 0.82), libre * 0.6);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.98, 0.86, 0.82), lunula * 0.6);
          diffuseColor.rgb *= 0.95 + 0.08 * sin(vObjN.x * 60.0);`);
      };
      unya = new THREE.Mesh(ngeo, nm);
      grupo.add(unya);
    }
    // x-ray shell: pink rim and dark see-through inside (for the ions)
    const rxMat = new THREE.ShaderMaterial({
      uniforms: { op: { value: 0 }, col: { value: new THREE.Color(0xf2b2a6) } },
      vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
      fragmentShader: "uniform float op; uniform vec3 col; varying vec3 vN; varying vec3 vV; void main(){ float r = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = smoothstep(0.55, 0.95, r); gl_FragColor = vec4(mix(vec3(0.05,0.07,0.1), col, a), (0.45 + 0.55*a) * op); }",
      transparent: true, depthWrite: false, side: THREE.FrontSide,
    });
    const rx = new THREE.Mesh(geo, rxMat); rx.visible = false; rx.renderOrder = 5; grupo.add(rx);
    // wool loops along the outline of a gloved fingertip (seen from the side: local plane x = 0)
    let lazosG = null, lazoMat = null;
    if (lazos > 0) {
      lazosG = new THREE.Group(); grupo.add(lazosG);
      lazoMat = new THREE.MeshPhysicalMaterial({ color: colorLazo, roughness: 0.75, metalness: 0.1, sheen: 0.4, sheenColor: new THREE.Color(0x9aa0a8), emissive: 0xffa630, emissiveIntensity: 0 });
      const tg = new THREE.TorusGeometry(0.12, 0.028, 8, 24); tg.scale(1, 1.35, 1);
      const p = new THREE.Vector3(), q = new THREE.Vector3();
      for (let k = 0; k < lazos; k++) {
        // from the pad side (phi = PI) far up, round the tip, to the nail side (phi = 0)
        const s = k / (lazos - 1), side = s < 0.5;
        const v = side ? lerp(0.4, 0, s / 0.5) : lerp(0, 0.4, (s - 0.5) / 0.5);
        const vv = Math.pow(v, 1.35) * 0 + v;
        superficie(side ? PI : 0, vv, p, 0.08); superficie(side ? PI : 0, vv + 0.004, q, 0.08);
        const m = new THREE.Mesh(tg, lazoMat);
        m.position.copy(p); m.lookAt(p.clone().add(v3(1, 0, 0))); m.rotateZ(Math.atan2(q.z - p.z, q.y - p.y));
        lazosG.add(m);
      }
    }
    grupo.scale.setScalar(radio);
    const api = {
      grupo, malla, unya, material: piel, geo, lazos: lazosG, lazoMat,
      colocar: colocador(grupo),
      brillo(k) { if (piel.userData.brillo) piel.userData.brillo.value = k; },
      rayosX(k) { rxMat.uniforms.op.value = k; rx.visible = k > 0.01; malla.visible = k < 0.99; if (unya) unya.visible = k < 0.99; piel.transparent = k > 0.01; piel.opacity = 1 - k; if (unya) { unya.material.transparent = k > 0.01; unya.material.opacity = 1 - k; } },
      // world point of the pad's lowest point (useful as the arcs' target)
      yema(out = new THREE.Vector3()) { return malla.localToWorld(out.set(0, 0.55, -0.8)); },
    };
    return api;
  }

  // ---------- ballpoint pen ----------
  function boli({ largo = 14, radio = 0.42 } = {}) {
    const grupo = new THREE.Group();
    const tinta = new THREE.MeshPhysicalMaterial({ color: 0x2a3cff, roughness: 0.3, emissive: 0x1020c0, emissiveIntensity: 0.55, clearcoat: 1 });
    const cana = new THREE.MeshPhysicalMaterial({ color: 0xdfe8f5, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.6, ior: 1.46, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, attenuationColor: new THREE.Color(0xc8d6ff), attenuationDistance: 6 });
    const oro = matOro();
    const acero = new THREE.MeshPhysicalMaterial({ color: 0xd4d7dc, metalness: 1, roughness: 0.15 });
    // tip at the origin, pen along +Y
    const bola = new THREE.Mesh(new THREE.SphereGeometry(radio * 0.11, 20, 12), acero); bola.position.y = radio * 0.08; grupo.add(bola);
    const punta = new THREE.Mesh(new THREE.CylinderGeometry(radio * 0.16, radio * 0.11, radio * 0.45, 24), acero); punta.position.y = radio * 0.3; grupo.add(punta);
    const cono = new THREE.Mesh(new THREE.CylinderGeometry(radio * 0.84, radio * 0.17, radio * 2.2, 48, 1, true), oro); cono.position.y = radio * 0.52 + radio * 1.1; grupo.add(cono);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(radio * 0.86, radio * 0.07, 10, 48), oro); anillo.rotation.x = PI / 2; anillo.position.y = radio * 2.72; grupo.add(anillo);
    const hexGeo = new THREE.CylinderGeometry(radio * 1.0, radio * 1.0, largo, 6, 1, false); hexGeo.translate(0, radio * 2.75 + largo / 2, 0);
    const caña = new THREE.Mesh(hexGeo, cana); grupo.add(caña);
    const tubo = new THREE.Mesh(new THREE.CylinderGeometry(radio * 0.24, radio * 0.24, largo * 0.95, 20), tinta); tubo.position.y = radio * 2.75 + largo * 0.48; grupo.add(tubo);
    const cuello = new THREE.Mesh(new THREE.CylinderGeometry(radio * 0.6, radio * 0.8, radio * 0.6, 32), new THREE.MeshPhysicalMaterial({ color: 0xf2f4f8, roughness: 0.4, transmission: 0.6, thickness: 0.3 })); cuello.position.y = radio * 2.95; grupo.add(cuello);
    const colocar = (contacto, dir, dist = 0) => {
      const d = dir.clone().normalize();
      grupo.quaternion.setFromUnitVectors(UPV, d);
      grupo.position.copy(contacto).add(d.clone().multiplyScalar(dist));
    };
    return { grupo, colocar };
  }

  // ---------- phone ----------
  function movil({ ancho = 7.15, alto = 14.7, grosor = 0.82, res = 760 } = {}) {
    const grupo = new THREE.Group();
    const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(ancho, alto, grosor, 8, 1.05), matTitanio());
    grupo.add(cuerpo);
    const frente = new THREE.Mesh(new RoundedBoxGeometry(ancho - 0.12, alto - 0.12, 0.08, 8, 0.98), matNegro());
    frente.position.z = grosor / 2 - 0.02; grupo.add(frente);
    const W = res, H = Math.round(res * (alto - 0.62) / (ancho - 0.58));
    const lz = lienzo(W, H, (g) => { g.fillStyle = "#000"; g.fillRect(0, 0, W, H); });
    const sw = ancho - 0.58, shh = alto - 0.62;
    const pantMat = new THREE.MeshBasicMaterial({ map: lz.tex, color: 0xb4b4b4, toneMapped: false });
    // rounded screen: shape geometry with UVs mapped to the rectangle
    const shp = C.rrShape(sw, shh, 0.82);
    const sg = new THREE.ShapeGeometry(shp, 24);
    const uv = sg.attributes.uv, ps = sg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / sw + 0.5, ps.getY(i) / shh + 0.5);
    const pant = new THREE.Mesh(sg, pantMat); pant.position.z = grosor / 2 + 0.03; grupo.add(pant);
    // glass on top: reflections and dust
    const cristal = new THREE.Mesh(new THREE.ShapeGeometry(C.rrShape(ancho - 0.16, alto - 0.16, 1.0), 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, transparent: true, opacity: 0.035, clearcoat: 0.6, clearcoatRoughness: 0.1, depthWrite: false, envMapIntensity: 0.5 }));
    cristal.position.z = grosor / 2 + 0.05; grupo.add(cristal);
    const isla = new THREE.Mesh(new THREE.ShapeGeometry(C.rrShape(2.0, 0.58, 0.29), 12), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    isla.position.set(0, shh / 2 - 0.62, grosor / 2 + 0.04); grupo.add(isla);
    const lente = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), new THREE.MeshBasicMaterial({ color: 0x141a2a })); lente.position.set(0.55, shh / 2 - 0.62, grosor / 2 + 0.045); grupo.add(lente);
    const tit = cuerpo.material;
    for (const [x, y, h] of [[-ancho / 2 - 0.03, 3.6, 0.7], [-ancho / 2 - 0.03, 2.2, 1.4], [-ancho / 2 - 0.03, 0.5, 1.4], [ancho / 2 + 0.03, 2.4, 2.2]]) {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.12, h, 0.32, 3, 0.05), tit); b.position.set(x, y, 0); grupo.add(b);
    }
    let clave = null;
    const pantalla = {
      c: lz.c, g: lz.g, tex: lz.tex, w: W, h: H, malla: pant,
      dibujar(fn, k) { if (k !== undefined && k === clave) return; clave = k; lz.g.save(); fn(lz.g, W, H); lz.g.restore(); lz.tex.needsUpdate = true; },
    };
    const punto = (u, v, z = grosor / 2 + 0.06) => v3((u - 0.5) * sw, (0.5 - v) * shh, z);
    return { grupo, pantalla, cristal, punto, ancho, alto, grosor, sw, sh: shh };
  }

  // ---------- gloved hand holding the phone (left hand, palm behind the phone) ----------
  function capsula(r, l, mat, seg = 24) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 10, seg), mat); return m; }
  function manoGuante({ color = [74, 77, 83] } = {}) {
    const grupo = new THREE.Group();
    const lana = matLana({ color, rx: 10, ry: 6 });
    const lanaDedo = matLana({ color, rx: 2.4, ry: 1.3 });
    const canale = matLana({ color: [70, 73, 79], cols: 12, filas: 4, rx: 4, ry: 3 });
    // palm and back of the hand, mostly behind the phone
    const palma = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), lana); palma.scale.set(4.3, 5.2, 2.0); palma.position.set(0.4, -5.6, -1.9); grupo.add(palma);
    const talon = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), lana); talon.scale.set(3.4, 3.2, 2.2); talon.position.set(-0.2, -8.6, -1.2); grupo.add(talon);
    // cuff (ribbed)
    const puno = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.1, 12, 48, 1, true), canale); puno.scale.set(1, 1, 0.68); puno.position.set(-0.1, -15.5, -1.2); grupo.add(puno);
    // thumb along the left edge, tip up
    const pulgar = capsula(1.02, 5.4, lanaDedo); pulgar.position.set(-4.0, -3.4, 0.35); pulgar.rotation.z = -0.32; pulgar.rotation.x = 0.12; grupo.add(pulgar);
    const pulgarB = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 20), lanaDedo); pulgarB.position.set(-3.2, -6.7, -0.4); grupo.add(pulgarB);
    // four fingers wrapping the right edge, seen end-on as stacked pills
    const dedos = [];
    [[3.9, 2.4], [3.95, 0.25], [3.95, -1.85], [3.75, -3.85]].forEach(([x, y], i) => {
      const d = capsula(0.98 - i * 0.04, 1.9, lanaDedo); d.rotation.z = PI / 2 + 0.08 * (i - 1.5); d.rotation.y = -0.35; d.position.set(x, y, -0.25); grupo.add(d); dedos.push(d);
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.98 - i * 0.04, 24, 16), lanaDedo); n.position.set(x + 0.9, y, -1.2); grupo.add(n);
    });
    return { grupo, palma, pulgar, dedos };
  }
  // a pointing hand (index finger out); guante: wool, else bare skin
  function manoSenala({ guante = false, radio = 1 } = {}) {
    const grupo = new THREE.Group();
    const dd = dedo({ radio: 1, guante });
    grupo.add(dd.grupo);
    const mat = guante ? matLana({ rx: 2, ry: 2 }) : matPiel({ huella: 0 });
    const puño = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mat); puño.scale.set(2.7, 3.2, 2.3); puño.position.set(0.7, 12.5, -1.1); grupo.add(puño);
    for (let i = 0; i < 3; i++) { const k = capsula(0.95, 1.6, mat); k.position.set(1.0 + i * 0.3, 9.9 - i * 0.2, -1.9 - i * 0.45); k.rotation.x = 1.1; grupo.add(k); }
    const pul = capsula(0.98, 2.8, mat); pul.position.set(-2.0, 11.2, -0.7); pul.rotation.z = 0.7; grupo.add(pul);
    const brazo = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 16, 32), guante ? matLana({ color: [80, 84, 90], cols: 12, filas: 4, rx: 3, ry: 1 }) : mat); brazo.position.set(0.7, 21, -1.1); grupo.add(brazo);
    grupo.scale.setScalar(radio);
    return { grupo, dedo: dd, colocar: colocador(grupo) };
  }

  // ---------- field arcs: glowing gold ribbons with light flowing along them ----------
  const ARCO_VS = `
    uniform vec2 resol; uniform float ancho; uniform float minPx;
    attribute vec3 sig; attribute float lado; attribute float u; attribute float semilla; attribute float peso;
    varying float vL; varying float vU; varying float vS; varying float vP; varying float vF;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec4 c0 = projectionMatrix * mv;
      vec4 c1 = projectionMatrix * (modelViewMatrix * vec4(sig, 1.0));
      vec2 s0 = c0.xy / c0.w * resol * 0.5, s1 = c1.xy / c1.w * resol * 0.5;
      vec2 d = s1 - s0; float ld = length(d); d = ld > 1e-5 ? d / ld : vec2(1.0, 0.0);
      vec2 n = vec2(-d.y, d.x);
      float pxM = ancho * projectionMatrix[1][1] * resol.y * 0.5 / max(c0.w, 1e-4);
      float px = max(pxM, minPx);
      c0.xy += n * lado * px / (resol * 0.5) * c0.w;
      gl_Position = c0;
      vL = lado; vU = u; vS = semilla; vP = peso; vF = clamp(pxM / minPx, 0.35, 1.0);
    }`;
  const ARCO_FS = `
    uniform vec3 color; uniform float tiempo; uniform float ondas; uniform float vel; uniform float intensidad; uniform float oscuro;
    varying float vL; varying float vU; varying float vS; varying float vP; varying float vF;
    void main() {
      float d = abs(vL);
      float core = exp(-d * d * 5.0), hot = exp(-d * d * 30.0);
      float f = fract(vU * ondas - tiempo * vel + vS);
      float pulso = pow(smoothstep(0.0, 0.5, f) * smoothstep(1.0, 0.5, f) * 4.0 * 0.25, 2.0);
      float ends = smoothstep(0.0, 0.04, vU) * smoothstep(1.0, 0.96, vU);
      float a = (0.55 * core + 0.45 * hot) * (0.4 + 1.0 * pulso) * vP * intensidad * ends * vF;
      vec3 col = color * a + vec3(1.0, 0.82, 0.45) * hot * pulso * 0.22 * vP * intensidad * ends;
      if (oscuro > 0.5) { gl_FragColor = vec4(vec3(0.0), core * vP * intensidad * ends); return; }
      gl_FragColor = vec4(col, 1.0);
    }`;
  function arcos({ lista, puntos = 30, ancho = 0.02, minPx = 1.6, color = 0xffb22e, intensidad = 0.85, ondas = 2.2, vel = 0.45, oscuro = false, eje = v3(0, 1, 0) }) {
    const N = lista.length, M = puntos, NV = N * M * 2;
    const pos = new Float32Array(NV * 3), sig = new Float32Array(NV * 3), lado = new Float32Array(NV), uu = new Float32Array(NV), sem = new Float32Array(NV), pes = new Float32Array(NV);
    const idx = new Uint32Array(N * (M - 1) * 6);
    let q = 0;
    lista.forEach((a, i) => {
      for (let j = 0; j < M; j++) {
        const v = (i * M + j) * 2;
        lado[v] = -1; lado[v + 1] = 1; uu[v] = uu[v + 1] = j / (M - 1); sem[v] = sem[v + 1] = a.fase ?? hash(i * 3.1);
        pes[v] = pes[v + 1] = a.peso ?? 1;
        if (j < M - 1) { idx[q++] = v; idx[q++] = v + 1; idx[q++] = v + 2; idx[q++] = v + 1; idx[q++] = v + 3; idx[q++] = v + 2; }
      }
    });
    const geo = new THREE.BufferGeometry();
    const aPos = new THREE.BufferAttribute(pos, 3), aSig = new THREE.BufferAttribute(sig, 3), aPes = new THREE.BufferAttribute(pes, 1);
    aPos.setUsage(THREE.DynamicDrawUsage); aSig.setUsage(THREE.DynamicDrawUsage); aPes.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", aPos); geo.setAttribute("sig", aSig); geo.setAttribute("lado", new THREE.BufferAttribute(lado, 1));
    geo.setAttribute("u", new THREE.BufferAttribute(uu, 1)); geo.setAttribute("semilla", new THREE.BufferAttribute(sem, 1)); geo.setAttribute("peso", aPes);
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { resol: { value: new THREE.Vector2(C.W * 2, C.H * 2) }, ancho: { value: ancho }, minPx: { value: minPx }, color: { value: new THREE.Color(color) }, tiempo: { value: 0 }, ondas: { value: ondas }, vel: { value: vel }, intensidad: { value: intensidad }, oscuro: { value: oscuro ? 1 : 0 } },
      vertexShader: ARCO_VS, fragmentShader: ARCO_FS, transparent: true, depthWrite: false,
      blending: oscuro ? THREE.NormalBlending : THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    const malla = new THREE.Mesh(geo, mat); malla.frustumCulled = false;
    const P = new Float32Array(M * 3);
    const tmp = new THREE.Vector3(), top = new THREE.Vector3(), F = new THREE.Vector3(), m = new THREE.Vector3();
    // base curve: half ellipse from a to b with height h along eje (vertical at both ends)
    function base(a, u, out) {
      const s = (1 - Math.cos(PI * u)) / 2;
      out.copy(a.a).lerp(a.b, s).addScaledVector(eje, a.h * Math.sin(PI * u));
      return out;
    }
    let hecho = false;
    function actualizar(t, objetivos = [], { estatico = false } = {}) {
      mat.uniforms.tiempo.value = t;
      if (estatico && hecho) return;
      hecho = true;
      for (let i = 0; i < N; i++) {
        const a = lista[i];
        // pull toward the strongest target
        let w = 0, best = null;
        if (objetivos.length) {
          m.copy(a.a).add(a.b).multiplyScalar(0.5);
          for (const o of objetivos) {
            if (!o || !(o.k > 0)) continue;
            const dx = m.x - o.p.x, dz = m.z - o.p.z, dd = Math.sqrt(dx * dx + (o.z ? dz * dz : 0));
            const ww = o.k * smooth(clamp(1 - dd / o.r));
            if (ww > w) { w = ww; best = o; }
          }
        }
        if (w > 0.001) {
          base(a, 0.5, top);
          const dx = m.x - best.p.x;
          F.set(best.p.x + dx * (best.abre ?? 0.4), best.p.y + (dx * dx) * (best.curva ?? 0.12), m.z * 0.6 + best.p.z * 0.4);
        }
        for (let j = 0; j < M; j++) {
          const u = j / (M - 1);
          base(a, u, tmp);
          if (w > 0.001) tmp.addScaledVector(F.clone().sub(top), w * Math.pow(Math.sin(PI * u), 0.42));
          P[j * 3] = tmp.x; P[j * 3 + 1] = tmp.y; P[j * 3 + 2] = tmp.z;
        }
        const pw = (a.peso ?? 1) * (1 + 0.9 * w) * (a.apagado ? 1 - a.apagado : 1);
        for (let j = 0; j < M; j++) {
          const v = (i * M + j) * 2;
          const jn = j < M - 1 ? j + 1 : j - 1, sgn = j < M - 1 ? 1 : -1;
          const px = P[j * 3], py = P[j * 3 + 1], pz = P[j * 3 + 2];
          const sx = px + sgn * (P[jn * 3] - px), sy = py + sgn * (P[jn * 3 + 1] - py), sz = pz + sgn * (P[jn * 3 + 2] - pz);
          for (let k = 0; k < 2; k++) {
            pos[(v + k) * 3] = px; pos[(v + k) * 3 + 1] = py; pos[(v + k) * 3 + 2] = pz;
            sig[(v + k) * 3] = sx; sig[(v + k) * 3 + 1] = sy; sig[(v + k) * 3 + 2] = sz;
            pes[v + k] = pw;
          }
        }
      }
      aPos.needsUpdate = true; aSig.needsUpdate = true; aPes.needsUpdate = true;
    }
    return { malla, lista, actualizar, material: mat };
  }

  // ---------- monospace figures in 3D ----------
  function cifras(puntos, { tam = 0.32, color = "#c9ced6", fuerte = "#ffffff", ancho = 3.2, mira = null } = {}) {
    const grupo = new THREE.Group();
    const items = puntos.map((p) => {
      const lz = lienzo(192, 72, () => {});
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(tam * ancho * 0.75, tam * 1.1), new THREE.MeshBasicMaterial({ map: lz.tex, transparent: true, depthWrite: false, toneMapped: false }));
      mesh.position.copy(p); grupo.add(mesh);
      return { lz, mesh, valor: null, fuerte: false, sucio: true };
    });
    function poner(i, valor, destacada = false) {
      const it = items[i]; if (!it) return;
      const v = String(valor);
      if (it.valor === v && it.fuerte === destacada) return;
      it.valor = v; it.fuerte = destacada; it.sucio = true;
    }
    function dibujar() {
      for (const it of items) {
        if (!it.sucio) continue; it.sucio = false;
        const g = it.lz.g; g.clearRect(0, 0, 192, 72);
        g.font = `${it.fuerte ? 700 : 400} 52px "JetBrains Mono", monospace`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = it.fuerte ? fuerte : color; g.fillText(it.valor ?? "", 96, 38);
        it.lz.tex.needsUpdate = true;
      }
    }
    const corcheteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
    const corch = new THREE.Group(); grupo.add(corch);
    const cb = new THREE.Mesh(new THREE.PlaneGeometry(1, tam * 0.06), corcheteMat), cl = new THREE.Mesh(new THREE.PlaneGeometry(tam * 0.06, tam * 0.35), corcheteMat), cr = cl.clone();
    corch.add(cb, cl, cr);
    function corchete(i0, i1, k) {
      corcheteMat.opacity = k; corch.visible = k > 0.01;
      if (!corch.visible) return;
      const a = items[i0].mesh.position, b = items[i1].mesh.position, w = b.x - a.x + tam * 2.6, y = a.y - tam * 0.75;
      cb.scale.x = w; cb.position.set((a.x + b.x) / 2, y, a.z); cl.position.set((a.x + b.x) / 2 - w / 2, y + tam * 0.16, a.z); cr.position.set((a.x + b.x) / 2 + w / 2, y + tam * 0.16, a.z);
    }
    return { grupo, items, poner, dibujar, corchete };
  }

  // ---------- the side cutaway of a touchscreen ----------
  function corte({ n = 90, paso = 1, alto = 1.25, fondo = 2.4, subpx = 6, arcosPor = 16 } = {}) {
    const grupo = new THREE.Group();
    const L = n * paso + 6;
    const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * paso);
    const yE = 0.06, yC = alto, zF = 0.3;
    const caja = (y0, y1, mat, r = 0) => { const m = new THREE.Mesh(r ? new RoundedBoxGeometry(L, y1 - y0, fondo, 3, r) : new THREE.BoxGeometry(L, y1 - y0, fondo), mat); m.position.set(0, (y0 + y1) / 2, -fondo / 2 + zF); grupo.add(m); return m; };
    const linea = (y, op, grosor = 0.02, z = zF + 0.02, color = 0xdfe8f5) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(L, grosor), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, toneMapped: false })); m.position.set(0, y, z); grupo.add(m); return m; };
    // glass: almost invisible slab; what you see is its bright top edge, a faint inner sheen and the top face at a grazing angle
    const vidrio = caja(0, alto, new THREE.MeshPhysicalMaterial({ color: 0x8fa6c2, roughness: 0.06, transparent: true, opacity: 0.035, depthWrite: false, clearcoat: 1 }));
    const brilloV = new THREE.Mesh(new THREE.PlaneGeometry(L, alto), new THREE.ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "varying vec2 vUv; void main(){ float a = 0.08 * smoothstep(0.45, 1.0, vUv.y) + 0.03 * smoothstep(0.25, 0.0, vUv.y) + 0.02; gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a, 1.0); }",
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    brilloV.position.set(0, alto / 2, zF + 0.005); grupo.add(brilloV);
    const bordeArriba = linea(yC, 0.9, 0.022, zF + 0.03, 0xeef4ff);
    linea(yC - 0.03, 0.12, 0.05);
    const techo = new THREE.Mesh(new THREE.PlaneGeometry(L, fondo), new THREE.MeshPhysicalMaterial({ color: 0xaabbd0, transparent: true, opacity: 0.05, roughness: 0.05, depthWrite: false, emissive: 0x1c2533, emissiveIntensity: 0.5 }));
    techo.rotation.x = -PI / 2; techo.position.set(0, yC, -fondo / 2 + zF); grupo.add(techo);
    // sensor wire and electrodes (small white pills)
    linea(yE - 0.035, 0.55, 0.016, zF + 0.03, 0xb9c4d4);
    const elMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f5fa, roughness: 0.3, emissive: 0xd8e2f2, emissiveIntensity: 0.55, clearcoat: 1 });
    const elGeo = new RoundedBoxGeometry(paso * 0.26, 0.07, 0.24, 3, 0.03);
    const electrodos = new THREE.InstancedMesh(elGeo, elMat, n);
    const dm = new THREE.Object3D();
    xs.forEach((x, i) => { dm.position.set(x, yE, 0.14); dm.updateMatrix(); electrodos.setMatrixAt(i, dm.matrix); });
    grupo.add(electrodos);
    // RGB sub-pixels right under the sensor (three triplets per electrode)
    const yP = -0.17;
    caja(-0.31, -0.06, new THREE.MeshPhysicalMaterial({ color: 0x0b0d11, roughness: 0.5 }));
    const np = Math.ceil(L / paso) * subpx;
    const pxGeo = new RoundedBoxGeometry((paso / subpx) * 0.66, 0.17, 0.05, 2, 0.02);
    const pix = new THREE.InstancedMesh(pxGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), np);
    const COL = [new THREE.Color(1.0, 0.1, 0.08), new THREE.Color(0.1, 0.95, 0.25), new THREE.Color(0.12, 0.28, 1.0)];
    for (let i = 0; i < np; i++) {
      dm.position.set(-L / 2 + (i + 0.5) * (paso / subpx), yP, zF + 0.01); dm.updateMatrix(); pix.setMatrixAt(i, dm.matrix);
      pix.setColorAt(i, COL[i % 3].clone().multiplyScalar(0.75 + 0.35 * hash(i * 1.7)));
    }
    grupo.add(pix);
    linea(-0.06, 0.25, 0.012); linea(-0.32, 0.4, 0.014);
    const nt = Math.ceil(L / paso) * 3;
    const tft = new THREE.InstancedMesh(new THREE.BoxGeometry(paso * 0.08, 0.035, 0.03), new THREE.MeshBasicMaterial({ color: 0x8a5424, toneMapped: false }), nt);
    for (let i = 0; i < nt; i++) { dm.position.set(-L / 2 + (i + 0.5) * (paso / 3), -0.4, zF + 0.012); dm.updateMatrix(); tft.setMatrixAt(i, dm.matrix); }
    grupo.add(tft);
    // dark layered stack underneath (bevelled slabs, slate blue, fine stripes)
    const pila = (c, paso2, fondoC, lin) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, metalness: 0.25, clearcoat: 0.3, map: rep(texRayado({ diagonal: false, paso: paso2, fondo: fondoC, linea: lin }), 10, 1) });
    caja(-0.62, -0.46, pila(0x2a3340, 4, "#2b3542", "rgba(170,190,220,0.08)"), 0.04);
    linea(-0.635, 0.28, 0.012);
    caja(-1.62, -0.66, pila(0x202833, 3, "#232c38", "rgba(160,180,210,0.07)"), 0.08);
    linea(-1.64, 0.3, 0.012); linea(-0.7, 0.14, 0.03);
    caja(-1.95, -1.68, pila(0x283240, 5, "#2a3442", "rgba(170,190,220,0.08)"), 0.05);
    linea(-1.97, 0.22, 0.012);
    caja(-8, -2.0, new THREE.MeshPhysicalMaterial({ color: 0x1a2029, roughness: 0.7, map: rep(texRayado({ fondo: "#1b222b", linea: "rgba(140,165,200,0.11)", paso: 7 }), 16, 2) }));
    // field arcs: each electrode sends nested arcs to its neighbours (a few reach two or three over), at several depths
    const lista = [];
    for (let i = 0; i < n; i++) {
      const xa = xs[i];
      for (let k = 0; k < arcosPor; k++) {
        const r0 = hash(i * 3.3 + k * 1.9), r1 = hash(i * 5.7 + k * 2.3), r2 = hash(i * 8.1 + k * 4.7);
        // fountains: from the electrode, up and down again 0.35 to 1.4 pitches away (narrow and tall)
        const dir = r1 < 0.5 ? 1 : -1, reach = paso * (0.35 + 1.05 * r0 * r0);
        if (xa + dir * reach < xs[0] || xa + dir * reach > xs[n - 1]) continue;
        const hh = paso * (0.4 + 0.7 * r2) * (0.7 + 0.45 * Math.min(1, reach / paso));
        const z = 0.14 + (hash(i * 7.7 + k * 1.3) - 0.5) * 0.9;
        const off = (hash(i * 2.9 + k) - 0.5) * 0.08;
        lista.push({ a: v3(xa + off, yE + 0.03, z), b: v3(xa + dir * reach, yE + 0.03, z), h: Math.min(hh, alto * 1.0), fase: hash(i * 13.7 + k * 3.9), peso: (0.35 + 0.65 * hash(i * 4.4 + k)) * (z < -0.1 ? 0.55 : 1) });
      }
    }
    const A = arcos({ lista, ancho: 0.014 * paso, minPx: 1.15 });
    A.malla.renderOrder = 3;
    grupo.add(A.malla);
    // figures under each electrode
    const F = cifras(xs.map((x) => v3(x, -0.92, zF + 0.06)), { tam: 0.3 * paso });
    grupo.add(F.grupo);
    // glow where something touches the glass
    const toque = C.brillo("255,190,90"); toque.scale.set(2.2, 0.9, 1); toque.position.set(0, yC, 0.2); grupo.add(toque);
    return { grupo, xs, yE, yC, yP, L, arcos: A, cifras: F, toque, bordeArriba, electrodos, vidrio };
  }

  // ---------- ions (Na+ and Cl-) ----------
  function iones({ n = 22, caja = [1.2, 2.6, 0.5], centro = v3(0, 1.6, 0), radio = 0.17 } = {}) {
    const grupo = new THREE.Group();
    const etiqueta = (txt, sup) => lienzo(128, 128, (g) => {
      g.font = '700 50px "Inter", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#1c2430";
      g.fillText(txt, 56, 68); g.font = '700 34px "Inter", sans-serif'; g.fillText(sup, 92, 40);
    }).tex;
    const tNa = etiqueta("Na", "+"), tCl = etiqueta("Cl", "−");
    const mNa = new THREE.MeshPhysicalMaterial({ color: 0xe9edf2, roughness: 0.25, clearcoat: 1, emissive: 0xffb340, emissiveIntensity: 0 });
    const mCl = new THREE.MeshPhysicalMaterial({ color: 0x6f8a98, roughness: 0.25, clearcoat: 1, emissive: 0xffb340, emissiveIntensity: 0 });
    const items = [];
    for (let i = 0; i < n; i++) {
      const na = i % 2 === 0;
      const s = new THREE.Mesh(new THREE.SphereGeometry(radio * (na ? 1 : 1.25), 28, 18), na ? mNa : mCl);
      const p = v3((hash(i * 3.1) - 0.5) * caja[0], (hash(i * 5.3) - 0.5) * caja[1], (hash(i * 7.9) - 0.5) * caja[2]).add(centro);
      s.position.copy(p);
      const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: na ? tNa : tCl, depthTest: false, transparent: true }));
      lab.scale.setScalar(radio * 1.6); lab.position.copy(p); lab.renderOrder = 8;
      const halo = C.brillo("255,190,80"); halo.scale.setScalar(radio * 6); halo.position.copy(p);
      grupo.add(s, lab, halo); items.push({ s, lab, halo, p, f: hash(i * 2.2) * 6.28 });
    }
    function actualizar(t, k = 0, mov = 1) {
      mNa.emissiveIntensity = mCl.emissiveIntensity = 0.9 * k;
      for (const it of items) {
        const o = v3(Math.sin(t * 0.9 + it.f), Math.cos(t * 0.7 + it.f * 1.3), Math.sin(t * 0.5 + it.f * 0.7)).multiplyScalar(0.035 * mov);
        it.s.position.copy(it.p).add(o); it.lab.position.copy(it.s.position); it.halo.position.copy(it.s.position);
        it.halo.material.opacity = 0.55 * k;
      }
    }
    return { grupo, actualizar, items };
  }

  // ---------- specks of light in the air ----------
  const motaTex = lienzo(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.3, "rgba(255,255,255,0.5)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }).tex;
  function motas({ n = 400, caja = [40, 30, 30], centro = v3(0, 0, 0), tam = 0.08, color = 0xb8c8e8, opacidad = 0.5 } = {}) {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = centro.x + (hash(i * 1.3) - 0.5) * caja[0]; p[i * 3 + 1] = centro.y + (hash(i * 2.7) - 0.5) * caja[1]; p[i * 3 + 2] = centro.z + (hash(i * 4.1) - 0.5) * caja[2]; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: motaTex, size: tam, color, transparent: true, opacity: opacidad, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    pts.frustumCulled = false;
    return { grupo: pts };
  }
  // snow, rain or sparks inside a box (centre c, size s), deterministic in t
  function particulas({ tipo = "nieve", n = 300, centro = v3(0, 0, 0), caja = [20, 30, 10], tam = 0.25 } = {}) {
    const grupo = new THREE.Group();
    if (tipo === "lluvia") {
      const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 6);
      geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
      const ln = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xaab8cc, transparent: true, opacity: 0.35, depthWrite: false }));
      ln.frustumCulled = false; grupo.add(ln);
      return { grupo, actualizar(t) {
        for (let i = 0; i < n; i++) {
          const sp = 30 + 10 * hash(i * 1.9), y0 = hash(i * 3.3) * caja[1];
          const y = centro.y + caja[1] / 2 - ((y0 + t * sp) % caja[1]);
          const x = centro.x + (hash(i * 5.1) - 0.5) * caja[0] + (y - centro.y) * 0.08, z = centro.z + (hash(i * 7.3) - 0.5) * caja[2];
          p.set([x, y, z, x - 0.12, y + 1.4, z], i * 6);
        }
        geo.attributes.position.needsUpdate = true;
      } };
    }
    const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: motaTex, size: tam, color: tipo === "chispas" ? 0xfff1d0 : 0xf2f6ff, transparent: true, opacity: tipo === "chispas" ? 0.95 : 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; grupo.add(pts);
    return { grupo, material: pts.material, actualizar(t, k = 1) {
      for (let i = 0; i < n; i++) {
        let x, y, z;
        if (tipo === "chispas") {
          // short-lived specks popping up and out from the centre
          const per = 0.7 + 0.5 * hash(i * 2.3), f = ((t + hash(i * 9.1) * per) % per) / per;
          const a = hash(i * 4.7) * PI * 2, r = (0.3 + f * 1.2) * caja[0] * (0.5 + 0.5 * hash(i * 6.1));
          x = centro.x + Math.cos(a) * r; z = centro.z + Math.sin(a) * r * 0.4; y = centro.y + Math.sin(f * PI) * caja[1] * (0.4 + 0.6 * hash(i * 8.3));
          if (hash(i * 3.9) > k) y = -1e4;
        } else {
          const sp = 1.2 + 1.2 * hash(i * 1.9), y0 = hash(i * 3.3) * caja[1];
          y = centro.y + caja[1] / 2 - ((y0 + t * sp) % caja[1]);
          x = centro.x + (hash(i * 5.1) - 0.5) * caja[0] + Math.sin(t * 0.8 + i) * 0.4; z = centro.z + (hash(i * 7.3) - 0.5) * caja[2];
        }
        p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      }
      geo.attributes.position.needsUpdate = true;
    } };
  }
  // breath fog: soft noisy puffs that grow and fade
  function vaho({ n = 7 } = {}) {
    const grupo = new THREE.Group();
    const tex = lienzo(256, 256, (g, w, h) => {
      const img = g.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2), r = Math.sqrt(dx * dx + dy * dy);
        const nn = 0.6 * ruido(x / 18, y / 18, 3) + 0.4 * ruido(x / 7, y / 7, 4);
        const a = clamp(1 - r) ** 1.6 * (0.35 + 0.9 * nn);
        const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 235; d[i + 3] = clamp(a, 0, 1) * 255;
      }
      g.putImageData(img, 0, 0);
    }).tex;
    const items = [];
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
      grupo.add(s); items.push(s);
    }
    function actualizar(k, t) {
      items.forEach((s, i) => {
        const f = clamp(k * 1.3 - i * 0.05);
        s.position.set(-6 + f * (4 + 6 * hash(i)) , 1 + (hash(i * 2.1) - 0.5) * 4 + f * 1.5, 1 + i * 0.1);
        s.scale.setScalar(2 + f * (5 + 4 * hash(i * 3.3)));
        s.material.opacity = 0.32 * Math.sin(PI * clamp(f)) * (0.6 + 0.4 * hash(i * 5.5));
        s.material.rotation = i + t * 0.1;
      });
    }
    return { grupo, actualizar };
  }

  // ---------- diamond electrode grid (rows and columns) ----------
  function diamantes({ cols = 16, filas = 28, paso = 1, alto = 0.12, color = 0x4a4e55, contorno = null } = {}) {
    const grupo = new THREE.Group();
    const d = paso * 0.5 * 0.94;
    const geo = new THREE.ConeGeometry(d, alto, 4, 1); geo.rotateY(PI / 4); geo.translate(0, alto / 2, 0); geo.scale(1, 1, 1);
    // diamond in the XZ plane: the cone's square base rotated 45° is a rhombus with tips on the axes
    geo.rotateY(PI / 4);
    const mat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.55, roughness: 0.34, clearcoat: 0.4, flatShading: true, envMapIntensity: 0.5 });
    const celdas = [];
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      celdas.push({ x: (i - (cols - 1) / 2) * paso, z: (j - (filas - 1) / 2) * paso, tipo: "fila", i, j });
      celdas.push({ x: (i - (cols - 1) / 2 + 0.5) * paso, z: (j - (filas - 1) / 2 + 0.5) * paso, tipo: "col", i, j });
    }
    const dentro = contorno ? celdas.filter((c) => contorno(c.x, c.z)) : celdas;
    const base = new THREE.InstancedMesh(geo, mat, dentro.length);
    const luz = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), dentro.length);
    const dm = new THREE.Object3D(), negro = new THREE.Color(0, 0, 0);
    dentro.forEach((c, k) => {
      dm.position.set(c.x, 0, c.z); dm.scale.set(1, 1, 1); dm.updateMatrix(); base.setMatrixAt(k, dm.matrix);
      dm.position.y = 0.004; dm.scale.set(1.0, 1.05, 1.0); dm.updateMatrix(); luz.setMatrixAt(k, dm.matrix); luz.setColorAt(k, negro);
    });
    luz.renderOrder = 2;
    grupo.add(base, luz);
    const fondoP = new THREE.Mesh(new THREE.PlaneGeometry(cols * paso + 2, filas * paso + 2), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.8 }));
    fondoP.rotation.x = -PI / 2; fondoP.position.y = -0.01; grupo.add(fondoP);
    const val = new Float32Array(dentro.length);
    const tmpc = new THREE.Color();
    function limpiar() { val.fill(0); }
    function poner(pred, k) { dentro.forEach((c, i) => { if (pred(c)) val[i] = Math.max(val[i], k); }); }
    function aplicar(color = 0xffffff) {
      const cc = new THREE.Color(color);
      for (let i = 0; i < dentro.length; i++) luz.setColorAt(i, tmpc.copy(cc).multiplyScalar(val[i] * 0.55));
      luz.instanceColor.needsUpdate = true;
    }
    return { grupo, celdas: dentro, limpiar, poner, aplicar, base, luz, fondoP, paso };
  }

  // ---------- big dark glass cells with white bridges (macro of the crossings) ----------
  function celdas({ n = 7, lado = 4, hueco = 0.36, alto = 0.16 } = {}) {
    const grupo = new THREE.Group();
    const tr = texTrama({}); rep(tr.tex, 1, 1);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x4a4e56, map: tr.tex, metalness: 0.4, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0xffb84a, emissiveIntensity: 0, envMapIntensity: 0.95 });
    const geo = new RoundedBoxGeometry(lado, alto, lado, 3, 0.05);
    const tiles = [];
    const paso = lado + hueco;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, mat.clone());
      const x = (i - (n - 1) / 2) * paso, z = (j - (n - 1) / 2) * paso;
      m.position.set(x, alto / 2, z); grupo.add(m); tiles.push({ m, i, j, x, z });
    }
    grupo.rotation.y = PI / 4;
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(n * paso + 30, n * paso + 30), new THREE.MeshPhysicalMaterial({ color: 0x0b0c0f, roughness: 0.55, metalness: 0.4, map: rep(texRayado({ fondo: "#0d0e12", linea: "rgba(255,170,90,0.05)", paso: 4, diagonal: false }), 12, 12) }));
    suelo.rotation.x = -PI / 2; grupo.add(suelo);
    // bridges: white straps over the gaps where four cells meet, along one diagonal
    const pmat = new THREE.MeshPhysicalMaterial({ color: 0xaeb3ba, roughness: 0.55, clearcoat: 0.3, envMapIntensity: 0.45 });
    const pgeo = new RoundedBoxGeometry(hueco * 2.6, alto * 1.25, lado * 0.16, 3, 0.04);
    const puentes = [];
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
      const x = (i - (n - 1) / 2 + 0.5) * paso, z = (j - (n - 1) / 2 + 0.5) * paso;
      const p = new THREE.Mesh(pgeo, pmat); p.position.set(x, alto * 0.95, z); p.rotation.y = PI / 4; grupo.add(p);
      const g = C.brillo("255,255,255"); g.position.set(x, alto * 1.8, z); g.scale.setScalar(lado * 0.4); grupo.add(g);
      puentes.push({ p, g, x, z, i, j });
    }
    return { grupo, tiles, puentes, paso, alto };
  }

  // ---------- knitted fabric in 3D (yarn with twist), with one row of conductive thread ----------
  function tejido({ cols = 22, filas = 26, ancho = 1, alto = 1.25, fila = 12 } = {}) {
    const grupo = new THREE.Group();
    // one stitch: a V of two twisted legs (tubes) that dip back at the ends
    const leg = (s) => new THREE.CatmullRomCurve3([v3(0, -alto * 0.55, -0.12), v3(s * ancho * 0.18, -alto * 0.15, 0.12), v3(s * ancho * 0.34, alto * 0.3, 0.14), v3(s * ancho * 0.42, alto * 0.62, -0.1)]);
    const r = ancho * 0.16;
    const g1 = new THREE.TubeGeometry(leg(-1), 24, r, 12, false), g2 = new THREE.TubeGeometry(leg(1), 24, r, 12, false);
    const plyTex = lienzo(64, 256, (g, w, h) => {
      g.fillStyle = "#8a8f97"; g.fillRect(0, 0, w, h);
      for (let k = -20; k < 40; k++) { g.strokeStyle = k % 2 ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.18)"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, k * 12); g.lineTo(w, k * 12 + 26); g.stroke(); }
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${hash(i) * 0.25})`; g.fillRect(hash(i + 1) * w, hash(i + 2) * h, 1, 2); }
    }).tex;
    plyTex.wrapS = plyTex.wrapT = THREE.RepeatWrapping; plyTex.repeat.set(1, 3);
    const lanaM = new THREE.MeshPhysicalMaterial({ color: 0x8d9299, map: plyTex, roughness: 0.92, sheen: 1, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xb8c0cc) });
    const hiloM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: plyTex, roughness: 0.45, metalness: 0.1, sheen: 0.8, sheenColor: new THREE.Color(0xffffff), emissive: 0xc8ccd2, emissiveIntensity: 0.35 });
    const merged = [g1, g2];
    const n = cols * filas;
    const inst = merged.map((g) => new THREE.InstancedMesh(g, lanaM, n));
    const instH = merged.map((g) => new THREE.InstancedMesh(g, hiloM, cols));
    const dm = new THREE.Object3D();
    let k = 0;
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      dm.position.set((i - (cols - 1) / 2) * ancho, (j - (filas - 1) / 2) * alto * 0.62, 0);
      dm.rotation.set(0, 0, (hash(i * 3.1 + j) - 0.5) * 0.05); dm.updateMatrix();
      if (j === fila) { instH.forEach((m) => m.setMatrixAt(i, dm.matrix)); dm.scale.setScalar(0.0001); dm.updateMatrix(); }
      inst.forEach((m) => m.setMatrixAt(k, dm.matrix)); dm.scale.setScalar(1); k++;
    }
    grupo.add(...inst, ...instH);
    const fondo = new THREE.Mesh(new THREE.PlaneGeometry(cols * ancho + 2, filas * alto + 2), new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 1 }));
    fondo.position.z = -0.3; grupo.add(fondo);
    return { grupo, hilo: hiloM, lana: lanaM, yFila: (fila - (filas - 1) / 2) * alto * 0.62 };
  }

  // ---------- background: blue-black, vignette, fine specks ----------
  function fondo({ arriba = "#07080b", medio = "#121722", abajo = "#08090c" } = {}) {
    const bg = lienzo(1080, 1920, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, arriba); gr.addColorStop(0.55, medio); gr.addColorStop(1, abajo);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const a = 0.05 + hash(i * 3.7) * 0.22, r = 0.6 + hash(i * 5.9) * 1.3;
        g.fillStyle = `rgba(190,205,235,${a})`; g.beginPath(); g.arc(hash(i) * w, hash(i + 11) * h, r, 0, PI * 2); g.fill();
      }
      const v = g.createRadialGradient(w / 2, h * 0.55, h * 0.22, w / 2, h * 0.55, h * 0.8);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.7)");
      g.fillStyle = v; g.fillRect(0, 0, w, h);
    });
    C.scene.background = bg.tex;
    return bg.tex;
  }

  // ---------- shots: a new framing every 2-3 s, joined by transitions (3 Nov: no dry cuts) ----------
  // Like @speedy_devv: inside the same set the camera glides from one framing to the next; between sets the old
  // shot fades into the new one while both keep moving. entrada: "corte" on a shot keeps the old dry cut.
  function planos(lista, sets, { deslizar = 0.7, fundido = 0.35 } = {}) {
    const L = lista.map((p) => ({ ...p, t0: C.cuando(p.desde) + (p.mas || 0) })).sort((a, b) => a.t0 - b.t0);
    L.forEach((p, i) => (p.t1 = i < L.length - 1 ? L[i + 1].t0 : C.D + 0.001));
    L.forEach((p, i) => {
      const prev = L[i - 1];
      p._entrada = !prev ? "corte" : p.entrada || (prev.set === p.set ? "deslizar" : "fundido");
      const tt = p.transicion ?? (p._entrada === "deslizar" ? deslizar : fundido);
      // at most half of this shot and most of the previous one
      p._tt = p._entrada === "corte" ? 0 : Math.min(tt, (p.t1 - p.t0) * 0.5, (prev.t1 - prev.t0) * 0.8);
    });
    const bokeh = C.composer.passes.find((x) => x.uniforms && x.uniforms.aperture);
    const curvas = { lineal: (k) => k, suave: (k) => 0.5 - 0.5 * Math.cos(PI * k), entra: (k) => 1 - (1 - k) * (1 - k), sale: (k) => k * k, rapido: (k) => 1 - Math.pow(1 - k, 4) };
    // camera of shot p at time t: its slow drift from `de` to `a`
    function pose(p, t) {
      const dur = Math.max(0.001, p.t1 - p.t0);
      const k = clamp((t - p.t0) / dur);
      const kk = (curvas[p.curva] || curvas.lineal)(k);
      const de = p.de, a = p.a || p.de;
      const c = (sets[p.set] && sets[p.set].centro) || v3(0, 0, 0);
      const pp = de.p.clone().lerp(a.p, kk).add(c), q = de.q.clone().lerp(a.q, kk).add(c);
      const fov = lerp(de.fov ?? p.fov ?? 30, a.fov ?? p.fov ?? 30, kk);
      return { k, kk, local: t - p.t0, dur, p: pp, q, fov, foco: p.foco ?? pp.distanceTo(q), apertura: p.apertura ?? 0 };
    }
    // glide between two framings: the aim slides, the camera turns around it (never straight through the object)
    // and the framed height changes smoothly even when the lens changes
    const giro = new THREE.Quaternion(), parte = new THREE.Quaternion();
    function entre(A, B, m) {
      const q = A.q.clone().lerp(B.q, m);
      const oa = A.p.clone().sub(A.q), ob = B.p.clone().sub(B.q);
      const ha = oa.length() * Math.tan((A.fov * PI) / 360), hb = ob.length() * Math.tan((B.fov * PI) / 360);
      const fov = lerp(A.fov, B.fov, m), d = lerp(ha, hb, m) / Math.tan((fov * PI) / 360);
      giro.setFromUnitVectors(oa.normalize(), ob.normalize());
      parte.identity().slerp(giro, m);
      return { p: oa.applyQuaternion(parte).multiplyScalar(d).add(q), q, fov, foco: lerp(A.foco, B.foco, m), apertura: lerp(A.apertura, B.apertura, m) };
    }
    function en(t) {
      let i = 0; while (i < L.length - 1 && t >= L[i + 1].t0) i++;
      const p = L[i], e = { i, plano: p, id: p.id, set: p.set, ...pose(p, t) };
      if (p._tt > 0 && t < p.t0 + p._tt) {
        // the previous shot stays on top and fades out; in a glide both are seen from the moving camera, so a change
        // of state (an object cut open, a light, a label) dissolves instead of popping in the middle of the move
        const m = curvas.suave(clamp((t - p.t0) / p._tt));
        e.fundido = { i: i - 1, k: m };
        if (p._entrada === "deslizar") { Object.assign(e, entre(pose(L[i - 1], t), e, m)); e.fundido.camara = true; }
      }
      return e;
    }
    function colocar(e) {
      for (const s in sets) if (sets[s].grupo) sets[s].grupo.visible = s === e.set;
      C.camera.fov = e.fov; C.camera.updateProjectionMatrix();
      C.mirar({ p: e.p, q: e.q });
      if (bokeh) {
        bokeh.uniforms.focus.value = e.foco;
        bokeh.uniforms.aperture.value = e.apertura;
        bokeh.enabled = e.apertura > 0;
      }
      return e;
    }
    // places the camera only, without the fade (a change of set shows as a dry cut): use pintar
    const aplicar = (t) => colocar(en(t));
    // the previous shot during a cross-fade: a 2D copy of the WebGL canvas right above it, fading out
    let capa = null;
    if (L.some((p) => p._tt > 0)) {
      const gl = C.renderer.domElement;
      capa = document.createElement("canvas");
      capa.id = "gl-fundido"; capa.width = gl.width; capa.height = gl.height;
      capa.style.cssText = `position:absolute;left:0;top:0;width:${C.W}px;height:${C.H}px;pointer-events:none;opacity:0`;
      gl.insertAdjacentElement("afterend", capa);
    }
    // the whole frame at t: dibujar(t, e) draws everything but the camera (3D objects, overlays and C.pintar).
    // During a cross-fade it draws the previous shot first and keeps it on top, fading out.
    function pintar(t, dibujar) {
      const e = en(t);
      if (e.fundido && capa) {
        const p = L[e.fundido.i], ea = { i: e.fundido.i, plano: p, id: p.id, set: p.set, ...pose(p, t) };
        if (e.fundido.camara) Object.assign(ea, { p: e.p, q: e.q, fov: e.fov, foco: e.foco, apertura: e.apertura });
        colocar(ea); dibujar(t, ea);
        const g = capa.getContext("2d");
        g.clearRect(0, 0, capa.width, capa.height);
        g.drawImage(C.renderer.domElement, 0, 0, capa.width, capa.height);
        capa.style.opacity = 1 - e.fundido.k;
      } else if (capa) capa.style.opacity = 0;
      colocar(e); dibujar(t, e);
      return e;
    }
    return { lista: L, en, aplicar, pintar };
  }

  // ---------- (added 3 Nov, 07-microondas) glowing ribbons along any path: waves, bouncing rays, flows ----------
  // Same shader as the arcs. poner(i, f, { peso, fase }) fills strand i with f(u, out) for u from 0 to 1 (f returns a
  // Vector3); peso is a number or a function of u (0 hides that stretch); tiempo(t) moves the light along the strands.
  function cinta({ hebras = 1, puntos = 64, ancho = 0.02, minPx = 1.6, color = 0xffb22e, intensidad = 0.85, ondas = 2.2, vel = 0.45, oscuro = false } = {}) {
    const N = hebras, M = puntos, NV = N * M * 2;
    const pos = new Float32Array(NV * 3), sig = new Float32Array(NV * 3), lado = new Float32Array(NV), uu = new Float32Array(NV), sem = new Float32Array(NV), pes = new Float32Array(NV);
    const idx = new Uint32Array(N * (M - 1) * 6);
    let q = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const v = (i * M + j) * 2;
      lado[v] = -1; lado[v + 1] = 1; uu[v] = uu[v + 1] = j / (M - 1);
      if (j < M - 1) { idx[q++] = v; idx[q++] = v + 1; idx[q++] = v + 2; idx[q++] = v + 1; idx[q++] = v + 3; idx[q++] = v + 2; }
    }
    const geo = new THREE.BufferGeometry();
    const aPos = new THREE.BufferAttribute(pos, 3), aSig = new THREE.BufferAttribute(sig, 3), aPes = new THREE.BufferAttribute(pes, 1), aSem = new THREE.BufferAttribute(sem, 1);
    for (const a of [aPos, aSig, aPes, aSem]) a.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", aPos); geo.setAttribute("sig", aSig); geo.setAttribute("lado", new THREE.BufferAttribute(lado, 1));
    geo.setAttribute("u", new THREE.BufferAttribute(uu, 1)); geo.setAttribute("semilla", aSem); geo.setAttribute("peso", aPes);
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { resol: { value: new THREE.Vector2(C.W * 2, C.H * 2) }, ancho: { value: ancho }, minPx: { value: minPx }, color: { value: new THREE.Color(color) }, tiempo: { value: 0 }, ondas: { value: ondas }, vel: { value: vel }, intensidad: { value: intensidad }, oscuro: { value: oscuro ? 1 : 0 } },
      vertexShader: ARCO_VS, fragmentShader: ARCO_FS, transparent: true, depthWrite: false,
      blending: oscuro ? THREE.NormalBlending : THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    const malla = new THREE.Mesh(geo, mat); malla.frustumCulled = false;
    const P = new Float32Array(M * 3), tmp = new THREE.Vector3();
    function poner(i, f, { peso = 1, fase = 0 } = {}) {
      if (i < 0 || i >= N) return;
      for (let j = 0; j < M; j++) { const r = f(j / (M - 1), tmp) || tmp; P[j * 3] = r.x; P[j * 3 + 1] = r.y; P[j * 3 + 2] = r.z; }
      for (let j = 0; j < M; j++) {
        const v = (i * M + j) * 2, u = j / (M - 1);
        const jn = j < M - 1 ? j + 1 : j - 1, sg = j < M - 1 ? 1 : -1;
        const px = P[j * 3], py = P[j * 3 + 1], pz = P[j * 3 + 2];
        const sx = px + sg * (P[jn * 3] - px), sy = py + sg * (P[jn * 3 + 1] - py), sz = pz + sg * (P[jn * 3 + 2] - pz);
        const w = typeof peso === "function" ? peso(u) : peso;
        for (let k = 0; k < 2; k++) {
          pos[(v + k) * 3] = px; pos[(v + k) * 3 + 1] = py; pos[(v + k) * 3 + 2] = pz;
          sig[(v + k) * 3] = sx; sig[(v + k) * 3 + 1] = sy; sig[(v + k) * 3 + 2] = sz;
          pes[v + k] = w; sem[v + k] = fase;
        }
      }
      aPos.needsUpdate = true; aSig.needsUpdate = true; aPes.needsUpdate = true; aSem.needsUpdate = true;
    }
    // hides strand i (weight 0)
    function apagar(i) { for (let j = 0; j < M * 2; j++) pes[i * M * 2 + j] = 0; aPes.needsUpdate = true; }
    return { malla, material: mat, poner, apagar, hebras: N, tiempo(t) { mat.uniforms.tiempo.value = t; } };
  }
  // (added 3 Nov, 07-microondas) perforated sheet for an alphaMap: white = metal, black = round hole, staggered rows
  // (a microwave door's mesh, a speaker grille, a vent); repeat it with rep()
  function texPerforada({ cols = 16, filas = 16, radio = 0.32, w = 512, h = 512, escalonada = true } = {}) {
    return lienzo(w, h, (g) => {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#000";
      const cw = w / cols, rh = h / filas;
      for (let r = -1; r <= filas; r++) for (let c = -1; c <= cols; c++) {
        g.beginPath(); g.arc((c + 0.5 + (escalonada && ((r + 2) % 2) ? 0.5 : 0)) * cw, (r + 0.5) * rh, radio * cw, 0, PI * 2); g.fill();
      }
    }, false).tex;
  }

  return {
    lienzo, ruido, normalDesde, rep,
    tex: { lana: texLana, metal: texMetal, rayado: texRayado, cristal: texCristal, trama: texTrama, perforada: texPerforada },
    mat: { piel: matPiel, unya: matUnya, lana: matLana, cristal: matCristal, oro: matOro, titanio: matTitanio, negro: matNegro, plastico: matPlastico },
    superficie, dedo, boli, movil, manoGuante, manoSenala, capsula,
    arcos, cifras, corte, iones, motas, particulas, vaho, diamantes, celdas, tejido, fondo, planos, cinta,
  };
}
