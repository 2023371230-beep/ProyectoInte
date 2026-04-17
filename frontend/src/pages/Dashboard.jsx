import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { obtenerResumenDashboard } from '../services/dashboardService';
import './Dashboard.css';

// Tarjeta reutilizable del dashboard
function StatCard({ titulo, valor, descripcion, icono, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: color + '20', color }}>
          {icono}
        </div>
        <span className="stat-card-titulo">{titulo}</span>
      </div>
      <div className="stat-card-metric">
        <span className="stat-card-bar" aria-hidden="true" style={{ backgroundColor: color }} />
        <div className="stat-card-valor">{valor ?? '—'}</div>
      </div>
      <div className="stat-card-desc">{descripcion}</div>
    </div>
  );
}

export default function Dashboard() {
  const [resumen, setResumen]   = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    obtenerResumenDashboard()
      .then(setResumen)
      .catch(() => setError('No se pudo cargar el resumen. Verifica la conexión al servidor.'));
  }, []);

  return (
    <>
      <Header
        titulo="Dashboard"
        subtitulo="Resumen general del sistema"
      />

      <div className="page-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </div>
        )}

        {/* Tarjetas de resumen */}
        <div className="stat-grid">
          <StatCard
            titulo="Clientes registrados"
            valor={resumen?.total_clientes}
            descripcion="Usuarios con perfil de cliente"
            color="#728156"
            icono={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            }
          />

          <StatCard
            titulo="Medicamentos"
            valor={resumen?.total_medicamentos}
            descripcion="Medicamentos en catálogo"
            color="#88976C"
            icono={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5 10h-2v4h2v-4zm4 0h-2v4h2v-4zm4 0h-2v4h2v-4zm2-8H4.5C3.4 2 2.5 2.9 2.5 4v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4.5V9h13v11zm0-13H4.5V4h13v3z"/>
              </svg>
            }
          />

          <StatCard
            titulo="Videos"
            valor={resumen?.total_videos}
            descripcion="Videos de rehabilitación"
            color="#B6C99C"
            icono={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            }
          />

          <StatCard
            titulo="Suscripciones activas"
            valor={resumen?.total_suscripciones_activas}
            descripcion="Planes activos actualmente"
            color="#CFE1BB"
            icono={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            }
          />
        </div>

        {/* Sección de accesos rápidos — ?nuevo=1 abre el modal directamente en la lista */}
        <div className="dashboard-section">
          <h2 className="section-title">Accesos rápidos</h2>
          <div className="quick-access-grid">
            <Link to="/admin/clientes?nuevo=1" className="quick-card">
              <span className="quick-card-icon">+</span>
              <span>Nuevo cliente</span>
            </Link>
            <Link to="/admin/medicamentos?nuevo=1" className="quick-card">
              <span className="quick-card-icon">+</span>
              <span>Nuevo medicamento</span>
            </Link>
            <Link to="/admin/videos?nuevo=1" className="quick-card">
              <span className="quick-card-icon">+</span>
              <span>Nuevo video</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
