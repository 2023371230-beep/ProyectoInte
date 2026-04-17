import { useEffect } from 'react';

/**
 * Modal genérico reutilizable.
 * Uso: <Modal titulo="..." onCerrar={fn} ancho={560}> ... </Modal>
 */
export default function Modal({ titulo, onCerrar, children, ancho = 540 }) {
  // Cierra con Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  // Evita scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="modal-panel" style={{ maxWidth: ancho }}>
        {/* Cabecera */}
        <div className="modal-header">
          <h2 id="modal-titulo" className="modal-titulo">{titulo}</h2>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
