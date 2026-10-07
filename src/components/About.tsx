import React from 'react';
import { CheckCircle2, Building2, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  const objectives = [
    'Promote innovative research across computing, AI, quantum intelligence, and future technologies.',
    'Encourage interdisciplinary collaboration between academia, research laboratories, and industry.',
    'Connect academia and global industry leaders to accelerate practical technology adoption.',
    'Share emerging technological developments and high-impact computational discoveries.',
    'Provide a premier platform for researchers, academicians, professionals, and students.',
    'Encourage practical, ethical, and impactful technology research addressing real-world challenges.',
    'Promote global academic collaboration and foster long-term international research partnerships.',
  ];

  return (
    <section id="about" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            About The Conference
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            About ICCAQI 2026
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Yenepoya School of Engineering &amp; Technology • Yenepoya (Deemed to be University)
          </p>
        </div>

        {/* Clean Editorial Intro */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-slate-200/80">
            {/* Host Institution Logos */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya (Deemed to be University)"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <div className="h-6 w-[1.5px] bg-slate-300 hidden sm:block" />
              <img
                src="/yenepoya-school-engineering-and-technologynew-02.svg"
                alt="Yenepoya School of Engineering & Technology"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>

            {/* Conference Emblem & Publication Partner Logos */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="h-7 w-[1.5px] bg-slate-200 hidden md:block" />
              <img
                src="/iccaqi-logo.png"
                alt="ICCAQI 2026 Official Conference Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div className="h-6 w-[1.5px] bg-slate-300 hidden sm:block" />
              <img
                src="/imanager-publications-logo.png"
                alt="i-manager Publications Partner"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>

          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            We cordially invite you to submit your original, unpublished, and high-quality research work to this international conference. The conference aims to provide a global platform for researchers, academicians, industry professionals, and students to share innovative ideas, research findings, and practical experiences in the areas of <strong>Computing, AI, Quantum Intelligence and Future Technologies</strong>.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hosted in the coastal academic hub of Mangaluru, Karnataka, ICCAQI 2026 connects researchers across continents through physical and virtual hybrid presentations, rigorous peer review, and indexed publication pathways.
          </p>
        </div>

        {/* Objectives */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 text-center sm:text-left">
            Conference Objectives
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {objectives.map((obj, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
              >
                <CheckCircle2 className="w-5 h-5 text-[#7cb305] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
