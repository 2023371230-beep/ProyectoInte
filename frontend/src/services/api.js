import axios from 'axios';

// URL base del backend Node.js
// En desarrollo apunta a localhost, en producción se cambia por variable de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjunta el token JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja errores de forma centralizada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje = error.response?.data?.error || 'Error de conexión con el servidor.';

    // Si el servidor devuelve 401 (token inválido/expirado), limpiamos la sesión
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(mensaje));
  }
);

export default api;
