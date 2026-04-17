import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import Header                  from '../../components/Header';
import { obtenerClientes }     from '../../services/clientesService';
import { obtenerMedicamentos, asignarMedicamento } from '../../services/medicamentosService';

export default function AsignarMedicamento() {
  const navigate = useNavigate();

  const [clientes,     setClientes]     = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [error,        setError]        = useState('');
  const [exito,        setExito]        = useState('');

  const [form, setForm] = useState({
    id_cliente:     '',
    id_medicamento: '',
    dosis:          '',
    frecuencia:     '',
    hora_inicio:    '',
  });

  // Cargar lista de clientes y medicamentos al montar
  useEffect(() => {
    async function cargar() {
      try {
        const [c, m] = await Promise.all([obtenerClientes(), obtenerMedicamentos()]);
        setClientes(c);
        setMedicamentos(m);
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

    if (!form.id_cliente || !form.id_medicamento || !form.dosis || !form.frecuencia) {
      setError('Cliente, medicamento, dosis y frecuencia son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      await asignarMedicamento({
        id_cliente:     Number(form.id_cliente),
        id_medicamento: Number(form.id_medicamento),
        dosis:          form.dosis.trim(),
        frecuencia:     form.frecuencia.trim(),
        hora_inicio:    form.hora_inicio || null,
      });

      // Mostrar éxito y limpiar el formulario para asignar otro
      const clienteNombre = clientes.find(c => c.id_cliente === Number(form.id_cliente))?.nombre;
      const medNombre     = medicamentos.find(m => m.id_medicamento === Number(form.id_medicamento))?.nombre;
      setExito(`✓ "${medNombre}" asignado a ${clienteNombre} correctamente.`);
      setForm({ id_cliente: form.id_cliente, id_medicamento: '', dosis: '', frecuencia: '', hora_inicio: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al asignar el medicamento.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <>
        <Header titulo="Asignar Medicamento" subtitulo="Cargando datos..." />
        <div className="page-body" style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div className="spinner" aria-label="Cargando" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        titulo="Asignar Medicamento"
        subtitulo="Asigna un medicamento específico a un cliente"
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

            {/* ── Cliente ── */}
            <div className="form-group">
              <label htmlFor="id_cliente">Cliente *</label>
              <select
                id="id_cliente"
                name="id_cliente"
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

            {/* ── Medicamento ── */}
            <div className="form-group">
              <label htmlFor="id_medicamento">Medicamento *</label>
              <select
                id="id_medicamento"
                name="id_medicamento"
                value={form.id_medicamento}
                onChange={handleChange}
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

            {/* ── Dosis ── */}
            <div className="form-group">
              <label htmlFor="dosis">Dosis *</label>
              <input
                id="dosis"
                name="dosis"
                type="text"
                placeholder="Ej: 400mg, 1 tableta, 5ml"
                value={form.dosis}
                onChange={handleChange}
                required
              />
            </div>

            {/* ── Frecuencia ── */}
            <div className="form-group">
              <label htmlFor="frecuencia">Frecuencia *</label>
              <input
                id="frecuencia"
                name="frecuencia"
                type="text"
                placeholder="Ej: Cada 8 horas, 2 veces al día"
                value={form.frecuencia}
                onChange={handleChange}
                required
              />
            </div>

            {/* ── Hora de inicio (opcional) ── */}
            <div className="form-group">
              <label htmlFor="hora_inicio">Hora de inicio <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>(opcional)</span></label>
              <input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                value={form.hora_inicio}
                onChange={handleChange}
              />
            </div>

            {/* ── Botones ── */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/medicamentos')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
                aria-busy={guardando}
              >
                {guardando ? 'Asignando...' : 'Asignar Medicamento'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
