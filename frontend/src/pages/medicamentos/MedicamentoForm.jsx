import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import { crearMedicamento, obtenerMedicamentoPorId, actualizarMedicamento } from '../../services/medicamentosService';

export default function MedicamentoForm() {
  const { id }    = useParams();
  const esEdicion = Boolean(id);
  const navigate  = useNavigate();

  const [form, setForm]           = useState({ nombre: '', descripcion: '' });
  const [error, setError]         = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion) {
      obtenerMedicamentoPorId(id)
        .then((datos) => setForm({ nombre: datos.nombre, descripcion: datos.descripcion || '' }))
        .catch(() => setError('No se pudo cargar el medicamento.'));
    }
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setError('El nombre del medicamento es obligatorio.');
      return;
    }

    setGuardando(true);

    try {
      if (esEdicion) {
        await actualizarMedicamento(id, form);
      } else {
        await crearMedicamento(form);
      }
      navigate('/admin/medicamentos');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Header
        titulo={esEdicion ? 'Editar Medicamento' : 'Nuevo Medicamento'}
        subtitulo={esEdicion ? `Modificando medicamento #${id}` : 'Agregar medicamento al catálogo'}
      />

      <div className="page-body">
        <div className="card" style={{ maxWidth: 520 }}>
          {error && (
            <div className="alert alert-error" role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre del medicamento *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-input"
                value={form.nombre}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="Ej. Ibuprofeno 400mg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-textarea"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Información del medicamento, indicaciones, etc."
                rows={5}
              />
            </div>

            <div className="flex gap-16 mt-16">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                aria-busy={guardando}
              >
                {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear medicamento')}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/admin/medicamentos')}
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
