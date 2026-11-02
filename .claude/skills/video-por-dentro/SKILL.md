---
name: video-por-dentro
description: Hacer vídeos verticales cortos de "cómo funciona por dentro" con el estilo del trackpad del Mac (3D oscuro, objeto abierto, dedo, subtítulos con palabra seleccionada) usando HyperFrames, three.js y la voz de Gemini TTS.
---

# Vídeos "por dentro" (estilo trackpad del Mac)

Esta skill hace vídeos verticales que explican cómo funciona por dentro un objeto de cada día (tarjeta, móvil, portátil, coche…). Cada vídeo es una página web con una escena 3D que HyperFrames graba fotograma a fotograma. La voz y los efectos de sonido se generan con código. No hay grabación ni edición a mano.

El ejemplo completo que funciona es la carpeta `fabrica-prueba` de Javier:
- `render/index.html`: la plantilla de la tarjeta.
- `voces/voz_gemini.py`: la voz.
- `exports/`: todo lo que se genera.

También hay una copia en el proyecto "Side hustle" de claude.ai, en `claude/estilo-por-dentro/`. Empieza siempre desde ahí. Si no tienes acceso a ninguno de los dos, reconstrúyelo con los fragmentos del final de esta skill.

## 1. Cómo tiene que verse

- **Formato:** vertical, 1080×1920 y 30 fps. Para cobrar en TikTok, el vídeo tiene que durar más de 60 segundos.
- **Fondo:** casi negro arriba y una mesa de madera oscura y cálida abajo.
- **Luz:** una luz cálida desde arriba a la izquierda, un contraluz frío detrás y reflejos suaves.
- **Objeto:** uno solo y grande, que se abre por dentro, por capas o con vista de rayos X. La pieza clave es de cobre u oro y se ilumina cuando la voz la nombra.
- **Lo invisible** (campos, corriente, calor) se dibuja en ámbar con brillo suave. Nada de colores chillones.
- **Dedo:** entra desde un borde del encuadre y toca o empuja el objeto en los momentos clave. Nunca pasa entre la cámara y el objeto.
- **Subtítulos:** arriba, palabra a palabra.
  - Las palabras ya dichas van en gris y la actual en blanco.
  - La palabra clave de cada frase lleva una caja de selección azul con dos tiradores, como el texto seleccionado en un Mac.
  - Algunas palabras llevan delante un icono SVG pequeño, por ejemplo una pila o un rayo.
- **Etiquetas:** en mayúsculas, con una línea fina que va hasta la pieza. Por ejemplo: "ANTENA DE COBRE" o "CHIP".
- **Notas honestas:** pequeñas, abajo a la izquierda. Por ejemplo: "Ilustración ampliada", "Campo mostrado en ámbar, invisible a la vista" o "Valores ilustrativos".
- **Final:** el resultado se ve en pantalla (por ejemplo, "Pagado" con un check). En los vídeos largos, cierra con una invitación a compartir: "Mándaselo a alguien que…".

## 2. Receta del guion

1. **Gancho de 0 a 2 segundos:** una frase que choca sobre algo que todos usan. Por ejemplo: "Tu tarjeta no tiene batería."
2. **La pregunta:** "Entonces, ¿de dónde saca la energía para pagar?"
3. **"Dentro hay…":** aquí se abre el objeto.
4. **Cómo funciona:** de 3 a 5 pasos, con una idea por plano y un cambio en pantalla cada 2 o 3 segundos.
5. **El dato final y el cierre.**

Reglas del guion:
- Cada frase tiene una sola palabra clave.
- Escribe los números con letras en el texto de la voz.
- Cada dato tiene que estar comprobado con una fuente. Si es aproximado, pon la nota "Valores ilustrativos".
- No copies temas ni guiones de otras cuentas.
- Sin logos de marcas como protagonistas y sin caricaturas de personas reales.

## 3. Pasos de producción

1. **Guion.** Escribe las frases en `voces/guion.json` y apunta aparte la palabra clave de cada frase.
2. **Voz.** Usa Gemini TTS desde Google AI Studio, con `voces/voz_gemini.py`.
   - Voz `es-es-concierge-12` (27 años, castellano), más la instrucción de estilo de la variable `ESTILO`: chico joven de Madrid, acento castellano claro, tono cercano y ritmo ágil.
   - La clave va en la variable `GEMINI_API_KEY`. Tiene que ser de un proyecto personal de AI Studio **sin facturación**, para usar el plan gratis. Si da el error 429, espera un minuto y repite.
   - Lee el guion entero de una vez, no frase a frase: así suena más natural.
   - Descartadas: Kokoro (suena con acento inglés), Chatterbox v2 (suena mal) y Google Chirp 3 HD (suena a IA y algo latinoamericana).
