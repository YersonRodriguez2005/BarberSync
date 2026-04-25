// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://barbersync-v2lb.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de REQUEST — inyectar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// FIX: Interceptor de RESPONSE — detectar token expirado/inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde 400 o 401, el token es inválido → limpiar sesión
    if (error.response?.status === 400 || error.response?.status === 401) {
      const mensaje = error.response?.data?.message || '';
      if (
        mensaje.includes('Token inválido') ||
        mensaje.includes('expirado') ||
        mensaje.includes('Acceso denegado')
      ) {
        // Limpiar localStorage y forzar login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirigir al login sin usar history (fuera de React)
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;