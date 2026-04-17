const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportes.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/clientes', ctrl.reporteClientes);
router.get('/clientes/pdf', ctrl.reporteClientesPdf);

router.get('/suscripciones', ctrl.reporteSuscripciones);
router.get('/suscripciones/pdf', ctrl.reporteSuscripcionesPdf);

router.get('/videos-asignados', ctrl.reporteVideos);
router.get('/videos-asignados/pdf', ctrl.reporteVideosPdf);

router.get('/medicamentos-asignados', ctrl.reporteMedicamentos);
router.get('/medicamentos-asignados/pdf', ctrl.reporteMedicamentosPdf);

module.exports = router;
