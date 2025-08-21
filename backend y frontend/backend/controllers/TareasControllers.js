// controllers/tareasControllers.js
const db = require('../config/db');

// Crear una nueva tarea
const crearTarea = async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;

        if (!titulo || !descripcion) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const sql = 'INSERT INTO tareas (titulo, descripcion) VALUES (?, ?)';
        const [result] = await db.query(sql, [titulo, descripcion]);

        res.status(201).json({ mensaje: 'Tarea creada correctamente', id: result.insertId });
    } catch (err) {
        console.error('Error al crear la tarea:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Listar todas las tareas
const listarTareas = async (req, res) => {
    try {
        const sql = 'SELECT * FROM tareas';
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las tareas:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    crearTarea,
    listarTareas
};

