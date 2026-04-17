// controllers/pagos.controller.js

const pagosService = require('../services/pagos.service');

async function listar(req, res) {
  try {
    const pagos = await pagosService.obtenerTodos();
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function registrar(req, res) {
  const { monto, metodo } = req.body;

  // El id_usuario viene solo del JWT — no se acepta desde el body.
  const id_usuario = req.usuario?.id;

  if (!id_usuario || !monto) {
    return res.status(400).json({ error: 'monto es requerido.' });
  }

  if (isNaN(monto) || Number(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }

  try {
    const pago = await pagosService.registrar({ id_usuario, monto, metodo });
    res.status(201).json({
      ...pago,
      mensaje: 'Pago registrado. La suscripción ha sido actualizada a premium.',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { listar, registrar };
