// Servicio para consultar la suscripción del cliente autenticado.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/suscripcion_model.dart';
import '../utils/constants.dart';
import '../utils/storage.dart';

class SuscripcionService {
  // Devuelve la suscripción del usuario que tiene sesión activa.
  // Usa el token JWT guardado en SharedPreferences para autenticarse.
  Future<SuscripcionModel> getMiSuscripcion() async {
    final token = await AppStorage.obtenerToken();
    if (token == null) throw Exception('No hay sesión activa.');

    final url = Uri.parse('${ApiConfig.baseUrl}/suscripciones/mia');

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data['error'] ?? 'Error al obtener la suscripción.');
    }

    return SuscripcionModel.fromJson(data as Map<String, dynamic>);
  }
}
