// Modelo de suscripción del cliente.
// Viene del endpoint GET /api/suscripciones/mia
class SuscripcionModel {
  final int      idSuscripcion;
  final String   plan;         // 'estandar' | 'premium'
  final String   estado;       // 'activa' | 'vencida' | 'cancelada'
  final DateTime fechaInicio;
  final DateTime? fechaFin;    // null si no tiene vencimiento definido

  const SuscripcionModel({
    required this.idSuscripcion,
    required this.plan,
    required this.estado,
    required this.fechaInicio,
    this.fechaFin,
  });

  factory SuscripcionModel.fromJson(Map<String, dynamic> json) {
    return SuscripcionModel(
      idSuscripcion: json['id_suscripcion'] as int,
      plan:          json['plan']           as String,
      estado:        json['estado']         as String,
      fechaInicio:   DateTime.parse(json['fecha_inicio'] as String),
      fechaFin: json['fecha_fin'] != null
          ? DateTime.parse(json['fecha_fin'] as String)
          : null,
    );
  }

  // Tiene acceso a videos si:
  //   · plan es premium
  //   · estado es activa
  //   · fecha_fin no ha vencido (o no tiene fecha_fin → acceso indefinido)
  bool get tieneAccesoVideos {
    if (plan != 'premium' || estado != 'activa') return false;
    if (fechaFin != null && fechaFin!.isBefore(DateTime.now())) return false;
    return true;
  }

  // Días restantes de suscripción premium (null si no aplica)
  int? get diasRestantes {
    if (fechaFin == null || plan != 'premium') return null;
    final diff = fechaFin!.difference(DateTime.now()).inDays;
    return diff > 0 ? diff : 0;
  }
}
