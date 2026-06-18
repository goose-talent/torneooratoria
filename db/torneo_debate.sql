-- Base de datos: torneo_debate
-- Importar en aaPanel: Panel → Base de datos → Importar

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `inscripciones` (
  `id`              varchar(50)   NOT NULL,
  `torneo`          varchar(200)  DEFAULT NULL,
  `denominacion`    varchar(200)  NOT NULL,
  `direccion`       varchar(300)  DEFAULT NULL,
  `localidad`       varchar(100)  DEFAULT NULL,
  `provincia`       varchar(100)  DEFAULT NULL,
  `codigo_postal`   varchar(10)   DEFAULT NULL,
  `telefono_centro` varchar(30)   DEFAULT NULL,
  `correo_centro`   varchar(200)  DEFAULT NULL,
  `director`        varchar(200)  DEFAULT NULL,
  `profesores`      longtext      CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `equipos`         longtext      CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fecha`           datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
