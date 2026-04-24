// controllers/documentosController.js
const path = require('path');
const fs   = require('fs');
const db   = require('../config/db');

async function listarPorEtapa(req, res) {
  try {
    const { rows: etapas } = await db.query('SELECT * FROM etapas ORDER BY orden');
    const { rows: docs }   = await db.query(
      `SELECT d.*, e.nombre AS etapa_nombre
       FROM documentos d
       JOIN etapas e ON d.etapa_id = e.id
       WHERE d.vigente = TRUE
       ORDER BY d.etapa_id, d.orden`
    );
    const resultado = etapas.map(etapa => ({
      ...etapa,
      documentos: docs.filter(d => d.etapa_id === etapa.id)
    }));
    return res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener documentos' });
  }
}

async function listarPorEtapaId(req, res) {
  const { etapaId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT d.*, e.nombre AS etapa_nombre, e.color AS etapa_color
       FROM documentos d
       JOIN etapas e ON d.etapa_id = e.id
       WHERE d.etapa_id = $1 AND d.vigente = TRUE
       ORDER BY d.orden`,
      [etapaId]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener documentos de la etapa' });
  }
}

async function descargar(req, res) {
  const { id } = req.params;
  const esGuia = req.query.guia === '1';
  try {
    const { rows } = await db.query(
      'SELECT * FROM documentos WHERE id = $1 AND vigente = TRUE', [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'Documento no encontrado' });

    const doc = rows[0];
    const nombreArchivo = esGuia ? doc.nombre_guia : doc.nombre_archivo;

    if (!nombreArchivo)
      return res.status(404).json({ ok: false, mensaje: 'Archivo no disponible aún' });

    const rutaArchivo = path.join(__dirname, '..', 'uploads', nombreArchivo);
    if (!fs.existsSync(rutaArchivo))
      return res.status(404).json({ ok: false, mensaje: 'Archivo pendiente de subir por el administrador', nombreArchivo });

    await db.query(
      'INSERT INTO descargas (documento_id, ip_origen, user_agent) VALUES ($1, $2, $3)',
      [id, req.ip, req.headers['user-agent']?.substring(0, 300) || null]
    );

    res.download(rutaArchivo, nombreArchivo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al descargar el archivo' });
  }
}

module.exports = { listarPorEtapa, listarPorEtapaId, descargar };
