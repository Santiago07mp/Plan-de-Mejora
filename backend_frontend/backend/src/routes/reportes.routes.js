const express = require('express');
const auth = require('../middlewares/auth');
const soloAdmin = require('../middlewares/roles');
const { reporteTareasCompletadas } = require('../controllers/reportes.controller');
const { reporteFechasValidator } = require('../utils/validators');
const checkErrors = require('../utils/checkErrors');

const router = express.Router();

router.get('/tareas', auth, soloAdmin, reporteFechasValidator, checkErrors, reporteTareasCompletadas);

module.exports = router;
