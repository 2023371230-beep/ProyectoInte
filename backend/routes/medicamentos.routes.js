// routes/medicamentos.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/medicamentos.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

// IMPORTANTE: rutas específicas ANTES de /:id para que Express no las confunda
// Devuelve solo los medicamentos asignados al cliente autenticado (app móvil)
router.get('/mis-medicamentos', ctrl.misMedicamentos);

// Admin asigna un medicamento a un cliente
router.post('/asignar', soloAdmin, ctrl.asignar);

router.get('/',       soloAdmin, ctrl.listar);
router.post('/',      soloAdmin, ctrl.crear);
router.get('/:id',    soloAdmin, ctrl.obtener);
router.put('/:id',    soloAdmin, ctrl.actualizar);
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;
