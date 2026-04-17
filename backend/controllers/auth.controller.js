// controllers/auth.controller.js
// Recibe la petición HTTP, llama al service y responde.
// No contiene lógica de negocio — eso vive en auth.service.js.

const authService = require('../services/auth.service');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    const datos = await authService.login(email, password);
    res.json(datos);
  } catch (err) {
    // Devolvemos 401 para credenciales incorrectas, no el detalle del error (seguridad)
    res.status(401).json({ error: err.message });
  }
}

async function register(req, res) {
  const { nombre, email, password, diagnostico, telefono } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
  }

  try {
    const datos = await authService.register(nombre, email, password, diagnostico, telefono);
    res.status(201).json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Login para el panel web — rechaza si el usuario no es admin
async function loginAdmin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    const datos = await authService.loginAdmin(email, password);
    res.json(datos);
  } catch (err) {
    const esAccesoDenegado = err.message.includes('solo para administradores');
    res.status(esAccesoDenegado ? 403 : 401).json({ error: err.message });
  }
}

module.exports = { login, loginAdmin, register };
