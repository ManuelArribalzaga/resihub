const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ─── MULTER CONFIG ─────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.xlsx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF, Word o Excel.'));
  }
});

// ─── DOCUMENTOS ─────────────────────────────────

// GET /api/admin/documentos – todos (incluso inactivos)
async function listarTodos(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT d.*, e.nombre AS etapa_nombre
      FROM documentos d JOIN etapas e ON d.etapa_id = e.id
      ORDER BY e.orden, d.id
    `);
    res.json({ ok: true, datos: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al listar documentos.' });
  }
}

// POST /api/admin/documentos – crear nuevo documento
async function crearDocumento(req, res) {
  const { etapa_id, titulo, descripcion, tipo } = req.body;
  if (!etapa_id || !titulo) {
    return res.status(400).json({ ok: false, mensaje: 'etapa_id y titulo son requeridos.' });
  }
  try {
    let nombre_archivo = null, ruta_archivo = null;
    if (req.file) {
      nombre_archivo = req.file.originalname;
      ruta_archivo   = req.file.filename;
    }
    const [result] = await db.query(
      'INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, ruta_archivo, tipo) VALUES (?,?,?,?,?,?)',
      [etapa_id, titulo, descripcion || null, nombre_archivo, ruta_archivo, tipo || 'formato']
    );
    res.status(201).json({ ok: true, mensaje: 'Documento creado.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear documento.' });
  }
}

// PUT /api/admin/documentos/:id – actualizar
async function actualizarDocumento(req, res) {
  const { titulo, descripcion, tipo, vigente } = req.body;
  try {
    let query  = 'UPDATE documentos SET titulo=?, descripcion=?, tipo=?, vigente=?';
    let params = [titulo, descripcion, tipo, vigente !== undefined ? vigente : 1];

    if (req.file) {
      query  += ', nombre_archivo=?, ruta_archivo=?';
      params.push(req.file.originalname, req.file.filename);
    }
    query  += ' WHERE id=?';
    params.push(req.params.id);

    await db.query(query, params);
    res.json({ ok: true, mensaje: 'Documento actualizado.' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar documento.' });
  }
}

// DELETE /api/admin/documentos/:id – eliminar
async function eliminarDocumento(req, res) {
  try {
    await db.query('DELETE FROM documentos WHERE id = ?', [req.params.id]);
    res.json({ ok: true, mensaje: 'Documento eliminado.' });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar documento.' });
  }
}

// ─── ESTADÍSTICAS ───────────────────────────────

// GET /api/admin/estadisticas
async function estadisticas(req, res) {
  try {
    const [[{ total_docs }]]  = await db.query('SELECT COUNT(*) AS total_docs FROM documentos WHERE vigente=1');
    const [[{ total_desc }]]  = await db.query('SELECT COALESCE(SUM(descargas),0) AS total_desc FROM documentos');
    const [[{ total_etapas }]]= await db.query('SELECT COUNT(*) AS total_etapas FROM etapas');

    // Top 5 documentos más descargados
    const [topDocs] = await db.query(`
      SELECT d.titulo, d.descargas, e.nombre AS etapa
      FROM documentos d JOIN etapas e ON d.etapa_id = e.id
      ORDER BY d.descargas DESC LIMIT 5
    `);

    // Descargas por día (últimos 7 días)
    const [descPorDia] = await db.query(`
      SELECT DATE(fecha) AS dia, COUNT(*) AS total
      FROM descargas
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha) ORDER BY dia
    `);

    res.json({
      ok: true,
      datos: { total_docs, total_desc, total_etapas, topDocs, descPorDia }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener estadísticas.' });
  }
}

// ─── USUARIOS ────────────────────────────────────

// GET /api/admin/usuarios
async function listarUsuarios(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json({ ok: true, datos: rows });
  } catch (err) {
    res.status(500).json({ ok: false, mensaje: 'Error al listar usuarios.' });
  }
}

// POST /api/admin/usuarios
async function crearUsuario(req, res) {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Nombre, email y password son requeridos.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?,?,?,?)',
      [nombre, email, hash, rol || 'admin']
    );
    res.status(201).json({ ok: true, mensaje: 'Usuario creado.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado.' });
    res.status(500).json({ ok: false, mensaje: 'Error al crear usuario.' });
  }
}

module.exports = {
  upload,
  listarTodos, crearDocumento, actualizarDocumento, eliminarDocumento,
  estadisticas,
  listarUsuarios, crearUsuario
};
