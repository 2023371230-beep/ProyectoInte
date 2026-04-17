// services/suscripciones.service.js
// Lista y gestión de suscripciones. La actualización a premium ocurre
// automáticamente via el trigger trg_pago_exitoso al insertar un pago.

const db = require('../db');

async function obtenerTodas() {
  const result = await db.query(`
    SELECT
      s.id_suscripcion,
      u.nombre,
      u.email,
      s.plan,
      s.estado,
      s.fecha_inicio
    FROM suscripciones s
    JOIN usuarios u ON u.id_usuario = s.id_usuario
    WHERE u.activo = true
    ORDER BY s.id_suscripcion DESC
  `);
  return result.rows;
}

async function obtenerPorId(id) {
  const result = await db.query(`
    SELECT
      s.id_suscripcion,
      s.id_usuario,
      u.nombre,
      u.email,
      s.plan,
      s.estado,
      s.fecha_inicio
    FROM suscripciones s
    JOIN usuarios u ON u.id_usuario = s.id_usuario
    WHERE s.id_suscripcion = $1
      AND u.activo = true
  `, [id]);
  if (result.rows.length === 0) throw new Error('Suscripción no encontrada.');
  return result.rows[0];
}

// El admin puede cambiar manualmente el estado de una suscripción
async function actualizarEstado(id, { plan, estado }) {
  const result = await db.query(
    'UPDATE suscripciones SET plan = $1, estado = $2 WHERE id_suscripcion = $3 RETURNING *',
    [plan, estado, id]
  );
  if (result.rows.length === 0) throw new Error('Suscripción no encontrada.');
  return result.rows[0];
}

// Devuelve la suscripción del usuario autenticado (usado por la app móvil).
// Si el usuario no tiene suscripción (ej. admin) devuelve un objeto por defecto
// en lugar de lanzar un error, para que la app móvil siempre pueda mostrar el dashboard.
async function getSuscripcionPorUsuario(id_usuario) {
  const result = await db.query(`
    SELECT
      s.id_suscripcion,
      s.plan,
      s.estado,
      s.fecha_inicio,
      s.fecha_fin,
      u.nombre,
      u.email
    FROM suscripciones s
    JOIN usuarios u ON u.id_usuario = s.id_usuario
    WHERE s.id_usuario = $1
    ORDER BY s.id_suscripcion DESC
    LIMIT 1
  `, [id_usuario]);

  // Si no existe suscripción (ej. admin), devuelve valores por defecto
  if (result.rows.length === 0) {
    return {
      id_suscripcion: 0,
      plan:         'estandar',
      estado:       'activa',
      fecha_inicio: new Date().toISOString(),
      fecha_fin:    null,
    };
  }

  return result.rows[0];
}

module.exports = { obtenerTodas, obtenerPorId, actualizarEstado, getSuscripcionPorUsuario };
