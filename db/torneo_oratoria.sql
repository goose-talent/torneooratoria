-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-06-2026 a las 13:23:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `torneo_oratoria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `sala` varchar(100) DEFAULT NULL,
  `sala_r2` varchar(100) DEFAULT NULL,
  `ronda` varchar(20) DEFAULT NULL,
  `alumnos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`alumnos`)),
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `equipos`
--

INSERT INTO `equipos` (`id`, `nombre`, `sala`, `sala_r2`, `ronda`, `alumnos`, `fecha`) VALUES
('eq_1780901328127', 'Brewster', 'Auditorio', 'Ludoteca', '1', '[\"Marta Martin\",\"Romero Santos\",\"Patricia G\\u00f3mez\",\"Samuel Ortiz\",\"Sara Parker\",\"Samanta Ro\"]', '2026-06-11 10:14:15'),
('eq_1780901365027', 'La Salle', 'Auditorio', 'Poli 2', '', '[\"Rosa Ramos\",\"Maria Ruiz\",\"Esteban Perez\",\"Maximo Lopez\",\"Tomas Alvarez\",\"Antonio Perez\"]', '2026-06-11 10:14:15'),
('eq_1780901434771', 'Claudio Moyano', 'Ludoteca', 'Poli 2', '', '[\"Tamara Gonzalez\",\"Hugo Casa\",\"Aitor Garcia\",\"Francisco Antiller\",\"Macarena Miranda\",\"Lucas Hernandez\"]', '2026-06-11 10:14:15'),
('eq_1780901528046', 'Esclavas C', 'Ludoteca', 'Auditorio', '', '[\"Julio Fernandez\",\"Luisa Mejilas\",\"Sean Smith\",\"Neizan Perea\",\"Martina Cabello\",\"Gloria Martin\"]', '2026-06-11 10:14:15'),
('eq_1780901599190', 'Divina Pastora B', 'Auditorio', 'Poli 2', '', '[\"Ruben De la Rosa\",\"Roberto Zapatero\",\"Raul Escudero\",\"Marina Moreno\",\"Pedro Gil\",\"Manuel Perez\"]', '2026-06-11 10:14:15'),
('eq_1780901647644', 'Esclavas Chamberí A', 'Poli 2', 'Ludoteca', '', '[\"Javier Rangel\",\"Lucia Rencio\",\"Alonso Vera\",\"Laura Riego\",\"Dolores Vargas\",\"Israel Rodriguez\"]', '2026-06-11 10:14:15'),
('eq_1780902531987', 'María Inmaculada B', 'Ludoteca', 'Ludoteca', '', '[\"Cayetano Rodriguez\",\"Mariana Vega\",\"Magadalena Perez\",\"Cristina Romero\",\"Esteban Luca\",\"Timothy Blake\"]', '2026-06-11 10:14:15'),
('eq_1780902604387', 'Rufino Blanco B', 'Poli 2', 'Auditorio', '', '[\"Ruben Abad\",\"Sergio Amaya\",\"Gema Reyes\",\"Amparo Luna\",\"Luz Cordero\",\"Enrique Perez\"]', '2026-06-11 10:14:15'),
('eq_1781165535747', 'Asunción Rincón', 'Ludoteca', 'Auditorio', '1', '[\"Marta\",\"Maria\",\"Pedro\",\"Juan\",\"Mariano\",\"Antonio\"]', '2026-06-11 10:12:15'),
('eq_1781244623485', 'Divina Pastora A', 'Poli 2', 'Poli 2', NULL, '[\"Maria Delibes\",\"Ruth Paramo\",\"Oscar De Luca\",\"Mariana Moreno\",\"Esther Rolo\",\"Tamara Exposito\"]', '2026-06-12 08:10:23'),
('eq_1781509561203', 'Chamberi C', 'Poli 2', 'Ludoteca', NULL, '[\"marta adamuzx\",\"Pedro Paramo\"]', '2026-06-15 09:46:01'),
('eq_1781589503727', 'Eufino Blanco A', 'Poli 2', 'Auditorio', NULL, '[\"Noelia Jimenez\"]', '2026-06-16 07:58:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntuaciones`
--

CREATE TABLE `puntuaciones` (
  `id` varchar(50) NOT NULL,
  `equipoId` varchar(50) NOT NULL,
  `alumnoIdx` int(11) DEFAULT NULL,
  `alumnoNombreOtro` varchar(200) DEFAULT NULL,
  `prueba` varchar(100) NOT NULL,
  `sala` varchar(50) DEFAULT NULL,
  `ronda` varchar(10) DEFAULT NULL,
  `criterios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criterios`)),
  `total` int(11) DEFAULT 0,
  `aviso` varchar(50) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `puntuaciones`
--

INSERT INTO `puntuaciones` (`id`, `equipoId`, `alumnoIdx`, `alumnoNombreOtro`, `prueba`, `sala`, `ronda`, `criterios`, `total`, `aviso`, `fecha`) VALUES
('p_1780904678710', 'eq_1780901328127', 0, NULL, 'hazme-fan', '1', '1', '{\"opinion\":1,\"emocion\":2,\"razones\":2,\"enganchar\":2,\"organizar\":2}', 9, 'aviso', '2026-06-08 09:44:38'),
('p_1780904695768', 'eq_1780901365027', 0, NULL, 'fabrica-historias', '1', '1', '{\"inicio\":1,\"nudo\":1,\"desenlace\":1,\"personajes\":1,\"emocion\":2}', 5, 'falta-leve', '2026-06-08 09:44:55'),
('p_1780906435347', 'eq_1780901328127', 0, NULL, 'hazme-fan', '1', '1', '{\"opinion\":1,\"razones\":1,\"emocion\":1,\"enganchar\":1,\"organizar\":1}', 5, NULL, '2026-06-08 10:13:55'),
('p_1780906900769', 'eq_1780901647644', 1, NULL, 'hazme-fan', '2', '1', '{\"opinion\":2,\"razones\":2,\"emocion\":2,\"enganchar\":2,\"organizar\":2}', 10, NULL, '2026-06-08 10:21:40'),
('p_1780906939917', 'eq_1780901434771', 0, NULL, 'hazme-fan', '2', '1', '{\"opinion\":1,\"razones\":1,\"emocion\":2,\"organizar\":2,\"enganchar\":2}', 8, NULL, '2026-06-08 10:22:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE IF NOT EXISTS `inscripciones` (
  `id` varchar(50) NOT NULL,
  `denominacion` varchar(200) NOT NULL,
  `director` varchar(200) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `localidad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `telefono_centro` varchar(30) DEFAULT NULL,
  `correo_centro` varchar(200) DEFAULT NULL,
  `profesores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `equipos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `puntuaciones`
--
ALTER TABLE `puntuaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipoId` (`equipoId`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `puntuaciones`
--
ALTER TABLE `puntuaciones`
  ADD CONSTRAINT `puntuaciones_ibfk_1` FOREIGN KEY (`equipoId`) REFERENCES `equipos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
