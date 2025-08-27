// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const verificado = jwt.verify(token, "secreto123");
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido" });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };