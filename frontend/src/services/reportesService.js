import api from './api';

export async function obtenerReporteClientes() {
  const res = await api.get('/reportes/clientes');
  return res.data;
}

export async function obtenerReporteSuscripciones() {
  const res = await api.get('/reportes/suscripciones');
  return res.data;
}

export async function obtenerReporteVideosAsignados() {
  const res = await api.get('/reportes/videos-asignados');
  return res.data;
}

export async function obtenerReporteMedicamentosAsignados() {
  const res = await api.get('/reportes/medicamentos-asignados');
  return res.data;
}

export async function descargarReportePdf(tipo) {
  const res = await api.get(`/reportes/${tipo}/pdf`, {
    responseType: 'blob',
  });

  return res.data;
}
