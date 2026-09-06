import React from 'react';
import { getEmptyState, formatBrand } from '../../scheme';

export const WelcomeScreen: React.FC<{
  onPick?: (prompt: string) => void;
}> = () => {
  const empty = getEmptyState();
  if (!empty) return null;

  return (
    <div className="chat__welcome">
      <div className="chat__welcome-brand">
        {empty.logoUrl ? (
          <img className="chat__welcome-logo-img" src={empty.logoUrl} alt={empty.name} />
        ) : (
          <div className="chat__welcome-logo">{empty.logo}</div>
        )}
        <h1 className="chat__welcome-title">{formatBrand(empty.greeting, empty)}</h1>
      </div>
      <p className="chat__welcome-sub">{empty.subtitle}</p>
      {empty.features.length > 0 && (
        <ul className="chat__welcome-features">
          {empty.features.map((text, i) => (
            <li key={i} className="chat__welcome-feature">
              <span className="chat__welcome-check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
