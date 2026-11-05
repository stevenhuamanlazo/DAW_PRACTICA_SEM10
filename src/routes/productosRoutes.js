import { Router } from 'express';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productosController.js';

const router = Router();

// GET    /api/productos       → lista (admite ?categoria= y ?buscar=)
router.get('/', listarProductos);

// GET    /api/productos/:id   → un producto por id
router.get('/:id', obtenerProducto);

// POST   /api/productos       → crea un producto
router.post('/', crearProducto);

// PUT    /api/productos/:id   → actualiza (total o parcial)
router.put('/:id', actualizarProducto);

// DELETE /api/productos/:id   → elimina (lógico)
router.delete('/:id', eliminarProducto);

export default router;