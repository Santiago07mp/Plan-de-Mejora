const pool = require('../config/db');

async function listarNotificaciones(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM notificaciones WHERE id_usuario_destino = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor", detalle: err.message });
  }
}

module.exports = { listarNotificaciones };

