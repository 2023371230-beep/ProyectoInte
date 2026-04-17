// routes/dashboard.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// GET /api/dashboard/resumen → conteos para las tarjetas del panel
router.get('/resumen', ctrl.resumen);

module.exports = router;
