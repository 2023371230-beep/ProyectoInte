import { createContext, useContext, useState, useEffect } from 'react';

// Contexto de autenticación — maneja el estado global del usuario logueado
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar la app, revisamos si ya hay sesión guardada en localStorage.
  // Si el token es el demo antiguo, lo descartamos para forzar login real con el backend.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const datos = localStorage.getItem('usuario');

    if (token && token !== 'demo-token-frontend' && datos) {
      setUsuario(JSON.parse(datos));
    } else if (!token || token === 'demo-token-frontend') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }

    setCargando(false);
  }, []);

  // Guarda el token y datos del usuario tras un login exitoso
  function iniciarSesion(token, datosUsuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }

  // Limpia todo al cerrar sesión
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto de forma limpia
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
