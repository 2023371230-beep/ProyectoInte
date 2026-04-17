import api from './api';

export async function obtenerVideos() {
  const res = await api.get('/videos');
  return res.data;
}

export async function obtenerVideoPorId(id) {
  const res = await api.get(`/videos/${id}`);
  return res.data;
}

export async function crearVideo(datos) {
  const res = await api.post('/videos', datos);
  return res.data;
}

export async function actualizarVideo(id, datos) {
  const res = await api.put(`/videos/${id}`, datos);
  return res.data;
}

export async function eliminarVideo(id) {
  const res = await api.delete(`/videos/${id}`);
  return res.data;
}

// Admin asigna un video a un cliente
export async function asignarVideo(datos) {
  const res = await api.post('/videos/asignar', datos);
  return res.data;
}
