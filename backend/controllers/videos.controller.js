// controllers/videos.controller.js

const videosService = require('../services/videos.service');
const suscripcionesService = require('../services/suscripciones.service');

async function listar(req, res) {
  try {
    const videos = await videosService.obtenerTodos();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const video = await videosService.obtenerPorId(req.params.id);
    res.json(video);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function crear(req, res) {
  const { titulo, youtube_id, categoria } = req.body;

  if (!titulo || !youtube_id || !categoria) {
    return res.status(400).json({ error: 'Título, youtube_id y categoría son requeridos.' });
  }

  try {
    const video = await videosService.crear({ titulo, youtube_id, categoria });
    res.status(201).json(video);
  } catch (err) {
    const mensaje = err.message.includes('unique')
      ? 'Ya existe un video con ese youtube_id.'
      : err.message;
    res.status(400).json({ error: mensaje });
  }
}

async function actualizar(req, res) {
  const { titulo, youtube_id, categoria } = req.body;

  if (!titulo || !youtube_id || !categoria) {
    return res.status(400).json({ error: 'Título, youtube_id y categoría son requeridos.' });
  }

  try {
    const video = await videosService.actualizar(req.params.id, { titulo, youtube_id, categoria });
    res.json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await videosService.eliminar(req.params.id);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

// Admin asigna un video a un cliente
async function asignar(req, res) {
  const { id_cliente, id_video } = req.body;
  if (!id_cliente || !id_video) {
    return res.status(400).json({ error: 'id_cliente e id_video son requeridos.' });
  }
  try {
    const resultado = await videosService.asignarVideo({ id_cliente: Number(id_cliente), id_video: Number(id_video) });
    res.status(201).json({ ...resultado, mensaje: 'Video asignado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Devuelve solo los videos asignados al cliente autenticado (app móvil)
async function misVideos(req, res) {
  try {
    const suscripcion = await suscripcionesService.getSuscripcionPorUsuario(req.usuario.id);
    if (suscripcion.plan !== 'premium') {
      return res.status(403).json({ error: 'Requiere suscripción premium' });
    }

    const videos = await videosService.getVideosCliente(req.usuario.id);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, asignar, misVideos };
