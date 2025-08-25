// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas de autenticação abertas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.delete('/users/:id', authMiddleware, authController.deleteUser);
router.get('/usuarios/me', authMiddleware, authController.getMe);

module.exports = router;