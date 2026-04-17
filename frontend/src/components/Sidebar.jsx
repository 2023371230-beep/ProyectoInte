import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// Íconos SVG simples — no dependemos de librerías externas
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  clientes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  medicamentos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 10h-2v4h2v-4zm4 0h-2v4h2v-4zm4 0h-2v4h2v-4zm2-8H4.5C3.4 2 2.5 2.9 2.5 4v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4.5V9h13v11zm0-13H4.5V4h13v3z"/>
    </svg>
  ),
  videos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  ),
  suscripciones: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  ),
  reportes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2h12l4 4v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm11 1.5V7h3.5L15 3.5zM6 11h12v1.5H6V11zm0 4h12v1.5H6V15zm0 4h8v1.5H6V19z"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  ),
};

const navItems = [
  { to: '/admin/dashboard',     label: 'Dashboard',      icon: icons.dashboard },
  { to: '/admin/clientes',      label: 'Clientes',       icon: icons.clientes },
  { to: '/admin/medicamentos',  label: 'Medicamentos',   icon: icons.medicamentos },
  { to: '/admin/videos',        label: 'Videos',         icon: icons.videos },
  { to: '/admin/suscripciones', label: 'Suscripciones',  icon: icons.suscripciones },
  { to: '/admin/reportes',      label: 'Reportes',       icon: icons.reportes },
];

export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      {/* Logo / Branding */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">DSB</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">Discapacidad</span>
          <span className="sidebar-brand-subtitle">sin Barreras</span>
        </div>
      </div>

      {/* Info del usuario logueado */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{usuario?.nombre || 'Administrador'}</span>
          <span className="sidebar-user-role">Administrador</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <ul role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                // Siempre visible — sin depender de hover para revelar info
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar-nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Cerrar sesión al fondo */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <span aria-hidden="true">{icons.logout}</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
