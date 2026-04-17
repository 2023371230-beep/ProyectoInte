import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { obtenerSuscripciones, actualizarSuscripcion } from '../../services/suscripcionesService';

const PLANES  = ['estandar', 'premium'];
const ESTADOS = ['activa', 'vencida', 'cancelada'];

// Colores de badge según estado
function BadgeEstado({ estado }) {
  const clases = {
    activa:    'badge badge-success',
    vencida:   'badge badge-warning',
    cancelada: 'badge badge-error',
  };
  return <span className={clases[estado] || 'badge badge-neutral'}>{estado}</span>;
}

function BadgePlan({ plan }) {
  return (
    <span className={plan === 'premium' ? 'badge badge-success' : 'badge badge-neutral'}>
      {plan === 'premium' ? '★ Premium' : 'Estándar'}
    </span>
  );
}

export default function SuscripcionesLista() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [busqueda, setBusqueda]           = useState('');
  const [filtroEstado, setFiltroEstado]   = useState('Todos');
  const [error, setError]                 = useState('');
  const [mensaje, setMensaje]             = useState('');
  // id de la fila que está siendo editada en línea
  const [editandoId, setEditandoId]       = useState(null);
  const [editForm, setEditForm]           = useState({ plan: '', estado: '' });

  async function cargar() {
    try {
      const datos = await obtenerSuscripciones();
      setSuscripciones(datos);
    } catch {
      setError('No se pudieron cargar las suscripciones.');
    }
  }

  useEffect(() => {
    let activo = true;

    obtenerSuscripciones()
      .then((datos) => {
        if (activo) setSuscripciones(datos);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las suscripciones.');
      });

    return () => {
      activo = false;
    };
  }, []);

  function iniciarEdicion(s) {
    setEditandoId(s.id_suscripcion);
    setEditForm({ plan: s.plan, estado: s.estado });
    setMensaje('');
    setError('');
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEditForm({ plan: '', estado: '' });
  }

  async function guardarEdicion(id) {
    try {
      await actualizarSuscripcion(id, editForm);
      setMensaje('Suscripción actualizada correctamente.');
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la suscripción.');
    }
  }

  const filtradas = suscripciones.filter((s) => {
    const texto = `${s.nombre} ${s.email}`.toLowerCase();
    const coincideTexto  = texto.includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || s.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <>
      <Header
        titulo="Suscripciones"
        subtitulo="Gestión de planes y estados de suscripción"
      />

      <div className="page-body">
        {error   && <div className="alert alert-error"   role="alert"><span aria-hidden="true">⚠</span> {error}</div>}
        {mensaje && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span> {mensaje}</div>}

        {/* Barra de filtros */}
        <div className="page-header">
          <div className="flex gap-16">
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-muted)" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar suscripciones"
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minHeight: 44 }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Contador de activas visible sin hover */}
          <div style={{ display: 'flex', gap: 12 }}>
            {['activa', 'premium'].map((tipo) => {
              const count = tipo === 'premium'
                ? suscripciones.filter(s => s.plan === 'premium').length
                : suscripciones.filter(s => s.estado === 'activa').length;
              return (
                <div key={tipo} style={{
                  background: '#E8F5E9', borderRadius: 8, padding: '6px 16px',
                  fontSize: 13, color: '#2E7D32', fontWeight: 600
                }}>
                  {count} {tipo === 'premium' ? 'Premium' : 'Activas'}
                </div>
              );
            })}
          </div>
        </div>

        <div className="table-container">
          <table className="table" aria-label="Lista de suscripciones">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Usuario</th>
                <th scope="col">Email</th>
                <th scope="col">Plan</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha inicio</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '32px', color: 'var(--color-text-muted)' }}>
                    No se encontraron suscripciones.
                  </td>
                </tr>
              ) : (
                filtradas.map((s) => (
                  <tr key={s.id_suscripcion}>
                    <td>#{s.id_suscripcion}</td>
                    <td><strong>{s.nombre}</strong></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{s.email}</td>

                    {/* Plan — editable en línea */}
                    <td>
                      {editandoId === s.id_suscripcion ? (
                        <select
                          className="form-select btn-sm"
                          style={{ minHeight: 36, width: 'auto' }}
                          value={editForm.plan}
                          onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                          aria-label="Cambiar plan"
                        >
                          {PLANES.map((p) => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <BadgePlan plan={s.plan} />
                      )}
                    </td>

                    {/* Estado — editable en línea */}
                    <td>
                      {editandoId === s.id_suscripcion ? (
                        <select
                          className="form-select btn-sm"
                          style={{ minHeight: 36, width: 'auto' }}
                          value={editForm.estado}
                          onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                          aria-label="Cambiar estado"
                        >
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <BadgeEstado estado={s.estado} />
                      )}
                    </td>

                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {new Date(s.fecha_inicio).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>

                    <td>
                      {editandoId === s.id_suscripcion ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => guardarEdicion(s.id_suscripcion)}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={cancelarEdicion}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => iniciarEdicion(s)}
                          aria-label={`Editar suscripción de ${s.nombre}`}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-muted mt-16" style={{ fontSize: 'var(--font-size-sm)' }}>
          Mostrando {filtradas.length} de {suscripciones.length} suscripciones
        </p>
      </div>
    </>
  );
}
