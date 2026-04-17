// Tarjeta de acceso rápido para el dashboard.
// Botones grandes con ícono y etiqueta — fáciles de tocar.
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AccesoRapidoCard extends StatelessWidget {
  final String     label;
  final IconData   icon;
  final String?    badge;      // texto pequeño (ej. "Bloqueado")
  final bool       bloqueado;
  final VoidCallback onTap;

  const AccesoRapidoCard({
    super.key,
    required this.label,
    required this.icon,
    required this.onTap,
    this.badge,
    this.bloqueado = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: bloqueado ? Colors.grey.shade200 : AppColors.cardLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: bloqueado ? Colors.grey.shade300 : AppColors.accent,
            width: 1.5,
          ),
        ),
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 36,
                  color: bloqueado ? Colors.grey : AppColors.primary,
                ),
                if (bloqueado)
                  const Positioned(
                    right: -6,
                    top: -6,
                    child: Icon(Icons.lock, size: 16, color: Colors.grey),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: bloqueado ? Colors.grey : AppColors.textDark,
              ),
            ),
            if (badge != null) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: bloqueado ? Colors.grey.shade300 : AppColors.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge!,
                  style: TextStyle(
                    fontSize: 10,
                    color: bloqueado ? Colors.grey.shade600 : Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
