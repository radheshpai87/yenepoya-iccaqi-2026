import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export const Publication: React.FC = () => {
  const indexingList = [
    'Scopus (Q3/Q4 Consideration)',
    'Wiley Book Series',
    'Google Scholar',
    'Crossref & DOI',
    'Dimensions',
    'EBSCO',
    'MIAR',
    'Ulrichsweb',
    'DeepDyve',
    'TrendMD',
  ];

  return (
    <section id="publication" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Proceedings
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Publication &amp; Indexing
          </h2>
          <p className="text-sm text-slate-600">
            Scholarly dissemination channels and indexing for accepted papers.
          </p>
        </div>

        {/* Highlighted Publication Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Journal publication */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                All Accepted &amp; Presented Papers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All accepted and presented papers will be published in a reputed peer-reviewed journal indexed in <strong>Google Scholar, Crossref, MIAR, Ulrichsweb, EBSCO, DeepDyve, Dimensions, and TrendMD</strong>, with official <strong>DOI assignment</strong>.
              </p>
            </div>

            {/* Scopus / Wiley Consideration */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Selected High-Impact Papers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Selected papers will be considered for publication in <strong>Scopus-indexed Q3/Q4 journals</strong> or as book chapters in <strong>Scopus-indexed Wiley book series</strong>, subject to additional peer review and applicable publication requirements.
              </p>
            </div>

          </div>

          {/* Indexing Badges */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Referenced Indexing Services &amp; Archival:
            </span>
            <div className="flex flex-wrap gap-2">
              {indexingList.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            * Publication and indexing opportunities are subject to applicable editorial, peer-review, and publisher requirements.
          </p>
        </div>

      </div>
    </section>
  );
};
