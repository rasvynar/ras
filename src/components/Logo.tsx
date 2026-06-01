import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export default function Logo({ className = '', size = 'md', showTagline = false }: LogoProps) {
  // Size metrics
  const dimensions = {
    sm: { h: 28, text: 'text-lg', letter: 'tracking-[0.25em]' },
    md: { h: 36, text: 'text-2xl', letter: 'tracking-[0.3em]' },
    lg: { h: 54, text: 'text-4xl', letter: 'tracking-[0.35em]' },
    xl: { h: 72, text: 'text-6xl', letter: 'tracking-[0.4em]' }
  };

  const current = dimensions[size];

  return (
    <div className={`flex flex-col items-center justify-center font-display text-white select-none ${className}`}>
      <div className="flex items-center gap-3">
        {/* Elegant Abstract Hexagonal Serif R Icon */}
        <svg
          height={current.h}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white hover:text-neutral-300 transition-colors"
        >
          {/* Hexagonal container */}
          <polygon
            points="50,5 93,30 93,70 50,95 7,70 7,30"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinejoin="bevel"
            fill="#050505"
          />
          {/* Inner Abstract Geometric serif R */}
          <path
            d="M38 32H55C62 32 67 36 67 42C67 48 62 52 55 52H38V32Z"
            fill="currentColor"
          />
          <path
            d="M38 52H45L58 72H69L55 52H38"
            fill="currentColor"
          />
          <rect x="34" y="32" width="4" height="40" fill="currentColor" />
          <rect x="34" y="70" width="10" height="2" fill="currentColor" />
          <rect x="30" y="32" width="12" height="2" fill="currentColor" />
        </svg>

        <span className={`font-semibold ${current.text} ${current.letter} font-display text-white tracking-widest`}>
          RASVYNAR
        </span>
      </div>
      
      {showTagline && (
        <span className="text-[10px] font-mono uppercase tracking-[0.6em] text-neutral-400 mt-2 block">
          STYLE BEYOND ORDINARY
        </span>
      )}
    </div>
  );
}
