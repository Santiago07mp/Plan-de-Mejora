// src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

async function handleResponse(response) {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const text = await response.text();
  console.log('Response text:', text);
  
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid JSON response from server');
  }
  
  if (!response.ok) {
    console.error('API Error:', data);
    
    // Manejar errores específicos de autenticación
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    
    if (response.status === 500) {
      // Extraer mensaje de error más específico si está disponible
      const errorMessage = data.error || 'Internal server error';
      throw new Error(errorMessage);
    }
    
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
}

export const api = {
  async get(endpoint, token) {
    console.log('GET request to:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async post(endpoint, data, token) {
    console.log('POST request to:', `${API_BASE_URL}${endpoint}`, 'with data:', data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  async put(endpoint, data, token) {
    console.log('PUT request to:', `${API_BASE_URL}${endpoint}`, 'with data:', data);
    
    // Asegurar que las fechas estén en formato correcto para MySQL
    const processedData = { ...data };
    
    if (processedData.fecha_vencimiento) {
      // Si es una fecha ISO (con T y Z), convertir a formato YYYY-MM-DD
      if (typeof processedData.fecha_vencimiento === 'string' && 
          processedData.fecha_vencimiento.includes('T')) {
        processedData.fecha_vencimiento = processedData.fecha_vencimiento.split('T')[0];
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });
    
    return handleResponse(response);
  },

  async delete(endpoint, token) {
    console.log('DELETE request to:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },

  // Métodos específicos para tareas
  async getTareas(token) {
    return this.get('/tareas', token);
  },

  async getUsers(token) {
    return this.get('/usuarios', token);
  },

  async createTarea(tareaData, token) {
    return this.post('/tareas', tareaData, token);
  },

  async updateTarea(id, tareaData, token) {
    return this.put(`/tareas/${id}`, tareaData, token);
  },

  async deleteTarea(id, token) {
    return this.delete(`/tareas/${id}`, token);
  },
};