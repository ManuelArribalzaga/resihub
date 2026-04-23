-- ================================================================
--  ResiHub · Datos Iniciales (Seeds)
--  Ejecutar DESPUÉS de schema.sql
-- ================================================================

USE resihub_db;

-- ─── ETAPAS ──────────────────────────────────────────────────
INSERT INTO etapas (id, nombre, descripcion, icono, color, orden) VALUES
(1, 'Solicitud',    'Inicia tu proceso con los formatos de solicitud y anteproyecto.',         'bi-file-earmark-text',  'primary', 1),
(2, 'Seguimiento',  'Entrega tus reportes bimestrales y mantén tu expediente al día.',          'bi-check-circle',       'secondary', 2),
(3, 'Liberación',   'Finaliza tu residencia con el informe final y obtén tu liberación.',       'bi-mortarboard',        'danger', 3);

-- ─── DOCUMENTOS – ETAPA 1: SOLICITUD ─────────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, nombre_guia, orden) VALUES
(1, 'Solicitud de Residencia Profesional',
   'Formato oficial para solicitar el inicio de tu residencia. Debe ser llenado con tus datos personales y académicos.',
   'solicitud_residencia.pdf', 'formato', 1, 'guia_solicitud.pdf', 1),

(1, 'Formato de Autorización del Proyecto',
   'Documento que describe el proyecto a realizar. Incluye objetivos, justificación y cronograma preliminar.',
   'autorizacion_proyecto.pdf', 'formato', 1, 'guia_autorizacion.pdf', 2),

(1, 'Acuse de Entrega',
   'Documento que sirve para dar constancia legal y formal de la entrega-recepción de la documentación técnica y académica.',
   'acuse_entrega.pdf', 'formato', 1, 'guia_acuse.pdf', 3);

-- ─── DOCUMENTOS – ETAPA 2: SEGUIMIENTO ───────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, orden) VALUES
(2, 'Primer Reporte Bimestral',
   'Primer avance de tu proyecto. Debe ser entregado a los 2 meses de haber iniciado la residencia.',
   'reporte_bimestral_1.pdf', 'formato', 0, 1),

(2, 'Segundo Reporte Bimestral',
   'Segundo avance, correspondiente al periodo intermedio de tu residencia profesional.',
   'reporte_bimestral_2.pdf', 'formato', 0, 2),

(2, 'Tercer Reporte Bimestral',
   'Tercer avance, solo si tu residencia excede los 4 meses regulares establecidos.',
   'reporte_bimestral_3.pdf', 'formato', 0, 3),

(2, 'Formato de Evaluación',
   'Evaluación que debe realizar tu asesor externo sobre tu desempeño en la empresa receptora.',
   'evaluacion_seguimiento.pdf', 'formato', 0, 4);

-- ─── DOCUMENTOS – ETAPA 3: LIBERACIÓN ────────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, nombre_guia, orden) VALUES
(3, 'Formato de Evaluación Final',
   'Rúbrica de evaluación que llenan tus asesores interno y externo al finalizar la residencia.',
   'evaluacion_final.pdf', 'formato', 1, 'guia_evaluacion_final.pdf', 1),

(3, 'Solicitud de Liberación',
   'Formato interno para solicitar tu carta de liberación académica de residencia profesional.',
   'solicitud_liberacion.pdf', 'formato', 0, 2);

-- ─── USUARIO ADMINISTRADOR ───────────────────────────────────
-- NOTA: La contraseña real se genera con bcrypt en el script setup.js
-- Este hash corresponde a: Admin2026!
-- Regenerar con: node setup.js
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador ResiHub', 'admin@itmina.edu.mx',
 '$2a$10$placeholder_run_setup_js_to_create_real_hash', 'admin');
