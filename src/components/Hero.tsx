'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Globe2, 
  BookOpen, 
  Sparkles,
  Award
} from 'lucide-react';

interface HeroProps {
  onOpenSubmitModal: () => void;
  onOpenBrochureModal: () => void;
  onExploreDetails: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenSubmitModal,
  onOpenBrochureModal,
  onExploreDetails,
}) => {
  const campusImages = [
    {
      src: '/yenepoya_aerial.png',
      alt: 'Yenepoya University Aerial Campus View',
    },
    {
      src: '/yiascm_balmatta.png',
      alt: 'Yenepoya Campus',
    },
    {
      src: '/yenepoya2image.webp',
      alt: 'Yenepoya University Infrastructure',
    },
    {
      src: '/yenepoya3image.jpeg',
      alt: 'Yenepoya University Academic Blocks',
    },
    {
      src: '/yiascm_kulur.png',
      alt: 'Yenepoya University Kulur Campus',
    },
    {
      src: '/event.png',
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
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 shadow-lg">
          <img
            src="/yenepoya-school-engineering-and-technologynew-white.svg"
            alt="Yenepoya School of Engineering & Technology"
            className="h-7 sm:h-8 w-auto object-contain drop-shadow-xs"
          />
          <div className="h-5 w-[1px] bg-white/25 hidden sm:block" />
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            NAAC Grade &apos;A+&apos;
          </span>
        </div>

        {/* Main Title & Acronym */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-md">
              ICCAQI
            </h1>
            <span className="text-4xl sm:text-6xl md:text-7xl font-black text-[#94cf1b] tracking-tight drop-shadow-md">
              2026
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white max-w-3xl mx-auto leading-snug drop-shadow-xs">
            International Conference on Computing, AI, Quantum Intelligence and Future Technologies
          </h2>
        </div>

        {/* Short Editorial Description */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs">
          A premier global platform uniting researchers, academicians, and industry pioneers to exchange groundbreaking ideas across computing, quantum intelligence, and future technologies.
        </p>

        {/* Essential Info Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-100">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>November 6–7, 2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Mangaluru, Karnataka, India</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 shadow-sm">
            <Globe2 className="w-4 h-4 text-indigo-300" />
            <span>Hybrid Mode (Online / Offline)</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenSubmitModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-[#7cb305] hover:bg-[#689803] shadow-lg shadow-lime-900/30 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Submit Your Paper</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDetails}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 shadow-sm transition-all cursor-pointer"
          >
            <span>Conference Overview</span>
          </button>

          <button
            onClick={onOpenBrochureModal}
            className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
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
