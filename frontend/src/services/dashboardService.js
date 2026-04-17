import api from './api';

// Trae los conteos para las tarjetas del dashboard
export async function obtenerResumenDashboard() {
  const response = await api.get('/dashboard/resumen');
  return response.data;
}
