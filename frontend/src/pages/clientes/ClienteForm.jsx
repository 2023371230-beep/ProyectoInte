import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import { crearCliente, obtenerClientePorId, actualizarCliente } from '../../services/clientesService';

// Formulario compartido para crear y editar clientes
export default function ClienteForm() {
  const { id }    = useParams();   // si existe id, estamos editando
  const esEdicion = Boolean(id);
  const navigate  = useNavigate();

  const [form, setForm]       = useState({
    nombre: '', email: '', password: '', diagnostico: '', telefono: '',
  });
  const [error, setError]     = useState('');
  const [guardando, setGuardando] = useState(false);

  // Si estamos editando, cargamos los datos del cliente
  useEffect(() => {
    if (esEdicion) {
      obtenerClientePorId(id)
        .then((datos) => setForm({
          nombre:      datos.nombre,
          email:       datos.email,
          password:    '',           // no pre-llenamos la contraseña
          diagnostico: datos.diagnostico || '',
          telefono:    datos.telefono    || '',
        }))
        .catch(() => setError('No se pudo cargar el cliente.'));
    }
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nombre || !form.email) {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    if (!esEdicion && !form.password) {
      setError('La contraseña es obligatoria para nuevos clientes.');
      return;
    }

    setGuardando(true);

    try {
      if (esEdicion) {
        await actualizarCliente(id, form);
      } else {
        await crearCliente(form);
      }
      navigate('/admin/clientes');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Header
        titulo={esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
        subtitulo={esEdicion ? `Modificando datos del cliente #${id}` : 'Registrar un nuevo cliente en el sistema'}
      />

      <div className="page-body">
        <div className="card" style={{ maxWidth: 560 }}>
          {error && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre completo *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-input"
                value={form.nombre}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="Ej. Juan García Pérez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Correo electrónico *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {esEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                required={!esEdicion}
                aria-required={!esEdicion}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="form-input"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. 442-123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="diagnostico" className="form-label">Diagnóstico</label>
              <textarea
                id="diagnostico"
                name="diagnostico"
                className="form-textarea"
                value={form.diagnostico}
                onChange={handleChange}
                placeholder="Descripción del diagnóstico del paciente..."
                rows={4}
              />
            </div>

            <div className="flex gap-16 mt-16">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                aria-busy={guardando}
              >
                {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear cliente')}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/admin/clientes')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
