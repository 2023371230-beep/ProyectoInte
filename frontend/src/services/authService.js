import api from './api';

// Envía las credenciales al endpoint exclusivo para admins.
// Si el usuario tiene rol 'cliente', el backend devuelve 403 y rechaza el acceso.
export async function loginUsuario(email, password) {
  const response = await api.post('/auth/login-admin', { email, password });
  return response.data;
}
