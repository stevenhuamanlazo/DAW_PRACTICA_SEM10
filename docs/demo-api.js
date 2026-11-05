(function () {
  var realFetch = window.fetch.bind(window);
  var db = null;
  var nextId = 1;

  function load() {
    if (db) return Promise.resolve();
    return realFetch('demo-data.json').then(function (r) { return r.json(); }).then(function (d) {
      db = d.map(function (p) { return Object.assign({}, p, { activo: 1 }); });
      nextId = db.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1;
    });
  }
  function resp(status, body) {
    return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } });
  }
  function vacio(v) { return v === undefined || v === null || String(v).trim() === ''; }
  window.fetch = function (url, opts) {
    var u = String(url);
    if (u.indexOf('/api/productos') !== 0) return realFetch(url, opts);
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    var m = u.match(/^\/api\/productos\/?(\d+)?/);
    var id = m && m[1] ? Number(m[1]) : null;
    var body = {};
    try { body = opts.body ? JSON.parse(opts.body) : {}; } catch (e) { return Promise.resolve(resp(400, { error: 'JSON invalido' })); }

    return load().then(function () {
      var activos = db.filter(function (p) { return p.activo; });
      var prod = id ? activos.filter(function (p) { return p.id === id; })[0] : null;

      if (method === 'GET') {
        if (!id) return resp(200, activos);
        return prod ? resp(200, prod) : resp(404, { error: 'Producto no encontrado' });
      }
      if (method === 'POST') {
        var req = ['sku', 'nombre', 'categoria', 'marca'];
        for (var i = 0; i < req.length; i++) {
          if (vacio(body[req[i]])) return resp(400, { error: 'El campo ' + req[i] + ' es obligatorio' });
        }
        if (!(Number(body.precio) >= 0) || vacio(body.precio)) return resp(400, { error: 'El precio debe ser un numero mayor o igual a 0' });
        if (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0) return resp(400, { error: 'El stock debe ser un entero mayor o igual a 0' });
        if (db.some(function (p) { return p.sku === body.sku; })) return resp(409, { error: 'Ya existe un producto con ese SKU' });
        var nuevo = { id: nextId++, sku: body.sku, nombre: body.nombre, categoria: body.categoria, marca: body.marca,
          precio: Number(body.precio), stock: Number(body.stock), especificaciones: body.especificaciones || null, activo: 1 };
        db.push(nuevo);
        return resp(201, nuevo);
      }
      if (method === 'PUT') {
        if (!prod) return resp(404, { error: 'Producto no encontrado' });
        if (body.sku && db.some(function (p) { return p.sku === body.sku && p.id !== id; })) return resp(409, { error: 'Ya existe un producto con ese SKU' });
        ['sku', 'nombre', 'categoria', 'marca', 'especificaciones'].forEach(function (k) { if (k in body) prod[k] = body[k]; });
        if ('precio' in body) prod.precio = Number(body.precio);
        if ('stock' in body) prod.stock = Number(body.stock);
        return resp(200, prod);
      }
      if (method === 'DELETE') {
        if (!prod) return resp(404, { error: 'Producto no encontrado' });
        prod.activo = 0;
        return resp(200, { mensaje: 'Producto eliminado', id: id });
      }
      return resp(405, { error: 'Metodo no permitido' });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.textContent = 'DEMO ESTATICA - los cambios solo viven en tu navegador. La API real (Node + MySQL) corre en local.';
    b.setAttribute('style', 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:200;padding:8px 14px;border-radius:99px;font:600 12px system-ui,sans-serif;color:#fff;background:rgba(79,93,232,.92);box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:92vw;text-align:center');
    document.body.appendChild(b);
  });
})();