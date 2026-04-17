// routes/paypal.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paypal.controller');
const { verificarToken } = require('../middleware/auth');

// Crear orden — requiere que el usuario esté autenticado (JWT)
router.post('/crear-orden', verificarToken, ctrl.crearOrden);

// Callbacks de PayPal — NO llevan JWT, los ejecuta el navegador del usuario
router.get('/exito',     ctrl.exitoPago);
router.get('/cancelado', ctrl.pagoCancelado);

module.exports = router;
