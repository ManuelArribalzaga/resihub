const express = require('express');
const router  = express.Router();
const { listar, obtener, descargar } = require('../controllers/documentosController');

router.get('/',              listar);
router.get('/:id',           obtener);
router.get('/:id/descargar', descargar);

module.exports = router;
