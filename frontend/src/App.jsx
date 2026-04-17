import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import AdminLayout      from './components/AdminLayout';

// Páginas
import Home               from './pages/Home';
import Login              from './pages/Login';
import Dashboard          from './pages/Dashboard';
import ClientesLista      from './pages/clientes/ClientesLista';
import MedicamentosLista  from './pages/medicamentos/MedicamentosLista';
import AsignarMedicamento from './pages/medicamentos/AsignarMedicamento';
import VideosLista        from './pages/videos/VideosLista';
import AsignarVideo       from './pages/videos/AsignarVideo';
import SuscripcionesLista from './pages/suscripciones/SuscripcionesLista';

// Estilos globales
import './styles/global.css';
import './styles/actions.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas — requieren sesión activa */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Clientes — crear/editar en modal inline */}
            <Route path="clientes" element={<ClientesLista />} />

            {/* Medicamentos — crear/editar en modal inline; asignar sigue en página propia */}
            <Route path="medicamentos"         element={<MedicamentosLista />} />
            <Route path="medicamentos/asignar" element={<AsignarMedicamento />} />

            {/* Videos — crear/editar en modal inline; asignar en página propia */}
            <Route path="videos"         element={<VideosLista />} />
            <Route path="videos/asignar" element={<AsignarVideo />} />

            {/* Suscripciones */}
            <Route path="suscripciones" element={<SuscripcionesLista />} />
          </Route>

          {/* Cualquier ruta desconocida va al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