3. **Tiempos de cada palabra.** Transcribe el audio con la transcripción de HyperFrames (`npx hyperframes transcribe`, en español). Sale un `transcript.json` con el inicio y el final de cada palabra.
   - Revisa las palabras pegadas a la puntuación (por ejemplo, "entonces¿de") comparándolas con el guion.
   - Después conviértelo al formato de `vozdata` de la plantilla: frases con palabras `{w, s, e, key}`, en el orden del guion y marcando la palabra clave.
4. **Sonido.** `sonido.py` crea los efectos con numpy, colocados en el segundo exacto de cada momento: toque, deslizamiento, apertura, zumbido, corriente, encendido y campanilla. Añade también un fondo grave muy bajo y lo mezcla todo con la voz de Gemini en `render/assets/mezcla.wav` (`render/sonido.py`).
   - Los tiempos de los efectos tienen que coincidir con las constantes `T_*` de la escena.
5. **Proyecto.** Crea el proyecto con:
   `npx hyperframes init <nombre> --example blank --resolution portrait --non-interactive --skip-skills`
   - Instala `three@0.170.0` y `gsap` con npm y copia a `lib/` estos archivos: `three.module.js`, la carpeta `examples/jsm` (renombrada como `addons`) y `gsap.min.js`. No uses CDN.
   - Copia la plantilla como `index.html`.
   - Pega el resultado del paso 3 (frases con sus palabras y tiempos) dentro de `<script id="vozdata">`.
   - Ajusta `data-duration` (en todos los elementos) al total del vídeo.
6. **Escena.** Cambia solo estas partes de la plantilla:
   - El objeto: su geometría, sus materiales y las piezas internas.
   - Las constantes de la historia (`T_*`, `C0`/`C1`/`C2`).
   - La cámara (`CAM`).
   - Dónde se cortan los subtítulos (`BREAKS`) y qué palabras llevan icono (`ICON_FOR`).
   - Las etiquetas, las notas y la pantalla final.
7. **Revisión.** Saca entre 6 y 8 fotogramas, mira la hoja de contacto y corrige. Repite hasta que se lean bien.
   `npx hyperframes snapshot --at 1,4,7,11,15,19 --no-end -o snaps`
8. **Render.** Hazlo siempre en la Terminal del Mac, con la gráfica, y guarda el resultado en `exports/render/`:
   `npx -y hyperframes@0.8.228 render --browser-gpu -o ../exports/render/salida.mp4`
   - En el MacBook Pro M5 sale a 0,035 segundos por fotograma: el vídeo tarda en hacerse lo mismo que dura.
   - Si sale el error "Chrome not found", exporta `HYPERFRAMES_BROWSER_PATH` con la ruta de un Chromium o de `chrome-headless-shell` que ya esté instalado.
   - Para confirmar que usa la gráfica, busca `--use-angle=metal` en lo que imprime. Si pone `swiftshader`, está dibujando con el procesador.
   - No midas la velocidad con un trozo (`--start`/`--end`): ese modo siempre dibuja con el procesador y sale unas 20 veces más lento. Como el render completo es rápido, para arreglar algo repite el vídeo entero.

## 4. Lecciones que ya costaron errores

- **Contrato de HyperFrames:**
  - Todo elemento con tiempo lleva `class="clip"`, `data-start` y `data-duration`.
  - La raíz registra una línea de tiempo de GSAP en pausa: `window.__timelines["main"]`.
  - Todo se calcula a partir del tiempo `t`.
  - Prohibido `Math.random` (usa `hash(i)`), `fetch` (mete los datos dentro del HTML) y las librerías desde un CDN.
- **3D:** dibuja dentro del evento `hf-seek`. Registra la promesa `window.__hf.buildReady.<clave>` en un script normal, antes del módulo, y resuélvela cuando la escena esté construida.
- **Encuadre vertical:** el ancho visible es muy poco (con 30° de campo vertical, el horizontal es de unos 17°).
  - Pon los objetos largos a lo largo de la profundidad.
  - Aleja la cámara antes de recortar.
- **Piezas internas:** tienen que quedar dentro de la carcasa. Si no, se ven con el objeto cerrado. Por ejemplo, la bobina de la tarjeta asomaba por encima.
- **Corte por capas:** sube la capa de arriba y hazla translúcida (opacidad de 0,15 a 0,3), con un emisivo gris suave y poco clearcoat. Ningún objeto grande debe tapar la vista.
- **Dedo:** se construye con un perfil de torno, aplastado a 0,84 en profundidad, con piel `0xd9ad98`, rugosidad 0,62 y brillo suave tipo terciopelo. La uña es una esfera aplastada.
  - Colócalo con `placeFinger(contacto, dirección, distancia)`.
  - Haz que entre por el borde cuando la cámara ya esté quieta.
