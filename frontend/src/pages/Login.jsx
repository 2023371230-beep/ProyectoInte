import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../services/authService';
import './Login.css';

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate          = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setCargando(true);
    try {
      const { token, usuario } = await loginUsuario(form.email, form.password);
      iniciarSesion(token, usuario);
      navigate('/admin/dashboard');
    } catch (err) {
      // Axios envuelve el error — el mensaje real viene en err.response.data.error
      const mensaje = err.response?.data?.error || err.message || 'Error al iniciar sesión.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">

      {/* ── Panel izquierdo: formulario ── */}
      <div className="login-form-panel">
        <div className="login-form-card">

          {/* Logo y bienvenida */}
          <div className="login-form-header">
            <img src="/logo.png" alt="Logo clínica" className="login-logo-img" />
            <p className="login-welcome">BIENVENIDO AL PANEL</p>
            <h1 className="login-form-title">Iniciar Sesión</h1>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="email">Correo electrónico</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">✉</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando ? 'Ingresando...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="login-form-footer">
            <Link to="/" className="login-back-link">← Volver al inicio</Link>
          </div>

        </div>
      </div>

      {/* ── Panel derecho: branding con imagen ── */}
      <div className="login-brand-panel" aria-hidden="true">
        <div className="login-brand-overlay" />
        <div className="login-brand-content">
          <img src="/logo.png" alt="" className="brand-logo" />
          <h2 className="brand-title">Discapacidad<br />sin Barreras</h2>
          <p className="brand-desc">
            Plataforma administrativa para el seguimiento de pacientes,
            medicamentos y contenido de rehabilitación motriz.
          </p>
          <div className="brand-badge">Panel Administrativo</div>
        </div>
      </div>

    </div>
  );
}
