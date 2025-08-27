// src/controllers/tareas.controller.js
const db = require("../config/db");

const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_vencimiento, id_usuario_asignado } = req.body;
    
    await db.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_vencimiento, id_usuario_creador, id_usuario_asignado) VALUES (?, ?, ?, ?, ?)",
      [titulo, descripcion, fecha_vencimiento, req.usuario.id_usuario, id_usuario_asignado]
    );

    res.json({ mensaje: "Tarea creada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tarea" });
  }
};

// Agrega más funciones según necesites

module.exports = {
  crearTarea,
  listarTareas: async (req, res) => res.json({ mensaje: "Listar tareas" }),
  actualizarTarea: async (req, res) => res.json({ mensaje: "Actualizar tarea" }),
  eliminarTarea: async (req, res) => res.json({ mensaje: "Eliminar tarea" }),
  asignarTarea: async (req, res) => res.json({ mensaje: "Asignar tarea" })
};