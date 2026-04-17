// middleware/auth.js
// Verifica que el token JWT sea válido antes de dejar pasar la petición.
// Si el token falta o es inválido, regresa 401 y la petición no llega al controlador.

const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

function verificarToken(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido. Inicia sesión primero.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Adjuntamos el usuario decodificado al request para que los controladores lo usen
    req.usuario = {
      ...decoded,
      id: decoded.id_usuario,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

// Solo permite el acceso a administradores
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol admin.' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
