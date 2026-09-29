'use client';

import React from 'react';
import { 
  FileText, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle 
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

  const guidelines = [
    'Standard manuscript length: 6–8 pages (including figures & references)',
    'Strict similarity policy (<15% similarity check excluding references)',
    'Submissions evaluated via double-blind international peer review',
    'Accepted papers must be presented by at least one registered author',
  ];

  return (
    <section id="call-for-papers" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Box 1: Scopes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submission Scopes
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {scopes.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#7cb305] shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Box 2: Guidelines */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submission Guidelines
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Action Strip */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Templates:</span>
            <button
              onClick={() => alert("LaTeX package files will be provided in the author submission pack.")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>LaTeX</span>
            </button>
            <button
              onClick={() => alert("MS Word (.docx) template conforms to standard double-column formatting.")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MS Word</span>
            </button>
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs cursor-pointer"
          >
            Submit Your Paper
          </button>
        </div>

      </div>
    </section>
  );
};
