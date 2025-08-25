// agentesRoutes.js
const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplica o middleware de autenticação a TODAS as rotas de agentes
router.use(authMiddleware);

router.get('/', agentesController.getAllAgentes);
router.get('/:id', agentesController.getAgenteById);
router.post('/', agentesController.createAgente);
router.put('/:id', agentesController.updateAgente);
router.patch('/:id', agentesController.patchAgente);
router.delete('/:id', agentesController.deleteAgente);
router.get('/:id/casos', agentesController.getCasosDoAgente);

module.exports = router;