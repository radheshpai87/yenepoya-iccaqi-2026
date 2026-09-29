import React from 'react';

interface YenepoyaLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showDual?: boolean;
}

export const YenepoyaLogo: React.FC<YenepoyaLogoProps> = ({
  className = '',
  variant = 'dark',
  showDual = false,
}) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 1. Main Yenepoya University Official Logo (Primary Priority) */}
      <img
        src={isLight ? '/yenepoya-university-logonew3-white.svg' : '/yenepoya-university-logonew3.svg'}
        alt="Yenepoya (Deemed to be University)"
        className="h-8 sm:h-10 w-auto object-contain transition-all drop-shadow-xs"
      />

      {showDual && (
        <>
          <div className={`h-6 w-[1.5px] ${isLight ? 'bg-white/25' : 'bg-slate-300'}`} />
          <img
            src={isLight ? '/yenepoya-school-engineering-and-technologynew-white.svg' : '/yenepoya-school-engineering-and-technologynew-02.svg'}
            alt="Yenepoya School of Engineering & Technology"
            className="h-8 sm:h-10 w-auto object-contain transition-all drop-shadow-xs"
          />
        </>
      )}
    </div>
  );
};
