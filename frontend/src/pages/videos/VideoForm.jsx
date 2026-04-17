import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import { crearVideo, obtenerVideoPorId, actualizarVideo } from '../../services/videosService';

const CATEGORIAS = ['Rehabilitación', 'Ejercicios', 'Fisioterapia', 'Hidroterapia', 'Otro'];

export default function VideoForm() {
  const { id }    = useParams();
  const esEdicion = Boolean(id);
  const navigate  = useNavigate();

  const [form, setForm]           = useState({ titulo: '', youtube_id: '', categoria: 'Rehabilitación' });
  const [error, setError]         = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion) {
      obtenerVideoPorId(id)
        .then((datos) => setForm({
          titulo:      datos.titulo,
          youtube_id:  datos.youtube_id,
          categoria:   datos.categoria,
        }))
        .catch(() => setError('No se pudo cargar el video.'));
    }
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.titulo.trim() || !form.youtube_id.trim()) {
      setError('El título y el ID de YouTube son obligatorios.');
      return;
    }

    setGuardando(true);

    try {
      if (esEdicion) {
        await actualizarVideo(id, form);
      } else {
        await crearVideo(form);
      }
      navigate('/admin/videos');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Header
        titulo={esEdicion ? 'Editar Video' : 'Nuevo Video'}
        subtitulo={esEdicion ? `Modificando video #${id}` : 'Agregar video de rehabilitación'}
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
              <label htmlFor="titulo" className="form-label">Título del video *</label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                className="form-input"
                value={form.titulo}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="Ej. Ejercicios de movilidad de brazo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="youtube_id" className="form-label">
                ID de YouTube *
              </label>
              <input
                id="youtube_id"
                name="youtube_id"
                type="text"
                className="form-input"
                value={form.youtube_id}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="Ej. dQw4w9WgXcQ"
              />
              <span className="form-error" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                El ID está en la URL de YouTube: youtube.com/watch?v=<strong>ID_AQUÍ</strong>
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="categoria" className="form-label">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                className="form-select"
                value={form.categoria}
                onChange={handleChange}
                required
                aria-required="true"
              >
                {CATEGORIAS.map((cat) => (
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                aria-busy={guardando}
              >
                {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear video')}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/admin/videos')}
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
