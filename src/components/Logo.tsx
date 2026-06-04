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
        {/* Elegant Official Brand Logo Image */}
        <img
          src="/rasvynar.png"
          alt="Rasvynar Brand"
          height={current.h}
          style={{ height: current.h, objectFit: 'contain' }}
          className="hover:scale-105 transition-transform"
        />

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
