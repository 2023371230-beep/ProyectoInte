// controllers/clientes.controller.js

const clientesService = require('../services/clientes.service');

async function listar(req, res) {
  try {
    const clientes = await clientesService.obtenerTodos();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const cliente = await clientesService.obtenerPorId(req.params.id);
    res.json(cliente);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function detalleAsignaciones(req, res) {
  try {
    const detalle = await clientesService.obtenerDetalleAsignaciones(req.params.id);
    res.json(detalle);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function crear(req, res) {
  const { nombre, email, password, diagnostico, telefono } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
  }

  try {
    const cliente = await clientesService.crear({ nombre, email, password, diagnostico, telefono });
    res.status(201).json(cliente);
  } catch (err) {
    // El email duplicado genera un error de constraint en PostgreSQL
    const mensaje = err.message.includes('unique') || err.message.includes('duplicate')
      ? 'Ya existe un usuario con ese email.'
      : err.message;
    res.status(400).json({ error: mensaje });
  }
}

async function actualizar(req, res) {
  const { nombre, email, diagnostico, telefono } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son requeridos.' });
  }

  try {
    const cliente = await clientesService.actualizar(req.params.id, { nombre, email, diagnostico, telefono });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await clientesService.darDeBaja(req.params.id);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

// Devuelve el perfil del cliente que tiene sesión activa (usa JWT)
async function miPerfil(req, res) {
  try {
    const id_usuario = req.usuario?.id_usuario;
    if (!id_usuario) return res.status(401).json({ error: 'No autenticado.' });
    const cliente = await clientesService.obtenerPorUsuario(id_usuario);
    res.json(cliente);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { listar, obtener, detalleAsignaciones, miPerfil, crear, actualizar, eliminar };
