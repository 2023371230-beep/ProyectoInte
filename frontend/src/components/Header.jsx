import './Header.css';

// El header muestra el título de la página actual y una barra de búsqueda opcional
export default function Header({ titulo, subtitulo }) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <h1 className="topbar-title">{titulo}</h1>
        {subtitulo && (
          <p className="topbar-subtitle">{subtitulo}</p>
        )}
      </div>

      <div className="topbar-right">
        <span className="topbar-date">
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </header>
  );
}
