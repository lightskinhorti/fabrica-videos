// Panel de la fábrica: pinta la línea de montaje y una nave por cuenta con los datos de /api/datos,
// y guarda cada cambio (aprobado, programado, día, hora, Instagram, métricas) en /api/estado.
// Las cifras que herramientas/metricas.py lee de TikTok llegan en datos.metricas; lo escrito a mano manda.

const ESTACIONES = [
  { id: "guion", nombre: "Guion", texto: "en escritura", icono: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/>' },
  { id: "voz", nombre: "Voz", texto: "esperan el montaje", icono: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>' },
  { id: "video", nombre: "Vídeo", texto: "esperan tu aprobación", icono: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>' },
  { id: "aprobado", nombre: "Aprobado", texto: "falta programarlos", icono: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>' },
  { id: "programado", nombre: "Programado", texto: "en cola para salir", icono: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>' },
  { id: "publicado", nombre: "Publicado", texto: "ya han salido", icono: '<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>' },
];
const ORDEN = ESTACIONES.map((e) => e.id);

let datos = { cuentas: [], videos: [], estado: {}, metricas: {} };
let porPanel = {};
let filtro = null;
const errores = {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icono = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const diaCorto = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });
const diaLargo = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const diaHora = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const soloHora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
const num = new Intl.NumberFormat("es-ES");

const est = (v) => datos.estado[v.id] || {};
const momento = (e) => (e.fecha && e.hora ? new Date(`${e.fecha}T${e.hora}`) : null);
function etapa(v) {
  const e = est(v);
  if (e.programado && momento(e) && momento(e) <= new Date()) return "publicado";
  if (e.programado) return "programado";
  if (e.aprobado) return "aprobado";
  if (v.video) return "video";
  if (v.voz) return "voz";
  return "guion";
}
const activos = () => datos.videos.filter((v) => !est(v).descartado);

// ---------- figures read from TikTok ----------
const escrito = (v, campo) => est(v)[campo] !== undefined && est(v)[campo] !== "";
// a figure typed in the panel wins over the one read from TikTok
function cifra(v, campo) {
  if (escrito(v, campo)) {
    const n = Number(String(est(v)[campo]).replace(/[.\s]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return porPanel[v.id]?.[campo] ?? null;
}
const mediana = (ns) => {
  const s = [...ns].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null;
};

function campoVistas(v, campo, etiqueta, horas) {
  const e = est(v);
  const m = porPanel[v.id];
  const salida = m?.publicado ? new Date(m.publicado * 1000) : e.programado ? momento(e) : null;
  let pista = "";
  if (!escrito(v, campo) && m?.[campo] != null) pista = "Leído de TikTok";
  else if (!escrito(v, campo) && salida) {
    const cuando = new Date(salida.getTime() + horas * 3600000);
    pista = cuando > new Date() ? `Se rellena solo el ${diaHora.format(cuando)}` : "No se leyó a tiempo: apúntalo de TikTok Studio";
  }
  const valor = escrito(v, campo) ? e[campo] : m?.[campo] ?? "";
  return `<label>${etiqueta}<input inputmode="numeric" data-campo="${campo}" value="${esc(valor)}">${pista ? `<span class="pista">${pista}</span>` : ""}</label>`;
}

function marcador(c) {
  const mc = datos.metricas?.cuentas?.[c.id];
  if (!mc) return "";
  if (!mc.leido) return `<p class="lectura mal">No se ha podido leer TikTok: ${esc(mc.error)}</p>`;
  const suyos = Object.values(datos.metricas.videos || {}).filter((m) => m.cuenta === c.id);
  const total = suyos.reduce((s, m) => s + (m.vistas || 0), 0);
  const med = mediana(datos.videos.filter((v) => v.cuenta === c.id).map((v) => cifra(v, "v24")).filter((n) => n != null));
  const mejor = Math.max(0, ...suyos.map((m) => m.vistas || 0));
  const porMil = total ? ((mc.seguidores / total) * 1000).toFixed(1).replace(".", ",") : null;
  const dato = (valor, texto) => `<div><span class="marcador-cifra${valor == null ? " sin" : ""}">${valor ?? "Aún no"}</span><span class="marcador-texto">${texto}</span></div>`;
  const leido = new Date(mc.leido * 1000);
  const hoy = leido.toDateString() === new Date().toDateString();
  const viejo = Date.now() - leido > 6 * 3600000;
  return `<div class="marcador">
      ${dato(num.format(mc.seguidores ?? 0), "seguidores")}
      ${dato(med == null ? null : num.format(Math.round(med)), "mediana a las 24 h")}
      ${dato(porMil, "seguidores por cada 1.000 visualizaciones")}
      ${dato(num.format(mejor), "visualizaciones del mejor vídeo")}
    </div>
    <p class="lectura${mc.error ? " mal" : viejo ? " vieja" : ""}">${mc.error ? `Última lectura fallida: ${esc(mc.error)}. ` : ""}Cifras de TikTok leídas ${hoy ? `a las ${soloHora.format(leido)}` : `el ${diaHora.format(leido)}`}</p>`;
}

// ---------- saving ----------
let avisoTimer;
async function guardar(v, cambios) {
  const r = await fetch("/api/estado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id, cambios }) });
  if (!r.ok) {
    $("guardado").textContent = "No se ha podido guardar";
    return;
  }
  datos.estado[v.id] = await r.json();
  $("guardado").textContent = `Guardado: ${v.slug}`;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => ($("guardado").textContent = ""), 2500);
  pintar();
}

// ---------- the assembly line ----------
function pintarEstaciones() {
  const lista = activos();
  $("estaciones").innerHTML = ESTACIONES.map((s) => {
    const aqui = lista.filter((v) => etapa(v) === s.id);
    const pips = datos.cuentas
      .map((c) => [c, aqui.filter((v) => v.cuenta === c.id).length])
      .filter(([, n]) => n)
      .map(([c, n]) => `<span class="pip" title="${esc(c.nombre)}"><i style="background:${c.color}"></i>${n}</span>`)
      .join("");
    return `<button type="button" class="estacion" data-estacion="${s.id}" aria-pressed="${filtro === s.id}">
      <span class="estacion-nombre">${icono(s.icono)}${s.nombre}</span>
      <span class="estacion-cifra">${aqui.length}</span>
      <span class="estacion-texto">${s.texto}</span>
      <span class="pips">${pips}</span>
    </button>`;
  }).join("");
  const s = ESTACIONES.find((x) => x.id === filtro);
  $("filtro-texto").innerHTML = s
    ? `Mostrando solo: <strong>${s.nombre}</strong>. Vuelve a pulsarla para verlo todo.`
    : "Pulsa una estación para ver solo lo que hay en ella";
}

// ---------- one bay per account ----------
function reserva(c) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
  const fechas = activos()
    .filter((v) => v.cuenta === c.id && est(v).programado && est(v).fecha)
    .map((v) => new Date(`${est(v).fecha}T00:00`));
  if (!fechas.length) return { clase: "mal", texto: "Nada programado" };
  const ultima = new Date(Math.max(...fechas));
  if (ultima < manana) return { clase: "mal", texto: "Sin vídeo para mañana" };
  const dias = Math.round((ultima - hoy) / 86400000);
  return { clase: dias >= 2 ? "bien" : "justo", texto: `Programado hasta el ${diaCorto.format(ultima)}` };
}

function pieza(v, c) {
  const e = est(v);
  const paso = etapa(v);
  const n = ORDEN.indexOf(paso) + 1;
  const s = ESTACIONES.find((x) => x.id === paso);
  const dur = v.duracion ? `${String(v.duracion).replace(".", ",")} s` : "sin vídeo aún";
  const portada = v.portada ? `<img class="portada" src="${v.portada}" alt="">` : `<div class="portada" aria-hidden="true"></div>`;
  const ig = c.instagram
    ? `<label class="marca"><input type="checkbox" data-campo="instagram" ${e.instagram ? "checked" : ""}> Instagram</label>`
    : "";
  const m = porPanel[v.id];
  const enTiktok = m
    ? `<p class="en-tiktok"><a href="${esc(m.url)}" target="_blank" rel="noopener">En TikTok</a>: ${num.format(m.vistas ?? 0)} visualizaciones · ${num.format(m.megusta ?? 0)} me gusta · ${num.format(m.comentarios ?? 0)} comentarios</p>`
    : "";
  return `<article class="pieza" data-id="${esc(v.id)}">
    ${portada}
    <div class="pieza-cuerpo">
      <div>
        <h3 class="pieza-titulo">${esc(v.titulo)}</h3>
        <p class="pieza-meta">${esc(v.slug)} · ${dur}</p>
      </div>
      <div class="progreso" aria-hidden="true">${ORDEN.map((_, i) => `<span class="${i < n ? "lleno" : ""}"></span>`).join("")}</div>
      <p class="etapa">${e.descartado ? "Descartado" : `${s.nombre}: ${s.texto.replace("esperan", "espera").replace("falta programarlos", "falta programarlo").replace("ya han salido", "ya ha salido")}`}</p>
      ${enTiktok}
      <div class="acciones">
        <button type="button" class="boton" data-accion="ver" ${v.mp4 ? "" : "disabled"}>Ver vídeo</button>
        <button type="button" class="boton" data-accion="copiar" ${v.texto ? "" : "disabled"}>Copiar texto</button>
      </div>
      <div class="controles">
        <label class="marca"><input type="checkbox" data-campo="aprobado" ${e.aprobado ? "checked" : ""} ${v.video ? "" : "disabled"}> Aprobado</label>
        <span class="cuando">
          <input type="date" data-campo="fecha" value="${esc(e.fecha)}" aria-label="Día de publicación de ${esc(v.slug)}">
          <input type="time" data-campo="hora" value="${esc(e.hora)}" step="900" aria-label="Hora de publicación de ${esc(v.slug)}">
        </span>
        <label class="marca"><input type="checkbox" data-campo="programado" ${e.programado ? "checked" : ""}> Programado</label>
        ${ig}
      </div>
      ${errores[v.id] ? `<p class="error" role="alert">${esc(errores[v.id])}</p>` : ""}
      <details class="metricas">
        <summary>Métricas de TikTok</summary>
        <div class="metricas-rejilla">
          ${campoVistas(v, "v24", "Visualizaciones a las 24 h", 24)}
          ${campoVistas(v, "v7", "Visualizaciones a los 7 días", 168)}
          <label>% que lo ve entero<input inputmode="decimal" data-campo="entero" value="${esc(e.entero)}"></label>
          <label>Seguidores ganados<input inputmode="numeric" data-campo="seguidores" value="${esc(e.seguidores)}"></label>
          <label class="ancho">Nota<textarea data-campo="nota">${esc(e.nota)}</textarea></label>
        </div>
      </details>
    </div>
  </article>`;
}

function pintarNaves() {
  $("naves").innerHTML = datos.cuentas.map((c) => {
    const suyos = datos.videos.filter((v) => v.cuenta === c.id);
    const vivos = suyos.filter((v) => !est(v).descartado && (!filtro || etapa(v) === filtro));
    const cuando = (v) => momento(est(v))?.getTime() ?? Infinity;
    const porHacer = vivos.filter((v) => !["programado", "publicado"].includes(etapa(v)));
    const enCola = vivos.filter((v) => etapa(v) === "programado").sort((a, b) => cuando(a) - cuando(b));
    const salidos = vivos.filter((v) => etapa(v) === "publicado").sort((a, b) => cuando(b) - cuando(a));
    const descartados = filtro ? [] : suyos.filter((v) => est(v).descartado);
    const r = reserva(c);
    const lista = (vs, vacio) => (vs.length ? vs.map((v) => pieza(v, c)).join("") : `<p class="vacio">${vacio}</p>`);
    return `<article class="nave" style="--color:${c.color}" aria-labelledby="nave-${c.id}">
      <header class="nave-cabecera">
        <div class="nave-titulo"><h2 id="nave-${c.id}">${esc(c.nombre)}</h2><span class="redes">${esc(c.arroba)} · TikTok${c.instagram ? " e Instagram" : ""}</span></div>
        <span class="reserva ${r.clase}">${r.texto}</span>
        ${marcador(c)}
      </header>
      <section class="grupo"><h3 class="grupo-titulo">Por hacer (${porHacer.length})</h3>${lista(porHacer, "Nada pendiente")}</section>
      <section class="grupo"><h3 class="grupo-titulo">En cola (${enCola.length})</h3>${lista(enCola, "Nada en cola")}</section>
      <details class="grupo"${filtro === "publicado" ? " open" : ""}><summary>Publicados (${salidos.length})</summary>${lista(salidos, "Todavía nada")}</details>
      ${descartados.length ? `<details class="grupo"><summary>Descartados (${descartados.length})</summary>${lista(descartados, "")}</details>` : ""}
    </article>`;
  }).join("");
}

function pintar() {
  // keep the focus and the open metric panels across repaints
  const foco = document.activeElement?.closest?.(".pieza") ? [document.activeElement.closest(".pieza").dataset.id, document.activeElement.dataset.campo || document.activeElement.dataset.accion] : null;
  const abiertos = [...document.querySelectorAll(".pieza details[open]")].map((d) => d.closest(".pieza").dataset.id);
  const grupos = [...document.querySelectorAll("details.grupo[open]")].map((d) => d.closest(".nave").getAttribute("aria-labelledby") + d.querySelector("summary").textContent.split(" (")[0]);
  pintarEstaciones();
  pintarNaves();
  for (const id of abiertos) document.querySelector(`.pieza[data-id="${CSS.escape(id)}"] details`)?.setAttribute("open", "");
  for (const d of document.querySelectorAll("details.grupo")) if (grupos.includes(d.closest(".nave").getAttribute("aria-labelledby") + d.querySelector("summary").textContent.split(" (")[0])) d.open = true;
  if (foco) document.querySelector(`.pieza[data-id="${CSS.escape(foco[0])}"] [data-campo="${foco[1]}"], .pieza[data-id="${CSS.escape(foco[0])}"] [data-accion="${foco[1]}"]`)?.focus();
}

// ---------- events ----------
const videoDe = (el) => datos.videos.find((v) => v.id === el.closest(".pieza")?.dataset.id);

document.addEventListener("click", async (ev) => {
  const estacion = ev.target.closest(".estacion");
  if (estacion) {
    filtro = filtro === estacion.dataset.estacion ? null : estacion.dataset.estacion;
    return pintar();
  }
  const boton = ev.target.closest("[data-accion]");
  if (!boton) return;
  const v = videoDe(boton);
  if (boton.dataset.accion === "ver") {
    $("visor-titulo").textContent = v.titulo;
    $("visor-video").src = v.mp4;
    $("visor").showModal();
  } else if (boton.dataset.accion === "copiar") {
    try {
      await navigator.clipboard.writeText(v.texto);
    } catch {
      const t = document.createElement("textarea");
      t.value = v.texto; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    boton.textContent = "Copiado";
    boton.classList.add("hecho");
    setTimeout(() => { boton.textContent = "Copiar texto"; boton.classList.remove("hecho"); }, 1600);
  }
});

document.addEventListener("change", (ev) => {
  const campo = ev.target.dataset?.campo;
  if (!campo) return;
  const v = videoDe(ev.target);
  const valor = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value.trim();
  delete errores[v.id];
  if (campo === "programado" && valor) {
    const e = est(v);
    if (!e.fecha || !e.hora) {
      errores[v.id] = "Pon el día y la hora antes de marcarlo como programado";
      ev.target.checked = false;
      return pintar();
    }
    if (!e.aprobado) return guardar(v, { programado: true, aprobado: true });
  }
  guardar(v, { [campo]: valor });
});

$("visor-cerrar").addEventListener("click", () => $("visor").close());
$("visor").addEventListener("close", () => { $("visor-video").pause(); $("visor-video").removeAttribute("src"); });
$("actualizar").addEventListener("click", cargar);

async function cargar() {
  const r = await fetch("/api/datos");
  datos = await r.json();
  porPanel = Object.fromEntries(Object.values(datos.metricas?.videos || {}).filter((m) => m.panel).map((m) => [m.panel, m]));
  $("hoy").textContent = diaLargo.format(new Date()).replace(/^./, (c) => c.toUpperCase());
  pintar();
}
cargar();
// published videos move on their own when their time comes (not while you are typing in a field)
setInterval(() => { if (!document.activeElement?.matches?.("input, textarea")) pintar(); }, 60000);
