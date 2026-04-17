// routes/pagos.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pagos.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/',  ctrl.listar);
router.post('/', ctrl.registrar); // Simula pago con PayPal Sandbox → activa trigger de suscripción

module.exports = router;
