// Servicio de videos de rehabilitación.
// Llama a GET /api/videos con el token JWT del usuario.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/video_model.dart';
import '../utils/constants.dart';
import '../utils/storage.dart';

class VideoService {
  Future<List<VideoModel>> getVideos() async {
    final token = await AppStorage.obtenerToken();
    if (token == null) throw Exception('No hay sesión activa.');

    final url = Uri.parse('${ApiConfig.baseUrl}/videos/mis-videos');

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Error al cargar videos.');
    }

    final lista = jsonDecode(response.body) as List<dynamic>;
    return lista
        .map((item) => VideoModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
