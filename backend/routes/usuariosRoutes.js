//ruta para el controlador de usuarios
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/peluqueros', usuariosController.obtenerPeluqueros);
router.get('/mis-horarios', usuariosController.obtenerMisHorarios);
router.put('/mis-horarios', usuariosController.actualizarMisHorarios);

module.exports = router;