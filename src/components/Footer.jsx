import React from 'react';
import { ArrowUp } from 'lucide-react';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-left">
        <span>© {currentYear} Tomas Kimmel. Todos los derechos reservados.</span>
        <span className="footer-subtext">Diseñado & construido con React 19, CSS & Vite.</span>
      </div>

      <button className="back-top-btn" onClick={handleScrollTop} aria-label="Volver arriba">
        <span>Volver arriba</span>
        <ArrowUp size={14} aria-hidden="true" />
      </button>
    </footer>
  );
}
