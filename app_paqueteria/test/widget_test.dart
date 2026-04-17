// Test de humo — verifica que la app arranca sin errores de compilación.
// La app usa shared_preferences para verificar sesión, por eso se inicializan
// valores vacíos antes de correr el widget. No se prueban redes ni base de datos.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:discapacidad_sin_barreras/main.dart';

void main() {
  testWidgets('App arranca y muestra pantalla de carga o login',
      (WidgetTester tester) async {
    // Simula shared_preferences vacío (sin sesión guardada)
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const DiscapacidadApp());

    // Mientras FutureBuilder verifica la sesión aparece el indicador de carga
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
