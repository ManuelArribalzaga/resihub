// middleware/auth.js — Verificación JWT + control de roles
const jwt = require('jsonwebtoken');

/** Verifica que el request tenga un JWT válido */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ ok: false, mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, email, rol, nombre }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
  }
}

/** Solo admin puede acceder — gestores bloqueados */
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({
      ok: false,
      mensaje: 'Acceso denegado: se requiere rol administrador'
    });
  }
  next();
}

/** Admin Y gestor pueden acceder */
function adminOGestor(req, res, next) {
  const rolesPermitidos = ['admin', 'gestor'];
  if (!rolesPermitidos.includes(req.usuario?.rol)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Acceso denegado'
    });
  }
  next();
}

module.exports = { verificarToken, soloAdmin, adminOGestor };
