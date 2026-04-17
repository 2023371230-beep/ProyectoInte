// services/dashboard.service.js
// Estadísticas rápidas para las tarjetas del dashboard administrativo.

const db = require('../db');

async function obtenerResumen() {
  // Ejecutamos todas las consultas en paralelo para que sea rápido
  const [clientes, medicamentos, videos, suscripciones, pagos] = await Promise.all([
    db.query('SELECT COUNT(*) AS total FROM clientes'),
    db.query('SELECT COUNT(*) AS total FROM medicamentos'),
    db.query('SELECT COUNT(*) AS total FROM videos'),
    db.query("SELECT COUNT(*) AS total FROM suscripciones WHERE estado = 'activa'"),
    db.query('SELECT COALESCE(SUM(monto), 0) AS total FROM pagos'),
  ]);

  return {
    total_clientes:              Number(clientes.rows[0].total),
    total_medicamentos:          Number(medicamentos.rows[0].total),
    total_videos:                Number(videos.rows[0].total),
    total_suscripciones_activas: Number(suscripciones.rows[0].total),
    total_ingresos:              Number(pagos.rows[0].total),
  };
}

module.exports = { obtenerResumen };
