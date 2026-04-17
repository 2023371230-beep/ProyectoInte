// Pantalla principal del cliente después de iniciar sesión.
// Auto-refresh: recarga datos al volver de cualquier sub-pantalla (Navigator.pop)
// y cuando la app regresa al primer plano (WidgetsBindingObserver).
import 'package:flutter/material.dart';
import '../models/suscripcion_model.dart';
import '../models/usuario_model.dart';
import '../services/auth_service.dart';
import '../services/suscripcion_service.dart';
import '../theme/app_theme.dart';
import '../utils/storage.dart';
import '../widgets/acceso_rapido_card.dart';
import '../widgets/suscripcion_card.dart';
import 'login_screen.dart';
import 'medicamentos_screen.dart';
import 'perfil_screen.dart';
import 'suscripcion_screen.dart';
import 'videos_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with WidgetsBindingObserver {
  final _suscripcionService = SuscripcionService();
  final _authService        = AuthService();

  UsuarioModel?     _usuario;
  SuscripcionModel? _suscripcion;
  bool   _cargando = true;
  String _error    = '';

  @override
  void initState() {
    super.initState();
    // Escucha cuando la app vuelve al primer plano para refrescar datos
    WidgetsBinding.instance.addObserver(this);
    _cargarDatos();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Recarga automática cuando la app vuelve del background
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _cargarDatos();
    }
  }

  Future<void> _cargarDatos() async {
    setState(() { _cargando = true; _error = ''; });
    try {
      final resultados = await Future.wait([
        AppStorage.obtenerUsuario(),
        _suscripcionService.getMiSuscripcion(),
      ]);

      final usuarioMap  = resultados[0] as Map<String, dynamic>?;
      final suscripcion = resultados[1] as SuscripcionModel;

      setState(() {
        _usuario     = usuarioMap != null ? UsuarioModel.fromJson(usuarioMap) : null;
        _suscripcion = suscripcion;
        _cargando    = false;
      });
    } catch (e) {
      setState(() {
        _error    = e.toString().replaceFirst('Exception: ', '');
        _cargando = false;
      });
    }
  }

  // Navega a una pantalla y recarga los datos al regresar
  void _irA(Widget pantalla) {
    Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => pantalla))
        .then((_) { if (mounted) _cargarDatos(); });
  }

  Future<void> _cerrarSesion() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Deseas salir de tu cuenta?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(
                foregroundColor: AppColors.statusCancelled),
            child: const Text('Salir'),
          ),
        ],
      ),
    );

    if (confirmar == true) {
      await _authService.logout();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Discapacidad sin Barreras'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: _cerrarSesion,
          ),
        ],
      ),
      body: _cargando
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _error.isNotEmpty
              ? _VistaError(mensaje: _error, onReintentar: _cargarDatos)
              : _Contenido(
                  usuario:     _usuario,
                  suscripcion: _suscripcion!,
                  onNavegar:   _irA,
                  onRefresh:   _cargarDatos,
                ),
    );
  }
}

// ─── Vista de error ────────────────────────────────────────────────────────
class _VistaError extends StatelessWidget {
  final String       mensaje;
  final VoidCallback onReintentar;
  const _VistaError({required this.mensaje, required this.onReintentar});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              mensaje.toLowerCase().contains('socket') ||
                      mensaje.toLowerCase().contains('connection') ||
                      mensaje.toLowerCase().contains('network')
                  ? Icons.wifi_off
                  : Icons.error_outline,
              size: 52,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: 16),
            Text(mensaje,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 14)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onReintentar,
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Contenido principal del dashboard ────────────────────────────────────
class _Contenido extends StatelessWidget {
  final UsuarioModel?    usuario;
  final SuscripcionModel suscripcion;
  final void Function(Widget) onNavegar;
  final Future<void> Function() onRefresh;

  const _Contenido({
    required this.usuario,
    required this.suscripcion,
    required this.onNavegar,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final nombre             = usuario?.nombre ?? 'Cliente';
    final primerNombre       = nombre.split(' ').first;
    final videosDesbloqueados = suscripcion.tieneAccesoVideos;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: onRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Saludo personalizado
            Text(
              'Hola, $primerNombre 👋',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Aquí está tu resumen de hoy.',
              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),

            const SizedBox(height: 24),

            // Tarjeta de suscripción
            SuscripcionCard(suscripcion: suscripcion),

            const SizedBox(height: 28),

            const Text(
              'Accesos rápidos',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 12),

            // Grid 2×2 de accesos rápidos
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                AccesoRapidoCard(
                  label: 'Medicamentos',
                  icon:  Icons.medication_outlined,
                  onTap: () => onNavegar(const MedicamentosScreen()),
                ),
                AccesoRapidoCard(
                  label:     'Videos',
                  icon:      Icons.play_circle_outline,
                  bloqueado: !videosDesbloqueados,
                  badge:     videosDesbloqueados ? 'Disponible' : 'Bloqueado',
                  onTap: () => onNavegar(
                      VideosScreen(suscripcion: suscripcion)),
                ),
                AccesoRapidoCard(
                  label: 'Mi Suscripción',
                  icon:  Icons.card_membership_outlined,
                  badge: suscripcion.plan == 'premium' ? 'Premium' : 'Estándar',
                  onTap: () => onNavegar(
                      SuscripcionScreen(suscripcionInicial: suscripcion)),
                ),
                AccesoRapidoCard(
                  label: 'Mi Perfil',
                  icon:  Icons.person_outline,
                  onTap: () => onNavegar(const PerfilScreen()),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Aviso de upgrade si el plan no es premium
            if (!videosDesbloqueados)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.statusExpired),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        color: AppColors.statusExpired, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        // Tap en el aviso también lleva a la pantalla de pago
                        onTap: () => onNavegar(
                            SuscripcionScreen(suscripcionInicial: suscripcion)),
                        child: const Text(
                          'Actualiza tu plan a Premium para desbloquear todos los videos de rehabilitación. Toca aquí.',
                          style: TextStyle(
                              fontSize: 13, color: Color(0xFF6D4C00)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
