// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const { register, login, actualizarPerfil } = require('../controllers/authController');

// Definir las rutas
router.post('/register', register);
router.post('/login', login);
router.put('/perfil', verificarToken, actualizarPerfil);

module.exports = router;