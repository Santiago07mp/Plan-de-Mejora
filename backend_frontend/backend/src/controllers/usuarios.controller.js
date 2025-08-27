// src/controllers/usuarios.controller.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registrar usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    // Verificar si el usuario ya existe
    const [existing] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, 'usuario')",
      [nombre, correo, hashedPassword]
    );

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// Login usuario (CORREGIDO: ahora devuelve información del usuario)
const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (rows.length === 0)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const usuario = rows[0];

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      "secreto123",
      { expiresIn: "1h" }
    );

    // Respuesta modificada para incluir información del usuario
    res.json({ 
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Listar usuarios
const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id_usuario, nombre, correo, rol FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

// Cambiar rol de usuario
const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!["usuario", "admin"].includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    await db.query("UPDATE usuarios SET rol = ? WHERE id_usuario = ?", [rol, id]);
    res.json({ mensaje: "Rol actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar rol" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  cambiarRol,
};