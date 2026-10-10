import React from 'react';

interface YenepoyaLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showDual?: boolean;
  showNaac?: boolean;
}

export const YenepoyaLogo: React.FC<YenepoyaLogoProps> = ({
  className = '',
  variant = 'dark',
  showDual = false,
  showNaac = true,
}) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2 sm:gap-3.5 select-none ${className}`}>
      {/* 1. Main Yenepoya University Official Logo (Bigger) */}
      <img
        src={isLight ? '/yenepoya-university-logonew3-white.svg' : '/yenepoya-university-logonew3.svg'}
        alt="Yenepoya (Deemed to be University)"
        className="h-9 sm:h-12 md:h-14 w-auto object-contain transition-all drop-shadow-xs"
      />

      {/* 2. NAAC Grade 'A+' Official Badge */}
      {showNaac && (
        <>
          <div className={`h-7 sm:h-9 w-[1.5px] ${isLight ? 'bg-white/25' : 'bg-slate-300'}`} />
          <img
            src="/naac-a-plus-logo.webp"
            alt="NAAC Accredited with Grade A+"
            className="h-8 sm:h-11 md:h-13 w-auto object-contain transition-all drop-shadow-xs shrink-0"
          />
        </>
      )}

      {showDual && (
        <>
          <div className={`h-7 sm:h-9 w-[1.5px] ${isLight ? 'bg-white/25' : 'bg-slate-300'}`} />
          <img
            src={isLight ? '/yenepoya-school-engineering-and-technologynew-white.svg' : '/yenepoya-school-engineering-and-technologynew-02.svg'}
            alt="Yenepoya School of Engineering & Technology"
            className="h-9 sm:h-12 md:h-14 w-auto object-contain transition-all drop-shadow-xs"
          />
        </>
      )}
    </div>
  );
};