- **Subtítulos:** el texto y los iconos necesitan `position: relative` y un `z-index` por encima de la caja de selección. Si no, la caja los tapa.
- **Etiquetas:** proyecta el punto 3D a la pantalla en cada fotograma y pon el texto en el lado donde haya sitio.
- **Texto dentro del 3D:** escríbelo con Inter 400 o 700, que son los únicos pesos incluidos.
- **Velocidad:** en la nube, sin gráfica, sale a unos 6 segundos por fotograma, así que 21 segundos de vídeo tardan una hora. Renderiza siempre en el Mac, con `--browser-gpu`.
- **HeyGen:** no inicies sesión. Usa solo las herramientas ya elegidas, que son gratis.

## 5. Lo que falta para igualar el vídeo de referencia

- Un dedo más realista: textura de piel, huella y una sombra de contacto suave.
- Más detalle en los objetos: texturas, tornillos, grabados y bordes con brillo.
- Más planos de detalle cortos, con movimientos de cámara rápidos y paradas claras.
- Vídeos de más de 60 segundos: la tarjeta, ya con la voz de Gemini, dura 21,2.

Para pasar una plantilla a una voz nueva sin rehacer la escena, lleva cada tiempo de la escena (las constantes `T_*`, la cámara, las etiquetas y las notas) al punto equivalente entre las mismas palabras de la voz nueva. Los efectos de `sonido.py` usan las mismas constantes `T_*`.

## 6. Fragmentos clave (por si no tienes la plantilla)

Arranque de la escena:

```html
<script>
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady.escena = new Promise((r) => (window.__escenaReady = r));
  const tl = gsap.timeline({ paused: true }); tl.to({}, { duration: DURACION }, 0);
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
</script>
<script type="module">
  // ... construir escena ...
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  await document.fonts.ready; renderAt(0); window.__escenaReady();
</script>
```

Cámara por puntos clave:

```js
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function camAt(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++;
  const a = CAM[i], b = CAM[i + 1], k = ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  return { p: a.p.clone().lerp(b.p, k), q: a.q.clone().lerp(b.q, k) };
}
```

Dedo:

```js
const prof = [];
for (let i = 0; i <= 16; i++) { const a = (i / 16) * (Math.PI / 2); prof.push(new THREE.Vector2(0.82 * Math.sin(a) + 1e-4, 0.82 * (1 - Math.cos(a)))); }
prof.push(new THREE.Vector2(0.86, 1.8), new THREE.Vector2(0.88, 3.0), new THREE.Vector2(0.93, 3.4), new THREE.Vector2(0.92, 4.4), new THREE.Vector2(0.97, 7), new THREE.Vector2(1.02, 12));
const fGeo = new THREE.LatheGeometry(prof, 64); fGeo.scale(1, 1, 0.84);
const skin = new THREE.MeshPhysicalMaterial({ color: 0xd9ad98, roughness: 0.62, sheen: 0.45, sheenRoughness: 0.7, sheenColor: new THREE.Color(0xffd2bd), clearcoat: 0.08, clearcoatRoughness: 0.7, emissive: 0x3a1408, emissiveIntensity: 0.18 });
// uña: SphereGeometry(1) con escala (0.5, 0.78, 0.085), posición (0, 1.12, 0.61)
function placeFinger(contact, dir, away) {
  const UP = new THREE.Vector3(0, 1, 0), d = dir.clone().normalize();
  const z = UP.clone().sub(d.clone().multiplyScalar(d.dot(UP))).normalize();
  const x = new THREE.Vector3().crossVectors(d, z).normalize();
  finger.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, d, z));
  finger.position.copy(contact.clone().add(UP.clone().multiplyScalar(0.72)).sub(d.clone().multiplyScalar(0.8)).add(d.clone().multiplyScalar(away)));
}
```

Subtítulos con caja de selección (CSS):

```css
#caps { position: absolute; left: 90px; right: 90px; top: 196px; display: flex; justify-content: center; text-align: center; }
#caps .line { font-size: 68px; line-height: 1.18; font-weight: 700; letter-spacing: -0.02em; color: rgba(255,255,255,0.42); }
#caps .w { display: inline-block; margin: 0 0.12em; opacity: 0; position: relative; white-space: nowrap; }
#caps .w.now, #caps .w.key { color: #fff; }
#caps .w .txt, #caps .w svg.ico { position: relative; z-index: 1; }
#caps .w .box { position: absolute; left: -10px; right: -10px; top: 2px; bottom: -2px; border-radius: 6px; background: #16305f; border: 3px solid #3d7bf0; opacity: 0; }
#caps .w .h1, #caps .w .h2 { position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #3d7bf0; border: 2px solid #fff; opacity: 0; z-index: 2; }
#caps .w .h1 { left: -18px; top: -6px; } #caps .w .h2 { right: -18px; bottom: -10px; }
```

Lógica de los subtítulos: un bloque por grupo de 1 a 4 palabras. El bloque activo es el último cuya primera palabra ya ha empezado.
- Cada palabra aparece cuando le toca: pasa de opacidad 0 a 1 y sube 10 px en 0,12 segundos.
- La última palabra dicha lleva la clase `now`.
- En las palabras clave, la caja y los tiradores aparecen en 0,14 segundos, desde el momento en que se dicen.
