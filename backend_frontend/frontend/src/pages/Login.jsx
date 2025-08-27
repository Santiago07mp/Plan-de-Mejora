import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

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
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input 
            className="form-control" 
            type="email" 
            placeholder="Correo electrónico" 
            value={correo} 
            onChange={e => setCorreo(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <input 
            className="form-control" 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <div className="mt-3 text-center">
        <span>¿No tienes cuenta? </span>
        <Link to="/register">Regístrate aquí</Link>
      </div>
    </div>
  );
}