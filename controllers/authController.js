// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ? AND activo = 1',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const passwordOk = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      ok: true,
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
}

/**
 * GET /api/auth/me  (requiere token)
 * Devuelve datos del usuario autenticado
 */
async function me(req, res) {
  return res.json({ ok: true, usuario: req.usuario });
}

module.exports = { login, me };
