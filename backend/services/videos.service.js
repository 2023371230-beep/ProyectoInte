// services/videos.service.js
// CRUD de videos de rehabilitación (YouTube embeds).
// El campo youtube_id es el código del video en YouTube (ej: "dQw4w9WgXcQ").

const db = require('../db');

async function obtenerTodos() {
  const result = await db.query(
    'SELECT id_video, titulo, youtube_id, categoria FROM videos ORDER BY id_video DESC'
  );
  return result.rows;
}

async function obtenerPorId(id) {
  const result = await db.query(
    'SELECT id_video, titulo, youtube_id, categoria FROM videos WHERE id_video = $1',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Video no encontrado.');
  return result.rows[0];
}

async function crear({ titulo, youtube_id, categoria }) {
  const result = await db.query(
    'INSERT INTO videos (titulo, youtube_id, categoria) VALUES ($1, $2, $3) RETURNING *',
    [titulo, youtube_id, categoria]
  );
  return result.rows[0];
}

async function actualizar(id, { titulo, youtube_id, categoria }) {
  const result = await db.query(
    'UPDATE videos SET titulo = $1, youtube_id = $2, categoria = $3 WHERE id_video = $4 RETURNING *',
    [titulo, youtube_id, categoria, id]
  );
  if (result.rows.length === 0) throw new Error('Video no encontrado.');
  return result.rows[0];
}

async function eliminar(id) {
  const result = await db.query(
    'DELETE FROM videos WHERE id_video = $1 RETURNING id_video',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Video no encontrado.');
  return { mensaje: 'Video eliminado correctamente.' };
}

// Admin asigna un video a un cliente específico
async function asignarVideo({ id_cliente, id_video }) {
  const cliente = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [id_cliente]);
  if (cliente.rows.length === 0) throw new Error('Cliente no encontrado.');

  const video = await db.query('SELECT id_video FROM videos WHERE id_video = $1', [id_video]);
  if (video.rows.length === 0) throw new Error('Video no encontrado.');

  const result = await db.query(
    `INSERT INTO video_usuario (id_cliente, id_video)
     VALUES ($1, $2)
     ON CONFLICT (id_cliente, id_video) DO NOTHING
     RETURNING *`,
    [id_cliente, id_video]
  );
  return result.rows[0] ?? { id_cliente, id_video, ya_asignado: true };
}

// Devuelve los videos asignados al cliente autenticado
async function getVideosCliente(id_usuario) {
  const result = await db.query(`
    SELECT
      v.id_video,
      v.titulo,
      v.youtube_id,
      v.categoria
    FROM video_usuario vu
    JOIN videos   v ON v.id_video    = vu.id_video
    JOIN clientes c ON c.id_cliente  = vu.id_cliente
    WHERE c.id_usuario = $1
    ORDER BY v.id_video DESC
  `, [id_usuario]);
  return result.rows;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, asignarVideo, getVideosCliente };
