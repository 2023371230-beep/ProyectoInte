// Modelo del usuario autenticado.
// Viene del JWT que retorna el backend al hacer login.
class UsuarioModel {
  final int    idUsuario;
  final String nombre;
  final String email;
  final String rol;

  const UsuarioModel({
    required this.idUsuario,
    required this.nombre,
    required this.email,
    required this.rol,
  });

  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      idUsuario: json['id_usuario'] as int,
      nombre:    json['nombre']    as String,
      email:     json['email']     as String,
      rol:       json['rol']       as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id_usuario': idUsuario,
    'nombre':     nombre,
    'email':      email,
    'rol':        rol,
  };
}
