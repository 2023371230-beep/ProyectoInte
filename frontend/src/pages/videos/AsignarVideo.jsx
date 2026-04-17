import { useEffect, useState } from 'react';
import { useNavigate }        from 'react-router-dom';
import Header                 from '../../components/Header';
import { obtenerClientes }    from '../../services/clientesService';
import { obtenerVideos, asignarVideo } from '../../services/videosService';

export default function AsignarVideo() {
  const navigate = useNavigate();

  const [clientes,  setClientes]  = useState([]);
  const [videos,    setVideos]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState('');
  const [exito,     setExito]     = useState('');

  const [form, setForm] = useState({ id_cliente: '', id_video: '' });

  useEffect(() => {
    async function cargar() {
      try {
        const [c, v] = await Promise.all([obtenerClientes(), obtenerVideos()]);
        setClientes(c);
        setVideos(v);
      } catch {
        setError('No se pudieron cargar los datos. Verifica tu conexión.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.id_cliente || !form.id_video) {
      setError('Cliente y video son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await asignarVideo({
        id_cliente: Number(form.id_cliente),
        id_video:   Number(form.id_video),
      });
      const clienteNombre = clientes.find(c => c.id_cliente === Number(form.id_cliente))?.nombre;
      const videoTitulo   = videos.find(v => v.id_video === Number(form.id_video))?.titulo;
      setExito(`✓ "${videoTitulo}" asignado a ${clienteNombre} correctamente.`);
      setForm({ id_cliente: form.id_cliente, id_video: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al asignar el video.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <>
        <Header titulo="Asignar Video" subtitulo="Cargando datos..." />
        <div className="page-body" style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div className="spinner" aria-label="Cargando" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        titulo="Asignar Video"
        subtitulo="Asigna un video de rehabilitación a un cliente específico"
      />

      <div className="page-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </div>
        )}
        {exito && (
          <div className="alert alert-success" role="status">
            {exito}
          </div>
        )}

        <div className="form-card">
          <form onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="id_cliente">Cliente *</label>
              <select
                id="id_cliente"
                name="id_cliente"
                className="form-select"
                value={form.id_cliente}
                onChange={handleChange}
                required
              >
                <option value="">— Selecciona un cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} — {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_video">Video *</label>
              <select
                id="id_video"
                name="id_video"
                className="form-select"
                value={form.id_video}
                onChange={handleChange}
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

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/admin/videos')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                aria-busy={guardando}
              >
                {guardando ? 'Asignando...' : 'Asignar Video'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
