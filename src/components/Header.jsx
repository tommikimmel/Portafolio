import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Send } from 'lucide-react';
import './Header.css';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const activeSectionRef = useRef('');
  const scrolledRef = useRef(false);

  const navLinks = [
    { href: '#sobre-mi', label: 'Sobre mí' },
    { href: '#stack', label: 'Stack' },
    { href: '#experiencia', label: 'Experiencia' },
    { href: '#proyectos', label: 'Proyectos' },
    { href: '#educacion', label: 'Educación' },
    { href: '#contacto', label: 'Contacto' },
  ];

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const isScrolledNow = window.scrollY > 20;
      if (isScrolledNow !== scrolledRef.current) {
        scrolledRef.current = isScrolledNow;
        setScrolled(isScrolledNow);
      }

      const sections = document.querySelectorAll('main section[id]');
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 60;

      let current = '';
      if (isAtBottom) {
        current = '#contacto';
      } else {
        sections.forEach((section) => {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = `#${section.getAttribute('id')}`;
          }
        });
      }

      if (current && current !== activeSectionRef.current) {
        activeSectionRef.current = current;
        setActiveSection(current);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollState();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);

    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <nav className="nav wrap" aria-label="Navegación principal">
        <a href="#top" onClick={(e) => handleNavClick(e, '#top')} className="logo font-display">
          Tomas Kimmel
        </a>

        <div className="nav-links">
          {navLinks.slice(0, 5).map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={activeSection === link.href ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button
            className="nav-cta btn btn-primary"
            onClick={(e) => handleNavClick(e, '#contacto')}
            aria-label="Ir a sección de contacto"
          >
            <Send size={15} />
            <span>Contactar</span>
          </button>

          <button
            className="burger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className={activeSection === link.href ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}
