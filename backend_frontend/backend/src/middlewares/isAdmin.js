// src/middlewares/isAdmin.js
module.exports = function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol admin.' });
  }
  next();
};
