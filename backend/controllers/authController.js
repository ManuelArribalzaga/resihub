const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son requeridos.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1', [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
}

// GET /api/auth/me  – verifica token y retorna datos del usuario
async function me(req, res) {
  res.json({ ok: true, usuario: req.usuario });
}

module.exports = { login, me };
