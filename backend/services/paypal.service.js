// services/paypal.service.js
// Comunicación directa con la API REST de PayPal Sandbox.
// Flujo: obtener token → crear orden → capturar pago.

const axios  = require('axios');
const config = require('../config/paypal');

// Almacena temporalmente la relación orden ↔ usuario mientras el pago está pendiente.
// En producción usarías una tabla en BD; aquí un Map en memoria es suficiente para demos.
const ordenesEnCurso = new Map(); // paypalOrderId → id_usuario

// ─── Obtener token de acceso OAuth2 ───────────────────────────────────────
async function getAccessToken() {
  const response = await axios.post(
    `${config.baseUrl}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // Basic auth: clientId:clientSecret en Base64
      auth: { username: config.clientId, password: config.clientSecret },
    }
  );
  return response.data.access_token;
}

// ─── Crear orden de pago ───────────────────────────────────────────────────
// Devuelve { orderId, approvalUrl } — Flutter abre approvalUrl en el navegador.
async function crearOrden({ id_usuario, monto, returnUrl, cancelUrl }) {
  const token = await getAccessToken();

  const response = await axios.post(
    `${config.baseUrl}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'MXN',
            value: monto.toFixed(2),
          },
          description: 'Plan Premium — Discapacidad sin Barreras (30 días)',
        },
      ],
      application_context: {
        return_url:  returnUrl,
        cancel_url:  cancelUrl,
        brand_name:  'Discapacidad sin Barreras',
        landing_page: 'LOGIN',
        user_action:  'PAY_NOW',
      },
    },
    {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const order = response.data;

  // Guardar la asociación orden → usuario para el callback de éxito
  ordenesEnCurso.set(order.id, id_usuario);

  // El link con rel='approve' es donde el usuario aprueba el pago en PayPal
  const approvalLink = order.links.find(l => l.rel === 'approve');
  return { orderId: order.id, approvalUrl: approvalLink.href };
}

// ─── Capturar el pago (llamado cuando PayPal redirige al return_url) ───────
// Devuelve { capture, id_usuario }
async function capturarOrden(orderId) {
  const token = await getAccessToken();

  const response = await axios.post(
    `${config.baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Recuperar el usuario dueño de esta orden
  const id_usuario = ordenesEnCurso.get(orderId) || null;
  ordenesEnCurso.delete(orderId); // Limpiar el registro temporal

  return { capture: response.data, id_usuario };
}

module.exports = { crearOrden, capturarOrden };
