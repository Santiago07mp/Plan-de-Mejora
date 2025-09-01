// src/controllers/tareas.controller.js
const db = require("../config/db");

const crearTarea = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    console.log("Usuario autenticado:", req.usuario);
    
    const { titulo, descripcion, fecha_vencimiento, id_usuario_asignado } = req.body;
    
    // Validar campos requeridos
    if (!titulo) {
      console.log("Faltan campos requeridos");
      return res.status(400).json({ error: "Título es requerido" });
    }
    
    // Convertir id_usuario_asignado a número si existe
    const usuarioAsignado = id_usuario_asignado ? 
      parseInt(id_usuario_asignado) : req.usuario.id_usuario;
    
    // Validar que el usuario asignado existe
    const [usuarioExiste] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [usuarioAsignado]
    );
    
    if (usuarioExiste.length === 0) {
      console.log("Usuario asignado no existe:", usuarioAsignado);
      return res.status(400).json({ error: "El usuario asignado no existe" });
    }
    
    console.log("Insertando tarea en la base de datos...");
    
    // Formatear fecha correctamente para MySQL (YYYY-MM-DD)
    let fechaVencimientoFormateada = null;
    if (fecha_vencimiento) {
      // Si viene con formato ISO (con T y Z), extraer solo la parte de la fecha
      if (fecha_vencimiento.includes('T')) {
        fechaVencimientoFormateada = fecha_vencimiento.split('T')[0];
      } else {
        fechaVencimientoFormateada = fecha_vencimiento;
      }
    }
    
    // Insertar la tarea con el estado por defecto 'pendiente'
    const result = await db.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_vencimiento, id_usuario_creador, id_usuario_asignado, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')",
      [titulo, descripcion, fechaVencimientoFormateada, req.usuario.id_usuario, usuarioAsignado]
    );

    console.log("Tarea creada exitosamente:", result);
    res.json({ mensaje: "Tarea creada correctamente", id_tarea: result[0].insertId });
  } catch (err) {
    console.error("Error en crearTarea:", err);
    console.error("Stack trace:", err.stack);
    
    // Manejar errores específicos de la base de datos
    if (err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ error: "El usuario asignado no existe" });
    }
    
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ error: "Formato de fecha inválido" });
    }
    
    res.status(500).json({ error: "Error al crear tarea: " + err.message });
  }
};

// Función para listar tareas
const listarTareas = async (req, res) => {
  try {
    console.log("Listando tareas para usuario:", req.usuario.id_usuario, "rol:", req.usuario.rol);
    
    let query = `
      SELECT t.*, 
        uc.nombre as creador_nombre,
        uc.correo as creador_correo,
        ua.nombre as asignado_nombre,
        ua.correo as asignado_correo
      FROM tareas t
      LEFT JOIN usuarios uc ON t.id_usuario_creador = uc.id_usuario
      LEFT JOIN usuarios ua ON t.id_usuario_asignado = ua.id_usuario
    `;
    
    let params = [];
    
    // Si no es admin, solo ver tareas donde es creador o asignado
    if (req.usuario.rol !== 'admin') {
      query += " WHERE t.id_usuario_creador = ? OR t.id_usuario_asignado = ?";
      params = [req.usuario.id_usuario, req.usuario.id_usuario];
    }
    
    query += " ORDER BY t.fecha_creacion DESC";
    
    const [tareas] = await db.query(query, params);
    
    // Asegurar que los IDs sean números
    const tareasFormateadas = tareas.map(tarea => ({
      ...tarea,
      id_tarea: parseInt(tarea.id_tarea),
      id_usuario_creador: parseInt(tarea.id_usuario_creador),
      id_usuario_asignado: parseInt(tarea.id_usuario_asignado)
    }));
    
    res.json(tareasFormateadas);
  } catch (err) {
    console.error("Error en listarTareas:", err);
    res.status(500).json({ error: "Error al listar tareas" });
  }
};

