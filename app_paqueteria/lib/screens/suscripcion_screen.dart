// Pantalla de suscripción con formulario de pago simulado con tarjeta bancaria.
//
// Flujo:
//   1. Usuario ve plan actual y beneficios
//   2. Presiona "Pagar con tarjeta" → aparece el formulario
//   3. Flutter valida número (16 dígitos), vencimiento (MM/AA vigente), CVV (3-4 dígitos)
//   4. Al confirmar, envía POST /api/pagos al backend con metodo='tarjeta_simulada'
//   5. El trigger trg_pago_exitoso de PostgreSQL actualiza la suscripción a premium
//   6. La app consulta /suscripciones/mia y muestra el mensaje de éxito
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/suscripcion_model.dart';
import '../services/pago_service.dart';
import '../services/suscripcion_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_button.dart';

class SuscripcionScreen extends StatefulWidget {
  final SuscripcionModel suscripcionInicial;
  const SuscripcionScreen({super.key, required this.suscripcionInicial});

  @override
  State<SuscripcionScreen> createState() => _SuscripcionScreenState();
}

class _SuscripcionScreenState extends State<SuscripcionScreen> {
  final _formKey  = GlobalKey<FormState>();
  final _numCtrl  = TextEditingController();
  final _nomCtrl  = TextEditingController();
  final _vencCtrl = TextEditingController();
  final _cvvCtrl  = TextEditingController();

  final _pagoService        = PagoService();
  final _suscripcionService = SuscripcionService();

  late SuscripcionModel _suscripcion;
  bool   _mostrandoFormulario = false;
  bool   _procesando          = false;
  bool   _exito               = false;
  String _error               = '';

  @override
  void initState() {
    super.initState();
    _suscripcion = widget.suscripcionInicial;
    // Rebuild al escribir para actualizar la vista previa de la tarjeta
    _numCtrl.addListener(()  => setState((){}));
    _nomCtrl.addListener(()  => setState((){}));
    _vencCtrl.addListener(() => setState((){}));
  }

  @override
  void dispose() {
    _numCtrl.dispose();
    _nomCtrl.dispose();
    _vencCtrl.dispose();
    _cvvCtrl.dispose();
    super.dispose();
  }

  bool _expiryValida(String val) {
    if (!RegExp(r'^\d{2}/\d{2}$').hasMatch(val)) return false;
    final parts = val.split('/');
    final month = int.tryParse(parts[0]) ?? 0;
    final year  = int.tryParse('20${parts[1]}') ?? 0;
    if (month < 1 || month > 12) return false;
    final now = DateTime.now();
    if (year < now.year) return false;
    if (year == now.year && month < now.month) return false;
    return true;
  }

