// src/controllers/reportes.controller.js
const db = require("../config/db");

const generarReporteTareas = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    let query = `
      SELECT t.*, u_creador.nombre as creador, u_asignado.nombre as asignado
      FROM tareas t
      INNER JOIN usuarios u_creador ON t.id_usuario_creador = u_creador.id_usuario
      INNER JOIN usuarios u_asignado ON t.id_usuario_asignado = u_asignado.id_usuario
      WHERE t.estado = 'completada'
    `;

    const params = [];

    if (desde && hasta) {
      query += " AND DATE(t.fecha_creacion) BETWEEN ? AND ?";
      params.push(desde, hasta);
    }

    const [tareas] = await db.query(query, params);

    res.json({
      success: true,
      data: tareas,
      total: tareas.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar el reporte" });
  }
};

module.exports = {
  generarReporteTareas
};