// Pantalla de perfil del cliente autenticado.
// Muestra nombre, email, diagnóstico, estado de suscripción y acceso rápido a upgradle.
// Se recarga automáticamente al enfocar la pantalla (didChangeDependencies).
import 'package:flutter/material.dart';
import '../models/suscripcion_model.dart';
import '../services/perfil_service.dart';
import '../services/suscripcion_service.dart';
import '../theme/app_theme.dart';
import 'suscripcion_screen.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  final _perfilService      = PerfilService();
  final _suscripcionService = SuscripcionService();

  Map<String, dynamic>? _perfil;
  SuscripcionModel?     _suscripcion;
  bool   _cargando = true;
  String _error    = '';

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _error = ''; });
    try {
      final resultados = await Future.wait([
        _perfilService.getMiPerfil(),
        _suscripcionService.getMiSuscripcion(),
      ]);
      setState(() {
        _perfil      = resultados[0] as Map<String, dynamic>;
        _suscripcion = resultados[1] as SuscripcionModel;
        _cargando    = false;
      });
    } catch (e) {
      setState(() {
        _error    = e.toString().replaceFirst('Exception: ', '');
        _cargando = false;
      });
    }
  }

  void _irASuscripcion() {
    Navigator.of(context)
        .push(MaterialPageRoute(
          builder: (_) => SuscripcionScreen(suscripcionInicial: _suscripcion!),
        ))
        // Recarga el perfil cuando el usuario regresa de la pantalla de pago
        .then((_) { if (mounted) _cargar(); });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Mi Perfil')),
      body: _cargando
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error.isNotEmpty
              ? _VistaError(mensaje: _error, onReintentar: _cargar)
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _cargar,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _AvatarUsuario(nombre: _perfil!['nombre'] ?? ''),
                        const SizedBox(height: 24),
                        _TarjetaInformacion(perfil: _perfil!),
                        const SizedBox(height: 16),
                        _TarjetaSuscripcion(
                          suscripcion: _suscripcion!,
                          onActualizar: _suscripcion!.plan != 'premium'
                              ? _irASuscripcion
                              : null,
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
    );
  }
}

// ─── Avatar circular con iniciales ────────────────────────────────────────
class _AvatarUsuario extends StatelessWidget {
  final String nombre;
  const _AvatarUsuario({required this.nombre});

  String get _iniciales {
    final partes = nombre.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (partes.isEmpty) return '?';
    if (partes.length == 1) return partes[0][0].toUpperCase();
    return '${partes[0][0]}${partes[1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.secondary],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.35),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Center(
            child: Text(
              _iniciales,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
        Text(
          nombre,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        const Text(
          'Cliente registrado',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      ],
    );
  }
}

// ─── Tarjeta de información personal ─────────────────────────────────────
class _TarjetaInformacion extends StatelessWidget {
  final Map<String, dynamic> perfil;
  const _TarjetaInformacion({required this.perfil});

  @override
  Widget build(BuildContext context) {
    final diagnostico = (perfil['diagnostico'] as String?)?.trim() ?? '';
    final telefono    = (perfil['telefono']    as String?)?.trim() ?? '';
    final email       = (perfil['email']       as String?) ?? '';

    return _Tarjeta(
      titulo: 'Información personal',
      icono:  Icons.person_outline,
      hijos: [
        _FilaDato(icono: Icons.email_outlined, etiqueta: 'Correo', valor: email),
        if (telefono.isNotEmpty)
          _FilaDato(
              icono: Icons.phone_outlined,
              etiqueta: 'Teléfono',
              valor: telefono),
        if (diagnostico.isNotEmpty)
          _FilaDato(
            icono:    Icons.medical_information_outlined,
            etiqueta: 'Diagnóstico',
            valor:    diagnostico,
            multilinea: true,
          ),
        if (diagnostico.isEmpty)
          _FilaDato(
            icono:    Icons.medical_information_outlined,
            etiqueta: 'Diagnóstico',
            valor:    'No especificado',
          ),
      ],
    );
  }
}

// ─── Tarjeta de estado de suscripción ────────────────────────────────────
class _TarjetaSuscripcion extends StatelessWidget {
  final SuscripcionModel suscripcion;
  final VoidCallback?    onActualizar;
  const _TarjetaSuscripcion({required this.suscripcion, this.onActualizar});

  String _formatFecha(DateTime f) {
    const m = ['ene','feb','mar','abr','may','jun',
                'jul','ago','sep','oct','nov','dic'];
    return '${f.day} ${m[f.month - 1]} ${f.year}';
  }

  @override
  Widget build(BuildContext context) {
    final esPremium   = suscripcion.plan == 'premium';
    final diasRest    = suscripcion.diasRestantes;

    return _Tarjeta(
      titulo: 'Mi suscripción',
      icono:  Icons.card_membership_outlined,
      hijos: [
        _FilaDato(
          icono:    esPremium ? Icons.star : Icons.star_border,
          etiqueta: 'Plan actual',
          valor:    esPremium ? 'Premium' : 'Estándar',
          colorValor: esPremium ? AppColors.primary : AppColors.textMuted,
        ),
        _FilaDato(
          icono:    Icons.circle,
          etiqueta: 'Estado',
          valor:    suscripcion.estado[0].toUpperCase() +
              suscripcion.estado.substring(1),
          colorValor: suscripcion.estado == 'activa'
              ? AppColors.statusActive
              : AppColors.statusExpired,
        ),
        _FilaDato(
          icono:    Icons.calendar_today_outlined,
          etiqueta: 'Inicio',
          valor:    _formatFecha(suscripcion.fechaInicio),
        ),
        if (esPremium && suscripcion.fechaFin != null)
          _FilaDato(
            icono:    Icons.event_outlined,
            etiqueta: 'Vence',
            valor:    _formatFecha(suscripcion.fechaFin!),
          ),
        if (esPremium && diasRest != null)
          _FilaDato(
            icono:    Icons.timer_outlined,
            etiqueta: 'Días restantes',
            valor:    '$diasRest días',
            colorValor: diasRest < 7 ? AppColors.statusExpired : AppColors.statusActive,
          ),
        // Botón de upgrade si no es premium
        if (onActualizar != null) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onActualizar,
              icon:  const Icon(Icons.upgrade),
              label: const Text('Actualizar a Premium'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// ─── Contenedor de tarjeta reutilizable ──────────────────────────────────
class _Tarjeta extends StatelessWidget {
  final String      titulo;
  final IconData    icono;
  final List<Widget> hijos;
  const _Tarjeta({required this.titulo, required this.icono, required this.hijos});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icono, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                titulo,
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1),
          const SizedBox(height: 12),
          ...hijos,
        ],
      ),
    );
  }
}

// ─── Fila de dato individual ──────────────────────────────────────────────
class _FilaDato extends StatelessWidget {
  final IconData icono;
  final String   etiqueta;
  final String   valor;
  final Color?   colorValor;
  final bool     multilinea;

  const _FilaDato({
    required this.icono,
    required this.etiqueta,
    required this.valor,
    this.colorValor,
    this.multilinea = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment:
            multilinea ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          Icon(icono, size: 16, color: AppColors.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(etiqueta,
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(
                  valor,
                  style: TextStyle(
                      fontSize: 14,
                      color: colorValor ?? AppColors.textDark,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Vista de error ───────────────────────────────────────────────────────
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
            const Icon(Icons.error_outline, size: 52, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(mensaje,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 14)),
            const SizedBox(height: 20),
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
