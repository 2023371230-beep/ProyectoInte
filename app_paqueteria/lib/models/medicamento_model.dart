// Modelo de medicamento asignado al cliente.
// Viene del endpoint GET /api/medicamentos/mis-medicamentos
// Incluye la información de la prescripción (dosis, frecuencia, hora).
class MedicamentoModel {
  final int    idMedicacion;
  final int    idMedicamento;
  final String nombre;
  final String descripcion;
  final String dosis;
  final String frecuencia;
  final String? horaInicio; // puede ser null si no se especificó

  const MedicamentoModel({
    required this.idMedicacion,
    required this.idMedicamento,
    required this.nombre,
    required this.descripcion,
    required this.dosis,
    required this.frecuencia,
    this.horaInicio,
  });

  factory MedicamentoModel.fromJson(Map<String, dynamic> json) {
    return MedicamentoModel(
      idMedicacion:   json['id_medicacion']   as int,
      idMedicamento:  json['id_medicamento']  as int,
      nombre:         json['nombre']          as String,
      descripcion:    (json['descripcion']    as String?) ?? '',
      dosis:          json['dosis']           as String,
      frecuencia:     json['frecuencia']      as String,
      horaInicio:     json['hora_inicio']     as String?,
    );
  }
}
