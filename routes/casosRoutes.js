// casosRoutes.js
const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplica o middleware de autenticação a TODAS as rotas de casos
router.use(authMiddleware);

router.get('/', casosController.getAllCasos);
router.get('/:id', casosController.getCasoById);
router.post('/', casosController.createCaso);
router.put('/:id', casosController.updateCaso);
router.patch('/:id', casosController.patchCaso);
router.delete('/:id', casosController.deleteCaso);
router.get('/:id/agente', casosController.getAgenteByCasoId);

module.exports = router;