import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Modal  from '../../components/Modal';
import {
  obtenerClientes,
  obtenerClientePorId,
  obtenerDetalleCliente,
  crearCliente,
  actualizarCliente,
  darDeBajaCliente,
} from '../../services/clientesService';

const FORM_VACIO = { nombre: '', email: '', password: '', diagnostico: '', telefono: '' };

export default function ClientesLista() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error,    setError]    = useState('');
  const [mensaje,  setMensaje]  = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId,   setEditandoId]   = useState(null);
  const [form,         setForm]         = useState(FORM_VACIO);
  const [formError,    setFormError]    = useState('');
  const [guardando,    setGuardando]    = useState(false);

  // Modal de detalle de asignaciones
  const [detalleAbierto,  setDetalleAbierto]  = useState(false);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [detalleError,    setDetalleError]    = useState('');
  const [detalleData,     setDetalleData]     = useState(null);

  const cargarClientes = useCallback(async () => {
    try {
      setClientes(await obtenerClientes());
    } catch {
      setError('No se pudieron cargar los clientes.');
    }
  }, []);

  useEffect(() => { cargarClientes(); }, [cargarClientes]);

  // Abre el modal si el Dashboard (u otro componente) navega con ?nuevo=1
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      abrirNuevo();
      setSearchParams({}, { replace: true }); // limpia el parámetro de la URL
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
      const datos = await obtenerClientePorId(id);
      setForm({
        nombre:      datos.nombre,
        email:       datos.email,
        password:    '',
        diagnostico: datos.diagnostico || '',
        telefono:    datos.telefono    || '',
      });
    } catch {
      setFormError('No se pudo cargar el cliente.');
    }
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError('');
  }

  async function abrirDetalle(id) {
    setDetalleAbierto(true);
    setDetalleCargando(true);
    setDetalleError('');
    setDetalleData(null);
    try {
      const data = await obtenerDetalleCliente(id);
      setDetalleData(data);
    } catch {
      setDetalleError('No se pudo cargar el detalle del cliente.');
    } finally {
      setDetalleCargando(false);
    }
  }

  function cerrarDetalle() {
    setDetalleAbierto(false);
    setDetalleCargando(false);
    setDetalleError('');
    setDetalleData(null);
  }

  // ── Guardar ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email) {
      setFormError('Nombre y correo son obligatorios.');
      return;
    }
    if (!editandoId && !form.password) {
      setFormError('La contraseña es obligatoria para nuevos clientes.');
      return;
    }
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarCliente(editandoId, form);
        setMensaje('Cliente actualizado correctamente.');
      } else {
        await crearCliente(form);
        setMensaje('Cliente creado correctamente.');
      }
      cerrarModal();
      cargarClientes();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  // ── Dar de baja ────────────────────────────────────────────────────────────
  async function handleDarDeBaja(id, nombre) {
    if (!window.confirm(`¿Dar de baja a "${nombre}"?\nEl cliente quedará inactivo y no podrá iniciar sesión.`)) return;
    try {
      await darDeBajaCliente(id);
      setMensaje(`Cliente "${nombre}" dado de baja correctamente.`);
      cargarClientes();
    } catch {
      setError('No se pudo dar de baja al cliente.');
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Header titulo="Clientes" subtitulo="Gestión de cuentas de clientes registrados" />

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
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar clientes"
            />
          </div>
          <button className="btn btn-primary" onClick={abrirNuevo}>
            + Nuevo cliente
          </button>
        </div>

        <div className="table-container">
          <table className="table" aria-label="Lista de clientes">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Diagnóstico</th>
                <th scope="col">Registro</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ padding: '32px', color: 'var(--color-text-muted)' }}>
                    {busqueda ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados.'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>#{c.id_cliente}</td>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.telefono || '—'}</td>
                    <td className="diagnostico-cell">
                      {c.diagnostico
                        ? <span title={c.diagnostico}>{c.diagnostico.substring(0, 40)}{c.diagnostico.length > 40 ? '…' : ''}</span>
                        : '—'}
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString('es-MX')}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => abrirDetalle(c.id_cliente)}
                          aria-label={`Ver detalle de ${c.nombre}`}
                        >
                          Ver detalle
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => abrirEditar(c.id_cliente)}
                          aria-label={`Editar cliente ${c.nombre}`}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDarDeBaja(c.id_cliente, c.nombre)}
                          aria-label={`Dar de baja a ${c.nombre}`}
                        >
                          Dar de baja
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
          Mostrando {clientesFiltrados.length} de {clientes.length} clientes
        </p>
      </div>

      {/* ── Modal de crear / editar ──────────────────────────────────────── */}
      {modalAbierto && (
        <Modal
          titulo={editandoId ? 'Editar cliente' : 'Nuevo cliente'}
          onCerrar={cerrarModal}
          ancho={560}
        >
          {formError && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre completo *</label>
              <input
                id="nombre" name="nombre" type="text" className="form-input"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required aria-required="true"
                placeholder="Ej. Juan García Pérez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Correo electrónico *</label>
              <input
                id="email" name="email" type="email" className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required aria-required="true"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {editandoId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input
                id="password" name="password" type="password" className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editandoId}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input
                id="telefono" name="telefono" type="tel" className="form-input"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Ej. 442-123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="diagnostico" className="form-label">Diagnóstico</label>
              <textarea
                id="diagnostico" name="diagnostico" className="form-textarea"
                value={form.diagnostico}
                onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                placeholder="Descripción del diagnóstico del paciente..."
                rows={3}
              />
            </div>

            <div className="flex gap-16 mt-16">
              <button type="submit" className="btn btn-primary" disabled={guardando} aria-busy={guardando}>
                {guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear cliente')}
              </button>
              <button type="button" className="btn btn-outline" onClick={cerrarModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detalleAbierto && (
        <Modal titulo="Detalle de asignaciones" onCerrar={cerrarDetalle} ancho={680}>
          {detalleCargando && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <div className="spinner" aria-label="Cargando detalle" />
            </div>
          )}

          {detalleError && !detalleCargando && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {detalleError}
            </div>
          )}

          {detalleData && !detalleCargando && (
            <div className="flex" style={{ flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '4px' }}>
                  {detalleData.cliente?.nombre || 'Cliente'}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {detalleData.cliente?.email || 'Sin correo'}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-dark)', fontSize: '1rem' }}>Medicamentos</h3>
                {detalleData.medicamentos?.length ? (
                  <div className="table-container" style={{ marginBottom: '0' }}>
                    <table className="table" aria-label="Medicamentos asignados">
                      <thead>
                        <tr>
                          <th scope="col">Medicamento</th>
                          <th scope="col">Dosis</th>
                          <th scope="col">Frecuencia</th>
                          <th scope="col">Hora inicio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleData.medicamentos.map((med) => (
                          <tr key={`${med.id_medicamento}-${med.dosis}-${med.frecuencia}`}>
                            <td><strong>{med.nombre}</strong></td>
                            <td>{med.dosis}</td>
                            <td>{med.frecuencia}</td>
                            <td>{med.hora_inicio || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted" style={{ margin: 0 }}>Sin medicamentos asignados.</p>
                )}
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-dark)', fontSize: '1rem' }}>Videos</h3>
                {detalleData.videos?.length ? (
                  <div className="table-container" style={{ marginBottom: '0' }}>
                    <table className="table" aria-label="Videos asignados">
                      <thead>
                        <tr>
                          <th scope="col">Título</th>
                          <th scope="col">Categoría</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleData.videos.map((video) => (
                          <tr key={video.id_video}>
                            <td><strong>{video.titulo}</strong></td>
                            <td>{video.categoria || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted" style={{ margin: 0 }}>Sin videos asignados.</p>
                )}
              </div>

              <div className="flex gap-16" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={cerrarDetalle}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
