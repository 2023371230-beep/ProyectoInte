// Servicio de medicamentos del cliente.
// Llama a GET /api/medicamentos/mis-medicamentos con el JWT del usuario.
// El backend filtra y devuelve SOLO los medicamentos asignados a este cliente.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/medicamento_model.dart';
import '../utils/constants.dart';
import '../utils/storage.dart';

class MedicamentoService {
  Future<List<MedicamentoModel>> getMedicamentos() async {
    final token = await AppStorage.obtenerToken();
    if (token == null) throw Exception('No hay sesión activa.');

    final url = Uri.parse('${ApiConfig.baseUrl}/medicamentos/mis-medicamentos');

    final response = await http.get(
      url,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Error al cargar medicamentos.');
    }

    final lista = jsonDecode(response.body) as List<dynamic>;
    return lista
        .map((item) => MedicamentoModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
