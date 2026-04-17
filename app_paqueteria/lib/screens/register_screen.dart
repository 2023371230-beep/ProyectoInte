// Pantalla de registro de nuevo cliente.
// Llama a POST /api/auth/register y redirige al dashboard si tiene éxito.
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_button.dart';
import 'dashboard_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey       = GlobalKey<FormState>();
  final _nombreCtrl    = TextEditingController();
  final _emailCtrl     = TextEditingController();
  final _passCtrl      = TextEditingController();
  final _diagCtrl      = TextEditingController();
  final _telCtrl       = TextEditingController();
  final _authService   = AuthService();

  bool   _cargando     = false;
  bool   _verPassword  = false;
  String _errorMensaje = '';

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _diagCtrl.dispose();
    _telCtrl.dispose();
    super.dispose();
  }

  Future<void> _registrar() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() { _cargando = true; _errorMensaje = ''; });

    try {
      await _authService.register(
        nombre:      _nombreCtrl.text.trim(),
        email:       _emailCtrl.text.trim(),
        password:    _passCtrl.text,
        diagnostico: _diagCtrl.text.trim(),
        telefono:    _telCtrl.text.trim(),
      );

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    } catch (e) {
      setState(() {
        _errorMensaje = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Crear cuenta'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Completa tus datos',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Se creará tu cuenta con plan Estándar.',
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),

                const SizedBox(height: 28),

                // Nombre completo
                TextFormField(
                  controller: _nombreCtrl,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Nombre completo',
                    prefixIcon: Icon(Icons.person_outline, color: AppColors.primary),
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Ingresa tu nombre.' : null,
                ),

                const SizedBox(height: 14),

                // Correo
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Correo electrónico',
                    prefixIcon: Icon(Icons.email_outlined, color: AppColors.primary),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Ingresa tu correo.';
                    if (!v.contains('@')) return 'Correo no válido.';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Contraseña
                TextFormField(
                  controller: _passCtrl,
                  obscureText: !_verPassword,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primary),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _verPassword ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.textMuted,
                      ),
                      onPressed: () => setState(() => _verPassword = !_verPassword),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Ingresa una contraseña.';
                    if (v.length < 6) return 'Mínimo 6 caracteres.';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                // Diagnóstico (opcional)
                TextFormField(
                  controller: _diagCtrl,
                  textInputAction: TextInputAction.next,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Diagnóstico (opcional)',
                    prefixIcon: Icon(Icons.medical_information_outlined,
                        color: AppColors.primary),
                    alignLabelWithHint: true,
                  ),
                ),

                const SizedBox(height: 14),

                // Teléfono (opcional)
                TextFormField(
                  controller: _telCtrl,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _registrar(),
                  decoration: const InputDecoration(
                    labelText: 'Teléfono (opcional)',
                    prefixIcon: Icon(Icons.phone_outlined, color: AppColors.primary),
                  ),
                ),

                const SizedBox(height: 24),

                // Error
                if (_errorMensaje.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.statusCancelled),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline,
                            color: AppColors.statusCancelled, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMensaje,
                            style: const TextStyle(
                                color: AppColors.statusCancelled, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                AppButton(
                  label: 'Crear cuenta',
                  onPressed: _registrar,
                  isLoading: _cargando,
                  icon: Icons.person_add_outlined,
                ),

                const SizedBox(height: 16),

                // Volver al login
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: const Text(
                      '¿Ya tienes cuenta? Inicia sesión',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
