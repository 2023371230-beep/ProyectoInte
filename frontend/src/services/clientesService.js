import api from './api';

export async function obtenerClientes() {
  const res = await api.get('/clientes');
  return res.data;
}

export async function obtenerClientePorId(id) {
  const res = await api.get(`/clientes/${id}`);
  return res.data;
}

export async function obtenerDetalleCliente(id) {
  const res = await api.get(`/clientes/${id}/detalle`);
  return res.data;
}

export async function crearCliente(datos) {
  const res = await api.post('/clientes', datos);
  return res.data;
}

export async function actualizarCliente(id, datos) {
  const res = await api.put(`/clientes/${id}`, datos);
  return res.data;
}

export async function darDeBajaCliente(id) {
  const res = await api.delete(`/clientes/${id}`);
  return res.data;
}
