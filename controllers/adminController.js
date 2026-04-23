// controllers/adminController.js
const bcrypt = require('bcryptjs');
const path   = require('path');
const fs     = require('fs');
const db     = require('../config/db');

// ─── DOCUMENTOS ──────────────────────────────────────────────

/** GET /api/admin/documentos — Todos los documentos (incluso no vigentes) */
async function listarDocumentos(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT d.*, e.nombre AS etapa_nombre
       FROM documentos d
       JOIN etapas e ON d.etapa_id = e.id
       ORDER BY d.etapa_id, d.orden`
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener documentos' });
  }
}

/** POST /api/admin/documentos — Crear nuevo documento */
async function crearDocumento(req, res) {
  const { etapa_id, titulo, descripcion, tipo, tiene_guia, orden } = req.body;

  if (!etapa_id || !titulo) {
    return res.status(400).json({ ok: false, mensaje: 'etapa_id y titulo son requeridos' });
  }

  // Multer pone los archivos en req.files
  const archivo      = req.files?.archivo?.[0]?.filename     || null;
  const archivoGuia  = req.files?.archivo_guia?.[0]?.filename || null;

  try {
    const [result] = await db.query(
      `INSERT INTO documentos
       (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, nombre_guia, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [etapa_id, titulo, descripcion || null, archivo, tipo || 'formato',
       tiene_guia === 'true' ? 1 : 0, archivoGuia, orden || 1]
    );

    return res.status(201).json({ ok: true, mensaje: 'Documento creado', id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al crear documento' });
  }
}

/** PUT /api/admin/documentos/:id — Actualizar documento */
async function actualizarDocumento(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, tipo, tiene_guia, vigente, orden, etapa_id } = req.body;

  const archivo     = req.files?.archivo?.[0]?.filename     || null;
  const archivoGuia = req.files?.archivo_guia?.[0]?.filename || null;

  try {
    // Construir UPDATE dinámico
    const campos = [];
    const valores = [];

    if (titulo)      { campos.push('titulo = ?');      valores.push(titulo); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }
    if (tipo)        { campos.push('tipo = ?');        valores.push(tipo); }
    if (tiene_guia !== undefined)  { campos.push('tiene_guia = ?');  valores.push(tiene_guia === 'true' ? 1 : 0); }
    if (vigente !== undefined)     { campos.push('vigente = ?');     valores.push(vigente === 'true' ? 1 : 0); }
    if (orden)       { campos.push('orden = ?');       valores.push(orden); }
    if (etapa_id)    { campos.push('etapa_id = ?');    valores.push(etapa_id); }
    if (archivo)     { campos.push('nombre_archivo = ?'); valores.push(archivo); }
    if (archivoGuia) { campos.push('nombre_guia = ?'); valores.push(archivoGuia); }

    if (campos.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'No hay campos para actualizar' });
    }

    valores.push(id);
    await db.query(`UPDATE documentos SET ${campos.join(', ')} WHERE id = ?`, valores);

    return res.json({ ok: true, mensaje: 'Documento actualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar documento' });
  }
}

/** DELETE /api/admin/documentos/:id — Eliminar documento */
async function eliminarDocumento(req, res) {
  const { id } = req.params;

  try {
    // Obtener nombres de archivos para borrarlos del disco
    const [rows] = await db.query('SELECT nombre_archivo, nombre_guia FROM documentos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });

    const { nombre_archivo, nombre_guia } = rows[0];

    await db.query('DELETE FROM documentos WHERE id = ?', [id]);

    // Borrar archivos físicos si existen
    [nombre_archivo, nombre_guia].forEach(nombre => {
      if (nombre) {
        const ruta = path.join(__dirname, '..', 'uploads', nombre);
        if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
      }
    });

    return res.json({ ok: true, mensaje: 'Documento eliminado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar documento' });
  }
}

// ─── ETAPAS ──────────────────────────────────────────────────

/** GET /api/admin/etapas */
async function listarEtapas(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM etapas ORDER BY orden');
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error' });
  }
}

// ─── ESTADÍSTICAS ─────────────────────────────────────────────

/** GET /api/admin/estadisticas */
async function estadisticas(req, res) {
  try {
    const [[{ totalDocs }]]       = await db.query('SELECT COUNT(*) AS totalDocs FROM documentos WHERE vigente = 1');
    const [[{ totalDescargas }]]  = await db.query('SELECT COUNT(*) AS totalDescargas FROM descargas');
    const [[{ descargasHoy }]]    = await db.query('SELECT COUNT(*) AS descargasHoy FROM descargas WHERE DATE(fecha) = CURDATE()');
    const [[{ totalUsuarios }]]   = await db.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');

    const [topDocs] = await db.query(
      `SELECT d.titulo, COUNT(desc2.id) AS descargas
       FROM documentos d
       LEFT JOIN descargas desc2 ON d.id = desc2.documento_id
       GROUP BY d.id ORDER BY descargas DESC LIMIT 5`
    );

    const [porEtapa] = await db.query(
      `SELECT e.nombre, COUNT(desc2.id) AS descargas
       FROM etapas e
       LEFT JOIN documentos d  ON e.id = d.etapa_id
       LEFT JOIN descargas desc2 ON d.id = desc2.documento_id
       GROUP BY e.id ORDER BY e.orden`
    );

    return res.json({
      ok: true,
      data: { totalDocs, totalDescargas, descargasHoy, totalUsuarios, topDocs, porEtapa }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error en estadísticas' });
  }
}

// ─── USUARIOS ─────────────────────────────────────────────────

/** GET /api/admin/usuarios */
async function listarUsuarios(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error' });
  }
}

/** POST /api/admin/usuarios — Crear usuario admin */
async function crearUsuario(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son requeridos' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email.toLowerCase(), hash, rol || 'admin']
    );
    return res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado' });
    }
    return res.status(500).json({ ok: false, mensaje: 'Error al crear usuario' });
  }
}

module.exports = {
  listarDocumentos, crearDocumento, actualizarDocumento, eliminarDocumento,
  listarEtapas, estadisticas, listarUsuarios, crearUsuario
};
