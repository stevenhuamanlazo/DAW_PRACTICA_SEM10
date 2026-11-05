import pool from './config/db.js';

try {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM productos WHERE activo = ?',
    [1]
  );
  console.log(`✅ Conexión exitosa a ${process.env.DB_NAME}. Productos activos: ${rows[0].total}`);
} catch (err) {
  console.error('❌ Error de conexión:', err.code, '-', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}