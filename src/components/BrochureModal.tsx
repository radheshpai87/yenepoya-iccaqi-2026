'use client';

import React from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 z-10 border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 pr-8 sm:pr-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Official Conference Publication
            </span>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
              ICCAQI 2026 Official Brochure &amp; Poster
            </h3>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href="/iccaqi-2026-poster.webp"
              download="ICCAQI-2026-Official-Poster.webp"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Poster</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Image Preview */}
        <div className="flex-1 overflow-y-auto py-4 flex justify-center bg-slate-100 rounded-2xl my-4 border border-slate-200">
          <img
            src="/iccaqi-2026-poster.webp"
            alt="ICCAQI 2026 Official Poster - Yenepoya School of Engineering & Technology"
            width={1200}
            height={1600}
            loading="lazy"
            decoding="async"
            className="max-w-full h-auto rounded-xl shadow-md object-contain"
          />
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Yenepoya (Deemed to be University) • Mangaluru, India</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
