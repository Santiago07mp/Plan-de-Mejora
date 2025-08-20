INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES
('Administrador', 'admin@example.com', 'admin123cifrado', 'admin'),
('Juan Pérez', 'juan@example.com', 'juan123cifrado', 'usuario'),
('María Gómez', 'maria@example.com', 'maria123cifrado', 'usuario'),
('Pedro López', 'pedro@example.com', 'pedro123cifrado', 'usuario');


INSERT INTO tareas (titulo, descripcion, estado, fecha_vencimiento, id_usuario_creador, id_usuario_asignado) VALUES
('Configurar base de datos', 'Instalar y configurar MySQL', 'pendiente', '2025-08-30', 1, 2),
('Diseñar interfaz', 'Maquetar la pantalla principal en React', 'en progreso', '2025-09-05', 1, 3),
('Escribir documentación API', 'Redactar los endpoints en Postman/Swagger', 'pendiente', '2025-09-10', 1, 4),
('Pruebas de seguridad', 'Revisar contraseñas cifradas y JWT', 'completada', '2025-08-15', 1, 2);

INSERT INTO notificaciones (mensaje, id_usuario_destino) VALUES
('Se te asignó la tarea: Configurar base de datos', 2),
('Se te asignó la tarea: Diseñar interfaz', 3),
('Se te asignó la tarea: Escribir documentación API', 4),
('Se te asignó la tarea: Pruebas de seguridad', 2);

INSERT INTO reportes (fecha_inicio, fecha_fin, id_admin, archivo) VALUES
('2025-08-01', '2025-08-15', 1, 'reporte_tareas_ago1-15.pdf'),
('2025-08-16', '2025-08-30', 1, 'reporte_tareas_ago16-30.pdf');
