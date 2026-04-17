// routes/auth.routes.js
// Rutas públicas — no requieren token JWT

const express = require('express');
const router  = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/login          — app móvil (clientes)
router.post('/login', authController.login);

// POST /api/auth/login-admin    — panel web (solo admins)
router.post('/login-admin', authController.loginAdmin);

// POST /api/auth/register       — crea usuario cliente + suscripción estandar
router.post('/register', authController.register);

module.exports = router;
