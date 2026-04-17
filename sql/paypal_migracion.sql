-- ============================================================
-- Migración: soporte para suscripción premium con fecha_fin
-- Ejecutar UNA sola vez en la base PostgreSQL (discapacidad_db)
-- ============================================================

-- 1. Agregar columna fecha_fin a suscripciones (si no existe)
ALTER TABLE suscripciones
  ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;

-- 2. Reemplazar la función del trigger para incluir 30 días
--    El trigger trg_pago_exitoso llama a esta función.
CREATE OR REPLACE FUNCTION fn_pago_exitoso()
RETURNS TRIGGER AS $$
BEGIN
  -- Al registrar un pago exitoso:
  --   · cambia el plan a premium
  --   · establece estado activa
  --   · registra la fecha de inicio (hoy)
  --   · calcula la fecha de vencimiento (hoy + 30 días)
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

-- 3. Eliminar el trigger existente (puede tener función distinta)
DROP TRIGGER IF EXISTS trg_pago_exitoso ON pagos;

-- 4. Recrear el trigger apuntando a la función actualizada
CREATE TRIGGER trg_pago_exitoso
AFTER INSERT ON pagos
FOR EACH ROW
EXECUTE FUNCTION fn_pago_exitoso();

-- Verificar que quedó bien
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_pago_exitoso';
