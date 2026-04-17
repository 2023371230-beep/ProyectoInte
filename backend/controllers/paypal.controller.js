// controllers/paypal.controller.js
// Maneja el ciclo completo de pago con PayPal Sandbox:
//   1. crearOrden    → Flutter llama esto, recibe URL de aprobación
//   2. exitoPago     → PayPal redirige aquí tras el pago (navegador del usuario)
//   3. pagoCancelado → PayPal redirige aquí si el usuario cancela

const paypalService = require('../services/paypal.service');
const pagosService  = require('../services/pagos.service');

const MONTO_PREMIUM = 199.00; // MXN

// ─── POST /api/paypal/crear-orden  (requiere JWT) ─────────────────────────
// Flutter lo llama; devuelve la URL donde el usuario aprueba el pago.
async function crearOrden(req, res) {
  const id_usuario = req.usuario.id_usuario; // viene del middleware verificarToken

  // URL base para los callbacks — debe ser accesible desde el navegador del dispositivo.
  // Emulador Android: 10.0.2.2 = la máquina host.
  // Dispositivo físico en LAN: pon la IP local de tu PC en PAYPAL_RETURN_BASE.
  const base = process.env.PAYPAL_RETURN_BASE || 'http://10.0.2.2:3001';

  try {
    const { orderId, approvalUrl } = await paypalService.crearOrden({
      id_usuario,
      monto:     MONTO_PREMIUM,
      returnUrl: `${base}/api/paypal/exito`,
      cancelUrl: `${base}/api/paypal/cancelado`,
    });

    res.json({ order_id: orderId, approval_url: approvalUrl });
  } catch (err) {
    const detalle = err.response?.data?.error_description || err.response?.data?.message || err.message;
    console.error('Error creando orden PayPal:', detalle);

    // Si el error es de autenticación, dar un mensaje específico
    const esCredenciales = err.response?.status === 401 ||
                           String(detalle).toLowerCase().includes('unauthorized') ||
                           String(detalle).toLowerCase().includes('invalid_client');

    res.status(500).json({
      error: esCredenciales
        ? 'Credenciales de PayPal Sandbox inválidas. Actualiza PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en el archivo .env y reinicia el servidor.'
        : `Error al crear la orden de pago: ${detalle}`,
    });
  }
}

// ─── GET /api/paypal/exito?token={orderId}&PayerID={payerId} ──────────────
// PayPal redirige aquí (en el navegador) tras la aprobación del pago.
// Captura el pago, lo registra en BD y muestra una página HTML de confirmación.
async function exitoPago(req, res) {
  const orderId = req.query.token; // PayPal pasa el orderId como "token"

  if (!orderId) {
    return res.status(400).send('<h2>Error: falta el identificador de la orden.</h2>');
  }

  try {
    const { capture, id_usuario } = await paypalService.capturarOrden(orderId);

    if (!id_usuario) {
      return res.status(400).send('<h2>Error: orden no reconocida o ya procesada.</h2>');
    }

    if (capture.status !== 'COMPLETED') {
      return res.status(400).send(`<h2>Pago no completado (estado: ${capture.status})</h2>`);
    }

    // Registrar el pago en la BD → el trigger trg_pago_exitoso actualiza la suscripción
    await pagosService.registrar({
      id_usuario,
      monto:  MONTO_PREMIUM,
      metodo: 'paypal_sandbox',
    });

    // Página HTML de confirmación que ve el usuario en el navegador
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Pago exitoso!</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #E8F4DC;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px 32px;
            text-align: center;
            max-width: 380px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,.10);
          }
          .icon { font-size: 72px; margin-bottom: 16px; }
          h2   { color: #4CAF50; font-size: 24px; margin-bottom: 10px; }
          p    { color: #555; font-size: 15px; line-height: 1.5; }
          .badge {
            display: inline-block;
            background: #728156;
            color: white;
            border-radius: 20px;
            padding: 6px 18px;
            font-size: 14px;
            font-weight: 700;
            margin: 16px 0;
          }
          .hint {
            background: #f0f7e8;
            border: 1px solid #B6C99C;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
            font-size: 14px;
            color: #4a5e30;
            line-height: 1.5;
          }
          .hint strong { color: #728156; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h2>¡Pago exitoso!</h2>
          <div class="badge">Plan Premium — 30 días</div>
          <p>Tu suscripción ha sido actualizada a <strong>Premium</strong>.</p>
          <div class="hint">
            Vuelve a la app y presiona<br>
            <strong>"Ya pagué — verificar"</strong><br>
            para desbloquear los videos.
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error capturando pago PayPal:', err.response?.data || err.message);
    res.status(500).send(`
      <div style="font-family:sans-serif;text-align:center;padding:40px">
        <h2 style="color:#e53935">Error al procesar el pago</h2>
        <p>${err.message}</p>
      </div>
    `);
  }
}

// ─── GET /api/paypal/cancelado ────────────────────────────────────────────
// PayPal redirige aquí si el usuario presiona "Cancelar" en la página de pago.
async function pagoCancelado(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Pago cancelado</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fafafa;
          display: flex; justify-content: center; align-items: center;
          min-height: 100vh; padding: 20px;
        }
        .card {
          background: white; border-radius: 20px; padding: 40px 32px;
          text-align: center; max-width: 380px; width: 100%;
          box-shadow: 0 4px 16px rgba(0,0,0,.08);
        }
        h2 { color: #999; margin: 16px 0 10px; }
        p  { color: #777; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size:72px">❌</div>
        <h2>Pago cancelado</h2>
        <p>No se realizó ningún cargo.<br>Vuelve a la app e inténtalo de nuevo cuando quieras.</p>
      </div>
    </body>
    </html>
  `);
}

module.exports = { crearOrden, exitoPago, pagoCancelado };
