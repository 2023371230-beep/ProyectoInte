import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Modal  from '../../components/Modal';
import { obtenerClientes } from '../../services/clientesService';
import {
  obtenerMedicamentos,
  obtenerMedicamentoPorId,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento,
} from '../../services/medicamentosService';

const FORM_VACIO = { nombre: '', descripcion: '' };

export default function MedicamentosLista() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [error,        setError]        = useState('');
  const [mensaje,      setMensaje]      = useState('');

  // Modal de asignación
  const [asignarAbierto,  setAsignarAbierto]  = useState(false);
  const [clientesAsignar,  setClientesAsignar] = useState([]);
  const [cargandoAsignar,  setCargandoAsignar] = useState(false);
  const [guardandoAsignar,  setGuardandoAsignar] = useState(false);
  const [errorAsignar,     setErrorAsignar]    = useState('');
  const [exitoAsignar,     setExitoAsignar]    = useState('');
  const [formAsignar,      setFormAsignar]     = useState({
    id_cliente: '',
    id_medicamento: '',
    dosis: '',
    frecuencia: '',
    hora_inicio: '',
  });

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId,   setEditandoId]   = useState(null);
  const [form,         setForm]         = useState(FORM_VACIO);
  const [formError,    setFormError]    = useState('');
  const [guardando,    setGuardando]    = useState(false);

  const cargarMedicamentos = useCallback(async () => {
    try {
      setMedicamentos(await obtenerMedicamentos());
    } catch {
      setError('No se pudieron cargar los medicamentos.');
    }
  }, []);

  useEffect(() => { cargarMedicamentos(); }, [cargarMedicamentos]);

  useEffect(() => {
    if (!asignarAbierto) return;

    let activo = true;

    async function cargarDatosAsignacion() {
      setCargandoAsignar(true);
      setErrorAsignar('');
      try {
        const clientes = await obtenerClientes();
        if (!activo) return;
        setClientesAsignar(clientes);
      } catch {
        if (activo) setErrorAsignar('No se pudieron cargar los clientes.');
      } finally {
        if (activo) setCargandoAsignar(false);
      }
    }

    cargarDatosAsignacion();
    return () => { activo = false; };
  }, [asignarAbierto]);

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      abrirNuevo();
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Abrir modal ────────────────────────────────────────────────────────────
  function abrirNuevo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError('');
    setModalAbierto(true);
  }

  async function abrirEditar(id) {
    setFormError('');
    setEditandoId(id);
    setForm(FORM_VACIO);
    setModalAbierto(true);
    try {
      const datos = await obtenerMedicamentoPorId(id);
      setForm({ nombre: datos.nombre, descripcion: datos.descripcion || '' });
    } catch {
      setFormError('No se pudo cargar el medicamento.');
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError('');
  }

  function abrirAsignar() {
    setAsignarAbierto(true);
    setErrorAsignar('');
    setExitoAsignar('');
    setFormAsignar({
      id_cliente: '',
      id_medicamento: '',
      dosis: '',
      frecuencia: '',
      hora_inicio: '',
    });
  }

  function cerrarAsignar() {
    setAsignarAbierto(false);
    setCargandoAsignar(false);
    setGuardandoAsignar(false);
    setErrorAsignar('');
    setExitoAsignar('');
    setFormAsignar({
      id_cliente: '',
      id_medicamento: '',
      dosis: '',
      frecuencia: '',
      hora_inicio: '',
    });
  }

  function handleAsignarChange(e) {
    setFormAsignar({ ...formAsignar, [e.target.name]: e.target.value });
    setErrorAsignar('');
    setExitoAsignar('');
  }

  async function handleAsignarSubmit(e) {
    e.preventDefault();

    if (!formAsignar.id_cliente || !formAsignar.id_medicamento || !formAsignar.dosis || !formAsignar.frecuencia) {
      setErrorAsignar('Cliente, medicamento, dosis y frecuencia son obligatorios.');
      return;
    }

    setGuardandoAsignar(true);
    try {
      const { asignarMedicamento } = await import('../../services/medicamentosService');
      await asignarMedicamento({
        id_cliente: Number(formAsignar.id_cliente),
        id_medicamento: Number(formAsignar.id_medicamento),
        dosis: formAsignar.dosis.trim(),
        frecuencia: formAsignar.frecuencia.trim(),
        hora_inicio: formAsignar.hora_inicio || null,
      });

      const clienteNombre = clientesAsignar.find((c) => c.id_cliente === Number(formAsignar.id_cliente))?.nombre;
      const medNombre = medicamentos.find((m) => m.id_medicamento === Number(formAsignar.id_medicamento))?.nombre;
      setExitoAsignar(`"${medNombre}" asignado a ${clienteNombre} correctamente.`);
      setFormAsignar({
        id_cliente: formAsignar.id_cliente,
        id_medicamento: '',
        dosis: '',
        frecuencia: '',
        hora_inicio: '',
      });
    } catch (err) {
      setErrorAsignar(err.response?.data?.error || err.message || 'Error al asignar el medicamento.');
    } finally {
      setGuardandoAsignar(false);
    }
  }

  // ── Guardar ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setFormError('El nombre del medicamento es obligatorio.');
      return;
    }
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarMedicamento(editandoId, form);
        setMensaje('Medicamento actualizado correctamente.');
      } else {
        await crearMedicamento(form);
        setMensaje('Medicamento creado correctamente.');
      }
      cerrarModal();
      cargarMedicamentos();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleEliminar(id, nombre) {
    if (!window.confirm(`¿Eliminar el medicamento "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    try {
      await eliminarMedicamento(id);
      setMensaje(`Medicamento "${nombre}" eliminado.`);
      cargarMedicamentos();
    } catch {
      setError('No se pudo eliminar el medicamento.');
    }
  }

  const filtrados = medicamentos.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Header titulo="Medicamentos" subtitulo="Catálogo de medicamentos del sistema" />

      <div className="page-body">
        {error   && <div className="alert alert-error"   role="alert"><span aria-hidden="true">⚠</span> {error}</div>}
        {mensaje && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span> {mensaje}</div>}

        <div className="page-header">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-muted)" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="search"
              placeholder="Buscar medicamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar medicamentos"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={abrirAsignar}>
              Asignar a cliente
            </button>
            <button className="btn btn-primary" onClick={abrirNuevo}>
              + Nuevo medicamento
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table" aria-label="Lista de medicamentos">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: '32px', color: 'var(--color-text-muted)' }}>
                    {busqueda ? 'No se encontraron medicamentos.' : 'No hay medicamentos registrados.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((med) => (
                  <tr key={med.id_medicamento}>
                    <td>#{med.id_medicamento}</td>
                    <td><strong>{med.nombre}</strong></td>
                    <td className="text-muted">
                      {med.descripcion
                        ? med.descripcion.substring(0, 80) + (med.descripcion.length > 80 ? '…' : '')
                        : '—'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => abrirEditar(med.id_medicamento)}
                          aria-label={`Editar ${med.nombre}`}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminar(med.id_medicamento, med.nombre)}
                          aria-label={`Eliminar ${med.nombre}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-muted mt-16" style={{ fontSize: 'var(--font-size-sm)' }}>
          Mostrando {filtrados.length} de {medicamentos.length} medicamentos
        </p>
      </div>

      {/* ── Modal de crear / editar ──────────────────────────────────────── */}
      {modalAbierto && (
        <Modal
          titulo={editandoId ? 'Editar medicamento' : 'Nuevo medicamento'}
          onCerrar={cerrarModal}
          ancho={520}
        >
          {formError && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre del medicamento *</label>
              <input
                id="nombre" name="nombre" type="text" className="form-input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required aria-required="true"
                placeholder="Ej. Ibuprofeno 400mg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">Descripción</label>
              <textarea
                id="descripcion" name="descripcion" className="form-textarea"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Información del medicamento, indicaciones, etc."
                rows={4}
              />
            </div>

            <div className="flex gap-16 mt-16">
              <button type="submit" className="btn btn-primary" disabled={guardando} aria-busy={guardando}>
                {guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear medicamento')}
              </button>
              <button type="button" className="btn btn-outline" onClick={cerrarModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {asignarAbierto && (
        <Modal titulo="Asignar medicamento" onCerrar={cerrarAsignar} ancho={620}>
          {errorAsignar && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {errorAsignar}
            </div>
          )}
          {exitoAsignar && (
            <div className="alert alert-success" role="status">
              {exitoAsignar}
            </div>
          )}

          {cargandoAsignar ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div className="spinner" aria-label="Cargando" />
            </div>
          ) : (
            <form onSubmit={handleAsignarSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="id_cliente_asignar" className="form-label">Cliente *</label>
                <select
                  id="id_cliente_asignar"
                  name="id_cliente"
                  className="form-select"
                  value={formAsignar.id_cliente}
                  onChange={handleAsignarChange}
                  required
                >
                  <option value="">— Selecciona un cliente —</option>
                  {clientesAsignar.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="id_medicamento_asignar" className="form-label">Medicamento *</label>
                <select
                  id="id_medicamento_asignar"
                  name="id_medicamento"
                  className="form-select"
                  value={formAsignar.id_medicamento}
                  onChange={handleAsignarChange}
                  required
                >
                  <option value="">— Selecciona un medicamento —</option>
                  {medicamentos.map((m) => (
                    <option key={m.id_medicamento} value={m.id_medicamento}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dosis_asignar" className="form-label">Dosis *</label>
                <input
                  id="dosis_asignar"
                  name="dosis"
                  type="text"
                  className="form-input"
                  placeholder="Ej: 400mg, 1 tableta, 5ml"
                  value={formAsignar.dosis}
                  onChange={handleAsignarChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frecuencia_asignar" className="form-label">Frecuencia *</label>
                <input
                  id="frecuencia_asignar"
                  name="frecuencia"
                  type="text"
                  className="form-input"
                  placeholder="Ej: Cada 8 horas, 2 veces al día"
                  value={formAsignar.frecuencia}
                  onChange={handleAsignarChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hora_inicio_asignar" className="form-label">
                  Hora de inicio <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>(opcional)</span>
                </label>
                <input
                  id="hora_inicio_asignar"
                  name="hora_inicio"
                  type="time"
                  className="form-input"
                  value={formAsignar.hora_inicio}
                  onChange={handleAsignarChange}
                />
              </div>

              <div className="flex gap-16 mt-16">
                <button type="button" className="btn btn-outline" onClick={cerrarAsignar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardandoAsignar} aria-busy={guardandoAsignar}>
                  {guardandoAsignar ? 'Asignando...' : 'Asignar medicamento'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
