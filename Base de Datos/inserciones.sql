-- Inserciones en usuarios
INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES
('Administrador General', 'admin@correo.com', '$2a$10$abcd1234abcd1234abcd12', 'admin'), -- hash bcrypt simulado
('Juan Pérez', 'juan@correo.com', '$2a$10$abcd1234abcd1234abcd12', 'usuario'),
('María Gómez', 'maria@correo.com', '$2a$10$abcd1234abcd1234abcd12', 'usuario'),
('Carlos Ruiz', 'carlos@correo.com', '$2a$10$abcd1234abcd1234abcd12', 'usuario');

-- Inserciones en tareas
INSERT INTO tareas (titulo, descripcion, estado, fecha_creacion, fecha_vencimiento, id_usuario_creador, id_usuario_asignado) VALUES
('Revisar informes', 'Revisar los informes de ventas de este mes.', 'pendiente', NOW(), '2025-09-10', 1, 2),
('Actualizar inventario', 'Actualizar la base de datos del inventario.', 'en progreso', NOW(), '2025-09-15', 1, 3),
('Preparar presentación', 'Preparar diapositivas para la reunión de la próxima semana.', 'pendiente', NOW(), NULL, 2, 4),
('Respaldo del sistema', 'Hacer copia de seguridad completa del sistema.', 'completada', NOW(), '2025-08-20', 1, 2);

-- Inserciones en notificaciones
INSERT INTO notificaciones (mensaje, fecha, leida, id_usuario_destino) VALUES
('Tienes una nueva tarea asignada: Revisar informes', NOW(), FALSE, 2),
('Tienes una nueva tarea asignada: Actualizar inventario', NOW(), FALSE, 3),
('Tarea completada: Respaldo del sistema', NOW(), TRUE, 1),
('Nueva tarea pendiente: Preparar presentación', NOW(), FALSE, 4);
