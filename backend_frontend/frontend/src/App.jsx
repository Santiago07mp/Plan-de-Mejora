import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tareas from "./pages/Tareas";
import Notificaciones from "./pages/Notificaciones";
import Reportes from "./pages/Reportes";
import Navbar from "./components/Navbar";

/**
 * Decodifica el payload de un JWT (sin verificar firma).
 * Devuelve el objeto payload o null si no se puede decodificar.
 */
function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // payload (base64url)
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // agregar padding
    const pad = payload.length % 4 === 0 ? "" : "=".repeat(4 - (payload.length % 4));
    const decoded = atob(payload + pad);
    // intento simple de parse JSON
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

/**
 * Valida si un token es "válido" para la UI:
 * - existe,
 * - no es la cadena "undefined" ni vacía,
 * - y si tiene exp, no está vencido.
 */
function isTokenValid(token) {
  if (!token) return false;
  if (typeof token !== "string") return false;
  const t = token.trim();
  if (t === "" || t === "undefined") return false;

  const payload = parseJwt(t);
  if (!payload) return true; // no se pudo parsear => asumimos token (backend decide), pero mejor que sea mejor que nada
  if (payload.exp && typeof payload.exp === "number") {
    const now = Date.now() / 1000;
    return payload.exp > now;
  }
  return true;
}

function App() {
  const [authed, setAuthed] = useState(() => {
    const token = localStorage.getItem("token");
    return isTokenValid(token);
  });

  // escucha cambios en storage (otras pestañas)
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem("token");
      setAuthed(isTokenValid(token));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // función que pasamos a Login para actualizar estado al hacer login en la misma pestaña
  const handleAuth = () => {
    const token = localStorage.getItem("token");
    setAuthed(isTokenValid(token));
  };

  return (
    <BrowserRouter>
      {authed && <Navbar />}
      <Routes>
        {/* Si ya estás autenticado, no permitir entrar al login/registro */}
        <Route path="/login" element={!authed ? <Login onAuth={handleAuth} /> : <Navigate to="/" replace />} />
        <Route path="/registro" element={!authed ? <Register /> : <Navigate to="/" replace />} />

        {/* Rutas protegidas */}
        <Route path="/" element={authed ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/tareas" element={authed ? <Tareas /> : <Navigate to="/login" replace />} />
        <Route path="/notificaciones" element={authed ? <Notificaciones /> : <Navigate to="/login" replace />} />
        <Route path="/reportes" element={authed ? <Reportes /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
