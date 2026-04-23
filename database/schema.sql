-- ================================================================
--  ResiHub · Esquema de Base de Datos
--  TecNM Campus Minatitlán · V3
-- ================================================================

CREATE DATABASE IF NOT EXISTS resihub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resihub_db;

-- ─── TABLA: usuarios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  email         VARCHAR(180)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  rol           ENUM('admin','estudiante') NOT NULL DEFAULT 'estudiante',
  activo        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABLA: etapas ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etapas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80)   NOT NULL,
  descripcion TEXT,
  icono       VARCHAR(80)   NOT NULL DEFAULT 'bi-file-earmark',
  color       VARCHAR(30)   NOT NULL DEFAULT 'primary',
  orden       TINYINT       NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ─── TABLA: documentos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  etapa_id        INT           NOT NULL,
  titulo          VARCHAR(200)  NOT NULL,
  descripcion     TEXT,
  nombre_archivo  VARCHAR(255)  DEFAULT NULL,   -- nombre del archivo en /uploads
  tipo            ENUM('formato','guia','manual','otro') NOT NULL DEFAULT 'formato',
  tiene_guia      TINYINT(1)    NOT NULL DEFAULT 0,
  nombre_guia     VARCHAR(255)  DEFAULT NULL,   -- archivo de guía separado
  vigente         TINYINT(1)    NOT NULL DEFAULT 1,
  orden           TINYINT       NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (etapa_id) REFERENCES etapas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── TABLA: descargas ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS descargas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  documento_id    INT           NOT NULL,
  usuario_id      INT           DEFAULT NULL,   -- NULL = estudiante no logueado
  ip_origen       VARCHAR(60)   DEFAULT NULL,
  user_agent      VARCHAR(300)  DEFAULT NULL,
  fecha           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)   ON DELETE SET NULL
) ENGINE=InnoDB;
