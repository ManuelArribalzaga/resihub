// config/db.js — Conexión a MySQL con pool de conexiones
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'resihub_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
});

// Verificar conexión al arrancar
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL conectado correctamente');
    conn.release();
  } catch (err) {
    console.error('❌  Error al conectar con MySQL:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
