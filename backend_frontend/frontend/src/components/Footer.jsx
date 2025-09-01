import React from 'react';
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer mt-auto">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">Gestor de Tareas</div>
          <div className="footer-links">
            <a href="/dashboard" className="footer-link">Inicio</a>
            <a href="/tareas" className="footer-link">Tareas</a>
            <a href="/reportes" className="footer-link">Reportes</a>
            <a href="/notificaciones" className="footer-link">Notificaciones</a>
          </div>
          <div className="footer-bottom">
            <p className="mb-0">&copy; 2024 Sistema de Gestión de Tareas. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;