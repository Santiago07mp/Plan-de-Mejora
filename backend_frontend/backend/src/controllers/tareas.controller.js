const { validationResult } = require('express-validator');
const pool = require('../config/db');

const crearTarea = async (req, res) => {
  const { titulo, descripcion, fecha_vencimiento } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO tareas (titulo, descripcion, estado, fecha_creacion, fecha_vencimiento, id_usuario_creador, id_usuario_asignado) VALUES (?,?,?, NOW(), ?, ?, ?)',
      [titulo, descripcion, 'pendiente', fecha_vencimiento || null, req.user.id, req.user.id]
    );
    res.status(201).json({ id_tarea: r.insertId, titulo, descripcion, estado: 'pendiente' });
  } catch (e) {
    res.status(500).json({ error: 'Error al crear tarea', detalle: e.message });
  }
};

const listarTareasUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u1.nombre AS creador, u2.nombre AS asignado
       FROM tareas t
       JOIN usuarios u1 ON u1.id_usuario = t.id_usuario_creador
       JOIN usuarios u2 ON u2.id_usuario = t.id_usuario_asignado
       WHERE t.id_usuario_asignado = ? OR t.id_usuario_creador = ?
       ORDER BY t.fecha_creacion DESC`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error listando tareas', detalle: e.message });
  }
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  try {
    if (estado) {
      const [rows] = await pool.query('SELECT id_usuario_asignado FROM tareas WHERE id_tarea = ?', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Tarea no encontrada' });
      if (rows[0].id_usuario_asignado !== req.user.id) {
        return res.status(403).json({ error: 'Solo el usuario asignado puede cambiar el estado' });
      }
    }
    const [r] = await pool.query(
      'UPDATE tareas SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion), estado = COALESCE(?, estado) WHERE id_tarea = ?',
      [titulo ?? null, descripcion ?? null, estado ?? null, id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea actualizada' });
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando tarea', detalle: e.message });
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query('DELETE FROM tareas WHERE id_tarea = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando tarea', detalle: e.message });
  }
};

const asignarTarea = async (req, res) => {
  const { id } = req.params;
  const { id_usuario_asignado } = req.body;
  try {
    const [r] = await pool.query('UPDATE tareas SET id_usuario_asignado = ? WHERE id_tarea = ?', [id_usuario_asignado, id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    const [t] = await pool.query('SELECT titulo FROM tareas WHERE id_tarea = ?', [id]);
    const titulo = t[0]?.titulo || 'Tarea';
    await pool.query('INSERT INTO notificaciones (mensaje, id_usuario_destino) VALUES (?, ?)', [`Te asignaron la tarea: ${titulo}`, id_usuario_asignado]);
    res.json({ message: 'Tarea asignada y notificación enviada' });
  } catch (e) {
    res.status(500).json({ error: 'Error asignando tarea', detalle: e.message });
  }
};

module.exports = { crearTarea, listarTareasUsuario, actualizarTarea, eliminarTarea, asignarTarea };
