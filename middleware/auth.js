// middleware/auth.js — Verificación de token JWT
const jwt = require('jsonwebtoken');

/**
 * Middleware: verifica que el request tenga un JWT válido
 * Uso en rutas protegidas: router.get('/ruta', verificarToken, handler)
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Formato esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;          // { id, email, rol }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
  }
}

/**
 * Middleware: verifica que el usuario sea administrador
 * Siempre usar DESPUÉS de verificarToken
 */
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado: se requiere rol admin' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
