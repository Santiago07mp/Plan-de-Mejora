// src/controllers/notificaciones.controller.js
const db = require("../config/db");

const listarNotificaciones = async (req, res) => {
  try {
    const [notificaciones] = await db.query(
      "SELECT * FROM notificaciones WHERE id_usuario_destino = ? ORDER BY fecha DESC",
      [req.usuario.id_usuario]
    );
    res.json({ success: true, notificaciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error al listar notificaciones" });
  }
};

const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE notificaciones SET leida = true WHERE id_notificacion = ? AND id_usuario_destino = ?",
      [id, req.usuario.id_usuario]
    );
    res.json({ success: true, mensaje: "Notificación marcada como leída" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error al marcar notificación" });
  }
};

module.exports = {
  listarNotificaciones,
  marcarComoLeida
};