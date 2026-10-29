import React from 'react';
import { ProjectCard } from './ProjectCard';
import './Projects.css';

// Campos vacíos (image, repo, live) se muestran como pendientes, nunca como links falsos.
const projects = [
  {
    id: 'tranqui-app',
    name: 'Tranqui App',
    category: 'SaaS · Salud mental',
    summary:
      'Plataforma para consultorios de salud mental: el paciente reserva turno en los bloques que define el profesional, tiene la consulta por videollamada y paga online, todo desde un mismo lugar.',
    image: '/projects/tranqui-app.webp',
    imageAlt: 'Página de inicio de Tranqui App: buscador de psicólogos y psiquiatras en Córdoba con filtros por especialidad, como ansiedad, depresión o insomnio.',
    repo: 'https://github.com/tommikimmel/tranquiApp',
    live: 'https://tranquisalud.com',
    stack: ['Spring Boot', 'ReactJS', 'PostgreSQL', 'Docker', 'WebSockets', 'Google Meet API', 'Mercado Pago API'],
    points: [
      'Arquitectura completa del SaaS para la gestión de consultorios de salud mental.',
      'Reserva de turnos en tiempo real vía WebSockets.',
      'Videollamadas integradas con Google Meet y cobros multiconcepto con Mercado Pago.',
    ],
  },
  {
    id: 'aulaquest',
    name: 'AulaQuest',
    category: 'Proyecto académico · UTN FRC',
    summary:
      'Plataforma de aprendizaje gamificado construida entre varios equipos de la TUP como un sistema de microservicios. Mi parte principal es el Market: la tienda del curso donde los alumnos usan sus monedas en ofertas, subastas y metas colectivas.',
    image: '/projects/aulaquest.webp',
    imageAlt: 'Tienda del Market de AulaQuest: filtros por tipo de objeto, buscador y una oferta de escudo que se compra con 10 monedas del curso.',
    repo: 'https://github.com/tommikimmel/tpi-market', // respaldo privado del repo de la organización
    live: 'https://aulaquest.marketplace-utn.tech/',
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'Flyway', 'Kafka', 'Docker', 'Angular 22'],
    points: [
      'Principal contribuidor del microservicio Market: catálogo, órdenes, subastas y metas colectivas de curso.',
      'Integración por eventos con Kafka (patrón outbox) con Contabilidad, Cursos y Notificaciones.',
      'Pantallas del frontend en Angular 22 con Signals y arquitectura por features.',
    ],
  },
];

export function Projects() {
  return (
    <section className="projects section" id="proyectos" aria-labelledby="projects-title">
      <div className="wrap">
        <div className="section-head reveal">
          <h2 id="projects-title" className="section-title">Proyectos destacados</h2>
          <p className="section-desc">
            Un SaaS en producción y un sistema de microservicios académico: arquitectura, backend, frontend y despliegue.
          </p>
        </div>

        <div className="proj-list">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>
      </div>
    </section>
  );
}
