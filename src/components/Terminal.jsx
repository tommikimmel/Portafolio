import React, { useState, useEffect } from 'react';
import { Terminal as TermIcon, RotateCcw, Check, Copy } from 'lucide-react';
import './Terminal.css';

const CODE_DATA = [
  { text: '// perfil.ts', type: 'comment' },
  { text: 'const tomas = {', type: 'code', kw: 'const', name: 'tomas' },
  { text: '  nombre: "Tomas Kimmel",', type: 'prop', key: 'nombre', val: '"Tomas Kimmel"' },
  { text: '  rol: "Full Stack Developer",', type: 'prop', key: 'rol', val: '"Full Stack Developer"' },
  { text: '  ubicacion: "Córdoba, AR",', type: 'prop', key: 'ubicacion', val: '"Córdoba, AR"' },
  { text: '  stack: ["Spring Boot", "React", "PostgreSQL"],', type: 'prop', key: 'stack', val: '["Spring Boot", "React", "PostgreSQL"]' },
  { text: '  estudia: "Programación – UTN",', type: 'prop', key: 'estudia', val: '"Programación – UTN"' },
  { text: '  disponible: true', type: 'prop', key: 'disponible', val: 'true', isBool: true },
  { text: '};', type: 'code' },
];

const FULL_CODE_TEXT = `// perfil.ts
const tomas = {
  nombre: "Tomas Kimmel",
  rol: "Full Stack Developer",
  ubicacion: "Córdoba, AR",
  stack: ["Spring Boot", "React", "PostgreSQL"],
  estudia: "Programación – UTN",
  disponible: true
};`;

export function Terminal() {
  const [copied, setCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < CODE_DATA.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 160);

    return () => clearInterval(interval);
  }, [replayKey]);

  const isTyping = visibleCount < CODE_DATA.length;

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_CODE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="tname font-mono">
          <TermIcon size={13} aria-hidden="true" />
          perfil.ts
        </div>
        <div className="terminal-actions">
          <button onClick={handleReplay} title="Repetir animación" aria-label="Repetir animación" className="tbtn">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleCopy} title="Copiar código" aria-label="Copiar código" className="tbtn">
            {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="terminal-body font-mono">
        {CODE_DATA.slice(0, visibleCount).map((line, idx) => (
          <div key={idx} className="tline">
            <span className="ln">{idx + 1}</span>
            {line.type === 'comment' && <span className="com">{line.text}</span>}
            {line.type === 'code' && (
              <span>
                {line.kw && <span className="kw">{line.kw} </span>}
                {line.name && <span className="fn">{line.name} </span>}
                {line.text.includes('=') ? '= {' : line.text}
              </span>
            )}
            {line.type === 'prop' && (
              <span>
                &nbsp;&nbsp;<span className="key">{line.key}:</span>{' '}
                {line.isBool ? (
                  <span className="kw">{line.val}</span>
                ) : (
                  <span className="str">{line.val}</span>
                )}
              </span>
            )}
          </div>
        ))}
        {isTyping && <span className="cursor"></span>}
      </div>
    </div>
  );
}
