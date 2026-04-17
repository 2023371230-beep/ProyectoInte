// Pantalla de videos de rehabilitación.
// Solo accesible con plan Premium activo.
// Muestra thumbnails de YouTube y abre el video al tocar.
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/suscripcion_model.dart';
import '../models/video_model.dart';
import '../services/video_service.dart';
import '../theme/app_theme.dart';

class VideosScreen extends StatefulWidget {
  final SuscripcionModel suscripcion;

  const VideosScreen({super.key, required this.suscripcion});

  @override
  State<VideosScreen> createState() => _VideosScreenState();
}

class _VideosScreenState extends State<VideosScreen> {
  final _service = VideoService();

  List<VideoModel> _todos      = [];
  List<VideoModel> _filtrados  = [];
  List<String>     _categorias = [];
  String           _categoriaSeleccionada = 'Todas';
  bool   _cargando = true;
  String _error    = '';

  @override
  void initState() {
    super.initState();
    // Si el usuario no tiene acceso, no hace la petición al servidor
    if (widget.suscripcion.tieneAccesoVideos) {
      _cargar();
    } else {
      setState(() => _cargando = false);
    }
  }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _error = ''; });
    try {
      final datos = await _service.getVideos();
      // Extrae las categorías únicas para el filtro
      final cats = datos.map((v) => v.categoria).toSet().toList()..sort();
      setState(() {
        _todos      = datos;
        _filtrados  = datos;
        _categorias = cats;
        _cargando   = false;
      });
    } catch (e) {
      setState(() {
        _error   = e.toString().replaceFirst('Exception: ', '');
        _cargando = false;
      });
    }
  }

  void _filtrarPorCategoria(String categoria) {
    setState(() {
      _categoriaSeleccionada = categoria;
      _filtrados = categoria == 'Todas'
          ? _todos
          : _todos.where((v) => v.categoria == categoria).toList();
    });
  }

  // Abre el video en la app de YouTube o en el navegador
  Future<void> _abrirVideo(VideoModel video) async {
    final uri = Uri.parse(video.youtubeUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo abrir el video.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Videos de Rehabilitación')),
      body: !widget.suscripcion.tieneAccesoVideos
          ? _VistaBloqueada(suscripcion: widget.suscripcion)
          : _cargando
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : _error.isNotEmpty
                  ? _VistaError(mensaje: _error, onReintentar: _cargar)
                  : _Contenido(
                      filtrados:             _filtrados,
                      categorias:            _categorias,
                      categoriaSeleccionada: _categoriaSeleccionada,
                      onCategoria:           _filtrarPorCategoria,
                      onVideoTap:            _abrirVideo,
                      onRefresh:             _cargar,
                    ),
    );
  }
}

// ─── Pantalla de acceso bloqueado ──────────────────────────────────────────
class _VistaBloqueada extends StatelessWidget {
  final SuscripcionModel suscripcion;
  const _VistaBloqueada({required this.suscripcion});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.lock_outline,
                  size: 52, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            const Text(
              'Contenido exclusivo',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              suscripcion.estado != 'activa'
                  ? 'Tu suscripción está ${suscripcion.estado}. Renuévala para acceder a los videos.'
                  : 'Los videos de rehabilitación son exclusivos del plan Premium.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Volver al inicio'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Contenido real cuando hay acceso ─────────────────────────────────────
class _Contenido extends StatelessWidget {
  final List<VideoModel> filtrados;
  final List<String>     categorias;
  final String           categoriaSeleccionada;
  final void Function(String)       onCategoria;
  final void Function(VideoModel)   onVideoTap;
  final Future<void> Function()     onRefresh;

  const _Contenido({
    required this.filtrados,
    required this.categorias,
    required this.categoriaSeleccionada,
    required this.onCategoria,
    required this.onVideoTap,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Chips de categoría
        if (categorias.isNotEmpty)
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                _Chip(
                  label: 'Todas',
                  seleccionado: categoriaSeleccionada == 'Todas',
                  onTap: () => onCategoria('Todas'),
                ),
                ...categorias.map((cat) => _Chip(
                      label: cat,
                      seleccionado: categoriaSeleccionada == cat,
                      onTap: () => onCategoria(cat),
                    )),
              ],
            ),
          ),

        // Grid de videos
        Expanded(
          child: filtrados.isEmpty
              ? const Center(
                  child: Text('Sin videos en esta categoría.',
                      style: TextStyle(color: AppColors.textMuted)),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: onRefresh,
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.78,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filtrados.length,
                    itemBuilder: (ctx, i) => _TarjetaVideo(
                      video: filtrados[i],
                      onTap: () => onVideoTap(filtrados[i]),
                    ),
                  ),
                ),
        ),
      ],
    );
  }
}

// ─── Chip de categoría ─────────────────────────────────────────────────────
class _Chip extends StatelessWidget {
  final String   label;
  final bool     seleccionado;
  final VoidCallback onTap;

  const _Chip({required this.label, required this.seleccionado, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: seleccionado ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: seleccionado ? AppColors.primary : AppColors.accent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: seleccionado ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

// ─── Tarjeta de un video con thumbnail ────────────────────────────────────
class _TarjetaVideo extends StatelessWidget {
  final VideoModel   video;
  final VoidCallback onTap;

  const _TarjetaVideo({required this.video, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail del video desde YouTube CDN
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(14)),
              child: Stack(
                children: [
                  Image.network(
                    video.thumbnailUrl,
                    height: 110,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 110,
                      color: AppColors.accent,
                      child: const Icon(Icons.play_circle_outline,
                          size: 40, color: AppColors.primary),
                    ),
                  ),
                  // Botón de play encima del thumbnail
                  Positioned.fill(
                    child: Center(
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.play_arrow,
                            color: AppColors.primary, size: 26),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Título y categoría
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      video.titulo,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                        height: 1.3,
                      ),
                    ),
                    const Spacer(),
                    // Badge de categoría
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.cardLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        video.categoria,
                        style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Vista de error ─────────────────────────────────────────────────────────
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
