-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_tareas;
USE gestion_tareas;

-- Tabla: usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario'
);

-- Tabla: tareas
CREATE TABLE tareas (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'en progreso', 'completada') NOT NULL DEFAULT 'pendiente',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NULL,
    id_usuario_creador INT NOT NULL,
    id_usuario_asignado INT NOT NULL,
    FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario_asignado) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla: notificaciones
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    mensaje VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    id_usuario_destino INT NOT NULL,
    FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);
