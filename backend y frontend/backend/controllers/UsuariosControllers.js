const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_usuario, nombre, correo, rol FROM usuarios'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', detalle: err });
  }
};

// Registrar usuario
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    // Cifrar contraseña
    const hash = bcrypt.hashSync(contrasena, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hash, rol || 'usuario']
    );

    res.json({
      mensaje: '✅ Usuario registrado correctamente',
      id: result.insertId,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Error al registrar usuario', detalle: err });
  }
};
