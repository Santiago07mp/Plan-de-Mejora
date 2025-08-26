const pool = require('../config/db');

const reporteTareasCompletadas = async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT t.id_tarea, t.titulo, t.descripcion, t.fecha_creacion, t.fecha_vencimiento,
              u1.nombre AS creador, u2.nombre AS asignado
       FROM tareas t
       JOIN usuarios u1 ON u1.id_usuario = t.id_usuario_creador
       JOIN usuarios u2 ON u2.id_usuario = t.id_usuario_asignado
       WHERE t.estado = 'completada' AND DATE(t.fecha_creacion) BETWEEN ? AND ?
       ORDER BY t.fecha_creacion DESC`,
      [desde, hasta]
    );
    res.json({ desde, hasta, total: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: 'Error generando reporte', detalle: e.message });
  }
};

module.exports = { reporteTareasCompletadas };
