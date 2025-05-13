import React from 'react';

const WeatherSVG = ({ type, animate }) => {
  if (type === 'sunny') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="12" fill="#FFD700" stroke="#FFB300" strokeWidth="3" />
        {animate && <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="6s" repeatCount="indefinite" />}
      </svg>
    );
  }
  if (type === 'cloudy') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <ellipse cx="24" cy="30" rx="16" ry="10" fill="#b3cfff" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#eaf6ff" />
        <ellipse cx="18" cy="28" rx="8" ry="6" fill="#d0e6ff" />
      </svg>
    );
  }
  if (type === 'storm') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <ellipse cx="24" cy="30" rx="16" ry="10" fill="#b3cfff" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#eaf6ff" />
        <ellipse cx="18" cy="28" rx="8" ry="6" fill="#d0e6ff" />
        <polyline points="22,34 26,38 24,38 28,44" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinejoin="round">
          {animate && <animate attributeName="points" values="22,34 26,38 24,38 28,44;22,36 26,40 24,40 28,46;22,34 26,38 24,38 28,44" dur="0.8s" repeatCount="indefinite" />}
        </polyline>
        <line x1="20" y1="38" x2="20" y2="44" stroke="#40a9ff" strokeWidth="2">
          {animate && <animate attributeName="y1" values="38;44;38" dur="0.7s" repeatCount="indefinite" />}
          {animate && <animate attributeName="y2" values="44;50;44" dur="0.7s" repeatCount="indefinite" />}
        </line>
        <line x1="28" y1="38" x2="28" y2="44" stroke="#40a9ff" strokeWidth="2">
          {animate && <animate attributeName="y1" values="38;44;38" dur="0.6s" repeatCount="indefinite" />}
          {animate && <animate attributeName="y2" values="44;50;44" dur="0.6s" repeatCount="indefinite" />}
        </line>
      </svg>
    );
  }
  if (type === 'wind') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <ellipse cx="24" cy="32" rx="16" ry="8" fill="#b3cfff" />
        <path d="M10 38 Q24 34 38 38" stroke="#40a9ff" strokeWidth="3" fill="none">
          {animate && <animate attributeName="d" values="M10 38 Q24 34 38 38;M10 36 Q24 38 38 36;M10 38 Q24 34 38 38" dur="1.2s" repeatCount="indefinite" />}
        </path>
      </svg>
    );
  }
  if (type === 'typhoon') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <ellipse cx="24" cy="32" rx="16" ry="8" fill="#b3cfff" />
        <ellipse cx="24" cy="24" rx="10" ry="10" fill="#ffd666" opacity="0.7" />
        <path d="M24 14 Q34 24 24 34 Q14 24 24 14" stroke="#ff5c5c" strokeWidth="3" fill="none">
          {animate && <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="2s" repeatCount="indefinite" />}
        </path>
      </svg>
    );
  }
  return null;
};

export default WeatherSVG; 