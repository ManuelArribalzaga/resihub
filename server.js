// server.js — Punto de entrada de ResiHub V3
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CREAR CARPETA UPLOADS SI NO EXISTE ──────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── MIDDLEWARES GLOBALES ────────────────────────────────────
app.use(cors());                        // Permite peticiones desde cualquier origen
app.use(express.json());                // Parsear JSON en el body
app.use(express.urlencoded({ extended: true }));

// ─── SERVIR ARCHIVOS ESTÁTICOS (Frontend) ────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── RUTAS DE LA API ─────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/admin',      require('./routes/admin'));

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'ResiHub API funcionando', version: '3.0.0' });
});

// ─── FALLBACK: SPA — Redirige todo al index.html ─────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── MANEJO DE ERRORES GLOBAL ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ ok: false, mensaje: err.message || 'Error interno del servidor' });
});

// ─── INICIAR SERVIDOR ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  ResiHub V3 corriendo en http://localhost:${PORT}`);
  console.log(`📂  Panel admin: http://localhost:${PORT}/admin/`);
  console.log(`🔌  API: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
