// setup.js — Crear usuario admin inicial (PostgreSQL/Supabase)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('./config/db');

async function setup() {
  console.log('\n🔧  ResiHub Setup V3 — Supabase');
  console.log('══════════════════════════════════════\n');

  const email    = process.env.ADMIN_EMAIL    || 'admin@itmina.edu.mx';
  const password = process.env.ADMIN_PASSWORD || 'Admin2026!';
  const nombre   = 'Administrador ResiHub';

  try {
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, nombre = EXCLUDED.nombre`,
      [nombre, email, hash]
    );

    console.log('✅  Usuario administrador creado/actualizado:');
    console.log(`    Email:    ${email}`);
    console.log(`    Password: ${password}`);
    console.log('\n⚠️  Cambia la contraseña después del primer inicio de sesión.');
    console.log('══════════════════════════════════════\n');
    process.exit(0);
  } catch (err) {
    console.error('❌  Error en setup:', err.message);
    process.exit(1);
  }
}

setup();
