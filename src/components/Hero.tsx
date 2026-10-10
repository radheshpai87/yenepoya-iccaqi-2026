'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Globe2, 
  BookOpen, 
  Sparkles,
  Award,
  CreditCard
} from 'lucide-react';

interface HeroProps {
  onOpenSubmitModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenBrochureModal: () => void;
  onExploreDetails: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenSubmitModal,
  onOpenRegisterModal,
  onOpenBrochureModal,
  onExploreDetails,
}) => {
  const campusImages = [
    {
      src: '/yiascm_balmatta.webp',
      alt: 'Yenepoya YIASCM Balmatta Campus',
    },
    {
      src: '/yenepoya_aerial.webp',
      alt: 'Yenepoya University Aerial Campus View',
    },
    {
      src: '/yenepoya2image.webp',
      alt: 'Yenepoya University Infrastructure',
    },
    {
      src: '/yenepoya3image.webp',
      alt: 'Yenepoya University Academic Blocks',
    },
    {
      src: '/yiascm_kulur.webp',
      alt: 'Yenepoya University Kulur Campus',
    },
    {
      src: '/event.webp',
      alt: 'Yenepoya International Conference Event',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Background carousel running automatically without buttons
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [campusImages.length]);

  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden bg-slate-900 text-white">
      
      {/* Background Campus Carousel - Visible through Subtle Dark Tint */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {campusImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-105 transition-transform duration-[6000ms]' : 'opacity-0 scale-100'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              width={1920}
              height={1080}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Subtle, Balanced Dark Overlay (Not harsh black, lets campus photos shine) */}
        <div className="absolute inset-0 bg-slate-950/45 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/35 to-slate-950/50 z-10" />
      </div>

      {/* Hero Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-20 space-y-8">
        
        {/* Institutional Pill with Yenepoya School of Engineering and Technology Logo */}
        <div className="inline-flex max-w-full items-center justify-center px-6 sm:px-10 py-3 sm:py-4 rounded-2xl sm:rounded-full bg-slate-900/80 backdrop-blur-md border border-white/25 shadow-xl mx-auto">
          <img
            src="/yenepoya-school-engineering-and-technologynew-white.svg"
            alt="Yenepoya School of Engineering & Technology"
            width={340}
            height={70}
            className="h-11 sm:h-14 md:h-16 lg:h-18 w-auto max-w-[85vw] sm:max-w-md md:max-w-xl object-contain drop-shadow-md mx-auto"
          />
        </div>

        {/* Main Title & Acronym - Semantic Unified H1 for High-Impact SEO */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="space-y-2 sm:space-y-3">
            <span className="flex items-center justify-center gap-2 sm:gap-4">
              <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-md">
                ICCAQI
              </span>
              <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#94cf1b] tracking-tight drop-shadow-md">
                2026
              </span>
            </span>
            <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white max-w-3xl mx-auto leading-snug drop-shadow-xs px-1">
              International Conference on Computing, AI, Quantum Intelligence and Future Technologies
            </span>
          </h1>
        </div>

        {/* Short Editorial Description */}
        <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs px-2">
          A premier global platform uniting researchers, academicians, and industry pioneers to exchange groundbreaking ideas across computing, quantum intelligence, and future technologies.
        </p>

        {/* Essential Info Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2 text-xs sm:text-sm font-semibold text-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm text-[11px] sm:text-xs md:text-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>November 25–26, 2026</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm text-[11px] sm:text-xs md:text-sm">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
            <span>Mangaluru, Karnataka, India</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm text-[11px] sm:text-xs md:text-sm">
            <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300 shrink-0" />
            <span>Hybrid (Online / Offline)</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 pt-3 sm:pt-4 max-w-2xl mx-auto w-full">
          <button
            onClick={onOpenSubmitModal}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#7cb305] hover:bg-[#689803] shadow-lg shadow-lime-900/30 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Submit Your Paper</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-950/40 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Register as Participant</span>
          </button>

          <button
            onClick={onExploreDetails}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 shadow-sm transition-all cursor-pointer"
          >
            <span>Conference Overview</span>
          </button>

          <button
            onClick={onOpenBrochureModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Official Brochure</span>
          </button>
        </div>

      </div>

      {/* Subtle Bottom Ambient Gradient to blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent z-20 pointer-events-none" />
    </section>
  );
};
