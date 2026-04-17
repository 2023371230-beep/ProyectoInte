// config/paypal.js
// Credenciales y URL base de PayPal Sandbox.
// Los valores reales vienen del archivo .env (nunca hardcodear en producción).

module.exports = {
  clientId:     process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  baseUrl:      'https://api-m.sandbox.paypal.com', // sandbox; en producción: api-m.paypal.com
};
