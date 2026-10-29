import React from 'react';

export function StackCard({ title, items }) {
  return (
    <div className="stack-row">
      <h3 className="stack-row-title">{title}</h3>
      <ul className="stack-row-items">
        {items.map((item) => (
          <li key={item.name} className={item.main ? 'is-main' : undefined}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
