// setup.js — Ejecutar UNA VEZ para crear el usuario administrador inicial
// Uso: node setup.js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const db     = require('./config/db');

async function setup() {
  console.log('\n🔧  ResiHub Setup V3');
  console.log('══════════════════════════════════════\n');

  const email    = process.env.ADMIN_EMAIL    || 'admin@itmina.edu.mx';
  const password = process.env.ADMIN_PASSWORD || 'Admin2026!';
  const nombre   = 'Administrador ResiHub';

  try {
    const hash = await bcrypt.hash(password, 10);

    // Upsert: insertar o actualizar si ya existe
    await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nombre = VALUES(nombre)`,
      [nombre, email, hash]
    );

    console.log('✅  Usuario administrador creado/actualizado:');
    console.log(`    Email:    ${email}`);
    console.log(`    Password: ${password}`);
    console.log('\n⚠️  Cambia la contraseña después de iniciar sesión por primera vez.');
    console.log('══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Error en setup:', err.message);
    process.exit(1);
  }
}

setup();