  Future<void> _pagar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _procesando = true; _error = ''; });
    try {
      await _pagoService.simularPago(monto: 199);
      final nueva = await _suscripcionService.getMiSuscripcion();
      if (!mounted) return;
      setState(() {
        _suscripcion         = nueva;
        _procesando          = false;
        _exito               = true;
        _mostrandoFormulario = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error     = e.toString().replaceFirst('Exception: ', '');
        _procesando = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final esPremium = _suscripcion.plan == 'premium';
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Mi Suscripción')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            _TarjetaPlanActual(suscripcion: _suscripcion),
            const SizedBox(height: 24),

            // Mensaje de éxito tras pago
            if (_exito)
              _MensajeExito(
                diasRestantes: _suscripcion.diasRestantes,
                onContinuar:   () => Navigator.of(context).pop(),
              ),

            // Banner de error
            if (_error.isNotEmpty && !_exito)
              _CajaError(mensaje: _error),

            // Sección upgrade (solo si no es premium y no hubo éxito)
            if (!esPremium && !_exito) ...[
              if (!_mostrandoFormulario)
                _SeccionUpgrade(
                  onPagar: () => setState(() { _mostrandoFormulario = true; _error = ''; }),
                )
              else
                _FormularioPago(
                  formKey:       _formKey,
                  numCtrl:       _numCtrl,
                  nomCtrl:       _nomCtrl,
                  vencCtrl:      _vencCtrl,
                  cvvCtrl:       _cvvCtrl,
                  procesando:    _procesando,
                  validarExpiry: _expiryValida,
                  onPagar:       _pagar,
                  onCancelar:    () => setState(() {
                    _mostrandoFormulario = false;
                    _error = '';
                  }),
                ),
            ],

            // Beneficios activos para usuarios premium
            if (esPremium && !_exito) ...[
              const Text(
                'Beneficios activos',
                style: TextStyle(
                    fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark),
              ),
              const SizedBox(height: 12),
              const _ListaBeneficios(activos: true),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Vista previa visual de la tarjeta bancaria ────────────────────────────
class _VistaPreviewTarjeta extends StatelessWidget {
  final String numero;
  final String titular;
  final String vencimiento;

  const _VistaPreviewTarjeta({
    required this.numero,
    required this.titular,
    required this.vencimiento,
  });

  String _tipoTarjeta() {
    final d = numero.replaceAll(' ', '');
    if (d.startsWith('4')) return 'VISA';
    if (d.startsWith('5')) return 'MASTERCARD';
    return 'TARJETA';
  }

  @override
  Widget build(BuildContext context) {
    // Convierte los dígitos ingresados en grupos de 4 con •• donde faltan
    final digits = numero.replaceAll(' ', '');
    final partes = <String>[];
    for (int i = 0; i < 4; i++) {
      final s = i * 4;
      final e = s + 4;
      if (s >= digits.length) {
        partes.add('••••');
      } else if (e > digits.length) {
        partes.add(digits.substring(s) + '•' * (e - digits.length));
      } else {
        partes.add(digits.substring(s, e));
      }
    }

    return Container(
      width: double.infinity,
      height: 192,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF728156), Color(0xFF4A5A35)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF728156).withValues(alpha: 0.45),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Círculos decorativos de fondo
          Positioned(
            right: -30, top: -30,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
          ),
          Positioned(
            right: 30, bottom: -50,
            child: Container(
              width: 130, height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Discapacidad sin Barreras',
                      style: TextStyle(color: Colors.white60, fontSize: 11),
                    ),
                    Text(
                      _tipoTarjeta(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Text(
                  partes.join('  '),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 3,
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TITULAR',
                            style: TextStyle(
                                color: Colors.white54, fontSize: 9, letterSpacing: 1)),
                        const SizedBox(height: 3),
                        Text(
                          titular.trim().isNotEmpty
                              ? titular.toUpperCase()
                              : 'NOMBRE APELLIDO',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('VENCE',
                            style: TextStyle(
                                color: Colors.white54, fontSize: 9, letterSpacing: 1)),
                        const SizedBox(height: 3),
                        Text(
                          vencimiento.isNotEmpty ? vencimiento : '••/••',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Formulario de pago con validación ────────────────────────────────────
class _FormularioPago extends StatelessWidget {
  final GlobalKey<FormState>  formKey;
  final TextEditingController numCtrl;
  final TextEditingController nomCtrl;
  final TextEditingController vencCtrl;
  final TextEditingController cvvCtrl;
  final bool                  procesando;
  final bool Function(String) validarExpiry;
  final VoidCallback          onPagar;
  final VoidCallback          onCancelar;

  const _FormularioPago({
    required this.formKey,
    required this.numCtrl,
    required this.nomCtrl,
    required this.vencCtrl,
    required this.cvvCtrl,
    required this.procesando,
    required this.validarExpiry,
    required this.onPagar,
    required this.onCancelar,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tarjeta visual que se actualiza al escribir
        _VistaPreviewTarjeta(
          numero:      numCtrl.text,
          titular:     nomCtrl.text,
          vencimiento: vencCtrl.text,
        ),
        const SizedBox(height: 24),

        const Text(
          'Datos de la tarjeta',
          style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark),
        ),
        const SizedBox(height: 14),

        Form(
          key: formKey,
          child: Column(
            children: [
              // Número de tarjeta
              TextFormField(
                controller:   numCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: [_CardNumberFormatter()],
                maxLength: 19, // 16 dígitos + 3 espacios
                decoration: const InputDecoration(
                  labelText:   'Número de tarjeta',
                  hintText:    '0000 0000 0000 0000',
                  prefixIcon:  Icon(Icons.credit_card, color: AppColors.primary),
                  counterText: '',
                ),
                validator: (v) {
                  final d = (v ?? '').replaceAll(' ', '');
                  if (d.length != 16) return 'El número debe tener 16 dígitos.';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              // Nombre del titular
              TextFormField(
                controller:         nomCtrl,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  labelText:  'Nombre del titular',
                  hintText:   'Como aparece en la tarjeta',
                  prefixIcon: Icon(Icons.person_outline, color: AppColors.primary),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Ingresa el nombre del titular.'
                    : null,
              ),
              const SizedBox(height: 14),

              // Vencimiento y CVV en la misma fila
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller:   vencCtrl,
                      keyboardType: TextInputType.number,
                      inputFormatters: [_ExpiryFormatter()],
                      maxLength: 5,
                      decoration: const InputDecoration(
                        labelText:   'Vencimiento',
                        hintText:    'MM/AA',
                        prefixIcon:  Icon(Icons.calendar_today_outlined,
                            color: AppColors.primary),
                        counterText: '',
                      ),
                      validator: (v) => validarExpiry(v ?? '')
                          ? null
                          : 'Fecha inválida o vencida.',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller:   cvvCtrl,
                      keyboardType: TextInputType.number,
                      obscureText:  true,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(4),
                      ],
                      decoration: const InputDecoration(
                        labelText:   'CVV',
                        hintText:    '•••',
                        prefixIcon:  Icon(Icons.lock_outline, color: AppColors.primary),
                        counterText: '',
                      ),
                      validator: (v) {
                        final len = (v ?? '').length;
                        if (len < 3 || len > 4) return 'CVV inválido.';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Resumen del precio
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Plan Premium — 30 días',
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.textDark,
                              fontSize: 14),
                        ),
                        Text(
                          'Acceso completo a videos',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                    Text(
                      '\$199',
                      style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              AppButton(
                label:     'Confirmar pago',
                icon:      Icons.lock,
                onPressed: onPagar,
                isLoading: procesando,
              ),
              const SizedBox(height: 10),

              Center(
                child: TextButton(
                  onPressed: procesando ? null : onCancelar,
                  child: const Text('Cancelar',
                      style: TextStyle(color: AppColors.textMuted)),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.lock, size: 12, color: AppColors.textMuted),
                    SizedBox(width: 4),
                    Text(
                      'Pago seguro con encriptación SSL',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Sección de overview de upgrade (antes del formulario) ────────────────
class _SeccionUpgrade extends StatelessWidget {
  final VoidCallback onPagar;
  const _SeccionUpgrade({required this.onPagar});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Actualizar a Premium',
          style: TextStyle(
              fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark),
        ),
        const SizedBox(height: 12),
        const _ListaBeneficios(),
        const SizedBox(height: 20),
        // Precio del plan
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.accent),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plan Premium',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: AppColors.textDark),
                  ),
                  SizedBox(height: 2),
                  Text(
                    '30 días · Acceso completo a videos',
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
              Text(
                '\$199',
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        AppButton(
          label:     'Pagar con tarjeta',
          icon:      Icons.credit_card,
          onPressed: onPagar,
        ),
      ],
    );
  }
}

// ─── Tarjeta del plan actual (encabezado de la pantalla) ──────────────────
class _TarjetaPlanActual extends StatelessWidget {
  final SuscripcionModel suscripcion;
  const _TarjetaPlanActual({required this.suscripcion});

  String _formatFecha(DateTime fecha) {
    const meses = ['ene','feb','mar','abr','may','jun',
                   'jul','ago','sep','oct','nov','dic'];
    return '${fecha.day} ${meses[fecha.month - 1]} ${fecha.year}';
  }

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
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(esPremium ? Icons.star : Icons.card_membership,
                  color: Colors.white, size: 24),
              const SizedBox(width: 8),
              Text(
                esPremium ? 'Plan Premium' : 'Plan Estándar',
                style: const TextStyle(
                    color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _BadgeEstado(estado: suscripcion.estado),
          const SizedBox(height: 10),
          Text(
            esPremium
                ? 'Tienes acceso completo a todos los videos de rehabilitación.'
                : 'Actualiza a Premium para desbloquear los videos.',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 6),
          Text(
            'Activo desde: ${_formatFecha(suscripcion.fechaInicio)}',
            style: const TextStyle(color: Colors.white54, fontSize: 11),
          ),
          if (esPremium && suscripcion.fechaFin != null)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                'Vence: ${_formatFecha(suscripcion.fechaFin!)}',
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ),
        ],
      ),
    );
  }
}

class _BadgeEstado extends StatelessWidget {
  final String estado;
  const _BadgeEstado({required this.estado});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (estado) {
      case 'activa':  color = AppColors.statusActive;    break;
      case 'vencida': color = AppColors.statusExpired;   break;
      default:        color = AppColors.statusCancelled; break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        estado[0].toUpperCase() + estado.substring(1),
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}

// ─── Lista de beneficios del plan premium ─────────────────────────────────
class _ListaBeneficios extends StatelessWidget {
  final bool activos;
  const _ListaBeneficios({this.activos = false});

  static const _beneficios = [
    (Icons.play_circle_outline, 'Acceso a todos los videos de rehabilitación'),
    (Icons.hd,                  'Videos en alta calidad'),
    (Icons.category_outlined,   'Filtro por categorías de rehabilitación'),
    (Icons.medication_outlined, 'Catálogo completo de medicamentos'),
    (Icons.support_agent,       'Soporte prioritario'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _beneficios.map((b) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: activos
                      ? AppColors.primary.withValues(alpha: 0.12)
                      : AppColors.cardLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(b.$1,
                    size: 20,
                    color: activos ? AppColors.primary : AppColors.secondary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(b.$2,
                    style: const TextStyle(fontSize: 14, color: AppColors.textDark)),
              ),
              if (activos)
                const Icon(Icons.check_circle, color: AppColors.statusActive, size: 18),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// ─── Mensaje de éxito tras pago exitoso ───────────────────────────────────
class _MensajeExito extends StatelessWidget {
  final int?         diasRestantes;
  final VoidCallback onContinuar;
  const _MensajeExito({required this.diasRestantes, required this.onContinuar});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.statusActive),
      ),
      child: Column(
        children: [
          const Icon(Icons.check_circle, size: 56, color: AppColors.statusActive),
          const SizedBox(height: 12),
          const Text(
            '¡Pago exitoso!',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.statusActive),
          ),
          const SizedBox(height: 8),
          Text(
            diasRestantes != null
                ? 'Tu suscripción Premium está activa por $diasRestantes días más.'
                : 'Tu suscripción ha sido actualizada a Premium.',
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 13, color: AppColors.textMuted, height: 1.5),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: onContinuar,
            icon: const Icon(Icons.home_outlined),
            label: const Text('Volver al inicio'),
          ),
        ],
      ),
    );
  }
}

// ─── Banner de error ───────────────────────────────────────────────────────
class _CajaError extends StatelessWidget {
  final String mensaje;
  const _CajaError({required this.mensaje});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEBEE),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.statusCancelled),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline,
              color: AppColors.statusCancelled, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(mensaje,
                style: const TextStyle(
                    color: AppColors.statusCancelled, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

// ─── Formateador para número de tarjeta (grupos de 4) ─────────────────────
class _CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits  = newValue.text.replaceAll(RegExp(r'\D'), '');
    final limited = digits.length > 16 ? digits.substring(0, 16) : digits;
    final buffer  = StringBuffer();
    for (int i = 0; i < limited.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(limited[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text:      formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

// ─── Formateador para fecha de vencimiento (MM/AA) ────────────────────────
class _ExpiryFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits  = newValue.text.replaceAll(RegExp(r'\D'), '');
    final limited = digits.length > 4 ? digits.substring(0, 4) : digits;
    final buffer  = StringBuffer();
    for (int i = 0; i < limited.length; i++) {
      if (i == 2) buffer.write('/');
      buffer.write(limited[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text:      formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
