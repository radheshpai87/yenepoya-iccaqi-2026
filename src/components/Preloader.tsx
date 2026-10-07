'use client';

import React, { useState, useEffect } from 'react';

const ASSETS_TO_PRELOAD = [
  '/yenepoya-university-logonew3.svg',
  '/yenepoya-school-engineering-and-technologynew-02.svg',
  '/yenepoya-emblem.svg',
  '/yenepoya-university-logonew3-white.svg',
  '/yenepoya-school-engineering-and-technologynew-white.svg',
  '/yenepoya_aerial.png',
  '/yiascm_balmatta.png',
  '/yenepoya2image.webp',
  '/yenepoya3image.jpeg',
  '/yiascm_kulur.png',
  '/event.png',
];

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Lock background scroll during preloader
    document.body.style.overflow = 'hidden';

    let loadedCount = 0;
    const totalAssets = ASSETS_TO_PRELOAD.length;
    let isCancelled = false;

    // Safety timeout: Maximum 2.5s so preloader never blocks user on slow connections
    const safetyTimeout = setTimeout(() => {
      if (!isCancelled) {
        setProgress(100);
        finishLoading();
      }
    }, 2500);

    const finishLoading = () => {
      setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => {
          setShouldRender(false);
          document.body.style.overflow = '';
        }, 700);
      }, 300);
    };

    const handleAssetDone = () => {
      if (isCancelled) return;
      loadedCount += 1;
      const targetPct = Math.min(Math.round((loadedCount / totalAssets) * 100), 100);
      setProgress(targetPct);

      if (loadedCount >= totalAssets) {
        clearTimeout(safetyTimeout);
        finishLoading();
      }
    };

    // Preload each image asynchronously
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = handleAssetDone;
      img.onerror = handleAssetDone;
    });

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden={isLoaded}
      className={`fixed inset-0 z-[99999] bg-[#030712] flex flex-col items-center justify-center p-6 select-none transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7cb305]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-6">
        {/* Brand Logos Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/yenepoya-university-logonew3-white.svg"
              alt="Yenepoya University"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <div className="h-6 w-[1px] bg-white/20" />
            <img
              src="/yenepoya-school-engineering-and-technologynew-white.svg"
              alt="School of Engineering and Technology"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7cb305]/20 border border-[#7cb305]/40 text-[#a0e020] text-[11px] font-bold tracking-wider uppercase mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7cb305] animate-ping" />
            <span>International Conference</span>
          </div>
        </div>

        {/* Conference Title */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>ICCAQI</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7cb305] via-lime-400 to-emerald-400">
              2026
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
            Computing, Artificial Intelligence, Quantum Intelligence &amp; Future Technologies
          </p>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="w-full space-y-2.5 pt-2">
          {/* Track Bar */}
          <div className="w-full h-2 bg-slate-900/80 border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-[#7cb305] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(124,179,5,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Percentage & Status text */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span className="text-[11px] text-slate-400">
              {progress < 35 && 'Initializing Portal...'}
              {progress >= 35 && progress < 75 && 'Preloading High-Res Media...'}
              {progress >= 75 && progress < 100 && 'Calibrating Experience...'}
              {progress === 100 && 'Welcome to ICCAQI 2026'}
            </span>
            <span className="font-mono font-bold text-[#7cb305] text-xs">
              {progress}%
            </span>
          </div>
        </div>

        {/* Footer date & venue line */}
        <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10 w-full flex items-center justify-center gap-2 font-medium">
          <span>November 6–7, 2026</span>
          <span>•</span>
          <span>Mangaluru, India</span>
        </div>
      </div>
    </div>
  );
};
