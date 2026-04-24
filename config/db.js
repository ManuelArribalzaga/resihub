// config/db.js — Conexión a PostgreSQL (Supabase)
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Verificar conexión al arrancar
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅  PostgreSQL (Supabase) conectado correctamente');
    client.release();
  } catch (err) {
    console.error('❌  Error al conectar con PostgreSQL:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
