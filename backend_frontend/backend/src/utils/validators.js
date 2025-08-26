const { body, param, query } = require('express-validator');

// Usuarios
const registroValidator = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('correo').isEmail().withMessage('Correo inválido'),
  body('contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres')
];

const loginValidator = [
  body('correo').isEmail().withMessage('Correo inválido'),
  body('contraseña').notEmpty().withMessage('La contraseña es obligatoria')
];

// Tareas
const tareaCreateValidator = [
  body('titulo').notEmpty().withMessage('El título es obligatorio'),
  body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
  body('fecha_vencimiento')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Formato de fecha inválido')
];

const tareaUpdateValidator = [
  param('id').isInt().withMessage('ID inválido'),
  body('titulo').optional(),
  body('descripcion').optional(),
  body('estado').optional().isIn(['pendiente', 'en progreso', 'completada']).withMessage('Estado inválido')
];

const asignarValidator = [
  param('id').isInt().withMessage('ID inválido'),
  body('id_usuario_asignado').isInt().withMessage('id_usuario_asignado debe ser entero')
];

// Notificaciones
const notificacionIdValidator = [
  param('id').isInt().withMessage('ID inválido')
];

// Reportes
const reporteFechasValidator = [
  query('desde').isISO8601().withMessage('Fecha "desde" inválida'),
  query('hasta').isISO8601().withMessage('Fecha "hasta" inválida')
];

module.exports = {
  registroValidator,
  loginValidator,
  tareaCreateValidator,
  tareaUpdateValidator,
  asignarValidator,
  notificacionIdValidator,
  reporteFechasValidator
};
