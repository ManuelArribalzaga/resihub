-- ═══════════════════════════════════════════════════
-- RESIHUB – Esquema de Base de Datos
-- Instituto Tecnológico de Minatitlán – TecNM
-- ═══════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS resihub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resihub_db;

-- ─────────────────────────────────────────────
-- TABLA: usuarios
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL,
  email        VARCHAR(120) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  rol          ENUM('admin','estudiante') NOT NULL DEFAULT 'estudiante',
  activo       TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- TABLA: etapas
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etapas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  descripcion TEXT,
  icono       VARCHAR(60) DEFAULT 'bi-file-earmark',
  color       VARCHAR(30) DEFAULT 'primary',
  orden       INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- TABLA: documentos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  etapa_id     INT NOT NULL,
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  nombre_archivo VARCHAR(255),
  ruta_archivo VARCHAR(255),
  tipo         ENUM('formato','guia','manual') NOT NULL DEFAULT 'formato',
  vigente      TINYINT(1) NOT NULL DEFAULT 1,
  descargas    INT NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_etapa FOREIGN KEY (etapa_id) REFERENCES etapas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- TABLA: descargas
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS descargas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  documento_id  INT NOT NULL,
  ip_origen     VARCHAR(45),
  user_agent    VARCHAR(300),
  fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_desc_doc FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- TABLA: configuracion  (textos editables del portal)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS configuracion (
  clave   VARCHAR(80) PRIMARY KEY,
  valor   TEXT,
  tipo    ENUM('texto','booleano','numero') DEFAULT 'texto',
  label   VARCHAR(120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
