import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para verificar si el token está expirado
  const isTokenExpired = (token) => {
    try {
      if (!token) return true;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true; // Si hay error al decodificar, considerar como expirado
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const usuarioData = localStorage.getItem("usuario");
        
        if (token && !isTokenExpired(token) && usuarioData) {
          const parsedUsuario = JSON.parse(usuarioData);
          setToken(token);
          setUsuario(parsedUsuario);
        } else {
          // Token expirado o inválido, limpiar
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setToken(null);
          setUsuario(null);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setToken(null);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (correo, password) => {
    try {
      const response = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }

      const data = await response.json();
      setToken(data.token);
      setUsuario(data.usuario);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  const value = {
    token,
    usuario,
    login,
    logout,
    isAuthenticated: !!token && !isTokenExpired(token),
    isAdmin: usuario?.rol === "admin"
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};