// Pantalla de inicio de sesión.
// Llama al backend via AuthService y guarda el token localmente.
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_button.dart';
import 'dashboard_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey     = GlobalKey<FormState>();
  final _emailCtrl   = TextEditingController();
  final _passCtrl    = TextEditingController();
  final _authService = AuthService();

  bool   _cargando     = false;
  bool   _verPassword  = false;
  String _errorMensaje = '';

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _iniciarSesion() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _cargando     = true;
      _errorMensaje = '';
    });

    try {
      await _authService.login(_emailCtrl.text.trim(), _passCtrl.text);

      if (!mounted) return;
      // Reemplaza login con dashboard — no se puede volver atrás con el botón de retroceso
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 40),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 20),

                // Logo oficial de la empresa
                Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.18),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(10),
                  child: Image.asset(
                    'assets/logo.png',
                    fit: BoxFit.contain,
                  ),
                ),

                const SizedBox(height: 20),

                const Text(
                  'Discapacidad\nsin Barreras',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                    height: 1.2,
                  ),
                ),

                const SizedBox(height: 8),
                const Text(
                  'Inicia sesión para continuar',
                  style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                ),

                const SizedBox(height: 40),

                // Email
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

                const SizedBox(height: 16),

                // Contraseña
                TextFormField(
                  controller: _passCtrl,
                  obscureText: !_verPassword,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _iniciarSesion(),
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
                    if (v == null || v.isEmpty) return 'Ingresa tu contraseña.';
                    return null;
                  },
                ),

                const SizedBox(height: 24),

                // Error del servidor
                if (_errorMensaje.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
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

                if (_errorMensaje.isNotEmpty) const SizedBox(height: 16),

                AppButton(
                  label: 'Ingresar',
                  onPressed: _iniciarSesion,
                  isLoading: _cargando,
                  icon: Icons.login,
                ),

                const SizedBox(height: 24),

                // Enlace a registro
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      '¿No tienes cuenta? ',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const RegisterScreen()),
                      ),
                      child: const Text(
                        'Regístrate',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
