// routes/admin.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();

const { verificarToken, soloAdmin } = require('../middleware/auth');
const {
  listarDocumentos, crearDocumento, actualizarDocumento, eliminarDocumento,
  listarEtapas, estadisticas, listarUsuarios, crearUsuario
} = require('../controllers/adminController');

// ─── MULTER (subida de archivos) ─────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext       = path.extname(file.originalname);
    const base      = path.basename(file.originalname, ext)
                        .replace(/[^a-z0-9_\-]/gi, '_')
                        .toLowerCase();
    const timestamp = Date.now();
    cb(null, `${base}_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const permitidos = ['.pdf', '.docx', '.doc', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (permitidos.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOCX, DOC, XLSX.'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// Campos permitidos para upload
const uploadFields = upload.fields([
  { name: 'archivo',      maxCount: 1 },
  { name: 'archivo_guia', maxCount: 1 }
]);

// ─── MIDDLEWARE GLOBAL: requiere token + admin ────────────────
router.use(verificarToken, soloAdmin);

// ─── RUTAS DE DOCUMENTOS ─────────────────────────────────────
router.get('/documentos',        listarDocumentos);
router.post('/documentos',       uploadFields, crearDocumento);
router.put('/documentos/:id',    uploadFields, actualizarDocumento);
router.delete('/documentos/:id', eliminarDocumento);

// ─── RUTAS DE ETAPAS ─────────────────────────────────────────
router.get('/etapas', listarEtapas);

// ─── ESTADÍSTICAS ─────────────────────────────────────────────
router.get('/estadisticas', estadisticas);

// ─── USUARIOS ─────────────────────────────────────────────────
router.get('/usuarios',  listarUsuarios);
router.post('/usuarios', crearUsuario);

module.exports = router;
