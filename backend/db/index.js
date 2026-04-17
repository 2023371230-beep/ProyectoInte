// db/index.js
// Pool de conexiones a PostgreSQL en Google Cloud.
// Un Pool reutiliza conexiones abiertas en lugar de abrir una nueva por cada petición,
// lo que evita saturar la instancia con peticiones simultáneas.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT) || 5432,
  // Google Cloud SQL requiere SSL. rejectUnauthorized: false acepta el certificado
  // autofirmado de la instancia sin necesidad de descargar el CA cert.
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('📦 Conexión establecida con PostgreSQL en Google Cloud');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

// Exportamos una función query para que los services no manejen el pool directamente.
// Siempre se usa $1, $2... para parámetros (nunca concatenar strings → evita SQL injection).
module.exports = {
  query: (text, params) => pool.query(text, params),
};
