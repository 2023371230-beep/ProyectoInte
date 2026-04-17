// Punto de entrada de la app Discapacidad sin Barreras.
// Al iniciar verifica si hay sesión guardada para no pedir login cada vez.
import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';
import 'utils/storage.dart';

void main() {
  runApp(const DiscapacidadApp());
}

class DiscapacidadApp extends StatelessWidget {
  const DiscapacidadApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Discapacidad sin Barreras',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      // Decide la pantalla inicial según si ya hay sesión guardada
      home: FutureBuilder<bool>(
        future: AppStorage.haySesion(),
        builder: (context, snapshot) {
          // Pantalla de carga mientras se verifica la sesión
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              backgroundColor: AppColors.background,
              body: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            );
          }

          final haySesion = snapshot.data ?? false;
          return haySesion ? const DashboardScreen() : const LoginScreen();
        },
      ),
    );
  }
}
