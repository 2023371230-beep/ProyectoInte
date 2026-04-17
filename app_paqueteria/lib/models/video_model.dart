// Modelo de video de rehabilitación.
// Viene del endpoint GET /api/videos
// youtube_id es el código de 11 caracteres del video (ej: "dQw4w9WgXcQ")
class VideoModel {
  final int    idVideo;
  final String titulo;
  final String youtubeId;
  final String categoria;

  const VideoModel({
    required this.idVideo,
    required this.titulo,
    required this.youtubeId,
    required this.categoria,
  });

  factory VideoModel.fromJson(Map<String, dynamic> json) {
    return VideoModel(
      idVideo:   json['id_video']    as int,
      titulo:    json['titulo']      as String,
      youtubeId: json['youtube_id']  as String,
      categoria: (json['categoria']  as String?) ?? 'General',
    );
  }

  // URL del thumbnail que YouTube genera automáticamente (no requiere API key)
  String get thumbnailUrl =>
      'https://img.youtube.com/vi/$youtubeId/hqdefault.jpg';

  // URL para abrir el video en YouTube
  String get youtubeUrl =>
      'https://www.youtube.com/watch?v=$youtubeId';
}
