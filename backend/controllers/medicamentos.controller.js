// controllers/medicamentos.controller.js

const medicamentosService = require('../services/medicamentos.service');

async function listar(req, res) {
  try {
    const medicamentos = await medicamentosService.obtenerTodos();
    res.json(medicamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function obtener(req, res) {
  try {
    const medicamento = await medicamentosService.obtenerPorId(req.params.id);
    res.json(medicamento);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function crear(req, res) {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del medicamento es requerido.' });
  }

  try {
    const medicamento = await medicamentosService.crear({ nombre, descripcion });
    res.status(201).json(medicamento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function actualizar(req, res) {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del medicamento es requerido.' });
  }

  try {
    const medicamento = await medicamentosService.actualizar(req.params.id, { nombre, descripcion });
    res.json(medicamento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await medicamentosService.eliminar(req.params.id);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

// Admin asigna un medicamento a un cliente específico
async function asignar(req, res) {
  const { id_cliente, id_medicamento, dosis, frecuencia, hora_inicio } = req.body;

  if (!id_cliente || !id_medicamento || !dosis || !frecuencia) {
    return res.status(400).json({ error: 'id_cliente, id_medicamento, dosis y frecuencia son requeridos.' });
  }

  try {
    const resultado = await medicamentosService.asignarMedicamento({ id_cliente, id_medicamento, dosis, frecuencia, hora_inicio });
    res.status(201).json({ ...resultado, mensaje: 'Medicamento asignado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Devuelve solo los medicamentos asignados al cliente autenticado (usado por la app móvil)
async function misMedicamentos(req, res) {
  try {
    // req.usuario.id_usuario viene del JWT — no se puede falsificar
    const medicamentos = await medicamentosService.getMedicamentosCliente(req.usuario.id_usuario);
    res.json(medicamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, asignar, misMedicamentos };
