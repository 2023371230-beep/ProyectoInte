// Botón principal reutilizable.
// Grande y accesible — fácil de tocar para personas con discapacidad motriz.
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppButton extends StatelessWidget {
  final String       label;
  final VoidCallback? onPressed;
  final bool         isLoading;
  final IconData?    icon;
  final Color?       backgroundColor;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading       = false,
    this.icon,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        disabledBackgroundColor: AppColors.accent,
      ),
      child: isLoading
          ? const SizedBox(
              height: 22,
              width:  22,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: Colors.white,
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 20),
                  const SizedBox(width: 8),
                ],
                Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ],
            ),
    );
  }
}
