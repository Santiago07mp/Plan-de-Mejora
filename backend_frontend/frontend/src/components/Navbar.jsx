// Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "../css/Navbar.css";

const Navbar = () => {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="app-navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-section">
            <div className="navbar-logo">Gestor de Tareas</div>
            <p className="navbar-description">Sistema profesional para la gestión eficiente de tareas y proyectos.</p>
          </div>
          
          <div className="navbar-section">
            <h4 className="navbar-title">Navegación</h4>
            <div className="navbar-links">
              <button 
                className="navbar-link" 
                onClick={() => handleNavigation('/dashboard')}
              >
                Inicio
              </button>
              <button 
                className="navbar-link" 
                onClick={() => handleNavigation('/tareas')}
              >
                Tareas
              </button>
              <button 
                className="navbar-link" 
                onClick={() => handleNavigation('/reportes')}
              >
                Reportes
              </button>
              <button 
                className="navbar-link" 
                onClick={() => handleNavigation('/notificaciones')}
              >
                Notificaciones
              </button>
            </div>
          </div>
          
          <div className="navbar-section">
            <h4 className="navbar-title">Usuario</h4>
            <div className="navbar-user-info">
              <p className="user-name">{usuario?.nombre}</p>
              <p className="user-role">{usuario?.rol}</p>
            </div>
            <button 
              className="navbar-logout-btn" 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="navbar-bottom">
          <p className="user-welcome">Bienvenido al sistema de gestión de tareas</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;