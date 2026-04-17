-- Script de migración para actualizar la base de datos
-- Ejecutar este script si ya tienes datos existentes
-- Asegúrate de estar usando la base `rompiendo_barreras` (o ajusta el nombre según tu config).
-- Ejemplo: USE rompiendo_barreras;

-- 1. Agregar columna estado a la tabla citas si no existe (compatible MySQL < 8 sin IF NOT EXISTS)
SET @col_estado := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'citas' AND column_name = 'estado'
);
SET @sql_add_estado := IF(@col_estado = 0,
  'ALTER TABLE `citas` ADD COLUMN `estado` VARCHAR(20) DEFAULT "pendiente" COMMENT "pendiente, cancelada" AFTER `motivo`;',
  'SELECT "columna estado ya existe";'
);
PREPARE stmt FROM @sql_add_estado; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Actualizar todas las citas existentes al estado 'pendiente'
UPDATE `citas` SET `estado` = 'pendiente' WHERE `estado` IS NULL;

-- 3. Crear tabla de productos si no existe
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

-- 4. Insertar productos de ejemplo si la tabla está vacía
INSERT INTO `productos` (`nombre`, `descripcion`, `precio`, `imagen_url`, `stock`, `categoria`, `created_by`)
SELECT * FROM (
  SELECT 
    'Guante de Rehabilitación Motriz' as nombre,
    'Guante especializado que ayuda con la movilidad de la mano mediante estimulación controlada' as descripcion,
    1299.99 as precio,
    'https://via.placeholder.com/300x200?text=Guante+Rehabilitacion' as imagen_url,
    10 as stock,
    'mano' as categoria,
    1 as created_by
  UNION ALL
  SELECT 
    'Andadera Ergonómica Ajustable',
    'Andadera con soporte ergonómico ajustable para mejorar la movilidad y balance',
    2499.99,
    'https://via.placeholder.com/300x200?text=Andadera',
    5,
    'movilidad',
    1
  UNION ALL
  SELECT 
    'Banda Elástica de Resistencia',
    'Set de bandas elásticas de diferentes resistencias para terapia física',
    299.99,
    'https://via.placeholder.com/300x200?text=Bandas+Elasticas',
    20,
    'ejercicio',
    1
  UNION ALL
  SELECT 
    'Ortesis de Muñeca',
    'Ortesis ajustable para soporte y rehabilitación de muñeca',
    599.99,
    'https://via.placeholder.com/300x200?text=Ortesis+Muneca',
    15,
    'mano',
    1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `productos` LIMIT 1);

-- 5. Crear tabla de médicos si no existe
CREATE TABLE IF NOT EXISTS `medicos` (
  `id_medico` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `especialidad` VARCHAR(120) NOT NULL DEFAULT 'Fisioterapeuta',
  `horarios_disponibles` VARCHAR(255) NOT NULL COMMENT 'Horas separadas por coma. Ej: 09:00,10:30,12:00',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Insertar fisioterapeutas base si la tabla está vacía
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

-- 7. Sincronizar teléfono de usuarios cliente desde tabla clientes
UPDATE usuarios u
INNER JOIN clientes c ON u.id_usr = c.id_usr
SET u.telefono = COALESCE(u.telefono, c.telefono)
WHERE u.tip_usu = 2 AND (u.telefono IS NULL OR u.telefono = '');

-- 8. Verificación de clientes en usuarios
SELECT 
  id_usr as ID,
  nom_usr as Nombre,
  mail as Correo,
  telefono as Telefono,
  tip_usu as Tipo
FROM usuarios 
WHERE tip_usu = 2
ORDER BY id_usr;

-- Fin de la migración
