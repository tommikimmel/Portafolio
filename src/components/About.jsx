import React from 'react';
import './About.css';

export function About() {
  const tags = ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'PostgreSQL', 'Docker', 'Microservicios', 'EDA', 'TailwindCSS'];

  return (
    <section className="about section" id="sobre-mi" aria-labelledby="about-title">
      <div className="wrap">
        <div className="section-head reveal">
          <h2 id="about-title" className="section-title">Sobre mí</h2>
          <p className="section-desc">UTN · Tecnicatura Universitaria en Programación</p>
        </div>

        <div className="about-grid">
          <p className="about-lead font-display reveal">
            Proactivo, analítico y con foco en construir soluciones que la gente realmente usa.
          </p>

          <div className="about-body reveal">
            <p>
              Estudiante de la Tecnicatura Universitaria en Programación con sólida formación técnica y experiencia profesional en el desarrollo de soluciones web eficientes, limpias y escalables.
            </p>
            <p>
              Fuerte capacidad analítica para la resolución de problemas y adaptabilidad para integrar equipos de trabajo ágiles. Experiencia en desarrollo full stack construyendo SaaS integrales con <strong>Spring Boot</strong>, <strong>React</strong>, <strong>PostgreSQL</strong> y <strong>Docker</strong>, aportando valor tanto en backend como en frontend con tecnologías modernas y buenas prácticas de desarrollo.
            </p>

            <ul className="about-tags" aria-label="Tecnologías principales">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
