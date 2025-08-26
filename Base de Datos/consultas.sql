-- Ver todos los usuarios
SELECT * FROM usuarios;

-- Buscar usuario por correo
SELECT * FROM usuarios WHERE correo = 'juan@correo.com';

-- Insertar un nuevo usuario
INSERT INTO usuarios (nombre, correo, contraseña, rol)
VALUES ('Laura Torres', 'laura@correo.com', '$2a$10$hashEjemplo', 'usuario');

-- Actualizar datos de un usuario
UPDATE usuarios
SET nombre = 'Juan P. Pérez', rol = 'admin'
WHERE id_usuario = 2;

-- Eliminar un usuario (y cascada elimina sus tareas y notificaciones)
DELETE FROM usuarios WHERE id_usuario = 4;


-- tareas


-- Ver todas las tareas con nombre de creador y asignado
SELECT t.id_tarea, t.titulo, t.descripcion, t.estado, 
       t.fecha_creacion, t.fecha_vencimiento,
       u1.nombre AS creador, u2.nombre AS asignado
FROM tareas t
JOIN usuarios u1 ON t.id_usuario_creador = u1.id_usuario
JOIN usuarios u2 ON t.id_usuario_asignado = u2.id_usuario;

-- Ver tareas asignadas a un usuario específico (ejemplo: Juan)
SELECT t.*
FROM tareas t
JOIN usuarios u ON t.id_usuario_asignado = u.id_usuario
WHERE u.correo = 'juan@correo.com';

-- Insertar nueva tarea
INSERT INTO tareas (titulo, descripcion, estado, fecha_creacion, fecha_vencimiento, id_usuario_creador, id_usuario_asignado)
VALUES ('Revisar documentación', 'Verificar y corregir errores en la documentación.', 'pendiente', NOW(), '2025-09-20', 1, 3);

-- Actualizar estado de una tarea
UPDATE tareas
SET estado = 'completada'
WHERE id_tarea = 1;

-- Eliminar una tarea
DELETE FROM tareas WHERE id_tarea = 3;


-- notificaciones 


-- Ver todas las notificaciones con el nombre del usuario destino
SELECT n.id_notificacion, n.mensaje, n.fecha, n.leida, u.nombre AS usuario_destino
FROM notificaciones n
JOIN usuarios u ON n.id_usuario_destino = u.id_usuario;

-- Ver notificaciones NO leídas de un usuario específico
SELECT * 
FROM notificaciones 
WHERE id_usuario_destino = 2 AND leida = FALSE;

-- Marcar una notificación como leída
UPDATE notificaciones
SET leida = TRUE
WHERE id_notificacion = 1;

-- Insertar nueva notificación
INSERT INTO notificaciones (mensaje, fecha, leida, id_usuario_destino)
VALUES ('Nueva actualización disponible en el sistema', NOW(), FALSE, 3);

-- Eliminar notificación
DELETE FROM notificaciones WHERE id_notificacion = 4;
