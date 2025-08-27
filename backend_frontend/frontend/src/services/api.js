// src/services/api.js
const API_BASE = "http://localhost:3000/api";

// Función mejorada para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  
  // Para endpoints que devuelven arrays, asegurar que siempre sea un array
  const data = await response.json();
  return data;
};

// Headers comunes
const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { "Authorization": `Bearer ${token}` }),
});

export const api = {
  // ... otros métodos保持不变 ...
  
  // Tareas - con manejo seguro
  getTareas: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/tareas`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching tareas:", error);
      return [];
    }
  },

  // Usuarios - con manejo seguro
  getUsers: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/usuarios`, {
        headers: getHeaders(token),
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },
};