import React from 'react';
import { 
  Lightbulb, 
  Globe2, 
  Building, 
  Share2, 
  BookMarked, 
  Network, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

export const WhyParticipate: React.FC = () => {
  const reasons = [
    {
      icon: Lightbulb,
      title: 'Research & Innovation',
      desc: 'Present pioneering findings to an international audience and gain critical, constructive feedback from domain experts.',
      accent: 'border-emerald-200 hover:border-emerald-500 text-emerald-600 bg-emerald-50',
    },
    {
      icon: Globe2,
      title: 'International Collaboration',
      desc: 'Forge multidisciplinary linkages with research laboratories, academic scholars, and innovators across continents.',
      accent: 'border-sky-200 hover:border-sky-500 text-sky-600 bg-sky-50',
    },
    {
      icon: Building,
      title: 'Industry Interaction',
      desc: 'Connect with technology enterprises and R&D practitioners driving practical implementations of AI and quantum systems.',
      accent: 'border-indigo-200 hover:border-indigo-500 text-indigo-600 bg-indigo-50',
    },
    {
      icon: Share2,
      title: 'Knowledge Exchange',
      desc: 'Engage in intensive technical discussions, keynote sessions, and panels covering breakthroughs in next-gen computing.',
      accent: 'border-amber-200 hover:border-amber-500 text-amber-600 bg-amber-50',
    },
    {
      icon: BookMarked,
      title: 'Publication Opportunities',
      desc: 'Accepted papers considered for publication in reputed peer-reviewed journals and Scopus-indexed channels.',
      accent: 'border-teal-200 hover:border-teal-500 text-teal-600 bg-teal-50',
    },
    {
      icon: Network,
      title: 'Academic Networking',
      desc: 'Expand professional networks, explore joint grant proposals, and build long-term mentorship relationships.',
      accent: 'border-violet-200 hover:border-violet-500 text-violet-600 bg-violet-50',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7cb305]" />
            <span>Value &amp; Benefits</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Participate in <span className="text-[#0369a1]">ICCAQI 2026?</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Discover the key advantages of presenting your research and participating in this premier international forum.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.accent} transition-transform group-hover:scale-110 duration-200`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#0369a1] transition-colors flex items-center gap-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  <span>Learn more in Guidelines</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
