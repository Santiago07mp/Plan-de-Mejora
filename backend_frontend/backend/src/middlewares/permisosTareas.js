// src/middlewares/permisosTareas.js
const db = require("../config/db");

const puedeVerTarea = async (req, res, next) => {
  try {
    if (req.usuario.rol === 'admin') {
      return next(); // Admin puede ver todo
    }
    
    // Para usuarios normales, solo pueden ver tareas donde son creadores o asignados
    const tareaId = req.params.id;
    const usuarioId = req.usuario.id_usuario;
    
    // Verificar si el usuario tiene permiso para ver esta tarea
    const [results] = await db.query(
      `SELECT COUNT(*) as count FROM tareas 
       WHERE id_tarea = ? AND (id_usuario_creador = ? OR id_usuario_asignado = ?)`,
      [tareaId, usuarioId, usuarioId]
    );
    
    if (results[0].count === 0) {
      return res.status(403).json({ error: "No tienes permisos para acceder a esta tarea" });
    }
    
    next();
  } catch (err) {
    console.error("Error en middleware puedeVerTarea:", err);
    res.status(500).json({ error: "Error verificando permisos" });
  }
};

module.exports = { puedeVerTarea };