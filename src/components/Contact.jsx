import React, { useState } from 'react';
import { Phone, Mail, MapPin, Briefcase, Copy, Check } from 'lucide-react';
import { Footer } from './Footer';
import './Contact.css';

function LinkedinIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}

function GithubIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
      <path d="M9 18c-4.51 2-5-2-7-2"></path>
    </svg>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('tomikimmeldev@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const contactLinks = [
    {
      label: 'Teléfono / WhatsApp',
      value: '+54 351 459-9330',
      href: 'tel:+543514599330',
      icon: Phone,
    },
    {
      label: 'Email (click para copiar)',
      value: 'tomikimmeldev@gmail.com',
      href: 'mailto:tomikimmeldev@gmail.com',
      icon: Mail,
      isCopy: true,
    },
    {
      label: 'LinkedIn',
      value: '/in/tomas-kimmel',
      href: 'https://linkedin.com/in/tomas-kimmel',
      icon: LinkedinIcon,
      external: true,
    },
    {
      label: 'GitHub',
      value: '/tommikimmel',
      href: 'https://github.com/tommikimmel',
      icon: GithubIcon,
      external: true,
    },
    {
      label: 'Ubicación',
      value: 'Córdoba, Argentina',
      href: '#top',
      icon: MapPin,
    },
    {
      label: 'Rol actual',
      value: 'Full Stack Dev',
      href: '#experiencia',
      icon: Briefcase,
    },
  ];

  return (
    <section className="contact section" id="contacto" aria-labelledby="contact-title">
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap contact-inner">
        <header className="contact-header reveal">
          <h2 id="contact-title" className="contact-title font-display">
            ¿Hablamos de tu <span className="accent">próximo proyecto</span>?
          </h2>
          <p className="contact-sub">
            Disponible para proyectos freelance, colaboraciones y roles full stack. Respondo rápido por mail o WhatsApp.
          </p>
        </header>

        <ul className="contact-list reveal">
          {contactLinks.map((item) => {
            const IconComp = item.icon;
            const isExternal = item.external;
            return (
              <li key={item.label}>
                <a
                  className="contact-row"
                  href={item.href}
                  onClick={item.isCopy ? handleCopyEmail : undefined}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  aria-label={item.isCopy ? 'Copiar correo electrónico tomikimmeldev@gmail.com' : `${item.label}: ${item.value}`}
                >
                  <IconComp size={18} className="contact-icon" aria-hidden="true" />
                  <span className="contact-label">{item.label}</span>
                  <span className="contact-val">{item.value}</span>
                  {item.isCopy && (copied ? (
                    <Check size={16} className="text-ok" aria-hidden="true" />
                  ) : (
                    <Copy size={16} className="contact-trail" aria-hidden="true" />
                  ))}
                  {item.isCopy && (
                    <span className="copied-toast" role="status">{copied ? '¡Email copiado!' : ''}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <Footer />
      </div>
    </section>
  );
}
