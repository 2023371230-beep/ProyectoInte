import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Modal  from '../../components/Modal';
import { obtenerClientes } from '../../services/clientesService';
import {
  obtenerVideos,
  obtenerVideoPorId,
  crearVideo,
  actualizarVideo,
  eliminarVideo,
} from '../../services/videosService';

const CATEGORIAS_FILTRO = ['Todos', 'Rehabilitación', 'Ejercicios', 'Fisioterapia', 'Hidroterapia', 'Otro'];
const CATEGORIAS_FORM   = ['Rehabilitación', 'Ejercicios', 'Fisioterapia', 'Hidroterapia', 'Otro'];
const FORM_VACIO        = { titulo: '', youtube_id: '', categoria: 'Rehabilitación' };

export default function VideosLista() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [videos,    setVideos]    = useState([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [error,     setError]     = useState('');
  const [mensaje,   setMensaje]   = useState('');

  // Modal de asignación
  const [asignarAbierto,  setAsignarAbierto]  = useState(false);
  const [clientesAsignar,  setClientesAsignar] = useState([]);
  const [cargandoAsignar,  setCargandoAsignar] = useState(false);
  const [guardandoAsignar,  setGuardandoAsignar] = useState(false);
  const [errorAsignar,     setErrorAsignar]    = useState('');
  const [exitoAsignar,     setExitoAsignar]    = useState('');
  const [formAsignar,      setFormAsignar]     = useState({
    id_cliente: '',
    id_video: '',
  });

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId,   setEditandoId]   = useState(null);
  const [form,         setForm]         = useState(FORM_VACIO);
  const [formError,    setFormError]    = useState('');
  const [guardando,    setGuardando]    = useState(false);

  const cargarVideos = useCallback(async () => {
    try {
      setVideos(await obtenerVideos());
    } catch {
      setError('No se pudieron cargar los videos.');
    }
  }, []);

  useEffect(() => { cargarVideos(); }, [cargarVideos]);

  useEffect(() => {
    if (!asignarAbierto) return;

    let activo = true;

    async function cargarClientesAsignacion() {
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

    cargarClientesAsignacion();
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
      const datos = await obtenerVideoPorId(id);
      setForm({ titulo: datos.titulo, youtube_id: datos.youtube_id, categoria: datos.categoria });
    } catch {
      setFormError('No se pudo cargar el video.');
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
    setFormAsignar({ id_cliente: '', id_video: '' });
  }

  function cerrarAsignar() {
    setAsignarAbierto(false);
    setCargandoAsignar(false);
    setGuardandoAsignar(false);
    setErrorAsignar('');
    setExitoAsignar('');
    setFormAsignar({ id_cliente: '', id_video: '' });
  }

  function handleAsignarChange(e) {
    setFormAsignar({ ...formAsignar, [e.target.name]: e.target.value });
    setErrorAsignar('');
    setExitoAsignar('');
  }

  async function handleAsignarSubmit(e) {
    e.preventDefault();
    if (!formAsignar.id_cliente || !formAsignar.id_video) {
      setErrorAsignar('Cliente y video son obligatorios.');
      return;
    }

    setGuardandoAsignar(true);
    try {
      const { asignarVideo } = await import('../../services/videosService');
      await asignarVideo({
        id_cliente: Number(formAsignar.id_cliente),
        id_video: Number(formAsignar.id_video),
      });
      const clienteNombre = clientesAsignar.find((c) => c.id_cliente === Number(formAsignar.id_cliente))?.nombre;
      const videoTitulo = videos.find((v) => v.id_video === Number(formAsignar.id_video))?.titulo;
      setExitoAsignar(`"${videoTitulo}" asignado a ${clienteNombre} correctamente.`);
      setFormAsignar({ id_cliente: formAsignar.id_cliente, id_video: '' });
    } catch (err) {
      setErrorAsignar(err.response?.data?.error || err.message || 'Error al asignar el video.');
    } finally {
      setGuardandoAsignar(false);
    }
  }

  // ── Guardar ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.youtube_id.trim()) {
      setFormError('El título y el ID de YouTube son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarVideo(editandoId, form);
        setMensaje('Video actualizado correctamente.');
      } else {
        await crearVideo(form);
        setMensaje('Video creado correctamente.');
      }
      cerrarModal();
      cargarVideos();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleEliminar(id, titulo) {
    if (!window.confirm(`¿Eliminar el video "${titulo}"?`)) return;
    try {
      await eliminarVideo(id);
      setMensaje(`Video "${titulo}" eliminado.`);
      cargarVideos();
    } catch {
      setError('No se pudo eliminar el video.');
    }
  }

  const filtrados = videos.filter((v) => {
    const coincideBusqueda  = v.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoria === 'Todos' || v.categoria === categoria;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <>
      <Header titulo="Videos" subtitulo="Biblioteca de videos de rehabilitación" />

      <div className="page-body">
        {error   && <div className="alert alert-error"   role="alert"><span aria-hidden="true">⚠</span> {error}</div>}
        {mensaje && <div className="alert alert-success" role="status"><span aria-hidden="true">✓</span> {mensaje}</div>}

        <div className="page-header">
          <div className="flex gap-16">
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-text-muted)" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="search"
                placeholder="Buscar video..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar videos"
              />
            </div>
            <select
              className="form-select"
              style={{ width: 'auto', minHeight: 44 }}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              {CATEGORIAS_FILTRO.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={abrirAsignar}>
              Asignar a cliente
            </button>
            <button className="btn btn-primary" onClick={abrirNuevo}>
              + Nuevo video
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table" aria-label="Lista de videos">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Título</th>
                <th scope="col">Categoría</th>
                <th scope="col">YouTube ID</th>
                <th scope="col">Vista previa</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '32px', color: 'var(--color-text-muted)' }}>
                    {busqueda || categoria !== 'Todos' ? 'No se encontraron videos.' : 'No hay videos registrados.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((video) => (
                  <tr key={video.id_video}>
                    <td>#{video.id_video}</td>
                    <td><strong>{video.titulo}</strong></td>
                    <td><span className="badge badge-neutral">{video.categoria}</span></td>
                    <td>
                      <code style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {video.youtube_id}
                      </code>
                    </td>
                    <td>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        aria-label={`Ver video ${video.titulo} en YouTube`}
                      >
                        Ver ↗
                      </a>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => abrirEditar(video.id_video)}
                          aria-label={`Editar video ${video.titulo}`}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminar(video.id_video, video.titulo)}
                          aria-label={`Eliminar video ${video.titulo}`}
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
          Mostrando {filtrados.length} de {videos.length} videos
        </p>
      </div>

      {/* ── Modal de crear / editar ──────────────────────────────────────── */}
      {modalAbierto && (
        <Modal
          titulo={editandoId ? 'Editar video' : 'Nuevo video'}
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
              <label htmlFor="titulo" className="form-label">Título del video *</label>
              <input
                id="titulo" name="titulo" type="text" className="form-input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required aria-required="true"
                placeholder="Ej. Ejercicios de movilidad de brazo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="youtube_id" className="form-label">ID de YouTube *</label>
              <input
                id="youtube_id" name="youtube_id" type="text" className="form-input"
                value={form.youtube_id}
                onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                required aria-required="true"
                placeholder="Ej. dQw4w9WgXcQ"
              />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                El ID está en la URL: youtube.com/watch?v=<strong>ID_AQUÍ</strong>
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="categoria" className="form-label">Categoría *</label>
              <select
                id="categoria" name="categoria" className="form-select"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                required aria-required="true"
              >
                {CATEGORIAS_FORM.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Vista previa del video si hay ID */}
            {form.youtube_id && (
              <div className="form-group">
                <span className="form-label">Vista previa</span>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${form.youtube_id}`}
                    title="Vista previa del video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="flex gap-16 mt-16">
              <button type="submit" className="btn btn-primary" disabled={guardando} aria-busy={guardando}>
                {guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear video')}
              </button>
              <button type="button" className="btn btn-outline" onClick={cerrarModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {asignarAbierto && (
        <Modal titulo="Asignar video" onCerrar={cerrarAsignar} ancho={620}>
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
                <label htmlFor="id_cliente_video" className="form-label">Cliente *</label>
                <select
                  id="id_cliente_video"
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
                <label htmlFor="id_video_asignar" className="form-label">Video *</label>
                <select
                  id="id_video_asignar"
                  name="id_video"
                  className="form-select"
                  value={formAsignar.id_video}
                  onChange={handleAsignarChange}
                  required
                >
                  <option value="">— Selecciona un video —</option>
                  {videos.map((v) => (
                    <option key={v.id_video} value={v.id_video}>
                      {v.titulo} [{v.categoria}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-16 mt-16">
                <button type="button" className="btn btn-outline" onClick={cerrarAsignar}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardandoAsignar} aria-busy={guardandoAsignar}>
                  {guardandoAsignar ? 'Asignando...' : 'Asignar video'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
