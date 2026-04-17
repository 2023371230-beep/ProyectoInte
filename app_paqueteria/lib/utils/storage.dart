// Manejo del token JWT y datos del usuario en SharedPreferences.
// Todo el acceso a almacenamiento local pasa por aquí.
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AppStorage {
  static const _keyToken   = 'token';
  static const _keyUsuario = 'usuario';

  // Guarda token y datos del usuario después del login
  static Future<void> guardarSesion(String token, Map<String, dynamic> usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
    await prefs.setString(_keyUsuario, jsonEncode(usuario));
  }

  // Recupera el token guardado (null si no hay sesión)
  static Future<String?> obtenerToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyToken);
  }

  // Recupera los datos del usuario guardados
  static Future<Map<String, dynamic>?> obtenerUsuario() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyUsuario);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  // Borra la sesión (logout)
  static Future<void> limpiarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyUsuario);
  }

  // Verifica si hay sesión activa
  static Future<bool> haySesion() async {
    final token = await obtenerToken();
    return token != null;
  }
}
