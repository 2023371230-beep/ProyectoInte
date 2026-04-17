// index.js — Punto de entrada del servidor
// Carga variables de entorno ANTES de importar cualquier módulo que las use

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// ─── Rutas ────────────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes');
const clientesRoutes      = require('./routes/clientes.routes');
const medicamentosRoutes  = require('./routes/medicamentos.routes');
const videosRoutes        = require('./routes/videos.routes');
const suscripcionesRoutes = require('./routes/suscripciones.routes');
const pagosRoutes         = require('./routes/pagos.routes');
const dashboardRoutes     = require('./routes/dashboard.routes');
const db                  = require('./db');

// ─── App ─────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares globales ─────────────────────────────────
app.use(cors({
  origin: [
    'https://discapacidadsinbarreras.duckdns.org',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// ─── Endpoints ───────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/clientes',      clientesRoutes);
app.use('/api/medicamentos',  medicamentosRoutes);
app.use('/api/videos',        videosRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);
app.use('/api/pagos',         pagosRoutes);
app.use('/api/dashboard',     dashboardRoutes);

// Ruta de estado — útil para saber si el servidor está vivo
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', proyecto: 'Discapacidad sin Barreras', version: '1.0.0' });
});

// ─── Manejo de rutas no encontradas ──────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` });
});

// ─── Manejo global de errores ─────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ─── Iniciar servidor ─────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 API status: http://localhost:${PORT}/api/status`);

  // Crear tablas de relación automáticamente si no existen
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS medicacion_usuario (
        id_medicacion  SERIAL PRIMARY KEY,
        id_cliente     INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
        id_medicamento INT NOT NULL REFERENCES medicamentos(id_medicamento) ON DELETE CASCADE,
        dosis          VARCHAR(100) NOT NULL,
        frecuencia     VARCHAR(100) NOT NULL,
        hora_inicio    TIME,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Compatibilidad: si la columna ya existía como NOT NULL, la volvemos opcional.
    await db.query(`
      ALTER TABLE medicacion_usuario
      ALTER COLUMN hora_inicio DROP NOT NULL;
    `);

    console.log('✅ Tabla medicacion_usuario verificada.');
  } catch (err) {
    console.warn('⚠️  No se pudo verificar medicacion_usuario:', err.message);
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS video_usuario (
        id_video_usuario SERIAL PRIMARY KEY,
        id_cliente       INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
        id_video         INT NOT NULL REFERENCES videos(id_video) ON DELETE CASCADE,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (id_cliente, id_video)
      );
    `);
    console.log('✅ Tabla video_usuario verificada.');
  } catch (err) {
    console.warn('⚠️  No se pudo verificar video_usuario:', err.message);
  }
});
