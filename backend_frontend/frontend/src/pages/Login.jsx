import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/login_register.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(correo, password);
      Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success");
      navigate("/dashboard");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 auth-container">
      <h2 className="mb-4 text-center auth-title">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="mb-3">
          <input 
            className="form-control auth-input" 
            type="email" 
            placeholder="Correo electrónico" 
            value={correo} 
            onChange={e => setCorreo(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <input 
            className="form-control auth-input" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button className="btn btn-primary w-100 auth-button" disabled={loading}>
          {loading ? (<><span className="loading-state"></span> Ingresando...</>) : "Ingresar"}
        </button>
      </form>
      <div className="mt-3 text-center auth-link-container">
        <span>¿No tienes cuenta? </span>
        <Link to="/register" className="auth-link">Regístrate aquí</Link>
      </div>
    </div>
  );
}