// src/controllers/notificaciones.controller.js
const db = require("../config/db");

const listarNotificaciones = async (req, res) => {
  try {
    const [notificaciones] = await db.query(
      "SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC",
      [req.usuario.id_usuario]
    );
    res.json(notificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar notificaciones" });
  }
};

const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE notificaciones SET leido = true WHERE id_notificacion = ? AND id_usuario = ?",
      [id, req.usuario.id_usuario]
    );
    res.json({ mensaje: "Notificación marcada como leída" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al marcar notificación" });
  }
};

module.exports = {
  listarNotificaciones,
  marcarComoLeida
};