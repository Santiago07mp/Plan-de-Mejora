-- ver los usuarios 

SELECT id_usuario, nombre, correo, rol
FROM usuarios;

-- ver las tareas existentes 

SELECT 
    t.id_tarea,
    t.titulo,
    t.descripcion,
    t.estado,
    t.fecha_creacion,
    t.fecha_vencimiento,
    u1.nombre AS creador,
    u2.nombre AS asignado
FROM tareas t
JOIN usuarios u1 ON t.id_usuario_creador = u1.id_usuario
LEFT JOIN usuarios u2 ON t.id_usuario_asignado = u2.id_usuario;

-- ver las notifias de un usuario 

SELECT 
    n.id_notificacion,
    n.mensaje,
    n.fecha,
    n.leida,
    u.nombre AS usuario
FROM notificaciones n
JOIN usuarios u ON n.id_usuario_destino = u.id_usuario
WHERE u.id_usuario = 2;  -- cambia el ID según el usuario

-- ver tareas completas segun fecha 

SELECT 
    t.id_tarea,
    t.titulo,
    t.descripcion,
    t.fecha_creacion,
    u.nombre AS asignado
FROM tareas t
JOIN usuarios u ON t.id_usuario_asignado = u.id_usuario
WHERE t.estado = 'completada'
  AND t.fecha_creacion BETWEEN '2025-08-01' AND '2025-08-30';

-- ver roles

SELECT id_usuario, nombre, rol
FROM usuarios;


