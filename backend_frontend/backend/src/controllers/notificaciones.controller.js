const pool = require('../config/db');

const listarNotificaciones = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notificaciones WHERE id_usuario_destino = ? ORDER BY fecha DESC', [req.user.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error listando notificaciones', detalle: e.message });
  }
};

const marcarLeida = async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query('UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ? AND id_usuario_destino = ?', [id, req.user.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'No encontrada o no pertenece al usuario' });
    res.json({ message: 'Notificación marcada como leída' });
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando notificación', detalle: e.message });
  }
};

module.exports = { listarNotificaciones, marcarLeida };
