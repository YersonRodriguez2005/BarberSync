// frontend/src/services/api.ts
import axios from 'axios';

// Creamos la instancia base apuntando a nuestro servidor local
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Se ejecuta ANTES de que cualquier petición salga hacia el servidor
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en el almacenamiento local
    const token = localStorage.getItem('token');
    
    // Si existe, lo inyectamos en las cabeceras de autorización
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;