// src/routes/reportes.routes.js
const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportes.controller");
const { verificarToken, verificarAdmin } = require("../middlewares/auth");

// Ruta para generar reportes de tareas (solo admin)
router.get("/tareas", verificarToken, verificarAdmin, reportesController.generarReporteTareas);

module.exports = router;