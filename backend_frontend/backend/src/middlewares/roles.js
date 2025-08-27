const soloAdmin = (req, res, next) => {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ error: "Requiere rol administrador" });
  }
  next();
};

module.exports = { soloAdmin };
