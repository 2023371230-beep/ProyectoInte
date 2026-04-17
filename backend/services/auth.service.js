// services/auth.service.js
// Lógica de negocio para autenticación. No sabe nada de HTTP (req/res).

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { secret, expiresIn } = require('../config/jwt');

async function login(email, password) {
  const result = await db.query(
    'SELECT id_usuario, nombre, email, password, rol, activo FROM usuarios WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales incorrectas.');
  }

  const usuario = result.rows[0];

  const esBcrypt = usuario.password.startsWith('$2');
  const coincide = esBcrypt
    ? await bcrypt.compare(password, usuario.password)
    : password === usuario.password;

  if (!coincide) {
    throw new Error('Credenciales incorrectas.');
  }

  if (!usuario.activo) {
    throw new Error('Esta cuenta ha sido dada de baja. Contacta al administrador.');
  }

  // Genera el token JWT con datos básicos del usuario (sin la contraseña)
  const payload = {
    id_usuario: usuario.id_usuario,
    nombre:     usuario.nombre,
    email:      usuario.email,
    rol:        usuario.rol,
  };

  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    token,
    usuario: payload,
  };
}

// Registra un nuevo cliente: llama al stored procedure que crea usuario + cliente + suscripción
async function register(nombre, email, password, diagnostico, telefono) {
  // Verifica que el email no esté ya registrado
  const existe = await db.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
  if (existe.rows.length > 0) {
    throw new Error('El correo ya está registrado.');
  }

  // Hashea la contraseña antes de guardarla
  const hash = await bcrypt.hash(password, 10);

  // El stored procedure crea usuario + cliente + suscripción en una sola transacción
  await db.query(
    'CALL sp_registrar_nuevo_cliente($1, $2, $3, $4, $5)',
    [nombre, email, hash, diagnostico || '', telefono || '']
  );

  // Devuelve los datos del usuario recién creado para poder generar el token
  const result = await db.query(
    'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = result.rows[0];
  const payload = { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  const token = jwt.sign(payload, secret, { expiresIn });

  return { token, usuario: payload };
}

// Login exclusivo para la web — solo acepta usuarios con rol 'admin'
async function loginAdmin(email, password) {
  const result = await db.query(
    'SELECT id_usuario, nombre, email, password, rol, activo FROM usuarios WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales incorrectas.');
  }

  const usuario = result.rows[0];

  const esBcrypt = usuario.password.startsWith('$2');
  const coincide = esBcrypt
    ? await bcrypt.compare(password, usuario.password)
    : password === usuario.password;

  if (!coincide) {
    throw new Error('Credenciales incorrectas.');
  }

  if (!usuario.activo) {
    throw new Error('Esta cuenta ha sido desactivada.');
  }

  // Bloquear acceso si no es administrador
  if (usuario.rol !== 'admin') {
    throw new Error('Acceso denegado. Esta plataforma es solo para administradores.');
  }

  const payload = {
    id_usuario: usuario.id_usuario,
    nombre:     usuario.nombre,
    email:      usuario.email,
    rol:        usuario.rol,
  };

  const token = jwt.sign(payload, secret, { expiresIn });
  return { token, usuario: payload };
}

module.exports = { login, loginAdmin, register };
