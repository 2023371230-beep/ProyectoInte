const reportesService = require('../services/reportes.service');
const { generarPdf, formatoFecha } = require('../services/reportes-pdf.service');

async function reporteClientes(req, res) {
  try {
    const datos = await reportesService.obtenerReporteClientes();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteClientesPdf(req, res) {
  try {
    const datos = await reportesService.obtenerReporteClientes();
    generarPdf({
      res,
      nombreArchivo: 'reporte-clientes.pdf',
      titulo: 'Reporte de Clientes Registrados',
      resumen: datos.resumen,
      columnas: [
        { key: 'id_cliente', label: 'ID', weight: 0.6 },
        { key: 'cliente', label: 'Cliente', weight: 1.5 },
        { key: 'email', label: 'Correo', weight: 2 },
        { key: 'estado', label: 'Estado', weight: 0.9 },
        { key: 'fecha_registro', label: 'Registro', weight: 1, format: formatoFecha },
      ],
      filas: datos.registros,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteSuscripciones(req, res) {
  try {
    const datos = await reportesService.obtenerReporteSuscripciones();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteSuscripcionesPdf(req, res) {
  try {
    const datos = await reportesService.obtenerReporteSuscripciones();
    generarPdf({
      res,
      nombreArchivo: 'reporte-suscripciones.pdf',
      titulo: 'Reporte de Suscripciones',
      resumen: datos.resumen,
      columnas: [
        { key: 'id_suscripcion', label: 'ID', weight: 0.7 },
        { key: 'cliente', label: 'Cliente', weight: 1.5 },
        { key: 'plan', label: 'Plan', weight: 0.8 },
        { key: 'estado', label: 'Estado', weight: 0.9 },
        { key: 'fecha_inicio', label: 'Inicio', weight: 1, format: formatoFecha },
      ],
      filas: datos.registros,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteVideos(req, res) {
  try {
    const datos = await reportesService.obtenerReporteVideosAsignados();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteVideosPdf(req, res) {
  try {
    const datos = await reportesService.obtenerReporteVideosAsignados();
    generarPdf({
      res,
      nombreArchivo: 'reporte-videos-asignados.pdf',
      titulo: 'Reporte de Videos Asignados',
      resumen: datos.resumen,
      columnas: [
        { key: 'cliente', label: 'Cliente', weight: 1.7 },
        { key: 'videos_asignados', label: 'Videos', weight: 0.8 },
        { key: 'estado_acceso', label: 'Acceso', weight: 1.2 },
        { key: 'tiene_premium', label: 'Premium', weight: 0.8 },
      ],
      filas: datos.registros,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteMedicamentos(req, res) {
  try {
    const datos = await reportesService.obtenerReporteMedicamentosAsignados();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reporteMedicamentosPdf(req, res) {
  try {
    const datos = await reportesService.obtenerReporteMedicamentosAsignados();
    generarPdf({
      res,
      nombreArchivo: 'reporte-medicamentos-asignados.pdf',
      titulo: 'Reporte de Medicamentos Asignados',
      resumen: datos.resumen,
      columnas: [
        { key: 'cliente', label: 'Cliente', weight: 1.6 },
        { key: 'medicamento', label: 'Medicamento', weight: 1.5 },
        { key: 'dosis', label: 'Dosis', weight: 1 },
        { key: 'frecuencia', label: 'Frecuencia', weight: 1.1 },
        { key: 'hora_inicio', label: 'Hora inicio', weight: 0.8 },
      ],
      filas: datos.registros,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  reporteClientes,
  reporteClientesPdf,
  reporteSuscripciones,
  reporteSuscripcionesPdf,
  reporteVideos,
  reporteVideosPdf,
  reporteMedicamentos,
  reporteMedicamentosPdf,
};
