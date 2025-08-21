// routes/tareas.js
const express = require('express');
const router = express.Router();
const TareasControllers = require('../controllers/TareasControllers');

// Rutas para tareas
router.get('/', TareasControllers.listarTareas);  // ← aquí corregido
router.post('/', TareasControllers.crearTarea);

module.exports = router;

