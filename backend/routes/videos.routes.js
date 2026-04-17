// routes/videos.routes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/videos.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

// Rutas específicas ANTES de /:id para que Express no las confunda
router.get('/mis-videos', ctrl.misVideos);
router.post('/asignar',   soloAdmin, ctrl.asignar);

router.get('/',     soloAdmin, ctrl.listar);
router.post('/',    soloAdmin, ctrl.crear);
router.get('/:id',  soloAdmin, ctrl.obtener);
router.put('/:id',  soloAdmin, ctrl.actualizar);
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;
