// controllers/dashboard.controller.js

const dashboardService = require('../services/dashboard.service');

async function resumen(req, res) {
  try {
    const datos = await dashboardService.obtenerResumen();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { resumen };
