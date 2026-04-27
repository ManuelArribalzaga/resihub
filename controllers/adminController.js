// controllers/adminController.js — Con eliminarUsuario añadido
const bcrypt = require('bcryptjs');
const path   = require('path');
const fs     = require('fs');
const db     = require('../config/db');

// ─── DOCUMENTOS ──────────────────────────────────────────────

async function listarDocumentos(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT d.*, e.nombre AS etapa_nombre
       FROM documentos d JOIN etapas e ON d.etapa_id = e.id
       ORDER BY d.etapa_id, d.orden`
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener documentos' });
  }
}

async function crearDocumento(req, res) {
  const { etapa_id, titulo, descripcion, tipo, tiene_guia, orden } = req.body;
  if (!etapa_id || !titulo)
    return res.status(400).json({ ok: false, mensaje: 'etapa_id y titulo son requeridos' });

  const archivo     = req.files?.archivo?.[0]?.filename     || null;
  const archivoGuia = req.files?.archivo_guia?.[0]?.filename || null;

  try {
    const { rows } = await db.query(
      `INSERT INTO documentos
       (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, nombre_guia, orden)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [etapa_id, titulo, descripcion || null, archivo,
       tipo || 'formato', tiene_guia === 'true', archivoGuia, orden || 1]
    );
    return res.status(201).json({ ok: true, mensaje: 'Documento creado', id: rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al crear documento' });
  }
}

async function actualizarDocumento(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, tipo, tiene_guia, vigente, orden, etapa_id } = req.body;
  const archivo     = req.files?.archivo?.[0]?.filename     || null;
  const archivoGuia = req.files?.archivo_guia?.[0]?.filename || null;

  try {
    const campos  = [];
    const valores = [];
    let   idx     = 1;

    if (titulo      !== undefined) { campos.push(`titulo = $${idx++}`);          valores.push(titulo); }
    if (descripcion !== undefined) { campos.push(`descripcion = $${idx++}`);     valores.push(descripcion); }
    if (tipo        !== undefined) { campos.push(`tipo = $${idx++}`);            valores.push(tipo); }
    if (tiene_guia  !== undefined) { campos.push(`tiene_guia = $${idx++}`);     valores.push(tiene_guia === 'true'); }
    if (vigente     !== undefined) { campos.push(`vigente = $${idx++}`);        valores.push(vigente === 'true'); }
    if (orden       !== undefined) { campos.push(`orden = $${idx++}`);          valores.push(orden); }
    if (etapa_id    !== undefined) { campos.push(`etapa_id = $${idx++}`);       valores.push(etapa_id); }
    if (archivo)                   { campos.push(`nombre_archivo = $${idx++}`); valores.push(archivo); }
    if (archivoGuia)               { campos.push(`nombre_guia = $${idx++}`);    valores.push(archivoGuia); }
    campos.push(`updated_at = NOW()`);

    if (campos.length === 1)
      return res.status(400).json({ ok: false, mensaje: 'No hay campos para actualizar' });

    valores.push(id);
    await db.query(`UPDATE documentos SET ${campos.join(', ')} WHERE id = $${idx}`, valores);
    return res.json({ ok: true, mensaje: 'Documento actualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar documento' });
  }
}

async function eliminarDocumento(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT nombre_archivo, nombre_guia FROM documentos WHERE id = $1', [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'No encontrado' });

    const { nombre_archivo, nombre_guia } = rows[0];
    await db.query('DELETE FROM documentos WHERE id = $1', [id]);

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

async function listarEtapas(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM etapas ORDER BY orden');
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error' });
  }
}

// ─── ESTADÍSTICAS ─────────────────────────────────────────────

async function estadisticas(req, res) {
  try {
    const { rows: [{ totaldocs }] }      = await db.query('SELECT COUNT(*) AS totaldocs FROM documentos WHERE vigente = TRUE');
    const { rows: [{ totaldescargas }] } = await db.query('SELECT COUNT(*) AS totaldescargas FROM descargas');
    const { rows: [{ descargashoy }] }   = await db.query("SELECT COUNT(*) AS descargashoy FROM descargas WHERE fecha::date = CURRENT_DATE");
    const { rows: [{ totalusuarios }] }  = await db.query('SELECT COUNT(*) AS totalusuarios FROM usuarios');

    const { rows: topDocs } = await db.query(
      `SELECT d.titulo, COUNT(desc2.id) AS descargas
       FROM documentos d
       LEFT JOIN descargas desc2 ON d.id = desc2.documento_id
       GROUP BY d.id ORDER BY descargas DESC LIMIT 5`
    );
    const { rows: porEtapa } = await db.query(
      `SELECT e.nombre, COUNT(desc2.id) AS descargas
       FROM etapas e
       LEFT JOIN documentos d    ON e.id = d.etapa_id
       LEFT JOIN descargas desc2 ON d.id = desc2.documento_id
       GROUP BY e.id, e.nombre ORDER BY e.orden`
    );

    return res.json({
      ok: true,
      data: {
        totalDocs:      parseInt(totaldocs),
        totalDescargas: parseInt(totaldescargas),
        descargasHoy:   parseInt(descargashoy),
        totalUsuarios:  parseInt(totalusuarios),
        topDocs, porEtapa
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error en estadísticas' });
  }
}

// ─── USUARIOS ─────────────────────────────────────────────────

async function listarUsuarios(req, res) {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error' });
  }
}

async function crearUsuario(req, res) {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ ok: false, mensaje: 'Nombre, email y contraseña son requeridos' });

  // Validar que el rol sea válido
  const rolesValidos = ['admin', 'gestor'];
  const rolFinal = rolesValidos.includes(rol) ? rol : 'gestor';

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1,$2,$3,$4)',
      [nombre, email.toLowerCase(), hash, rolFinal]
    );
    return res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado' });
    return res.status(500).json({ ok: false, mensaje: 'Error al crear usuario' });
  }
}

async function eliminarUsuario(req, res) {
  const { id } = req.params;

  // Evitar que el admin se elimine a sí mismo
  if (parseInt(id) === req.usuario.id)
    return res.status(400).json({ ok: false, mensaje: 'No puedes eliminarte a ti mismo' });

  try {
    const { rows } = await db.query('SELECT id FROM usuarios WHERE id = $1', [id]);
    if (rows.length === 0)
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar usuario' });
  }
}

module.exports = {
  listarDocumentos, crearDocumento, actualizarDocumento, eliminarDocumento,
  listarEtapas, estadisticas, listarUsuarios, crearUsuario, eliminarUsuario
};
