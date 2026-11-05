const API = '/api/productos';
const CATEGORIAS = ['Procesadores', 'Tarjetas Gr\u00e1ficas', 'Placas Madre', 'Memoria RAM', 'Almacenamiento', 'Fuentes de Poder', 'Refrigeraci\u00f3n', 'Gabinetes'];
const HUES = [215, 280, 165, 32, 190, 335, 120, 52];
const PAGE_SIZE = 8;
const STOCK_BAJO = 5;

const state = { todos: [], pagina: 1, cat: '', editId: null, delId: null, cargando: true };
const $ = (s) => document.querySelector(s);
const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICON_EDIT = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
const ICONS = {
  box: '<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.500M12 6v2M12 16v2"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  off: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/></svg>',
};

/* ---------- Cliente HTTP ---------- */
async function api(url, options) {
  const res = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, options));
  let data = null;
  try { data = await res.json(); } catch (e) { /* sin cuerpo */ }
  if (!res.ok) throw new Error((data && data.error) || ('Error ' + res.status));
  return data;
}
function toast(msg, tipo) {
  const el = document.createElement('div');
  el.className = 'toast ' + (tipo || 'ok');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}
function setStatus(ok) {
  const el = $('#apiStatus');
  el.className = 'api-status ' + (ok ? 'ok' : 'fail');
  el.lastElementChild.textContent = ok ? 'API conectada' : 'API sin conexi\u00f3n';
}

/* ---------- Tema ---------- */
function aplicarTema(t) {
  document.documentElement.setAttribute('data-theme', t);
  $('#themeLabel').textContent = t === 'dark' ? 'Modo claro' : 'Modo oscuro';
  try { localStorage.setItem('tp-theme', t); } catch (e) { /* sin almacenamiento */ }
}

