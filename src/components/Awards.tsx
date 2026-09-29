import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  FileCheck, 
  Star,
  CheckCircle2
} from 'lucide-react';

export const Awards: React.FC = () => {
  const awards = [
    {
      title: 'Best Paper Award',
      category: 'Overall Excellence',
      desc: 'Conferred upon outstanding research papers demonstrating exemplary methodological rigor, novel contributions, and high impact in computing and AI.',
      icon: Trophy,
      badge: 'Gold Certificate & Plaque',
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-300',
      iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
    },
    {
      title: 'Young Researcher Recognition',
      category: 'Emerging Scholars',
      desc: 'Special honor recognizing exceptional research contributions led by student researchers, PhD candidates, and early-career academicians.',
      icon: Star,
      badge: 'Special Honor Certificate',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300',
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Participation Certificates',
      category: 'All Registered Delegates',
      desc: 'Official verified digital and physical certificates awarded to all registered authors, co-authors, and delegates presenting their research at ICCAQI 2026.',
      icon: FileCheck,
      badge: 'Official University Credential',
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent border-sky-300',
      iconColor: 'text-[#0284c7] bg-sky-50 border-sky-200',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Honors &amp; Recognition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Awards &amp; <span className="text-[#0369a1]">Recognition</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Celebrating exceptional scientific inquiry and scholarship across all conference tracks.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {awards.map((aw, idx) => {
            const IconComponent = aw.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-7 border ${aw.gradient} shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${aw.iconColor}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {aw.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {aw.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {aw.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{aw.badge}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
