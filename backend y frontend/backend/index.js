const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/Usuarios', require('./routes/Usuarios'));
app.use('/api/Tareas', require('./routes/Tareas'));
app.use('/api/Notificaciones', require('./routes/Notificaciones'));

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '🚀 Backend funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

