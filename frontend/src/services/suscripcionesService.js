import api from './api';

export async function obtenerSuscripciones() {
  const res = await api.get('/suscripciones');
  return res.data;
}

export async function actualizarSuscripcion(id, datos) {
  const res = await api.put(`/suscripciones/${id}`, datos);
  return res.data;
}
