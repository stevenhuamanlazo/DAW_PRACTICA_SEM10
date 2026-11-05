import pool from '../config/db.js';

// ---------- Utilidades de validación ----------
const CAMPOS_TEXTO_OBLIGATORIOS = ['sku', 'nombre', 'categoria', 'marca'];
const CAMPOS_EDITABLES = ['sku', 'nombre', 'categoria', 'marca', 'precio', 'stock', 'especificaciones'];

const vacio = (v) => v === undefined || v === null || String(v).trim() === '';
const precioValido = (v) => !vacio(v) && Number.isFinite(Number(v)) && Number(v) >= 0;
const stockValido = (v) => !vacio(v) && Number.isInteger(Number(v)) && Number(v) >= 0;

// GET /api/productos → 200 + arreglo JSON
export const listarProductos = async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let sql = 'SELECT * FROM productos WHERE activo = 1';
    const params = [];

    if (categoria) {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    if (buscar) {
      sql += ' AND (nombre LIKE ? OR marca LIKE ? OR sku LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
    }

    sql += ' ORDER BY categoria, nombre';

    const [rows] = await pool.execute(sql, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/productos/:id → 200 + objeto | 404
export const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT * FROM productos WHERE id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/productos → 201 + producto creado | 400 | 409
export const crearProducto = async (req, res) => {
  try {
    const { sku, nombre, categoria, marca, precio, stock, especificaciones } = req.body ?? {};

    if ([sku, nombre, categoria, marca].some(vacio)) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: sku, nombre, categoria y marca' });
    }
    if (!precioValido(precio)) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a 0' });
    }
    if (!stockValido(stock)) {
      return res.status(400).json({ error: 'El stock debe ser un entero mayor o igual a 0' });
    }

    const [result] = await pool.execute(
      `INSERT INTO productos (sku, nombre, categoria, marca, precio, stock, especificaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku.trim(), nombre.trim(), categoria.trim(), marca.trim(), Number(precio), Number(stock), especificaciones ?? null]
    );

    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El SKU ya existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/productos/:id → 200 + producto actualizado | 400 | 404 | 409
// Actualización total o parcial: solo se modifican los campos enviados.
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const sets = [];
    const params = [];
    for (const campo of CAMPOS_EDITABLES) {
      if (body[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        params.push(body[campo]);
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }
    for (const campo of CAMPOS_TEXTO_OBLIGATORIOS) {
      if (body[campo] !== undefined && vacio(body[campo])) {
        return res.status(400).json({ error: `El campo ${campo} no puede estar vacío` });
      }
    }
    if (body.precio !== undefined && !precioValido(body.precio)) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a 0' });
    }
    if (body.stock !== undefined && !stockValido(body.stock)) {
      return res.status(400).json({ error: 'El stock debe ser un entero mayor o igual a 0' });
    }

    const [existe] = await pool.execute(
      'SELECT id FROM productos WHERE id = ? AND activo = 1',
      [id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    params.push(id);
    await pool.execute(`UPDATE productos SET ${sets.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(rows[0]);
   } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El SKU ya existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/productos/:id → 200 | 404  (eliminación lógica: activo = 0)
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [existe] = await pool.execute(
      'SELECT id FROM productos WHERE id = ? AND activo = 1',
      [id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.execute('UPDATE productos SET activo = 0 WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado correctamente', id: Number(id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};