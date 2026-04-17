// Tarjeta que muestra el estado actual de la suscripción del usuario.
// Se usa en el dashboard para que el cliente sepa de un vistazo su plan.
import 'package:flutter/material.dart';
import '../models/suscripcion_model.dart';
import '../theme/app_theme.dart';

class SuscripcionCard extends StatelessWidget {
  final SuscripcionModel suscripcion;

  const SuscripcionCard({super.key, required this.suscripcion});

  @override
  Widget build(BuildContext context) {
    final esPremium = suscripcion.plan == 'premium';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: esPremium
              ? [AppColors.primary, AppColors.secondary]
              : [AppColors.secondary, AppColors.accent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                esPremium ? '★ Plan Premium' : 'Plan Estándar',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              _BadgeEstado(estado: suscripcion.estado),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            esPremium
                ? 'Tienes acceso completo a todos los videos de rehabilitación.'
                : 'Actualiza a Premium para desbloquear los videos.',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 8),
          Text(
            'Desde: ${_formatFecha(suscripcion.fechaInicio)}',
            style: const TextStyle(color: Colors.white60, fontSize: 12),
          ),
        ],
      ),
    );
  }

  String _formatFecha(DateTime fecha) {
    final meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return '${fecha.day} ${meses[fecha.month - 1]} ${fecha.year}';
  }
}

// Badge de color según el estado de la suscripción
class _BadgeEstado extends StatelessWidget {
  final String estado;
  const _BadgeEstado({required this.estado});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;

    switch (estado) {
      case 'activa':
        color = AppColors.statusActive;
        label = 'Activa';
        break;
      case 'vencida':
        color = AppColors.statusExpired;
        label = 'Vencida';
        break;
      case 'cancelada':
        color = AppColors.statusCancelled;
        label = 'Cancelada';
        break;
      default:
        color = Colors.grey;
        label = estado;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}
