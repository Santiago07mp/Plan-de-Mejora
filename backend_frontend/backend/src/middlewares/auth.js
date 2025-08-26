const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = { id: decoded.id, rol: decoded.rol };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = auth;
