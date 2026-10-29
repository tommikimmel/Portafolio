import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageSquare, FolderOpen } from 'lucide-react';
import { Terminal } from './Terminal';
import './Hero.css';

const MOBILE_QUERY = '(max-width: 899px)';
const SCREEN_TABS = ['Presentación', 'perfil.ts', 'Proyectos'];

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const scrollToId = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

function IntroScreen() {
  return (
    <>
      <h1 className="hero-title">
        Desarrollador
        <span>Full Stack</span>
      </h1>

      <p className="hero-sub">
        Estudiante de la Tecnicatura Universitaria en Programación (UTN) construyendo productos SaaS reales con Spring Boot, React y PostgreSQL, de la base de datos a la interfaz.
      </p>

      <div className="hero-actions">
        <button className="btn btn-primary" onClick={() => scrollToId('#proyectos')}>
          <span>Ver proyectos</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button className="btn btn-ghost" onClick={() => scrollToId('#contacto')}>
          <MessageSquare size={16} aria-hidden="true" />
          <span>Hablemos</span>
        </button>
      </div>

      <p className="hero-meta">
        Rol actual: <strong>Full Stack en Tranqui App Neurociencias</strong>
      </p>
    </>
  );
}

function ProjectsScreen() {
  const items = [
    { name: 'tranqui-app', desc: 'SaaS · Salud mental' },
    { name: 'aulaquest', desc: 'Proyecto académico · UTN' },
  ];
  return (
    <nav className="files" aria-label="Proyectos destacados">
      <p className="files-path font-mono">~/proyectos</p>
      <ul>
        {items.map((it) => (
          <li key={it.name}>
            <button className="files-item" onClick={() => scrollToId('#proyectos')}>
              <FolderOpen size={20} aria-hidden="true" />
              <span className="files-name font-mono">{it.name}/</span>
              <span className="files-desc">{it.desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Steam({ steamRef }) {
  return (
    <svg ref={steamRef} className="steam" viewBox="0 0 60 90" fill="none" aria-hidden="true">
      <path d="M18 86c-8-12 8-18 0-32s8-22 2-40" />
      <path d="M31 86c-8-14 9-20 1-34s7-20 1-38" />
      <path d="M44 86c-7-12 8-18 0-30s7-20 1-34" />
    </svg>
  );
}

export function Hero() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const viewRef = useRef(null);
  const steamRef = useRef(null);
  const overlays = useRef({});
  const sceneRef = useRef(null);
  // 'loading' → escena cargando; 'ready' → pantallas sobre los monitores; 'flat' → sin WebGL
  const [status, setStatus] = useState('loading');
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    import('./hero3d/scene.js')
      .then(({ createDeskScene }) => {
        if (cancelled || !viewRef.current) return;
        sceneRef.current = createDeskScene(viewRef.current, {
          getOverlays: () => overlays.current,
          steam: steamRef.current,
          reducedMotion,
          onReady: () => !cancelled && setStatus('ready'),
          onError: () => !cancelled && setStatus('flat'),
        });
      })
      .catch(() => !cancelled && setStatus('flat'));

    // Si alguna textura tarda, mostramos las pantallas igual.
    const fallback = setTimeout(() => setStatus((s) => (s === 'loading' ? 'ready' : s)), 5000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Mobile: la cámara viaja al monitor elegido
  useEffect(() => {
    sceneRef.current?.focus(screen);
  }, [screen, status]);

  const go = (i) => setScreen((i + SCREEN_TABS.length) % SCREEN_TABS.length);

  // Deslizar horizontalmente cambia de monitor
  const swipe = useRef(null);
  const onTouchStart = (e) => {
    swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!swipe.current) return;
    const dx = e.changedTouches[0].clientX - swipe.current.x;
    const dy = e.changedTouches[0].clientY - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(screen + (dx < 0 ? 1 : -1));
  };

  const bind = (key) => (el) => {
    if (el) overlays.current[key] = el;
    else delete overlays.current[key];
  };

  return (
    <section className={`hero is-${status}`} id="inicio">
      <div className="hero-view" ref={viewRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="screen-ui screen-left" ref={bind('left')} inert={isMobile && screen !== 0 ? true : undefined}>
          <IntroScreen />
        </div>
        <div className="screen-ui screen-center" ref={bind('center')} inert={isMobile && screen !== 1 ? true : undefined}>
          <Terminal />
        </div>
        <div className="screen-ui screen-right" ref={bind('right')} inert={isMobile && screen !== 2 ? true : undefined}>
          <ProjectsScreen />
        </div>

        <Steam steamRef={steamRef} />

        {isMobile && status !== 'flat' && (
          <div className="screen-tabs" role="tablist" aria-label="Monitores">
            {SCREEN_TABS.map((label, i) => (
              <button
                key={label}
                role="tab"
                aria-selected={screen === i}
                className={screen === i ? 'is-active' : undefined}
                onClick={() => go(i)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
