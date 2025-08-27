// src/routes/tareas.routes.js
const express = require("express");
const router = express.Router();
const tareasController = require("../controllers/tareas.controller");
const { verificarToken } = require("../middlewares/auth");

router.post("/", verificarToken, tareasController.crearTarea);
router.get("/", verificarToken, tareasController.listarTareas);
router.put("/:id", verificarToken, tareasController.actualizarTarea);
router.delete("/:id", verificarToken, tareasController.eliminarTarea);
router.put("/:id/asignar", verificarToken, tareasController.asignarTarea);

module.exports = router;