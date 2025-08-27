-- ==================================================
-- USUARIOS DE PRUEBA
-- ==================================================
INSERT INTO usuarios (nombre, correo, password, rol) VALUES
('Administrador', 'admin@demo.com', '$2b$10$yha0I/rEhYGRwHkSfo20B.peu7Y4.T.zj2Njn3O4XB4drnLxIRgJK', 'admin'),
('Juan Pérez', 'juan@demo.com', '$2b$10$d5V.Y/RjcDDvVu4AXOyhEeM4NPLx9.SjaPUdzuW/sK5CA2sSK18rW', 'usuario'),
('María López', 'maria@demo.com', '$2a$10$abcd1234abcd1234abcd12', 'usuario'),
('Carlos Ramírez', 'carlos@demo.com', '$2a$10$abcd1234abcd1234abcd12', 'usuario');

-- ==================================================
-- TAREAS DE PRUEBA
-- ==================================================
INSERT INTO tareas (titulo, descripcion, estado, fecha_vencimiento, id_usuario_creador, id_usuario_asignado) VALUES
('Configurar servidor', 'Instalar Node.js y configurar entorno en el servidor.', 'pendiente', '2025-09-10', 1, 2),
('Diseñar frontend', 'Crear componentes principales en React.', 'en progreso', '2025-09-15', 1, 3),
('Redactar documentación', 'Generar documentación del API en Swagger.', 'pendiente', '2025-09-20', 2, 4),
('Pruebas unitarias', 'Implementar Jest para validar controladores.', 'completada', '2025-08-25', 3, 2);

-- ==================================================
-- NOTIFICACIONES DE PRUEBA
-- ==================================================
INSERT INTO notificaciones (id_usuario, mensaje, leido) VALUES
(2, 'Se te asignó la tarea: Configurar servidor', FALSE),
(3, 'Se te asignó la tarea: Diseñar frontend', FALSE),
(4, 'Nueva tarea asignada: Redactar documentación', FALSE),
(2, 'La tarea "Pruebas unitarias" fue marcada como completada', TRUE);

-- ==================================================
-- LOG DE CAMBIOS DE ROLES
-- ==================================================
INSERT INTO roles_log (id_admin, id_usuario, rol_anterior, rol_nuevo) VALUES
(1, 2, 'usuario', 'admin'),
(1, 3, 'usuario', 'usuario'),
(1, 4, 'usuario', 'usuario');
