// Base común de los objetos de la biblioteca (Las cosas por dentro). Cada módulo de objeto devuelve una
// "definición" y envolver() la convierte en un objeto que entienden las plantillas (plantillas.js):
//
//   def = {
//     grupo,                       el Object3D del objeto (en unidades de su escena; 1 unidad = 1 cm en los de cocina)
//     partes: { nombre: { obj, local: [x, y, z], radio } },   puntos con nombre (etiquetas, cámaras, flujos)
//     exterior: [Object3D],        lo que se desvanece con rayosX (carcasa, puerta…); sus bordes quedan en línea fina
//     semi: [[Object3D, minimo]],  lo que solo se aclara con rayosX hasta `minimo` de opacidad (una cavidad)
//     interior: [Object3D],        lo que solo se ve con rayosX > 0 (componentes ocultos)
//     ocultos: [Object3D],         lo que desaparece en cuanto empieza rayosX (rellenos como la espuma, que si
//                                  se desvanecieran a la vez que la carcasa se verían por encima de ella)
//     cortables: [Object3D],       lo que corta el plano de corte (por defecto, todo el grupo)
//     controles: { nombre: (valor, t) => {} },  mandos del objeto (puerta, giro, luz…); valor numérico o texto
//     defecto: { nombre: valor },  valor de cada mando al empezar cada fotograma
//     actualizar(t),               animación propia en cada fotograma (ventilador, electrones…)
//     curvas: { nombre: { obj, puntos: [Vector3 locales de obj] } }  recorridos de tubos (los flujos los siguen)
//   Ojo: los materiales de M (materiales.js) se copian por objeto al cortar o desvanecer; los que crea el propio
//   módulo se cambian en el sitio, así que sus mandos pueden tocarlos. Un mando no debe tocar un material de
//   "exterior" (ese sí se copia para rayosX).
//   }
//
// El objeto que sale de envolver() tiene: id, tipo, grupo, partes, mandos(), poner(nombre, v, t), reiniciar(t),
// rayosX(k), cortar(k, { eje, en, signo } o { plano }), resaltar(nombre, k), punto(nombre) (posición en el mundo), radio(nombre),
// actualizar(t). Las partes se registran en el motor como "<id>.<parte>" y, si el nombre está libre, también
// como "<parte>", para que las etiquetas de la escena (pieza: "compresor") las encuentren.

const REGISTRADAS = new Set();