// Actualizar tarea
const actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado, fecha_vencimiento, id_usuario_asignado } = req.body;
    
    console.log("Actualizando tarea:", id, "con datos:", req.body);
    
    // Verificar que la tarea existe
    const [tareaExistente] = await db.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id]
    );
    
    if (tareaExistente.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    
    const tarea = tareaExistente[0];
    
    // Validar permisos: solo admin, creador o asignado pueden modificar
    const esCreador = parseInt(tarea.id_usuario_creador) === parseInt(req.usuario.id_usuario);
    const esAsignado = parseInt(tarea.id_usuario_asignado) === parseInt(req.usuario.id_usuario);
    
    if (req.usuario.rol !== 'admin' && !esCreador && !esAsignado) {
      return res.status(403).json({ error: "No tienes permisos para modificar esta tarea" });
    }
    
    // Validar qué campos puede modificar cada tipo de usuario
    let camposPermitidos = {};
    
    if (req.usuario.rol === 'admin') {
      // Admin puede modificar todo
      camposPermitidos = { titulo, descripcion, estado, fecha_vencimiento, id_usuario_asignado };
    } else if (esCreador) {
      // Creador puede modificar título, descripción, fecha y asignación
      camposPermitidos = { titulo, descripcion, fecha_vencimiento, id_usuario_asignado };
    } else if (esAsignado) {
      // Asignado solo puede modificar el estado
      camposPermitidos = { estado };
    }
    
    // Formatear fecha correctamente para MySQL (YYYY-MM-DD)
    if (camposPermitidos.fecha_vencimiento !== undefined && camposPermitidos.fecha_vencimiento !== null) {
      if (camposPermitidos.fecha_vencimiento.includes('T')) {
        camposPermitidos.fecha_vencimiento = camposPermitidos.fecha_vencimiento.split('T')[0];
      }
    }
    
    // Si se cambia el usuario asignado, verificar que existe y convertir a número
    if (camposPermitidos.id_usuario_asignado !== undefined) {
      const usuarioAsignadoId = parseInt(camposPermitidos.id_usuario_asignado);
      const [usuarioExiste] = await db.query(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
        [usuarioAsignadoId]
      );
      
      if (usuarioExiste.length === 0) {
        return res.status(400).json({ error: "El usuario asignado no existe" });
      }
      camposPermitidos.id_usuario_asignado = usuarioAsignadoId;
    }
    
    // Construir la consulta dinámicamente
    const campos = [];
    const valores = [];
    
    Object.keys(camposPermitidos).forEach(key => {
      if (camposPermitidos[key] !== undefined && camposPermitidos[key] !== null) {
        campos.push(`${key} = ?`);
        valores.push(camposPermitidos[key]);
      }
    });
    
    // Si se cambia el estado, actualizar fecha_modificacion
    const estadoCambiado = estado && estado !== tarea.estado;
    
    // Solo actualizar si hay campos válidos para modificar
    if (campos.length > 0 || estadoCambiado) {
      // Siempre actualizar fecha_modificacion cuando hay cambios
      campos.push("fecha_modificacion = NOW()");
      
      valores.push(parseInt(id));
      
      const query = `UPDATE tareas SET ${campos.join(", ")} WHERE id_tarea = ?`;
      console.log("Ejecutando query:", query, "con valores:", valores);
      
      await db.query(query, valores);
    }
    
    res.json({ mensaje: "Tarea actualizada correctamente" });
  } catch (err) {
    console.error("Error en actualizarTarea:", err);
    res.status(500).json({ error: "Error al actualizar tarea: " + err.message });
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la tarea existe
    const [tareaExistente] = await db.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id]
    );
    
    if (tareaExistente.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    
    const tarea = tareaExistente[0];
    
    // Validar permisos: solo admin o creador puede eliminar
    const esCreador = parseInt(tarea.id_usuario_creador) === parseInt(req.usuario.id_usuario);
    
    if (req.usuario.rol !== 'admin' && !esCreador) {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta tarea" });
    }
    
    // Eliminar la tarea
    await db.query("DELETE FROM tareas WHERE id_tarea = ?", [id]);
    
    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (err) {
    console.error("Error en eliminarTarea:", err);
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
};

// Asignar tarea (función específica para cambiar asignación)
const asignarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario_asignado } = req.body;
    
    if (!id_usuario_asignado) {
      return res.status(400).json({ error: "ID de usuario asignado es requerido" });
    }
    
    // Convertir a número
    const usuarioAsignadoId = parseInt(id_usuario_asignado);
    
    // Verificar que la tarea existe
    const [tareaExistente] = await db.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id]
    );
    
    if (tareaExistente.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    
    const tarea = tareaExistente[0];
    
    // Verificar permisos: solo admin o creador puede reasignar
    const esCreador = parseInt(tarea.id_usuario_creador) === parseInt(req.usuario.id_usuario);
    
    if (req.usuario.rol !== 'admin' && !esCreador) {
      return res.status(403).json({ error: "No tienes permisos para reasignar esta tarea" });
    }
    
    // Verificar que el usuario asignado existe
    const [usuarioExiste] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [usuarioAsignadoId]
    );
    
    if (usuarioExiste.length === 0) {
      return res.status(400).json({ error: "El usuario asignado no existe" });
    }
    
    // Actualizar la asignación
    await db.query(
      "UPDATE tareas SET id_usuario_asignado = ?, fecha_modificacion = NOW() WHERE id_tarea = ?",
      [usuarioAsignadoId, id]
    );
    
    res.json({ mensaje: "Tarea asignada correctamente" });
  } catch (err) {
    console.error("Error en asignarTarea:", err);
    res.status(500).json({ error: "Error al asignar tarea" });
  }
};

module.exports = {
  crearTarea,
  listarTareas,
  actualizarTarea,
  eliminarTarea,
  asignarTarea
};