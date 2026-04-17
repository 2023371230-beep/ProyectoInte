// Paleta de colores y tema global de la app.
// Basado en el diseño de accesibilidad del proyecto Discapacidad sin Barreras.
import 'package:flutter/material.dart';

class AppColors {
  // Paleta principal — verde salud/calma
  static const Color primary    = Color(0xFF728156);
  static const Color secondary  = Color(0xFF88976C);
  static const Color accent     = Color(0xFFB6C99C);
  static const Color cardLight  = Color(0xFFCFE1BB);
  static const Color background = Color(0xFFE8F4DC);

  // Textos
  static const Color textDark   = Color(0xFF2D3320);
  static const Color textMuted  = Color(0xFF5C6B47);
  static const Color textOnPrimary = Colors.white;

  // Estados de suscripción
  static const Color statusActive    = Color(0xFF388E3C);
  static const Color statusExpired   = Color(0xFFF57C00);
  static const Color statusCancelled = Color(0xFFD32F2F);
}

class AppTheme {
  static ThemeData get theme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.background,
      ),
      scaffoldBackgroundColor: AppColors.background,
      useMaterial3: true,

      // AppBar verde principal
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AppColors.textOnPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Botones grandes y fáciles de tocar (accesibilidad)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          elevation: 2,
        ),
      ),

      // Campos de texto claros
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.accent),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.accent),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        labelStyle: const TextStyle(color: AppColors.textMuted),
      ),

      // Tarjetas con bordes suaves
      cardTheme: CardThemeData(
        color: AppColors.cardLight,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
      ),
    );
  }
}
