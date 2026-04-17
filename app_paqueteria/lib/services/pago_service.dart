// Servicio de pagos simulados con tarjeta bancaria.
// No realiza cobro real — solo registra el pago en el backend para activar
// el trigger de PostgreSQL que actualiza la suscripción a premium 30 días.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../utils/storage.dart';

class PagoService {
  // Registra un pago simulado en el backend.
  // El trigger trg_pago_exitoso actualiza automáticamente la suscripción a premium.
  Future<void> simularPago({ required double monto }) async {
    final token = await AppStorage.obtenerToken();
    if (token == null) throw Exception('No hay sesión activa.');

    final url = Uri.parse('${ApiConfig.baseUrl}/pagos');

    final response = await http.post(
      url,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'monto':  monto,
        'metodo': 'tarjeta_simulada',
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(data['error'] ?? 'Error al procesar el pago.');
    }
  }
}
