'use client';

import React from 'react';
import { 
  Send, 
  CheckCircle2 
} from 'lucide-react';

interface CallForPapersProps {
  onOpenSubmitModal: () => void;
}

export const CallForPapers: React.FC<CallForPapersProps> = ({ onOpenSubmitModal }) => {
  const scopes = [
    'Original, unpublished research contributions',
    'High-quality technical and theoretical rigor',
    'Interdisciplinary computing and AI applications',
    'Practical implementations, benchmarks, and prototypes',
    'Emerging technologies and quantum computational paradigms',
  ];

  return (
    <section id="call-for-papers" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Submissions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Call for Papers
          </h2>
          <p className="text-sm text-slate-600">
            Researchers, academicians, industry professionals, and students are invited to submit original research.
          </p>
        </div>

        {/* Submission Scopes */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-6 mb-8">
          <div className="max-w-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Submission Scopes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Authors are invited to submit papers addressing novel research, methodologies, and applications across our core scopes:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {scopes.map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-[#7cb305] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Ready to submit your manuscript?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Submissions are now open for ICCAQI 2026.
            </p>
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Submit Your Paper</span>
          </button>
        </div>

      </div>
    </section>
  );
};
