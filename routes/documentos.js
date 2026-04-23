// routes/documentos.js
const express = require('express');
const router  = express.Router();
const { listarPorEtapa, listarPorEtapaId, descargar } = require('../controllers/documentosController');

router.get('/',                     listarPorEtapa);
router.get('/etapa/:etapaId',       listarPorEtapaId);
router.get('/descargar/:id',        descargar);

module.exports = router;
