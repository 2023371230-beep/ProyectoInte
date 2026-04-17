// Servicio de autenticación.
// Llama al backend Node.js — nunca toca la base de datos directamente.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/usuario_model.dart';
import '../utils/constants.dart';
import '../utils/storage.dart';

class AuthService {
  // Inicia sesión con email y contraseña.
  // Guarda el token y los datos del usuario en SharedPreferences.
  // Lanza una excepción con el mensaje de error si falla.
  Future<UsuarioModel> login(String email, String password) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/login');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode != 200) {
      // El backend devuelve { error: '...' } cuando algo falla
      throw Exception(data['error'] ?? 'Error al iniciar sesión.');
    }

    // Guarda sesión para no pedir login cada vez que se abre la app
    await AppStorage.guardarSesion(
      data['token'] as String,
      data['usuario'] as Map<String, dynamic>,
    );

    return UsuarioModel.fromJson(data['usuario'] as Map<String, dynamic>);
  }

  // Registra un nuevo cliente.
  // El backend llama a sp_registrar_nuevo_cliente que crea usuario + cliente + suscripción.
  Future<UsuarioModel> register({
    required String nombre,
    required String email,
    required String password,
    String diagnostico = '',
    String telefono    = '',
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/auth/register');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nombre':      nombre,
        'email':       email,
        'password':    password,
        'diagnostico': diagnostico,
        'telefono':    telefono,
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode != 201) {
      throw Exception(data['error'] ?? 'Error al registrarse.');
    }

    await AppStorage.guardarSesion(
      data['token'] as String,
      data['usuario'] as Map<String, dynamic>,
    );

    return UsuarioModel.fromJson(data['usuario'] as Map<String, dynamic>);
  }

  // Cierra sesión borrando los datos locales
  Future<void> logout() async {
    await AppStorage.limpiarSesion();
  }
}
