'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Rocket, Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const ASSETS_TO_PRELOAD = [
  '/yenepoya-university-logonew3.svg',
  '/yenepoya-school-engineering-and-technologynew-02.svg',
  '/yenepoya-emblem.svg',
  '/yenepoya-university-logonew3-white.svg',
  '/yenepoya-school-engineering-and-technologynew-white.svg',
  '/yenepoya_aerial.webp',
  '/yiascm_balmatta.webp',
  '/yenepoya2image.webp',
  '/yenepoya3image.webp',
  '/yiascm_kulur.webp',
  '/event.webp',
  '/iccaqi-logo.webp',
  '/imanager-publications-logo.webp',
  '/indexing-services-collage.webp',
  '/naac-a-plus-logo.webp',
];

export const Preloader: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Background silent asset preloading so website loads instantly upon launch
  useEffect(() => {
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Lock scroll while launch screen is active
  useEffect(() => {
    if (shouldRender && !isRevealing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender, isRevealing]);

  // Pure Web Audio API Feel-Good Celebratory Chime
  const playFeelGoodChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Harmonic crystalline ascending pentatonic chord arpeggio
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.9 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.9 }, // E5
        { freq: 783.99, time: 0.16, dur: 1.0 }, // G5
        { freq: 987.77, time: 0.24, dur: 1.1 }, // B5
        { freq: 1046.50, time: 0.32, dur: 1.3 }, // C6
        { freq: 1318.51, time: 0.40, dur: 1.5 }, // E6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Soft attack and smooth exponential chime decay
        gain.gain.setValueAtTime(0.0001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.1);
      });

      // Warm harmonic foundation pad
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(261.63, now); // C4 base
      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      padOsc.connect(padGain);
      padGain.connect(ctx.destination);
      padOsc.start(now);
      padOsc.stop(now + 1.3);
    } catch {
      // Audio playback failsafe
    }
  }, [soundEnabled]);

  // Multi-Cannon Feel-Good Confetti Celebration
  const triggerConfettiCelebration = useCallback(() => {
    // 1. Center Starburst Explosion
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#7cb305', '#10b981', '#34d399', '#facc15', '#38bdf8', '#ffffff'],
      disableForReducedMotion: false,
    });

    // 2. Left Cannon Blast
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#7cb305', '#10b981', '#facc15', '#ffffff'],
      });
    }, 150);

    // 3. Right Cannon Blast
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#7cb305', '#10b981', '#facc15', '#ffffff'],
      });
    }, 300);

    // 4. Cascading golden sparkles
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 120,
        startVelocity: 35,
        origin: { y: 0.45 },
        shapes: ['star', 'circle'],
        colors: ['#facc15', '#ffffff', '#7cb305'],
      });
    }, 450);
  }, []);

  // Main Launch Trigger
  const handleLaunchWebsite = useCallback(() => {
    if (isLaunched) return;
    setIsPressed(true);
    setIsLaunched(true);

    // 1. Audio chime
    playFeelGoodChime();

    // 2. Confetti explosion
    triggerConfettiCelebration();

    // 3. Cinematic transition to reveal the website
    setTimeout(() => {
      setIsRevealing(true);
      document.body.style.overflow = '';
    }, 550);

    // 4. Complete unmount after reveal completes
    setTimeout(() => {
      setShouldRender(false);
    }, 1400);
  }, [isLaunched, playFeelGoodChime, triggerConfettiCelebration]);

  // Replay helper for testing/rehearsals
  const handleReplay = () => {
    setShouldRender(true);
    setIsRevealing(false);
    setIsLaunched(false);
    setIsPressed(false);
    document.body.style.overflow = 'hidden';
  };

  // Keyboard shortcut: Space or Enter triggers launch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLaunched && shouldRender && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleLaunchWebsite();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLaunched, shouldRender, handleLaunchWebsite]);

  return (
    <>
      {shouldRender && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Launch ICCAQI 2026 Website"
          className={`fixed inset-0 z-[999999] bg-[#030712] flex flex-col items-center justify-center p-6 select-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isRevealing
              ? 'opacity-0 scale-110 pointer-events-none blur-md'
              : 'opacity-100 scale-100'
          }`}
        >
          {/* Ambient Glowing Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Top-center Lime Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#7cb305]/18 rounded-full blur-[140px] animate-pulse" />
            {/* Bottom-center Emerald Glow */}
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px]" />
            {/* Subtle Star Particle Overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
          </div>

          {/* Sound Mute/Unmute Toggle in Top-Right */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all duration-200"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-[#a0e020]" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Main Launch Card / Portal */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full space-y-9 px-4">
            {/* University & Department Logo Header */}
            <div className="flex flex-col items-center gap-3 animate-fade-in">
              <div className="flex items-center justify-center gap-4 sm:gap-6 bg-white/[0.04] backdrop-blur-xl px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <img
                  src="/yenepoya-university-logonew3-white.svg"
                  alt="Yenepoya University"
                  className="h-9 sm:h-11 w-auto object-contain drop-shadow"
                />
                <div className="h-7 w-[1px] bg-white/20" />
                <img
                  src="/yenepoya-school-engineering-and-technologynew-white.svg"
                  alt="School of Engineering and Technology"
                  className="h-9 sm:h-11 w-auto object-contain drop-shadow"
                />
              </div>

              {/* Ceremony Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7cb305]/15 border border-[#7cb305]/30 text-[#a0e020] text-xs font-semibold tracking-wider uppercase shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#7cb305] animate-ping" />
                <span>Official Website Inauguration</span>
              </div>
            </div>

            {/* Conference Title */}
            <div className="space-y-2.5">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white flex items-center justify-center gap-3">
                <span>ICCAQI</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a0e020] via-emerald-400 to-teal-300 drop-shadow-[0_0_35px_rgba(124,179,5,0.4)]">
                  2026
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
                Computing, Artificial Intelligence, Quantum Intelligence &amp; Future Technologies
              </p>
            </div>

            {/* THE FEEL-GOOD LAUNCH BUTTON */}
            <div className="relative pt-2 pb-3 flex flex-col items-center justify-center">
              {/* Outer Radiating Pulsing Halo Ring */}
              <div
                className={`absolute w-72 sm:w-84 h-24 rounded-full bg-gradient-to-r from-[#7cb305] via-emerald-400 to-teal-400 opacity-40 blur-2xl transition-all duration-700 pointer-events-none ${
                  isPressed ? 'scale-150 opacity-80' : 'animate-pulse'
                }`}
              />

              {/* Expanding Shockwave Ring on Click */}
              {isPressed && (
                <div className="absolute w-28 h-28 rounded-full border-2 border-[#a0e020] animate-ping pointer-events-none" />
              )}

              {/* The Grand Launch Button */}
              <button
                ref={buttonRef}
                onClick={handleLaunchWebsite}
                disabled={isLaunched}
                className={`group relative overflow-hidden flex items-center justify-center gap-3.5 px-8 sm:px-12 py-5 sm:py-6 rounded-full font-extrabold text-lg sm:text-xl text-slate-950 shadow-[0_0_50px_rgba(124,179,5,0.45)] hover:shadow-[0_0_80px_rgba(124,179,5,0.75)] transition-all duration-300 ease-out active:scale-95 cursor-pointer ${
                  isPressed
                    ? 'scale-105 bg-white text-emerald-950'
                    : 'bg-gradient-to-r from-[#84cc16] via-[#10b981] to-[#14b8a6] hover:scale-105 hover:brightness-110'
                }`}
              >
                {/* Internal Shimmer Sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                {/* Rocket Icon */}
                <Rocket
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 ${
                    isPressed ? '-translate-y-2 translate-x-2' : 'group-hover:-translate-y-1'
                  }`}
                />

                {/* Button Text */}
                <span className="tracking-wide uppercase font-black">
                  {isLaunched ? 'Launching...' : 'Launch Website'}
                </span>

                {/* Sparkle Icon */}
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-950 animate-spin-slow group-hover:rotate-45 transition-transform duration-300" />
              </button>

              {/* Feel-Good Subtitle / Instruction */}
              <p className="text-xs sm:text-sm text-slate-400 mt-4 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                <span>Click the button to inaugurate and explore the portal</span>
              </p>
            </div>

            {/* Conference Venue & Dates */}
            <div className="text-xs text-slate-400 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-3 font-medium">
              <span>November 25–26, 2026</span>
              <span className="text-white/30">•</span>
              <span>Yenepoya Campus, Mangaluru, India</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Replay Button (Discreet in bottom-right corner when website is visible) */}
      {!shouldRender && (
        <aside aria-label="Ceremony Controls" className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleReplay}
            title="Replay Launch Ceremony"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold transition-all duration-200 hover:scale-105 group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-lime-400 group-hover:-rotate-90 transition-transform duration-300" />
            <span>Replay Launch</span>
          </button>
        </aside>
      )}
    </>
  );
};