/* ---------- Datos ---------- */
async function cargar() {
  state.cargando = true;
  render();
  try {
    state.todos = await api(API);
    setStatus(true);
  } catch (e) {
    state.todos = [];
    setStatus(false);
    toast('No se pudo cargar el inventario: ' + e.message, 'error');
  }
  state.cargando = false;
  render();
}
function hueDe(cat) {
  const i = CATEGORIAS.indexOf(cat);
  if (i >= 0) return HUES[i];
  let h = 0;
  for (const c of String(cat)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
function filtrados() {
  const q = $('#buscar').value.trim().toLowerCase();
  const lista = state.todos.filter((p) => {
    const okCat = !state.cat || p.categoria === state.cat;
    const okQ = !q || [p.nombre, p.marca, p.sku, p.especificaciones].some((v) => String(v == null ? '' : v).toLowerCase().includes(q));
    return okCat && okQ;
  });
  const cmp = {
    categoria: (a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre),
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    precio_asc: (a, b) => a.precio - b.precio,
    precio_desc: (a, b) => b.precio - a.precio,
    stock_asc: (a, b) => a.stock - b.stock,
    stock_desc: (a, b) => b.stock - a.stock,
  }[$('#orden').value];
  return lista.sort(cmp);
}

/* ---------- Render ---------- */
function renderKpis() {
  const t = state.todos;
  const valor = t.reduce((s, p) => s + p.precio * p.stock, 0);
  const bajo = t.filter((p) => p.stock > 0 && p.stock <= STOCK_BAJO).length;
  const agot = t.filter((p) => p.stock === 0).length;
  const cats = new Set(t.map((p) => p.categoria)).size;
  const k = [
    { l: 'Productos activos', v: t.length, h: 'en ' + cats + ' categor\u00edas', c: '#6d7cff', i: ICONS.box },
    { l: 'Valor del inventario', v: money.format(valor), h: 'precio x stock', c: '#22d3ee', i: ICONS.coin },
    { l: 'Stock bajo', v: bajo, h: STOCK_BAJO + ' unidades o menos', c: '#fbbf24', i: ICONS.warn },
    { l: 'Agotados', v: agot, h: 'requieren reposici\u00f3n', c: '#f87171', i: ICONS.off },
  ];
  $('#stats').innerHTML = k.map((x) => '<div class="kpi" style="--c:' + x.c + '"><div class="ico">' + x.i + '</div><div><div class="label">' + x.l + '</div><div class="value">' + x.v + '</div><div class="hint">' + x.h + '</div></div></div>').join('');
}
function renderCats() {
  const mapa = {};
  state.todos.forEach((p) => {
    const c = mapa[p.categoria] || (mapa[p.categoria] = { n: 0, v: 0 });
    c.n += 1; c.v += p.precio * p.stock;
  });
  const filas = Object.entries(mapa).sort((a, b) => b[1].v - a[1].v);
  const max = Math.max(1, ...filas.map((f) => f[1].v));
  $('#cats').innerHTML = filas.length ? filas.map(([nombre, c]) =>
    '<button type="button" class="cat-row' + (state.cat === nombre ? ' on' : '') + '" data-cat="' + esc(nombre) + '" style="--h:' + hueDe(nombre) + '">' +
    '<span class="nm">' + esc(nombre) + '</span><div class="track"><div class="fill" style="width:' + Math.max(4, Math.round(c.v / max * 100)) + '%"></div></div>' +
    '<span class="qt">' + c.n + ' prod.</span></button>').join('') : '<div class="empty-sm">Sin datos para mostrar</div>';
}
function renderAlertas() {
  const lista = state.todos.filter((p) => p.stock <= STOCK_BAJO).sort((a, b) => a.stock - b.stock).slice(0, 5);
  $('#alertList').innerHTML = lista.length ? lista.map((p) =>
    '<div class="alert"><div class="t"><b>' + esc(p.nombre) + '</b><small>' + esc(p.sku) + '</small></div>' +
    '<div style="display:flex;align-items:center;gap:10px">' + stockPill(p.stock) +
    '<button class="btn sm" type="button" data-edit="' + p.id + '">Reponer</button></div></div>').join('')
    : '<div class="empty-sm">Todo el inventario tiene stock suficiente</div>';
}
function renderChips() {
  const cats = Array.from(new Set(CATEGORIAS.concat(state.todos.map((p) => p.categoria))));
  $('#chips').innerHTML = '<button type="button" class="chip' + (state.cat ? '' : ' on') + '" data-chip="">Todas</button>' +
    cats.map((c) => '<button type="button" class="chip' + (state.cat === c ? ' on' : '') + '" data-chip="' + esc(c) + '">' + esc(c) + '</button>').join('');
}
function stockPill(n) {
  if (n === 0) return '<span class="pill out">Agotado</span>';
  if (n <= STOCK_BAJO) return '<span class="pill low">Bajo &middot; ' + n + '</span>';
  return '<span class="pill ok">' + n + ' en stock</span>';
}
function iniciales(m) { return String(m || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?'; }

function render() {
  renderKpis(); renderCats(); renderAlertas(); renderChips();
  const tbody = $('#tbody');
  if (state.cargando) {
    tbody.innerHTML = Array.from({ length: 5 }, () => '<tr class="skeleton">' + '<td><span></span></td>'.repeat(6) + '</tr>').join('');
    $('#pagerInfo').textContent = 'Cargando inventario...';
    $('#pageLabel').textContent = '';
    $('#prev').disabled = $('#next').disabled = true;
    return;
  }
  const lista = filtrados();
  const paginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
  state.pagina = Math.min(Math.max(1, state.pagina), paginas);
  const ini = (state.pagina - 1) * PAGE_SIZE;
  const vista = lista.slice(ini, ini + PAGE_SIZE);
  if (!vista.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty"><b>No se encontraron productos</b>Prueba con otra b\u00fasqueda o categor\u00eda.</div></td></tr>';
  } else {
    tbody.innerHTML = vista.map((p) =>
      '<tr><td><div class="prod"><div class="tile" style="--h:' + hueDe(p.categoria) + '">' + esc(iniciales(p.marca)) + '</div><div>' +
      '<div><span class="pn">' + esc(p.nombre) + '</span><span class="sku">' + esc(p.sku) + '</span></div>' +
      '<div class="pm">' + esc(p.especificaciones || 'Sin especificaciones') + '</div></div></div></td>' +
      '<td><span class="badge" style="--h:' + hueDe(p.categoria) + '">' + esc(p.categoria) + '</span></td>' +
      '<td>' + esc(p.marca) + '</td><td class="right price">' + money.format(p.precio) + '</td><td>' + stockPill(p.stock) + '</td>' +
      '<td><div class="actions"><button class="icon-btn" data-edit="' + p.id + '" title="Editar" aria-label="Editar">' + ICON_EDIT + '</button>' +
      '<button class="icon-btn del" data-del="' + p.id + '" title="Eliminar" aria-label="Eliminar">' + ICON_DEL + '</button></div></td></tr>').join('');
  }
  $('#pagerInfo').textContent = 'Mostrando ' + (lista.length ? ini + 1 : 0) + '-' + Math.min(ini + PAGE_SIZE, lista.length) + ' de ' + lista.length + ' productos';
  $('#pageLabel').textContent = 'P\u00e1gina ' + state.pagina + ' de ' + paginas;
  $('#prev').disabled = state.pagina <= 1;
  $('#next').disabled = state.pagina >= paginas;
}

/* ---------- Modales ---------- */
const openModal = (id) => { const m = $(id); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); };
const closeModals = () => document.querySelectorAll('.overlay').forEach((m) => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
function limpiarErrores() {
  document.querySelectorAll('[data-err]').forEach((e) => (e.textContent = ''));
  document.querySelectorAll('#form .field').forEach((f) => f.classList.remove('invalid'));
  $('#formBanner').classList.remove('show');
}
function llenarCategoriasForm(actual) {
  const cats = CATEGORIAS.slice();
  if (actual && !cats.includes(actual)) cats.push(actual);
  $('#fCategoria').innerHTML = cats.map((c) => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
  $('#fCategoria').value = actual || cats[0];
}
function abrirForm(prod) {
  limpiarErrores();
  state.editId = prod ? prod.id : null;
  $('#modalTitulo').textContent = prod ? 'Editar producto #' + prod.id : 'Nuevo producto';
  $('#btnGuardar').textContent = prod ? 'Guardar cambios' : 'Crear producto';
  llenarCategoriasForm(prod ? prod.categoria : null);
  $('#fSku').value = prod ? prod.sku : '';
  $('#fNombre').value = prod ? prod.nombre : '';
  $('#fMarca').value = prod ? prod.marca : '';
  $('#fPrecio').value = prod ? prod.precio : '';
  $('#fStock').value = prod ? prod.stock : '';
  $('#fEsp').value = prod ? (prod.especificaciones || '') : '';
  openModal('#modalForm');
  setTimeout(() => $('#fSku').focus(), 50);
}
function validarForm() {
  limpiarErrores();
  const e = {};
  const v = { sku: $('#fSku').value.trim(), nombre: $('#fNombre').value.trim(), categoria: $('#fCategoria').value, marca: $('#fMarca').value.trim(),
    precio: $('#fPrecio').value, stock: $('#fStock').value, especificaciones: $('#fEsp').value.trim() };
  if (!v.sku) e.sku = 'El SKU es obligatorio';
  if (!v.nombre) e.nombre = 'El nombre es obligatorio';
  if (!v.categoria) e.categoria = 'Selecciona una categor\u00eda';
  if (!v.marca) e.marca = 'La marca es obligatoria';
  if (v.precio === '' || !Number.isFinite(Number(v.precio)) || Number(v.precio) < 0) e.precio = 'Ingresa un precio v\u00e1lido (0 o m\u00e1s)';
  if (v.stock === '' || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Ingresa un stock entero (0 o m\u00e1s)';
  const ids = { sku: '#fSku', nombre: '#fNombre', categoria: '#fCategoria', marca: '#fMarca', precio: '#fPrecio', stock: '#fStock' };
  Object.keys(e).forEach((k) => { document.querySelector('[data-err="' + k + '"]').textContent = e[k]; $(ids[k]).classList.add('invalid'); });
  if (Object.keys(e).length) return null;
  return Object.assign({}, v, { precio: Number(v.precio), stock: Number(v.stock), especificaciones: v.especificaciones || null });
}
async function guardar(ev) {
  ev.preventDefault();
  const payload = validarForm();
  if (!payload) return;
  const btn = $('#btnGuardar');
  btn.disabled = true;
  try {
    if (state.editId) {
      await api(API + '/' + state.editId, { method: 'PUT', body: JSON.stringify(payload) });
      closeModals();
      toast('Producto actualizado correctamente');
    } else {
      await api(API, { method: 'POST', body: JSON.stringify(payload) });
      closeModals();
      toast('Producto creado correctamente');
    }
    await cargar();
  } catch (err) {
    const b = $('#formBanner');
    b.textContent = err.message;
    b.classList.add('show');
    if (/sku/i.test(err.message)) $('#fSku').classList.add('invalid');
  } finally { btn.disabled = false; }
}
function pedirEliminar(id) {
  const p = state.todos.find((x) => x.id === id);
  if (!p) return;
  state.delId = id;
  $('#delTexto').innerHTML = '\u00bfSeguro que deseas eliminar <b>' + esc(p.nombre) + '</b> (' + esc(p.sku) + ')? Dejar\u00e1 de aparecer en el inventario.';
  openModal('#modalDel');
}
async function confirmarEliminar() {
  const btn = $('#btnConfirmDel');
  btn.disabled = true;
  try {
    await api(API + '/' + state.delId, { method: 'DELETE' });
    closeModals();
    toast('Producto eliminado');
    await cargar();
  } catch (err) { toast(err.message, 'error'); } finally { btn.disabled = false; }
}

/* ---------- Exportar CSV ---------- */
function exportarCsv() {
  const lista = filtrados();
  if (!lista.length) { toast('No hay productos para exportar', 'error'); return; }
  const cols = ['id', 'sku', 'nombre', 'categoria', 'marca', 'precio', 'stock', 'especificaciones'];
  const cel = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const csv = '\ufeff' + [cols.join(',')].concat(lista.map((p) => cols.map((c) => cel(p[c])).join(','))).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'inventario-techparts.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Exportados ' + lista.length + ' productos a CSV');
}

/* ---------- Eventos ---------- */
$('#btnNuevo').addEventListener('click', () => abrirForm(null));
$('#btnExport').addEventListener('click', exportarCsv);
$('#btnTheme').addEventListener('click', () => aplicarTema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
$('#form').addEventListener('submit', guardar);
$('#btnConfirmDel').addEventListener('click', confirmarEliminar);
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModals));
document.querySelectorAll('.overlay').forEach((o) => o.addEventListener('mousedown', (e) => { if (e.target === o) closeModals(); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });
['#buscar', '#orden'].forEach((s) => $(s).addEventListener('input', () => { state.pagina = 1; render(); }));
$('#prev').addEventListener('click', () => { state.pagina--; render(); });
$('#next').addEventListener('click', () => { state.pagina++; render(); });
$('#chips').addEventListener('click', (e) => { const c = e.target.closest('[data-chip]'); if (c) { state.cat = c.dataset.chip; state.pagina = 1; render(); } });
$('#cats').addEventListener('click', (e) => {
  const c = e.target.closest('[data-cat]');
  if (c) { state.cat = state.cat === c.dataset.cat ? '' : c.dataset.cat; state.pagina = 1; render(); document.getElementById('inventario').scrollIntoView({ behavior: 'smooth' }); }
});
function delegarEditar(e) {
  const ed = e.target.closest('[data-edit]'); const dl = e.target.closest('[data-del]');
  if (ed) abrirForm(state.todos.find((p) => p.id === Number(ed.dataset.edit)));
  if (dl) pedirEliminar(Number(dl.dataset.del));
}
$('#tbody').addEventListener('click', delegarEditar);
$('#alertList').addEventListener('click', delegarEditar);
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => {
  document.querySelectorAll('.nav a').forEach((x) => x.classList.remove('active')); a.classList.add('active');
}));

let tema = 'dark';
try { tema = localStorage.getItem('tp-theme') || 'dark'; } catch (e) { /* ignorar */ }
aplicarTema(tema);
cargar();