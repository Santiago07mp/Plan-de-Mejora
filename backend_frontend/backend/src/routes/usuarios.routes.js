// src/routes/usuarios.routes.js
const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");
// CORREGIR: cambiar 'middleware' por 'middlewares'
const { verificarToken, verificarAdmin } = require("../middlewares/auth");

// Registro y login (públicos)
router.post("/registro", usuariosController.registrarUsuario);
router.post("/login", usuariosController.loginUsuario);

// Rutas protegidas
router.get("/", verificarToken, verificarAdmin, usuariosController.listarUsuarios);
router.put("/:id/rol", verificarToken, verificarAdmin, usuariosController.cambiarRol);

module.exports = router;