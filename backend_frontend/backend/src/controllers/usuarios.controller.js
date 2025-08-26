const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const registrar = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  try {
    const [existe] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length) return res.status(409).json({ error: 'El correo ya está registrado' });
    const hash = await bcrypt.hash(contraseña, 10);
    const [r] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?,?,?,?)',
      [nombre, correo, hash, 'usuario']
    );
    res.status(201).json({ id_usuario: r.insertId, nombre, correo, rol: 'usuario' });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar', detalle: e.message });
  }
};

const login = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = rows[0];
    const ok = await bcrypt.compare(contraseña, user['contraseña']);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET || 'supersecreto',
      { expiresIn: process.env.JWT_EXPIRES || '12h' }
    );
    res.json({ token, usuario: { id: user.id_usuario, nombre: user.nombre, correo: user.correo, rol: user.rol } });
  } catch (e) {
    res.status(500).json({ error: 'Error en login', detalle: e.message });
  }
};

const listarUsuarios = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_usuario, nombre, correo, rol FROM usuarios');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error listando usuarios', detalle: e.message });
  }
};

const cambiarRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  try {
    const [r] = await pool.query('UPDATE usuarios SET rol = ? WHERE id_usuario = ?', [rol, id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Rol actualizado', id_usuario: Number(id), rol });
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando rol', detalle: e.message });
  }
};

module.exports = { registrar, login, listarUsuarios, cambiarRol };
