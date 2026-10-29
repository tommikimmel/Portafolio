import React from 'react';
import './Education.css';

export function Education() {
  return (
    <section className="education section" id="educacion" aria-labelledby="education-title">
      <div className="wrap edu-layout">
        <h2 id="education-title" className="section-title reveal">Educación</h2>

        <article className="edu reveal">
          <p className="edu-date">2025 — En curso</p>
          <h3 className="edu-name">Tecnicatura Universitaria en Programación</h3>
          <p className="edu-org">Universidad Tecnológica Nacional (UTN)</p>
          <p className="edu-details">
            Especialización en desarrollo de software, algoritmos, bases de datos y arquitectura web.
          </p>
        </article>
      </div>
    </section>
  );
}
