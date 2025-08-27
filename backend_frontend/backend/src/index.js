const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/tareas", require("./routes/tareas.routes"));
app.use("/api/notificaciones", require("./routes/notificaciones.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));

app.get("/", (req, res) => res.json({ status: "ok", db: true }));

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));