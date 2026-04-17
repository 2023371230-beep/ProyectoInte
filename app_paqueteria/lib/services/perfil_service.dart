// Servicio para obtener el perfil del cliente autenticado.
// Llama a GET /api/clientes/mi-perfil con el JWT del usuario.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../utils/storage.dart';

class PerfilService {
  Future<Map<String, dynamic>> getMiPerfil() async {
    final token = await AppStorage.obtenerToken();
    if (token == null) throw Exception('No hay sesión activa.');

    final url = Uri.parse('${ApiConfig.baseUrl}/clientes/mi-perfil');

    final response = await http.get(
      url,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception((data as Map)['error'] ?? 'Error al cargar el perfil.');
    }

    return data as Map<String, dynamic>;
  }
}
