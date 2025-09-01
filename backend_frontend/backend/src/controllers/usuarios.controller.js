// src/controllers/usuarios.controller.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    // Validaciones
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Verificar si el usuario ya existe
    const [usuariosExistente] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (usuariosExistente.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)",
      [nombre, correo, hashedPassword]
    );

    res.status(201).json({ 
      mensaje: "Usuario registrado correctamente",
      id_usuario: result.insertId 
    });
  } catch (err) {
    console.error("Error en registrarUsuario:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    // Buscar usuario
    const [usuarios] = await db.query(
      "SELECT id_usuario, nombre, correo, password, rol FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        correo: usuario.correo,
        rol: usuario.rol 
      },
      "secreto123",
      { expiresIn: "24h" }
    );

    // Devolver datos sin password
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: usuarioSinPassword
    });
  } catch (err) {
    console.error("Error en loginUsuario:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    // Solo devolver información básica, sin contraseñas
    const query = "SELECT id_usuario, nombre, correo, rol FROM usuarios ORDER BY nombre";
    const [usuarios] = await db.query(query);
    
    res.json(usuarios);
  } catch (err) {
    console.error("Error en listarUsuarios:", err);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol || !['admin', 'usuario'].includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    // Verificar que el usuario existe
    const [usuarios] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar rol
    await db.query(
      "UPDATE usuarios SET rol = ? WHERE id_usuario = ?",
      [rol, id]
    );

    res.json({ mensaje: "Rol actualizado correctamente" });
  } catch (err) {
    console.error("Error en cambiarRol:", err);
    res.status(500).json({ error: "Error al cambiar rol" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  cambiarRol
};