import React from 'react';
import { 
  Users2, 
  Mic2, 
  Sparkles, 
  Globe2, 
  Clock, 
  Building2,
  BellRing
} from 'lucide-react';

export const Speakers: React.FC = () => {
  const speakerPlaceholders = [
    {
      slot: 'Keynote Speaker 01',
      domain: 'Artificial Intelligence & Large Foundation Models',
      type: 'International Academic Keynote',
      institutionHint: 'Premier Global University / Research Institute',
      avatarBg: 'from-blue-600 to-indigo-800',
    },
    {
      slot: 'Keynote Speaker 02',
      domain: 'Quantum Computing & Quantum Algorithms',
      type: 'Quantum Intelligence Luminary',
      institutionHint: 'International Quantum Laboratory / R&D Institute',
      avatarBg: 'from-emerald-600 to-teal-800',
    },
    {
      slot: 'Keynote Speaker 03',
      domain: 'Future Technologies & Cyber-Physical IoT',
      type: 'Industry Technology Leader',
      institutionHint: 'Leading Enterprise Technology Research Labs',
      avatarBg: 'from-purple-600 to-slate-800',
    },
  ];

  return (
    <section id="speakers" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Mic2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Distinguished Talks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Keynote <span className="text-[#0369a1]">Speakers</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Distinguished scholars and industry pioneers addressing critical frontiers in computing and quantum intelligence.
          </p>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#7cb305] to-[#0284c7] mx-auto rounded-full mt-2" />
        </div>

        {/* Speaker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {speakerPlaceholders.map((sp, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group"
            >
              {/* Circular Portrait Placeholder */}
              <div className="relative mb-5">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${sp.avatarBg} flex items-center justify-center text-white shadow-md p-1 group-hover:scale-105 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-full border-2 border-white/40 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-xs">
                    <Mic2 className="w-8 h-8 text-white/90 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-tighter text-emerald-300 mt-1">
                      ICCAQI-26
                    </span>
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-bold text-white border border-slate-700 shadow-xs">
                  Keynote
                </span>
              </div>

              {/* Slot & Category */}
              <span className="text-[11px] font-mono font-bold text-[#0369a1] uppercase tracking-wider mb-1">
                {sp.slot}
              </span>

              {/* Notice text */}
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Speaker to be Announced
              </h3>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold mb-3 border border-emerald-100">
                {sp.domain}
              </span>

              <p className="text-xs text-slate-500 leading-relaxed mt-auto pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{sp.institutionHint}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Academic Note banner */}
        <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs flex items-center justify-center gap-3">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-slate-600">
            <strong>Speaker details will be announced soon.</strong> Plenary addresses and technical session schedules will be updated following technical review completion.
          </p>
        </div>

      </div>
    </section>
  );
};
