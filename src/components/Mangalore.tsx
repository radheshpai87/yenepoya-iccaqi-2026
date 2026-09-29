'use client';

import React from 'react';
import { 
  Palmtree, 
  Waves, 
  Compass, 
  Plane, 
  Train, 
  Car, 
  MapPin, 
  Sun, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Mangalore: React.FC = () => {
  const attractions = [
    {
      title: 'Arabian Sea Coastlines',
      desc: 'Pristine beaches including Panambur, Tannirbhavi, and Someshwar offering breathtaking sunset vistas.',
      icon: Waves,
    },
    {
      title: 'Educational & Healthcare Capital',
      desc: 'Renowned as coastal Karnataka\'s premier academic and technological center with world-class institutions.',
      icon: Compass,
    },
    {
      title: 'Rich Cultural Heritage',
      desc: 'Historic coastal temples, architecture, cultural arts, and renowned authentic coastal cuisine.',
      icon: Palmtree,
    },
    {
      title: 'Pleasant Tropical Climate',
      desc: 'November welcomes mild, pleasant post-monsoon weather ideal for academic travels and campus visits.',
      icon: Sun,
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#0b1f3a] to-[#061325] text-white relative overflow-hidden border-b border-slate-800">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Editorial Intro */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Host Destination</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Experience <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-300 to-cyan-200">
                Mangaluru
              </span>
            </h2>

            <p className="text-base sm:text-lg text-emerald-300 font-medium italic">
              &ldquo;A Blend of Education, Technology and Natural Beauty&rdquo;
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Nestled between the azure Arabian Sea and the lush Western Ghats, Mangaluru is a vibrant commercial and educational powerhouse of Karnataka, India. Known for its warm hospitality, academic prestige, and scenic coastal landscapes, it provides an inspiring backdrop for global scholarly discourse at ICCAQI 2026.
            </p>

            <div className="pt-2">
              <a
                href="https://www.karnatakatourism.org/tour-item/mangalore/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Explore Mangaluru Tourism</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Highlights Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attractions.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/50 transition-all hover:bg-slate-800/90 space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
