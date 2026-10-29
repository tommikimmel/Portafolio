import React from 'react';
import { ProofLink } from './ProjectCard';
import './Experience.css';

const job = {
  role: 'Desarrollador Full Stack',
  org: 'Tranqui App Neurociencias',
  location: 'Córdoba, remoto',
  dates: 'Ene 2026 — Actualidad',
  summary: 'Construyo de punta a punta un SaaS para consultorios de salud mental.',
  live: 'https://tranquisalud.com',
  repo: 'https://github.com/tommikimmel/tranquiApp',
  done: [
    'Turnos en tiempo real por bloques del profesional',
    'Consultas online con Google Meet',
    'Cobros multiconcepto con Mercado Pago',
  ],
  stack: ['Spring Boot', 'React', 'PostgreSQL', 'WebSockets', 'Docker'],
};

export function Experience() {
  return (
    <section className="experience section" id="experiencia" aria-labelledby="experience-title">
      <div className="wrap">
        <div className="section-head reveal">
          <h2 id="experience-title" className="section-title">Experiencia</h2>
          <p className="section-desc">Donde construyo hoy, en producción y con usuarios reales.</p>
        </div>

        <article className="exp reveal">
          <div className="exp-head">
            <h3 className="exp-role">{job.role}</h3>
            <p className="exp-org">
              <strong>{job.org}</strong> · {job.location}
            </p>
            <p className="exp-date">
              {job.dates}
              <span className="exp-status">
                <span className="exp-pulse" aria-hidden="true" />
                En curso
              </span>
            </p>
            <div className="exp-links">
              <ProofLink href={job.live} label="Sitio" />
              <ProofLink href={job.repo} label="GitHub" />
            </div>
          </div>

          <div className="exp-body">
            <p className="exp-summary">{job.summary}</p>

            <dl className="exp-facts">
              <div>
                <dt>Qué hice</dt>
                <dd>
                  <ul className="exp-done">
                    {job.done.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Con qué</dt>
                <dd className="exp-stack">{job.stack.join(' · ')}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}
