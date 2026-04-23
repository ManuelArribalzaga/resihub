-- ResiHub · Seeds para Aiven (defaultdb)

DELETE FROM descargas;
DELETE FROM documentos;
DELETE FROM etapas;
DELETE FROM usuarios;

ALTER TABLE etapas     AUTO_INCREMENT = 1;
ALTER TABLE documentos AUTO_INCREMENT = 1;
ALTER TABLE usuarios   AUTO_INCREMENT = 1;

INSERT INTO etapas (nombre, descripcion, icono, color, orden) VALUES
('Solicitud',   'Inicia tu proceso con los formatos de solicitud y anteproyecto.',    'bi-file-earmark-text', 'primary',   1),
('Seguimiento', 'Entrega tus reportes bimestrales y manten tu expediente al dia.',    'bi-check-circle',      'secondary', 2),
('Liberacion',  'Finaliza tu residencia con el informe final y obten tu liberacion.', 'bi-mortarboard',       'danger',    3);

INSERT INTO documentos (etapa_id, titulo, descripcion, nombre_archivo, tipo, tiene_guia, nombre_guia, vigente, orden) VALUES
(1, 'Solicitud de Residencia Profesional', 'Formato oficial para solicitar el inicio de tu residencia.', 'solicitud_residencia.pdf', 'formato', 1, 'guia_solicitud.pdf', 1, 1),
(1, 'Formato de Autorizacion del Proyecto', 'Documento que describe el proyecto a realizar.', 'autorizacion_proyecto.pdf', 'formato', 1, 'guia_autorizacion.pdf', 1, 2),
(1, 'Acuse de Entrega', 'Constancia legal de la entrega de documentacion academica.', 'acuse_entrega.pdf', 'formato', 1, 'guia_acuse.pdf', 1, 3),
(2, 'Primer Reporte Bimestral', 'Primer avance de tu proyecto, entregado a los 2 meses de haber iniciado.', 'reporte_bimestral_1.pdf', 'formato', 0, NULL, 1, 1),
(2, 'Segundo Reporte Bimestral', 'Segundo avance, correspondiente al periodo intermedio de tu residencia.', 'reporte_bimestral_2.pdf', 'formato', 0, NULL, 1, 2),
(2, 'Tercer Reporte Bimestral', 'Tercer avance, solo si tu residencia excede los 4 meses regulares.', 'reporte_bimestral_3.pdf', 'formato', 0, NULL, 1, 3),
(2, 'Formato de Evaluacion', 'Evaluacion que realiza tu asesor externo sobre tu desempeno en la empresa.', 'evaluacion_seguimiento.pdf', 'formato', 0, NULL, 1, 4),
(3, 'Formato de Evaluacion Final', 'Rubrica que llenan tus asesores interno y externo al finalizar.', 'evaluacion_final.pdf', 'formato', 1, 'guia_evaluacion_final.pdf', 1, 1),
(3, 'Solicitud de Liberacion', 'Formato para solicitar tu carta de liberacion academica.', 'solicitud_liberacion.pdf', 'formato', 0, NULL, 1, 2);

INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
('Administrador ResiHub', 'admin@itmina.edu.mx', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1);
