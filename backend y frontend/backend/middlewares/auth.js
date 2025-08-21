const jwt = require('jsonwebtoken');
const SECRET = "mi_secreto_jwt";

// Middleware para validar token
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, SECRET };

