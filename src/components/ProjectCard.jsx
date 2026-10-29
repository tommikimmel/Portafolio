import React from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';

// Link a evidencia (GitHub / producción). Sin URL se muestra como pendiente, nunca como link falso.
export function ProofLink({ href, label }) {
  if (!href) {
    return (
      <span className="proof-link is-pending" title="Link pendiente de cargar">
        {label} · pendiente
      </span>
    );
  }

  return (
    <a className="proof-link" href={href} target="_blank" rel="noopener noreferrer">
      <span>{label}</span>
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}

export function ProjectShot({ src, alt, hint }) {
  return (
    <div className="shot">
      {src ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="shot-pending">
          <ImageOff size={22} aria-hidden="true" />
          <span>Captura pendiente</span>
          <code>{hint}</code>
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ id, name, category, summary, image, repo, live, stack, points }) {
  return (
    <article className="proj reveal" aria-labelledby={`${id}-title`}>
      <ProjectShot src={image} alt={`Captura de ${name}`} hint={`public/projects/${id}.webp`} />

      <div className="proj-info">
        <h3 id={`${id}-title`} className="proj-name">{name}</h3>
        <p className="proj-category">{category}</p>
        <p className="proj-summary">{summary}</p>

        <ul className="proj-points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <ul className="proj-stack" aria-label={`Stack de ${name}`}>
          {stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <div className="proj-links">
          <ProofLink href={live} label="Ver en producción" />
          <ProofLink href={repo} label="GitHub" />
        </div>
      </div>
    </article>
  );
}
