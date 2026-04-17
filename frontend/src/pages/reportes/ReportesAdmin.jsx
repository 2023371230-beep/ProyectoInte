import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import {
  obtenerReporteClientes,
  obtenerReporteSuscripciones,
  obtenerReporteVideosAsignados,
  obtenerReporteMedicamentosAsignados,
  descargarReportePdf,
} from '../../services/reportesService';
import './ReportesAdmin.css';

function Stat({ label, value }) {
  return (
    <div className="reporte-stat">
      <span className="reporte-stat-label">{label}</span>
      <strong className="reporte-stat-value">{value ?? 0}</strong>
    </div>
  );
}

function descargarBlob(blob, nombre) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function TablaReporte({ columns, rows, emptyText }) {
  return (
    <div className="table-container reporte-table-wrap">
      <table className="table" aria-label="Tabla de reporte">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center reporte-empty-row">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${index}-${row.id_cliente || row.id_suscripcion || row.cliente || 'fila'}`}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row[column.key], row) : (row[column.key] ?? '-')}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportesAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState('');

  const [clientes, setClientes] = useState({ resumen: {}, registros: [] });
  const [suscripciones, setSuscripciones] = useState({ resumen: {}, registros: [] });
  const [videos, setVideos] = useState({ resumen: {}, registros: [] });
  const [medicamentos, setMedicamentos] = useState({ resumen: {}, registros: [] });

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        setError('');

        const [resClientes, resSuscripciones, resVideos, resMedicamentos] = await Promise.all([
          obtenerReporteClientes(),
          obtenerReporteSuscripciones(),
          obtenerReporteVideosAsignados(),
          obtenerReporteMedicamentosAsignados(),
        ]);

        setClientes(resClientes);
        setSuscripciones(resSuscripciones);
        setVideos(resVideos);
        setMedicamentos(resMedicamentos);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los reportes.');
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  async function handleDescargar(tipo, nombreArchivo) {
    try {
      setDescargando(tipo);
      const blob = await descargarReportePdf(tipo);
      descargarBlob(blob, nombreArchivo);
    } catch (err) {
      setError(err.message || 'No se pudo descargar el PDF.');
    } finally {
      setDescargando('');
    }
  }

  return (
    <>
      <Header titulo="Reportes" subtitulo="Reportes administrativos con exportación a PDF" />

      <div className="page-body reportes-page">
        {error && (
          <div className="alert alert-error" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </div>
        )}

        {loading ? (
          <div className="card reporte-loading">
            <div className="spinner" aria-label="Cargando reportes" />
            <p className="text-muted">Cargando reportes...</p>
          </div>
        ) : (
          <div className="reportes-grid">
            <section className="card reporte-card">
              <div className="reporte-card-head">
                <div>
                  <h2>Clientes registrados</h2>
                  <p>Totales de clientes, estado y fecha de registro.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDescargar('clientes', 'reporte-clientes.pdf')}
                  disabled={descargando === 'clientes'}
                >
                  {descargando === 'clientes' ? 'Descargando...' : 'Descargar PDF'}
                </button>
              </div>

              <div className="reporte-stats-grid">
                <Stat label="Total de clientes" value={clientes.resumen.total_registrados} />
                <Stat label="Clientes activos" value={clientes.resumen.clientes_activos} />
                <Stat label="Clientes dados de baja" value={clientes.resumen.clientes_dados_baja} />
              </div>

              <TablaReporte
                columns={[
                  { key: 'id_cliente', label: 'ID' },
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'email', label: 'Correo' },
                  { key: 'estado', label: 'Estado' },
                  {
                    key: 'fecha_registro',
                    label: 'Fecha de registro',
                    render: (value) => value ? new Date(value).toLocaleDateString('es-MX') : '-',
                  },
                ]}
                rows={clientes.registros}
                emptyText="No hay clientes para mostrar."
              />
            </section>

            <section className="card reporte-card">
              <div className="reporte-card-head">
                <div>
                  <h2>Suscripciones</h2>
                  <p>Resumen por tipo de plan y estado de suscripción.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDescargar('suscripciones', 'reporte-suscripciones.pdf')}
                  disabled={descargando === 'suscripciones'}
                >
                  {descargando === 'suscripciones' ? 'Descargando...' : 'Descargar PDF'}
                </button>
              </div>

              <div className="reporte-stats-grid">
                <Stat label="Total" value={suscripciones.resumen.total_suscripciones} />
                <Stat label="Estandar" value={suscripciones.resumen.estandar} />
                <Stat label="Premium" value={suscripciones.resumen.premium} />
                <Stat label="Activas" value={suscripciones.resumen.activas} />
                <Stat label="Vencidas" value={suscripciones.resumen.vencidas} />
                <Stat label="Canceladas" value={suscripciones.resumen.canceladas} />
              </div>

              <TablaReporte
                columns={[
                  { key: 'id_suscripcion', label: 'ID' },
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'email', label: 'Correo' },
                  { key: 'plan', label: 'Plan' },
                  { key: 'estado', label: 'Estado' },
                  {
                    key: 'fecha_inicio',
                    label: 'Inicio',
                    render: (value) => value ? new Date(value).toLocaleDateString('es-MX') : '-',
                  },
                ]}
                rows={suscripciones.registros}
                emptyText="No hay suscripciones para mostrar."
              />
            </section>

            <section className="card reporte-card">
              <div className="reporte-card-head">
                <div>
                  <h2>Videos asignados</h2>
                  <p>Videos asignados por cliente, estado de acceso y plan premium.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDescargar('videos-asignados', 'reporte-videos-asignados.pdf')}
                  disabled={descargando === 'videos-asignados'}
                >
                  {descargando === 'videos-asignados' ? 'Descargando...' : 'Descargar PDF'}
                </button>
              </div>

              <div className="reporte-stats-grid">
                <Stat label="Total clientes" value={videos.resumen.total_clientes} />
                <Stat label="Videos asignados" value={videos.resumen.total_videos_asignados} />
                <Stat label="Acceso habilitado" value={videos.resumen.acceso_habilitado} />
                <Stat label="Acceso restringido" value={videos.resumen.acceso_restringido} />
                <Stat label="Clientes premium" value={videos.resumen.clientes_premium} />
              </div>

              <TablaReporte
                columns={[
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'email', label: 'Correo' },
                  { key: 'videos_asignados', label: 'Videos asignados' },
                  { key: 'estado_acceso', label: 'Estado de acceso' },
                  { key: 'tiene_premium', label: 'Premium' },
                ]}
                rows={videos.registros}
                emptyText="No hay asignaciones de videos para mostrar."
              />
            </section>

            <section className="card reporte-card">
              <div className="reporte-card-head">
                <div>
                  <h2>Medicamentos asignados</h2>
                  <p>Detalle por cliente: medicamento, dosis, frecuencia y hora de inicio.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDescargar('medicamentos-asignados', 'reporte-medicamentos-asignados.pdf')}
                  disabled={descargando === 'medicamentos-asignados'}
                >
                  {descargando === 'medicamentos-asignados' ? 'Descargando...' : 'Descargar PDF'}
                </button>
              </div>

              <div className="reporte-stats-grid">
                <Stat label="Total asignaciones" value={medicamentos.resumen.total_asignaciones} />
                <Stat label="Clientes con medicación" value={medicamentos.resumen.clientes_con_medicacion} />
              </div>

              <TablaReporte
                columns={[
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'medicamento', label: 'Medicamento' },
                  { key: 'dosis', label: 'Dosis' },
                  { key: 'frecuencia', label: 'Frecuencia' },
                  { key: 'hora_inicio', label: 'Hora de inicio' },
                ]}
                rows={medicamentos.registros}
                emptyText="No hay asignaciones de medicamentos para mostrar."
              />
            </section>
          </div>
        )}
      </div>
    </>
  );
}
