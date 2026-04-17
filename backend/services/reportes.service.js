const db = require('../db');

async function obtenerReporteClientes() {
  const [resumen, registros] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total_registrados,
        COUNT(*) FILTER (
          WHERE COALESCE(c.activo, true) = true
            AND COALESCE(u.activo, true) = true
        )::int AS clientes_activos,
        COUNT(*) FILTER (
          WHERE NOT (
            COALESCE(c.activo, true) = true
            AND COALESCE(u.activo, true) = true
          )
        )::int AS clientes_dados_baja
      FROM clientes c
      JOIN usuarios u ON u.id_usuario = c.id_usuario
    `),
    db.query(`
      SELECT
        c.id_cliente,
        u.nombre AS cliente,
        u.email,
        u.created_at AS fecha_registro,
        CASE
          WHEN COALESCE(c.activo, true) = true
           AND COALESCE(u.activo, true) = true
          THEN 'Activo'
          ELSE 'Baja'
        END AS estado
      FROM clientes c
      JOIN usuarios u ON u.id_usuario = c.id_usuario
      ORDER BY c.id_cliente DESC
    `),
  ]);

  return {
    resumen: resumen.rows[0],
    registros: registros.rows,
  };
}

async function obtenerReporteSuscripciones() {
  const [resumen, registros] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total_suscripciones,
        COUNT(*) FILTER (WHERE s.plan = 'estandar')::int AS estandar,
        COUNT(*) FILTER (WHERE s.plan = 'premium')::int AS premium,
        COUNT(*) FILTER (WHERE s.estado = 'activa')::int AS activas,
        COUNT(*) FILTER (WHERE s.estado = 'vencida')::int AS vencidas,
        COUNT(*) FILTER (WHERE s.estado = 'cancelada')::int AS canceladas
      FROM suscripciones s
    `),
    db.query(`
      SELECT
        s.id_suscripcion,
        u.nombre AS cliente,
        u.email,
        s.plan,
        s.estado,
        s.fecha_inicio,
        s.fecha_fin
      FROM suscripciones s
      JOIN usuarios u ON u.id_usuario = s.id_usuario
      ORDER BY s.id_suscripcion DESC
    `),
  ]);

  return {
    resumen: resumen.rows[0],
    registros: registros.rows,
  };
}

async function obtenerReporteVideosAsignados() {
  const base = await db.query(`
    WITH videos_por_cliente AS (
      SELECT
        c.id_cliente,
        u.nombre AS cliente,
        u.email,
        COALESCE(u.activo, true) AS usuario_activo,
        COALESCE(s.plan, 'estandar') AS plan,
        COALESCE(s.estado, 'activa') AS estado_suscripcion,
        COUNT(vu.id_video_usuario)::int AS videos_asignados
      FROM clientes c
      JOIN usuarios u ON u.id_usuario = c.id_usuario
      LEFT JOIN LATERAL (
        SELECT s1.plan, s1.estado
        FROM suscripciones s1
        WHERE s1.id_usuario = c.id_usuario
        ORDER BY s1.id_suscripcion DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN video_usuario vu ON vu.id_cliente = c.id_cliente
      GROUP BY
        c.id_cliente,
        u.nombre,
        u.email,
        u.activo,
        s.plan,
        s.estado
    )
    SELECT
      id_cliente,
      cliente,
      email,
      videos_asignados,
      CASE
        WHEN plan = 'premium' THEN 'Si'
        ELSE 'No'
      END AS tiene_premium,
      CASE
        WHEN videos_asignados = 0 THEN 'Sin videos asignados'
        WHEN plan = 'premium'
         AND estado_suscripcion = 'activa'
         AND usuario_activo = true
        THEN 'Habilitado'
        ELSE 'Restringido'
      END AS estado_acceso
    FROM videos_por_cliente
    ORDER BY cliente ASC
  `);

  const resumen = await db.query(`
    WITH videos_por_cliente AS (
      SELECT
        c.id_cliente,
        COALESCE(u.activo, true) AS usuario_activo,
        COALESCE(s.plan, 'estandar') AS plan,
        COALESCE(s.estado, 'activa') AS estado_suscripcion,
        COUNT(vu.id_video_usuario)::int AS videos_asignados
      FROM clientes c
      JOIN usuarios u ON u.id_usuario = c.id_usuario
      LEFT JOIN LATERAL (
        SELECT s1.plan, s1.estado
        FROM suscripciones s1
        WHERE s1.id_usuario = c.id_usuario
        ORDER BY s1.id_suscripcion DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN video_usuario vu ON vu.id_cliente = c.id_cliente
      GROUP BY c.id_cliente, u.activo, s.plan, s.estado
    )
    SELECT
      COUNT(*)::int AS total_clientes,
      COALESCE(SUM(videos_asignados), 0)::int AS total_videos_asignados,
      COUNT(*) FILTER (WHERE plan = 'premium')::int AS clientes_premium,
      COUNT(*) FILTER (
        WHERE videos_asignados > 0
          AND plan = 'premium'
          AND estado_suscripcion = 'activa'
          AND usuario_activo = true
      )::int AS acceso_habilitado,
      COUNT(*) FILTER (
        WHERE videos_asignados > 0
          AND NOT (
            plan = 'premium'
            AND estado_suscripcion = 'activa'
            AND usuario_activo = true
          )
      )::int AS acceso_restringido
    FROM videos_por_cliente
  `);

  return {
    resumen: resumen.rows[0],
    registros: base.rows,
  };
}

async function obtenerReporteMedicamentosAsignados() {
  const [resumen, registros] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total_asignaciones,
        COUNT(DISTINCT mu.id_cliente)::int AS clientes_con_medicacion
      FROM medicacion_usuario mu
    `),
    db.query(`
      SELECT
        c.id_cliente,
        u.nombre AS cliente,
        m.nombre AS medicamento,
        mu.dosis,
        mu.frecuencia,
        TO_CHAR(mu.hora_inicio, 'HH24:MI') AS hora_inicio
      FROM medicacion_usuario mu
      JOIN clientes c ON c.id_cliente = mu.id_cliente
      JOIN usuarios u ON u.id_usuario = c.id_usuario
      JOIN medicamentos m ON m.id_medicamento = mu.id_medicamento
      ORDER BY u.nombre ASC, m.nombre ASC
    `),
  ]);

  return {
    resumen: resumen.rows[0],
    registros: registros.rows,
  };
}

module.exports = {
  obtenerReporteClientes,
  obtenerReporteSuscripciones,
  obtenerReporteVideosAsignados,
  obtenerReporteMedicamentosAsignados,
};
