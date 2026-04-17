// services/medicamentos.service.js
// CRUD del catálogo de medicamentos (nombre y descripción).

const db = require('../db');

async function obtenerTodos() {
  const result = await db.query(
    'SELECT id_medicamento, nombre, descripcion FROM medicamentos ORDER BY nombre ASC'
  );
  return result.rows;
}

async function obtenerPorId(id) {
  const result = await db.query(
    'SELECT id_medicamento, nombre, descripcion FROM medicamentos WHERE id_medicamento = $1',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Medicamento no encontrado.');
  return result.rows[0];
}

async function crear({ nombre, descripcion }) {
  const result = await db.query(
    'INSERT INTO medicamentos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
    [nombre, descripcion]
  );
  return result.rows[0];
}

async function actualizar(id, { nombre, descripcion }) {
  const result = await db.query(
    'UPDATE medicamentos SET nombre = $1, descripcion = $2 WHERE id_medicamento = $3 RETURNING *',
    [nombre, descripcion, id]
  );
  if (result.rows.length === 0) throw new Error('Medicamento no encontrado.');
  return result.rows[0];
}

async function eliminar(id) {
  const result = await db.query(
    'DELETE FROM medicamentos WHERE id_medicamento = $1 RETURNING id_medicamento',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Medicamento no encontrado.');
  return { mensaje: 'Medicamento eliminado correctamente.' };
}

// Admin asigna un medicamento específico a un cliente
async function asignarMedicamento({ id_cliente, id_medicamento, dosis, frecuencia, hora_inicio }) {
  // Verificar que el cliente existe
  const cliente = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [id_cliente]);
  if (cliente.rows.length === 0) throw new Error('Cliente no encontrado.');

  // Verificar que el medicamento existe
  const med = await db.query('SELECT id_medicamento FROM medicamentos WHERE id_medicamento = $1', [id_medicamento]);
  if (med.rows.length === 0) throw new Error('Medicamento no encontrado.');

  const horaInicioNormalizada =
    hora_inicio && String(hora_inicio).trim() !== ''
      ? String(hora_inicio).trim()
      : null;

  const result = await db.query(
    `INSERT INTO medicacion_usuario (id_cliente, id_medicamento, dosis, frecuencia, hora_inicio)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id_cliente, id_medicamento, dosis, frecuencia, horaInicioNormalizada]
  );
  return result.rows[0];
}

// Devuelve los medicamentos asignados al cliente autenticado
// JOIN: medicacion_usuario → medicamentos, buscando el cliente por id_usuario del JWT
async function getMedicamentosCliente(id_usuario) {
  const result = await db.query(`
    SELECT
      mu.id_medicacion,
      m.id_medicamento,
      m.nombre,
      m.descripcion,
      mu.dosis,
      mu.frecuencia,
      TO_CHAR(mu.hora_inicio, 'HH24:MI') AS hora_inicio
    FROM medicacion_usuario mu
    JOIN medicamentos m  ON m.id_medicamento = mu.id_medicamento
    JOIN clientes     c  ON c.id_cliente      = mu.id_cliente
    WHERE c.id_usuario = $1
    ORDER BY m.nombre ASC
  `, [id_usuario]);

  return result.rows;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, asignarMedicamento, getMedicamentosCliente };
