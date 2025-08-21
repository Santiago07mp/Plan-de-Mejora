const express = require('express');
const router = express.Router();
const UsuariosControllers = require('../controllers/UsuariosControllers');

// Obtener todos los usuarios
router.get('/', UsuariosControllers.obtenerUsuarios);

// Registrar usuario
router.post('/', UsuariosControllers.registrarUsuario);

module.exports = router;
