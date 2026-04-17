// migrar.js
// Agrega la columna fecha_fin a suscripciones y actualiza el trigger de pagos.
// Ejecutar UNA sola vez: node migrar.js

require('dotenv').config();
const db = require('./db');

async function migrar() {
  console.log('🔧 Iniciando migración...');

  // 1. Agregar columna fecha_fin (IF NOT EXISTS evita error si ya existe)
  await db.query(`
    ALTER TABLE suscripciones
    ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;
  `);
  console.log('✅ Columna fecha_fin agregada (o ya existía).');

  // 2. Crear/reemplazar la función del trigger para incluir 30 días
  await db.query(`
    CREATE OR REPLACE FUNCTION fn_pago_exitoso()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE suscripciones
      SET
        plan         = 'premium',
        estado       = 'activa',
        fecha_inicio = NOW(),
        fecha_fin    = NOW() + INTERVAL '30 days'
      WHERE id_usuario = NEW.id_usuario;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  console.log('✅ Función del trigger actualizada (30 días de premium).');

  // 3. Eliminar el trigger viejo y recrearlo apuntando a la función actualizada
  await db.query(`DROP TRIGGER IF EXISTS trg_pago_exitoso ON pagos;`);
  await db.query(`
    CREATE TRIGGER trg_pago_exitoso
    AFTER INSERT ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION fn_pago_exitoso();
  `);
  console.log('✅ Trigger trg_pago_exitoso recreado.');

  // 4. Crear tabla medicacion_usuario si no existe
  await db.query(`
    CREATE TABLE IF NOT EXISTS medicacion_usuario (
      id_medicacion  SERIAL PRIMARY KEY,
      id_cliente     INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
      id_medicamento INT NOT NULL REFERENCES medicamentos(id_medicamento) ON DELETE CASCADE,
      dosis          VARCHAR(100) NOT NULL,
      frecuencia     VARCHAR(100) NOT NULL,
      hora_inicio    TIME,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    ALTER TABLE medicacion_usuario
    ALTER COLUMN hora_inicio DROP NOT NULL;
  `);

  console.log('✅ Tabla medicacion_usuario lista.');

  // 5. Crear tabla video_usuario si no existe
  await db.query(`
    CREATE TABLE IF NOT EXISTS video_usuario (
      id_video_usuario SERIAL PRIMARY KEY,
      id_cliente       INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
      id_video         INT NOT NULL REFERENCES videos(id_video) ON DELETE CASCADE,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (id_cliente, id_video)
    );
  `);
  console.log('✅ Tabla video_usuario lista.');

  console.log('🎉 Migración completada. Ya puedes usar la app.');
  process.exit(0);
}

migrar().catch((err) => {
  console.error('❌ Error en migración:', err.message);
  process.exit(1);
});