export function crearBase(THREE, C, X, M = {}) {
  const { v3, clamp } = C;
  // library materials are shared by every object of the video: an object that cuts or fades gets its own copy;
  // a material made inside the object's module is changed in place (so its controls keep working)
  const COMPARTIDOS = new Set(Object.values(M).filter((m) => m && m.isMaterial));
  const lineaRX = () => new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });

  function envolver(def, { id, tipo }) {
    const grupo = def.grupo;
    const partes = {};
    for (const [nombre, p] of Object.entries(def.partes || {})) {
      const local = Array.isArray(p.local) ? v3(...p.local) : p.local ? p.local.clone() : v3(0, 0, 0);
      let radio = p.radio;
      if (radio === undefined) {
        const b = new THREE.Box3().setFromObject(p.obj);
        radio = b.isEmpty() ? 1 : b.getBoundingSphere(new THREE.Sphere()).radius;
      }
      partes[nombre] = { obj: p.obj, local, radio };
      C.pieza(`${id}.${nombre}`, p.obj, local);
      if (!REGISTRADAS.has(nombre)) { REGISTRADAS.add(nombre); C.pieza(nombre, p.obj, local); }
    }
    // the whole object as a part too
    { const b = new THREE.Box3().setFromObject(grupo); const s = b.getBoundingSphere(new THREE.Sphere()); partes._todo = { obj: grupo, local: grupo.worldToLocal(s.center.clone()), radio: s.radius }; }

    // ---- x-ray: each exterior material is copied once, then faded ----
    const fundidos = [];
    const linea = lineaRX();
    const copias = new Map(), propios = new Set();
    const copia = (o, minimo) => o.traverse((m) => {
      if (!m.isMesh || m.isLineSegments) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const nuevos = mats.map((mt) => {
        if (propios.has(mt)) return mt;
        let c = copias.get(mt);
        if (!c) { c = mt.clone(); c.userData.op0 = mt.opacity; c.userData.tr0 = mt.transparent; c.userData.dw0 = mt.depthWrite; copias.set(mt, c); propios.add(c); fundidos.push({ c, minimo }); }
        return c;
      });
      m.material = Array.isArray(m.material) ? nuevos : nuevos[0];
      // its edges as a thin line that stays in x-ray (child of the mesh, so it follows a door that opens)
      if (minimo === 0 && m.geometry && !m.isInstancedMesh && !m.userData.sinBordes) {
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 35), linea);
        e.userData.noCortar = true; m.add(e); bordesL.push(e);
      }
    });
    const bordesL = [];
    for (const o of def.exterior || []) copia(o, 0);
    for (const [o, minimo] of def.semi || []) copia(o, minimo);
    const interior = def.interior || [];
    let kRX = -1;
    function rayosX(k) {
      k = clamp(k);
      if (k === kRX) return; kRX = k;
      for (const { c, minimo } of fundidos) {
        const op = c.userData.op0 * (1 - k * (1 - minimo));
        c.transparent = c.userData.tr0 || k > 0.001; c.opacity = op; c.depthWrite = k < 0.001 ? c.userData.dw0 : false;
      }
      linea.opacity = 0.42 * k;
      for (const e of bordesL) e.visible = k > 0.01;
      for (const o of interior) o.visible = k > 0.01;
      for (const o of def.ocultos || []) o.visible = k < 0.01;
    }

    // ---- cutaway: one clipping plane per object, always attached (no shader recompiles mid-video) ----
    const plano = new THREE.Plane(v3(0, 0, -1), 1e5);
    const cortables = def.cortables || [grupo];
    const yaCortado = new Set(), copiasC = new Map();
    for (const o of cortables) o.traverse((m) => {
      if (!m.isMesh || m.userData.noCortar || yaCortado.has(m)) return; yaCortado.add(m);
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const nuevos = mats.map((mt) => {
        // the object's own materials (and its x-ray copies) are cut in place; shared ones get a copy per object
        let c = mt;
        if (!propios.has(mt) && COMPARTIDOS.has(mt)) { c = copiasC.get(mt); if (!c) { c = mt.clone(); copiasC.set(mt, c); propios.add(c); } }
        c.clippingPlanes = [plano]; if (!c.isShaderMaterial) c.side = THREE.DoubleSide; return c;
      });
      m.material = Array.isArray(m.material) ? nuevos : nuevos[0];
    });
    const EJES = { x: v3(1, 0, 0), y: v3(0, 1, 0), z: v3(0, 0, 1) };
    // k > 0 cuts away everything on the + side of `eje` beyond `en` (object-local units); k = 0 cuts nothing
    // (or, with { plano }, by that world plane: the same cut for every object of a set)
    function cortar(k, { eje = "z", en = 0, signo = 1, plano: otro = null } = {}) {
      if (!(k > 0)) { plano.set(v3(0, 0, -1), 1e5); return; }
      if (otro) { plano.copy(otro); return; }
      grupo.updateWorldMatrix(true, false);
      const n = EJES[eje].clone().multiplyScalar(signo).transformDirection(grupo.matrixWorld);
      const p = grupo.localToWorld(EJES[eje].clone().multiplyScalar(en * signo));
      plano.setFromNormalAndCoplanarPoint(n.negate(), p);
    }

    // ---- glow on a part (a soft sprite at the part's point) ----
    const halos = {};
    function resaltar(nombre, k, rgb) {
      const P = partes[nombre]; if (!P) return;
      rgb = rgb || "255,190,90";
      const clave = nombre + "|" + rgb;
      for (const [k2, h2] of Object.entries(halos)) if (k2.startsWith(nombre + "|") && k2 !== clave) h2.visible = false;
      let h = halos[clave];
      if (!h) { h = C.brillo(rgb); h.scale.setScalar(P.radio * 2.6); P.obj.add(h); h.position.copy(P.local); halos[clave] = h; }
      h.material.opacity = clamp(k);
      h.visible = k > 0.001;
    }

    const controles = def.controles || {}, defecto = def.defecto || {};
    const api = {
      id, tipo, grupo, partes, def, plano,
      mandos: () => Object.keys(controles),
      poner(nombre, v, t) { if (nombre === "rayosX") rayosX(v); else if (controles[nombre]) controles[nombre](v, t); },
      reiniciar(t) {
        rayosX(0); cortar(0);
        for (const h of Object.values(halos)) { h.material.opacity = 0; h.visible = false; }
        for (const [k, v] of Object.entries(defecto)) if (controles[k]) controles[k](v, t);
      },
      rayosX, cortar, resaltar,
      // a tube's path as world points (def.curvas: { nombre: { obj, puntos } }), for flows along real pipes
      curva(nombre) { const c = (def.curvas || {})[nombre]; if (!c) return null; c.obj.updateWorldMatrix(true, false); return c.puntos.map((p) => c.obj.localToWorld(p.clone())); },
      curvas: () => Object.keys(def.curvas || {}),
      punto(nombre = "_todo", out = new THREE.Vector3()) { const P = partes[nombre] || partes._todo; return P.obj.localToWorld(out.copy(P.local)); },
      radio(nombre = "_todo") { return (partes[nombre] || partes._todo).radio; },
      actualizar(t) { if (def.actualizar) def.actualizar(t); },
    };
    rayosX(0);
    return api;
  }
  return { envolver };
}
