// src/components/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/login_register.css";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }

      Swal.fire("Éxito", "Usuario registrado correctamente", "success");
      navigate("/login");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <input 
          className="form-control mb-3" 
          type="text" 
          placeholder="Nombre completo" 
          value={nombre} 
          onChange={e => setNombre(e.target.value)} 
          required 
        />
        <input 
          className="form-control mb-3" 
          type="email" 
          placeholder="Correo electrónico" 
          value={correo} 
          onChange={e => setCorreo(e.target.value)} 
          required 
        />
        <input 
          className="form-control mb-3" 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      <div className="mt-3 text-center">
        <span>¿Ya tienes cuenta? </span>
        <Link to="/login">Inicia sesión aquí</Link>
      </div>
    </div>
  );
}