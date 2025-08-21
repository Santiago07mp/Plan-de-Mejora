const express = require('express');
const router = express.Router();
const { listarNotificaciones } = require('../controllers/NotificacionesControllers');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, listarNotificaciones);

module.exports = router;

