import React, { useRef } from 'react';
import { StackCard } from './StackCard';
import './Stack.css';

// `main`: lo que más uso en producción, se destaca en latón.
const stackCategories = [
  {
    title: 'Lenguajes',
    items: [
      { name: 'Java', main: true },
      { name: 'TypeScript', main: true },
      { name: 'JavaScript' },
      { name: 'C#' },
      { name: 'HTML5' },
      { name: 'CSS3' },
    ],
  },
  {
    title: 'Frameworks & libs',
    items: [
      { name: 'Spring Boot', main: true },
      { name: 'React 19', main: true },
      { name: '.NET / Entity Framework' },
      { name: 'JPA / Hibernate' },
      { name: 'Angular' },
      { name: 'Node.js' },
      { name: 'TailwindCSS' },
    ],
  },
  {
    title: 'Bases de datos',
    items: [{ name: 'PostgreSQL', main: true }, { name: 'SQL Server' }, { name: 'MongoDB' }, { name: 'Redis' }],
  },
  {
    title: 'Microservicios',
    items: [
      { name: 'API Gateway', main: true },
      { name: 'EDA', main: true },
      { name: 'Proxies' },
      { name: 'Load Balancer' },
      { name: 'BFF' },
      { name: 'Rate Limit' },
      { name: 'Health Check' },
    ],
  },
  {
    title: 'Herramientas & Prácticas',
    items: [
      { name: 'Docker', main: true },
      { name: 'WebSockets', main: true },
      { name: 'Git & GitHub' },
      { name: 'Google Meet / Mercado Pago API' },
      { name: 'JUnit, Mockito' },
      { name: 'Arquitectura DTOs' },
    ],
  },
];

function StackBoard({ lit = false }) {
  return (
    <div className={`stack-board ${lit ? 'is-lit' : ''}`} aria-hidden={lit || undefined}>
      {stackCategories.map((cat) => (
        <StackCard key={cat.title} title={cat.title} items={cat.items} />
      ))}
    </div>
  );
}

export function Stack() {
  const boardRef = useRef(null);

  // La luz sigue al puntero: solo actualiza dos custom properties, sin re-render.
  const handlePointerMove = (e) => {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <section className="stack section" id="stack" aria-labelledby="stack-title">
      <div className="wrap">
        <div className="section-head reveal">
          <h2 id="stack-title" className="section-title">Stack técnico</h2>
          <p className="section-desc">
            Lenguajes, frameworks y herramientas que uso día a día para pasar de una idea a un producto en producción.
          </p>
        </div>

        <div
          ref={boardRef}
          className="stack-stage reveal"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => boardRef.current?.style.removeProperty('--mx')}
        >
          <StackBoard />
          <StackBoard lit />
        </div>
      </div>
    </section>
  );
}
