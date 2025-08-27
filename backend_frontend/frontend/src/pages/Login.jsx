import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login({ onAuth }) {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/usuarios/login", { correo, contraseña });
      // revisar respuesta exacta del backend:
      // debe devolver { token: "...", usuario: {...} }
      console.log("Login response:", res.data);

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        // actualizar estado de la app (misma pestaña)
        if (typeof onAuth === "function") onAuth();
        navigate("/");
      } else {
        // si backend devuelve estructura distinta, mostrarla para debug
        alert("Respuesta inesperada del servidor. Revisa la consola.");
        console.log(res.data);
      }
    } catch (err) {
      console.error("Error login:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Credenciales inválidas";
      alert(msg);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
