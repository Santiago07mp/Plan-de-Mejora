const express = require('express');
const { registrar, login, listarUsuarios, cambiarRol } = require('../controllers/usuarios.controller');
const auth = require('../middlewares/auth');
const soloAdmin = require('../middlewares/roles');
const { registroValidator, loginValidator } = require('../utils/validators');
const checkErrors = require('../utils/checkErrors');

const router = express.Router();

router.post('/registro', registroValidator, checkErrors, registrar);
router.post('/login', loginValidator, checkErrors, login);
router.get('/', auth, soloAdmin, listarUsuarios);
router.put('/:id/rol', auth, soloAdmin, cambiarRol);

module.exports = router;
