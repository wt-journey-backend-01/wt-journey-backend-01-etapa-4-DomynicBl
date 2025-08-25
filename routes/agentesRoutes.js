// agentesRoutes.js
const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplica o middleware de autenticação a TODAS as rotas de agentes
router.use(authMiddleware);

router.get('/agentes', agentesController.getAllAgentes);
router.get('/agentes/:id', agentesController.getAgenteById);
router.post('/agentes', agentesController.createAgente);
router.put('/agentes/:id', agentesController.updateAgente);
router.patch('/agentes/:id', agentesController.patchAgente);
router.delete('/agentes/:id', agentesController.deleteAgente);
router.get('/agentes/:id/casos', agentesController.getCasosDoAgente);

module.exports = router;