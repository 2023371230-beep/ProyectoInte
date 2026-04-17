// seed.js
// Crea el usuario administrador inicial con contraseña hasheada.
// Ejecutar UNA sola vez: node seed.js
// (Si ya existe el email, no hace nada gracias al IF NOT EXISTS en la query)

require('dotenv').config();

const bcrypt = require('bcryptjs');
const db     = require('./db');

async function seed() {
  console.log('🌱 Iniciando seed...');

  // ─── Admin principal ──────────────────────────────────
  const adminEmail    = 'admin@clinica.com';
  const adminPassword = 'Admin123!';
  const adminHash     = await bcrypt.hash(adminPassword, 10);

  const existe = await db.query(
    'SELECT id_usuario FROM usuarios WHERE email = $1',
    [adminEmail]
  );

  if (existe.rows.length > 0) {
    console.log('ℹ️  El admin ya existe, no se vuelve a crear.');
  } else {
    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, 'admin')",
      ['Admin Clínica', adminEmail, adminHash]
    );
    console.log(`✅ Admin creado: ${adminEmail} / ${adminPassword}`);
  }

  // ─── Datos de demo (medicamentos y videos) ─────────────
  const medCount = await db.query('SELECT COUNT(*) AS total FROM medicamentos');
  if (Number(medCount.rows[0].total) === 0) {
    await db.query(`
      INSERT INTO medicamentos (nombre, descripcion) VALUES
      ('Ibuprofeno 400mg', 'Antiinflamatorio y analgésico para dolores musculares'),
      ('Paracetamol 500mg', 'Analgésico y antipirético de uso general'),
      ('Vitamina D3 1000 UI', 'Suplemento para huesos y sistema nervioso'),
      ('Baclofen 10mg', 'Relajante muscular para espasticidad'),
      ('Diclofenaco gel', 'Antiinflamatorio tópico para articulaciones')
    `);
    console.log('✅ Medicamentos de demo insertados.');
  }

  const vidCount = await db.query('SELECT COUNT(*) AS total FROM videos');
  if (Number(vidCount.rows[0].total) === 0) {
    await db.query(`
      INSERT INTO videos (titulo, youtube_id, categoria) VALUES
      ('Ejercicios de movilidad para hombro', 'dQw4w9WgXcQ', 'fisioterapia'),
      ('Hidroterapia básica para adultos', 'kJQP7kiw5Fk', 'hidroterapia'),
      ('Técnicas de transferencia en silla de ruedas', 'RgKAFK5djSk', 'movilidad'),
      ('Fortalecimiento de miembro inferior', 'OPf0YbXqDm0', 'fisioterapia')
    `);
    console.log('✅ Videos de demo insertados.');
  }

  console.log('🎉 Seed completado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
