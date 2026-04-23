require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos del FRONTEND desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// ─── RUTAS API ───────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/admin',      require('./routes/admin'));

// ─── RUTA RAÍZ ───────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'ResiHub API v1.0 – TecNM Campus Minatitlán',
    endpoints: {
      auth:       '/api/auth/login  [POST]',
      documentos: '/api/documentos  [GET]',
      admin:      '/api/admin/*     [requiere token]'
    }
  });
});

// ─── SPA FALLBACK (rutas del frontend) ───────────────────────
app.get('*', (req, res) => {
  // Si es una ruta de API no encontrada, devolver 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, mensaje: 'Endpoint no encontrado.' });
  }
  // Para cualquier otra ruta, dejar que el frontend la maneje
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── ARRANQUE ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 ResiHub corriendo en http://localhost:${PORT}`);
  console.log(`📚 API disponible en  http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend en        http://localhost:${PORT}/index.html\n`);
});
