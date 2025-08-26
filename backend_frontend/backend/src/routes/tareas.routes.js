const express = require('express');
const auth = require('../middlewares/auth');
const { crearTarea, listarTareasUsuario, actualizarTarea, eliminarTarea, asignarTarea } = require('../controllers/tareas.controller');
const { tareaCreateValidator, tareaUpdateValidator, asignarValidator } = require('../utils/validators');
const checkErrors = require('../utils/checkErrors');

const router = express.Router();

router.post('/', auth, tareaCreateValidator, checkErrors, crearTarea);
router.get('/', auth, listarTareasUsuario);
router.put('/:id', auth, tareaUpdateValidator, checkErrors, actualizarTarea);
router.delete('/:id', auth, eliminarTarea);
router.put('/:id/asignar', auth, asignarValidator, checkErrors, asignarTarea);

module.exports = router;
 