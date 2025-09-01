// src/routes/tareas.routes.js - CORREGIDO
const express = require("express");
const router = express.Router();
const tareasController = require("../controllers/tareas.controller");
const { verificarToken } = require("../middlewares/auth");
const { puedeVerTarea } = require("../middlewares/permisosTareas");

// Ruta para listar tareas (no necesita verificación de tarea específica)
router.get("/", verificarToken, tareasController.listarTareas);

// Ruta para crear tarea (no necesita verificación de tarea específica)
router.post("/", verificarToken, tareasController.crearTarea);

// Rutas que operan sobre una tarea específica (necesitan verificación)
router.put("/:id", verificarToken, puedeVerTarea, tareasController.actualizarTarea);
router.delete("/:id", verificarToken, puedeVerTarea, tareasController.eliminarTarea);
router.put("/:id/asignar", verificarToken, puedeVerTarea, tareasController.asignarTarea);

module.exports = router;