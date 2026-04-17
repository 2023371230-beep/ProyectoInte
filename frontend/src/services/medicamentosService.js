import api from './api';

export async function obtenerMedicamentos() {
  const res = await api.get('/medicamentos');
  return res.data;
}

export async function obtenerMedicamentoPorId(id) {
  const res = await api.get(`/medicamentos/${id}`);
  return res.data;
}

export async function crearMedicamento(datos) {
  const res = await api.post('/medicamentos', datos);
  return res.data;
}

export async function actualizarMedicamento(id, datos) {
  const res = await api.put(`/medicamentos/${id}`, datos);
  return res.data;
}

export async function eliminarMedicamento(id) {
  const res = await api.delete(`/medicamentos/${id}`);
  return res.data;
}

// Admin asigna un medicamento a un cliente con dosis y frecuencia
export async function asignarMedicamento(datos) {
  const res = await api.post('/medicamentos/asignar', datos);
  return res.data;
}
