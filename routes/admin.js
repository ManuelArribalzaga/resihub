// routes/admin.js — Rutas con control de roles
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();

const { verificarToken, soloAdmin, adminOGestor } = require('../middleware/auth');
const {
  listarDocumentos, crearDocumento, actualizarDocumento, eliminarDocumento,
  listarEtapas, estadisticas, listarUsuarios, crearUsuario, eliminarUsuario
} = require('../controllers/adminController');

// ─── MULTER ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
                   .replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const permitidos = ['.pdf', '.docx', '.doc', '.xlsx'];
  permitidos.includes(path.extname(file.originalname).toLowerCase())
    ? cb(null, true)
    : cb(new Error('Solo se permiten PDF, DOCX, DOC, XLSX'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadFields = upload.fields([
  { name: 'archivo', maxCount: 1 },
  { name: 'archivo_guia', maxCount: 1 }
]);

// ─── TODAS las rutas requieren token válido ───────────────────
router.use(verificarToken);

// ─── DOCUMENTOS (admin y gestor) ─────────────────────────────
router.get('/documentos',        adminOGestor, listarDocumentos);
router.post('/documentos',       adminOGestor, uploadFields, crearDocumento);
router.put('/documentos/:id',    adminOGestor, uploadFields, actualizarDocumento);

// ─── ELIMINAR DOCUMENTO (solo admin) ─────────────────────────
router.delete('/documentos/:id', soloAdmin, eliminarDocumento);

// ─── ETAPAS (admin y gestor) ─────────────────────────────────
router.get('/etapas', adminOGestor, listarEtapas);

// ─── ESTADÍSTICAS (admin y gestor) ───────────────────────────
router.get('/estadisticas', adminOGestor, estadisticas);

// ─── USUARIOS (solo admin) ───────────────────────────────────
router.get('/usuarios',     soloAdmin, listarUsuarios);
router.post('/usuarios',    soloAdmin, crearUsuario);
router.delete('/usuarios/:id', soloAdmin, eliminarUsuario);

module.exports = router;
