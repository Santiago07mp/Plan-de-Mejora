// src/routes/notificaciones.routes.js
const express = require("express");
const router = express.Router();
const notificacionesController = require("../controllers/notificaciones.controller");
const { verificarToken } = require("../middlewares/auth");

router.get("/", verificarToken, notificacionesController.listarNotificaciones);
router.patch("/:id/leida", verificarToken, notificacionesController.marcarComoLeida);

module.exports = router;