-- Script: bs.sql_
-- Esquema unificado: `usuarios` y `clientes` (antes "pacientes").
-- Crea la base y las tablas, enlazando cada cliente con un usuario (tip_usu=2).

CREATE DATABASE IF NOT EXISTS `rompiendo_barreras` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `rompiendo_barreras`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usr` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nom_usr` VARCHAR(255) NOT NULL,
  `mail` VARCHAR(255) NOT NULL UNIQUE,
  `pass` VARCHAR(255) NOT NULL,
  `dir_usr` VARCHAR(255) DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `tip_usu` TINYINT(1) NOT NULL DEFAULT 2 COMMENT '1=admin, 2=cliente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `id_usr` INT UNSIGNED NOT NULL,
  `nom_cliente` VARCHAR(255) NOT NULL,
  `edad` INT(3) DEFAULT NULL,
  `diagnostico` TEXT DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`id_usr`) REFERENCES `usuarios`(`id_usr`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ejemplos (usar hashes en producción):
INSERT INTO `usuarios` (`nom_usr`, `mail`, `pass`, `dir_usr`, `telefono`, `tip_usu`) VALUES
('admin', 'admin@clinica.test', 'admin123', 'Dirección admin', '555-0000', 1),
('juan.perez', 'juan.perez@clinica.test', 'juan123', 'Calle Falsa 123', '555-1234', 2),
('maria.lopez', 'maria.lopez@clinica.test', 'maria123', 'Av. Siempre Viva 742', '555-5678', 2);

-- Insertar clientes enlazados a los usuarios anteriores (ajusta IDs tras verificar inserciones)
INSERT INTO `clientes` (`id_usr`, `nom_cliente`, `edad`, `diagnostico`, `direccion`, `telefono`) VALUES
(2, 'Juan Pérez', 45, 'Hemiplejia izquierda, rehabilitación en curso', 'Calle Falsa 123', '555-1234'),
(3, 'María López', 32, 'Lesión medular, terapia intensiva', 'Av. Siempre Viva 742', '555-5678');

-- Notas:
-- 1) En la aplicación PHP se debe usar la tabla `clientes` en lugar de `pacientes`.
-- 2) Flujo sugerido: crear usuario (tip_usu=2) y luego crear cliente con `id_usr` apuntando al usuario.
-- 3) En producción, usa `password_hash()` desde PHP para insertar contraseñas.

-- Fin del script bs.sql_

-- Tabla de citas: almacena citas agendadas por usuarios (clientes)
CREATE TABLE IF NOT EXISTS `citas` (
  `id_cita` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `id_usr` INT UNSIGNED NOT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `motivo` VARCHAR(512) DEFAULT NULL,
  `estado` VARCHAR(20) DEFAULT 'pendiente' COMMENT 'pendiente, cancelada',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_citas_usuario` FOREIGN KEY (`id_usr`) REFERENCES `usuarios`(`id_usr`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de médicos fisioterapeutas disponibles para citas
CREATE TABLE IF NOT EXISTS `medicos` (
  `id_medico` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `especialidad` VARCHAR(120) NOT NULL DEFAULT 'Fisioterapeuta',
  `horarios_disponibles` VARCHAR(255) NOT NULL COMMENT 'Horas separadas por coma. Ej: 09:00,10:30,12:00',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medicos` (`nombre`, `especialidad`, `horarios_disponibles`, `activo`)
SELECT * FROM (
  SELECT 'Dra. Ana López' AS nombre, 'Fisioterapeuta general' AS especialidad, '09:00,10:30,12:00,16:00' AS horarios_disponibles, 1 AS activo
  UNION ALL
  SELECT 'Dr. Luis García', 'Fisioterapeuta deportivo', '08:30,11:00,14:30,17:00', 1
  UNION ALL
  SELECT 'Dra. Sofía Méndez', 'Fisioterapeuta de columna', '09:30,11:30,15:00,18:00', 1
  UNION ALL
  SELECT 'Dr. Ricardo Pérez', 'Fisioterapeuta ortopédico', '08:00,10:00,13:00,16:30', 1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `medicos` LIMIT 1);

-- Ejemplo de insert para pruebas (ajusta id_usr según tus usuarios):
-- INSERT INTO `citas` (`id_usr`, `fecha`, `hora`, `motivo`) VALUES (2, '2025-12-10', '10:30:00', 'Consulta inicial');

-- Tabla de productos: almacena productos de rehabilitación para discapacidad motriz
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `imagen_url` VARCHAR(1000) DEFAULT NULL COMMENT 'URL externa o ruta relativa a la imagen del producto',
  `stock` INT DEFAULT 0,
  `categoria` VARCHAR(100) DEFAULT 'rehabilitacion',
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_productos_usuario` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usr`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ejemplos de productos para pruebas:
INSERT INTO `productos` (`nombre`, `descripcion`, `precio`, `imagen_url`, `stock`, `categoria`, `created_by`) VALUES
('Guante de Rehabilitación Motriz', 'Guante especializado que ayuda con la movilidad de la mano mediante estimulación controlada', 1299.99, 'https://http2.mlstatic.com/D_NQ_NP_812532-MLU78418904062_082024-O.webp', 10, 'mano', 1),
('Andadera Ergonómica Ajustable', 'Andadera con soporte ergonómico ajustable para mejorar la movilidad y balance', 2499.99, 'https://hergom-medical.com/cdn/shop/products/Andaderaplegableconruedas_asiento_portabastonyajustedealturaMarcaHandy_720x.webp?v=1673374242', 5, 'movilidad', 1),
('Banda Elástica de Resistencia', 'Set de bandas elásticas de diferentes resistencias para terapia física', 299.99, 'https://backbone.care/cdn/shop/articles/B-Flexible_1024x1024.jpg?v=1698157063', 20, 'ejercicio', 1),
('Ortesis de Muñeca', 'Ortesis ajustable para soporte y rehabilitación de muñeca', 599.99, 'https://m.media-amazon.com/images/I/613hAxjDlfL._AC_UF350,350_QL80_.jpg', 15, 'mano', 1);

-- Tabla de videos: comentada, reemplazada por productos
-- CREATE TABLE IF NOT EXISTS `videos` (
--   `id_video` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   `titulo` VARCHAR(255) NOT NULL,
--   `descripcion` TEXT DEFAULT NULL,
--   `url_video` VARCHAR(1000) NOT NULL COMMENT 'URL externa o ruta relativa al archivo (p.ej. uploads/videos/archivo.mp4)',
--   `created_by` INT UNSIGNED DEFAULT NULL,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT `fk_videos_usuario` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usr`) ON DELETE SET NULL ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Tabla de compras: almacena las compras realizadas por los clientes
CREATE TABLE IF NOT EXISTS `compras` (
  `id_compra` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `id_usr` INT UNSIGNED NOT NULL,
  `id_producto` INT UNSIGNED NOT NULL,
  `nombre_envio` VARCHAR(255) NOT NULL,
  `direccion_envio` VARCHAR(255) NOT NULL,
  `telefono_envio` VARCHAR(50) NOT NULL,
  `metodo_pago` VARCHAR(50) NOT NULL,
  `fecha_compra` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_compras_usuario` FOREIGN KEY (`id_usr`) REFERENCES `usuarios`(`id_usr`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_compras_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
g