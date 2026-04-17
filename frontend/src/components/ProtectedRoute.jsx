import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { usuario, cargando, cerrarSesion } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--color-primary)' }}>Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Bloquea acceso al panel si el usuario no es administrador
  if (usuario.rol !== 'admin') {
    cerrarSesion();
    return <Navigate to="/login" replace />;
  }

  return children;
}
