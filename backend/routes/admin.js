const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { authMiddleware, soloAdmin } = require('../middleware/authMiddleware');

// Todas las rutas de admin requieren auth + rol admin
router.use(authMiddleware, soloAdmin);

// Documentos
router.get('/documentos',          ctrl.listarTodos);
router.post('/documentos',         ctrl.upload.single('archivo'), ctrl.crearDocumento);
router.put('/documentos/:id',      ctrl.upload.single('archivo'), ctrl.actualizarDocumento);
router.delete('/documentos/:id',   ctrl.eliminarDocumento);

// Estadísticas
router.get('/estadisticas',        ctrl.estadisticas);

// Usuarios
router.get('/usuarios',            ctrl.listarUsuarios);
router.post('/usuarios',           ctrl.crearUsuario);

module.exports = router;
