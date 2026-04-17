// Pantalla de medicamentos del cliente.
// Muestra SOLO los medicamentos asignados a este usuario por el administrador.
// Los medicamentos se agrupan por frecuencia de toma para facilitar el seguimiento.
// El pull-to-refresh y la recarga al volver a la pantalla mantienen los datos actualizados.
import 'package:flutter/material.dart';
import '../models/medicamento_model.dart';
import '../services/medicamento_service.dart';
import '../theme/app_theme.dart';

class MedicamentosScreen extends StatefulWidget {
  const MedicamentosScreen({super.key});

  @override
  State<MedicamentosScreen> createState() => _MedicamentosScreenState();
}

class _MedicamentosScreenState extends State<MedicamentosScreen> {
  final _service      = MedicamentoService();
  final _busquedaCtrl = TextEditingController();

  List<MedicamentoModel> _todos     = [];
  List<MedicamentoModel> _filtrados = [];
  bool   _cargando = true;
  String _error    = '';

  @override
  void initState() {
    super.initState();
    _cargar();
    _busquedaCtrl.addListener(_filtrar);
  }

  @override
  void dispose() {
    _busquedaCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _error = ''; });
    try {
      final datos = await _service.getMedicamentos();
      setState(() {
        _todos     = datos;
        _filtrados = datos;
        _cargando  = false;
      });
    } catch (e) {
      setState(() {
        _error    = e.toString().replaceFirst('Exception: ', '');
        _cargando = false;
      });
    }
  }

  void _filtrar() {
    final query = _busquedaCtrl.text.toLowerCase();
    setState(() {
      _filtrados = _todos.where((m) =>
        m.nombre.toLowerCase().contains(query) ||
        m.descripcion.toLowerCase().contains(query) ||
        m.frecuencia.toLowerCase().contains(query)
      ).toList();
    });
  }

  // Agrupa los medicamentos por frecuencia, ordenando los grupos más comunes primero
  Map<String, List<MedicamentoModel>> _agrupar(List<MedicamentoModel> items) {
    final grupos = <String, List<MedicamentoModel>>{};
    for (final m in items) {
      grupos.putIfAbsent(m.frecuencia, () => []).add(m);
    }
    return grupos;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Mis Medicamentos')),
      body: _cargando
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error.isNotEmpty
              ? _VistaError(mensaje: _error, onReintentar: _cargar)
              : Column(
                  children: [
                    // ── Buscador ──────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: TextField(
                        controller: _busquedaCtrl,
                        decoration: InputDecoration(
                          hintText: 'Buscar medicamento o frecuencia...',
                          prefixIcon:
                              const Icon(Icons.search, color: AppColors.primary),
                          suffixIcon: _busquedaCtrl.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear,
                                      color: AppColors.textMuted),
                                  onPressed: () => _busquedaCtrl.clear(),
                                )
                              : null,
                        ),
                      ),
                    ),

                    // ── Contador ──────────────────────────────────────
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 2),
                      child: Row(
                        children: [
                          Text(
                            '${_filtrados.length} medicamento${_filtrados.length != 1 ? 's' : ''} asignado${_filtrados.length != 1 ? 's' : ''}',
                            style: const TextStyle(
                                fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),

                    // ── Lista agrupada ────────────────────────────────
                    Expanded(
                      child: _filtrados.isEmpty
                          ? _VistaVacia(
                              busquedaActiva: _busquedaCtrl.text.isNotEmpty)
                          : RefreshIndicator(
                              color: AppColors.primary,
                              onRefresh: _cargar,
                              child: _ListaAgrupada(
                                grupos:   _agrupar(_filtrados),
                                onRefresh: _cargar,
                              ),
                            ),
                    ),
                  ],
                ),
    );
  }
}

// ─── Lista agrupada por frecuencia ────────────────────────────────────────
class _ListaAgrupada extends StatelessWidget {
  final Map<String, List<MedicamentoModel>> grupos;
  final Future<void> Function() onRefresh;

  const _ListaAgrupada({required this.grupos, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    // Construye una lista plana: [header, card, card, header, card, ...]
    final items = <Widget>[];
    grupos.forEach((frecuencia, meds) {
      items.add(_EncabezadoGrupo(frecuencia: frecuencia, cantidad: meds.length));
      for (final med in meds) {
        items.add(_TarjetaMedicamento(medicamento: med));
      }
    });

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
      itemCount: items.length,
      itemBuilder: (_, i) => items[i],
    );
  }
}

// ─── Encabezado de sección por frecuencia ────────────────────────────────
class _EncabezadoGrupo extends StatelessWidget {
  final String frecuencia;
  final int    cantidad;
  const _EncabezadoGrupo({required this.frecuencia, required this.cantidad});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 18, bottom: 8),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 18,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              frecuencia,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
                letterSpacing: 0.3,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$cantidad',
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Tarjeta de medicamento ───────────────────────────────────────────────
class _TarjetaMedicamento extends StatelessWidget {
  final MedicamentoModel medicamento;
  const _TarjetaMedicamento({required this.medicamento});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ícono de medicamento
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.secondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.medication,
                  color: Colors.white, size: 26),
            ),
            const SizedBox(width: 14),

            // Datos del medicamento
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    medicamento.nombre,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  if (medicamento.descripcion.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      medicamento.descripcion,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textMuted, height: 1.3),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 12),

                  // Chips de prescripción
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _Chip(
                        icon:  Icons.scale_outlined,
                        label: medicamento.dosis,
                        color: AppColors.primary,
                      ),
                      if (medicamento.horaInicio != null)
                        _Chip(
                          icon:  Icons.alarm_outlined,
                          label: 'Desde las ${medicamento.horaInicio}',
                          color: AppColors.secondary,
                        ),
                    ],
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

// ─── Chip de dato de prescripción ─────────────────────────────────────────
class _Chip extends StatelessWidget {
  final IconData icon;
  final String   label;
  final Color    color;
  const _Chip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
                fontSize: 12, color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

// ─── Vista vacía ──────────────────────────────────────────────────────────
class _VistaVacia extends StatelessWidget {
  final bool busquedaActiva;
  const _VistaVacia({required this.busquedaActiva});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const DecoratedBox(
              decoration: BoxDecoration(
                color: AppColors.cardLight,
                shape: BoxShape.circle,
              ),
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Icon(Icons.medication_outlined,
                    size: 48, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              busquedaActiva
                  ? 'Sin resultados para esa búsqueda.'
                  : 'Aún no tienes medicamentos asignados.',
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark),
              textAlign: TextAlign.center,
            ),
            if (!busquedaActiva) ...[
              const SizedBox(height: 8),
              const Text(
                'El administrador te asignará los medicamentos correspondientes a tu tratamiento.',
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
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
