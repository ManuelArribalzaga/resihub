-- ═══════════════════════════════════════════════════
-- RESIHUB – Datos Iniciales (Seeds)
-- ═══════════════════════════════════════════════════

USE resihub_db;

-- ─────────────────────────────────────────────
-- ADMINISTRADOR POR DEFECTO
-- password: admin123  (hash bcrypt, rounds=10)
-- ─────────────────────────────────────────────
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador ResiHub', 'admin@itmina.edu.mx',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ─────────────────────────────────────────────
-- ETAPAS DEL PROCESO
-- ─────────────────────────────────────────────
INSERT INTO etapas (nombre, slug, descripcion, icono, color, orden) VALUES
('Solicitud',   'solicitud',   'Inicia tu proceso con los formatos de solicitud y anteproyecto.',
  'bi-file-earmark-text', 'primary', 1),
('Seguimiento', 'seguimiento', 'Entrega tus reportes bimestrales y mantén tu expediente al día.',
  'bi-check-circle', 'secondary', 2),
('Liberación',  'liberacion',  'Finaliza tu residencia con el informe final y obtén tu liberación.',
  'bi-mortarboard', 'danger', 3);

-- ─────────────────────────────────────────────
-- DOCUMENTOS DE SOLICITUD
-- ─────────────────────────────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo) VALUES
(1, 'Solicitud de Residencia Profesional',
   'Formato oficial para solicitar el inicio de tu residencia. Debe ser llenado con tus datos personales y académicos.',
   NULL, 'formato'),
(1, 'Formato de Autorización del Proyecto',
   'Documento que describe el proyecto a realizar. Incluye objetivos, justificación y cronograma preliminar.',
   NULL, 'formato'),
(1, 'Acuse de Entrega',
   'Constancia legal de entrega-recepción de la documentación técnica y académica requerida.',
   NULL, 'formato');

-- ─────────────────────────────────────────────
-- DOCUMENTOS DE SEGUIMIENTO
-- ─────────────────────────────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo) VALUES
(2, 'Primer Reporte Bimestral',
   'Primer avance de tu proyecto, debe ser entregado a los 2 meses de haber iniciado.',
   NULL, 'formato'),
(2, 'Segundo Reporte Bimestral',
   'Segundo avance, correspondiente al periodo intermedio de tu residencia.',
   NULL, 'formato'),
(2, 'Tercer Reporte Bimestral',
   'Tercer avance, solo si tu residencia excede los 4 meses regulares.',
   NULL, 'formato'),
(2, 'Formato de Evaluación Bimestral',
   'Evaluación que debe realizar tu asesor externo sobre tu desempeño en la empresa.',
   NULL, 'formato');

-- ─────────────────────────────────────────────
-- DOCUMENTOS DE LIBERACIÓN
-- ─────────────────────────────────────────────
INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo) VALUES
(3, 'Formato de Evaluación Final',
   'Rúbrica de evaluación que llenan tus asesores (interno y externo) al concluir la residencia.',
   NULL, 'formato'),
(3, 'Solicitud de Liberación',
   'Formato interno para solicitar tu carta de liberación académica ante el departamento.',
   NULL, 'formato');

-- ─────────────────────────────────────────────
-- CONFIGURACIÓN GENERAL
-- ─────────────────────────────────────────────
INSERT INTO configuracion (clave, valor, tipo, label) VALUES
('email_contacto',   'gestion.tecnologica@itmina.edu.mx', 'texto', 'Email de contacto'),
('telefono_contacto','922-000-0000',                       'texto', 'Teléfono de contacto'),
('hero_titulo',      'Tu camino hacia la titulación comienza aquí', 'texto', 'Título del Hero'),
('hero_subtitulo',   'ResiHub centraliza todos los trámites, formatos y guías que necesitas para tu residencia profesional en el Tecnológico de Minatitlán. Sin confusiones, sin retrasos.', 'texto', 'Subtítulo del Hero'),
('portal_activo',    '1', 'booleano', 'Portal habilitado');
