const express = require('express');
const auth = require('../middlewares/auth');
const { listarNotificaciones, marcarLeida } = require('../controllers/notificaciones.controller');
const { notificacionIdValidator } = require('../utils/validators');
const checkErrors = require('../utils/checkErrors');

const router = express.Router();

router.get('/', auth, listarNotificaciones);
router.put('/:id', auth, notificacionIdValidator, checkErrors, marcarLeida);

module.exports = router;
