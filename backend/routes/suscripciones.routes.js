// routes/suscripciones.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/suscripciones.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// Ruta /mia debe ir ANTES de /:id para que Express no la confunda con un ID numérico
router.get('/mia',  ctrl.miSuscripcion); // Devuelve la suscripción del usuario autenticado
router.get('/',     ctrl.listar);
router.get('/:id',  ctrl.obtener);
router.put('/:id',  ctrl.actualizar); // El admin puede cambiar plan/estado manualmente

module.exports = router;
