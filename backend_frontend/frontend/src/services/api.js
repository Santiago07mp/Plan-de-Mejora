// src/services/api.js
const API_BASE = "http://localhost:3000/api";

// Función mejorada para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    
    try {
      // Intentar parsear como JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        // Si no es JSON, obtener el texto de la respuesta
        const text = await response.text();
        errorData = { error: text || `Error ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      // Si falla el parsing, crear un objeto de error básico
      errorData = { error: `Error ${response.status}: ${response.statusText}` };
    }
    
    // Detectar específicamente errores de token
    if (response.status === 400 && errorData.error && errorData.error.includes("Token")) {
      throw new Error("TOKEN_EXPIRED");
    }
    
    if (response.status === 401 || response.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    
    // Manejar errores 500 específicamente
    if (response.status === 500) {
      throw new Error(errorData.error || "Error interno del servidor. Por favor, intente más tarde.");
    }
    
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
};

// Headers comunes
const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { "Authorization": `Bearer ${token}` }),
});

export const api = {
  // Métodos GET genéricos
  get: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: getHeaders(token),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos POST genéricos
  post: async (endpoint, data, token) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos PUT genéricos
  put: async (endpoint, data, token) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error putting to ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos DELETE genéricos
  delete: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos específicos con manejo mejorado de errores
  getTareas: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/tareas`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching tareas:", error);
      
      // Relanzar el error para que el componente lo maneje
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        throw error;
      }
      
      return [];
    }
  },

  getUsers: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/usuarios`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      
      // Relanzar el error para que el componente lo maneje
      if (error.message === "TOKEN_EXPIRED" || error.message === "UNAUTHORIZED") {
        throw error;
      }
      
      return [];
    }
  },
};