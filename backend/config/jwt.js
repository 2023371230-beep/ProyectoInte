// config/jwt.js
// Centraliza la configuración de JWT para no repetirla en varios archivos.

module.exports = {
  secret:    process.env.JWT_SECRET  || 'fallback_secret_dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
};
