const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const usuariosRoutes = require('./routes/usuarios.routes');
const tareasRoutes = require('./routes/tareas.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const reportesRoutes = require('./routes/reportes.routes');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// health
app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch {
    res.status(500).json({ status: 'error', db: false });
  }
});

// rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes', reportesRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
