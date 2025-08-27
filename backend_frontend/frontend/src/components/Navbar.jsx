import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/tareas">Tareas</Link>
      <Link to="/notificaciones">Notificaciones</Link>
      <Link to="/reportes">Reportes</Link>
      <button onClick={logout}>Salir</button>
    </nav>
  );
}

export default Navbar;
