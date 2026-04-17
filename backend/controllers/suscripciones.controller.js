// controllers/suscripciones.controller.js

const suscripcionesService = require('../services/suscripciones.service');

async function listar(req, res) {
  try {
    const suscripciones = await suscripcionesService.obtenerTodas();
    res.json(suscripciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const suscripcion = await suscripcionesService.obtenerPorId(req.params.id);
    res.json(suscripcion);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function actualizar(req, res) {
  const { plan, estado } = req.body;

  const planesValidos  = ['estandar', 'premium'];
  const estadosValidos = ['activa', 'vencida', 'cancelada'];

  if (!planesValidos.includes(plan) || !estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: `Plan debe ser ${planesValidos.join('/')} y estado ${estadosValidos.join('/')}.`,
    });
  }

  try {
    const suscripcion = await suscripcionesService.actualizarEstado(req.params.id, { plan, estado });
    res.json(suscripcion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Devuelve la suscripción del usuario autenticado (usado por la app móvil)
async function miSuscripcion(req, res) {
  try {
    // req.usuario viene del middleware verificarToken (tiene id_usuario del JWT)
    const suscripcion = await suscripcionesService.getSuscripcionPorUsuario(req.usuario.id_usuario);
    res.json(suscripcion);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { listar, obtener, actualizar, miSuscripcion };
