const jwt = require('jsonwebtoken');

// Verifica que el token JWT sea válido
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ ok: false, mensaje: 'Token inválido o expirado.' });
  }
}

// Solo permite acceso a administradores
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso restringido a administradores.' });
  }
  next();
}

module.exports = { authMiddleware, soloAdmin };
