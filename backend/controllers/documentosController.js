const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// GET /api/documentos  – todos los documentos vigentes (con etapa)
async function listar(req, res) {
  try {
    const { etapa } = req.query; // ?etapa=solicitud
    let query = `
      SELECT d.*, e.nombre AS etapa_nombre, e.slug AS etapa_slug, e.color AS etapa_color
      FROM documentos d
      JOIN etapas e ON d.etapa_id = e.id
      WHERE d.vigente = 1
    `;
    const params = [];
    if (etapa) {
      query += ' AND e.slug = ?';
      params.push(etapa);
    }
    query += ' ORDER BY e.orden, d.id';

    const [rows] = await db.query(query, params);
    res.json({ ok: true, datos: rows });
  } catch (err) {
    console.error('Error listando documentos:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener documentos.' });
  }
}

// GET /api/documentos/:id – un documento
async function obtener(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT d.*, e.nombre AS etapa_nombre, e.slug AS etapa_slug
       FROM documentos d JOIN etapas e ON d.etapa_id = e.id
       WHERE d.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Documento no encontrado.' });
    res.json({ ok: true, datos: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener documento.' });
  }
}

// GET /api/documentos/:id/descargar – registra descarga y sirve el archivo
async function descargar(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM documentos WHERE id = ? AND vigente = 1', [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Documento no encontrado.' });

    const doc = rows[0];

    // Registrar la descarga
    await db.query(
      'INSERT INTO descargas (documento_id, ip_origen, user_agent) VALUES (?, ?, ?)',
      [doc.id, req.ip, req.headers['user-agent'] || '']
    );
    // Incrementar contador
    await db.query('UPDATE documentos SET descargas = descargas + 1 WHERE id = ?', [doc.id]);

    // Si hay archivo, servirlo; si no, responder con 404 amigable
    if (doc.ruta_archivo) {
      const filePath = path.join(__dirname, '..', 'uploads', doc.ruta_archivo);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, doc.nombre_archivo || doc.titulo + '.pdf');
      }
    }

    // Sin archivo aún subido
    return res.status(404).json({
      ok: false,
      mensaje: 'El archivo aún no ha sido subido por el administrador. Comunícate con el departamento.'
    });
  } catch (err) {
    console.error('Error en descarga:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al procesar la descarga.' });
  }
}

module.exports = { listar, obtener, descargar };
