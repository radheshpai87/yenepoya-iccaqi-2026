'use client';

import React from 'react';
import { YenepoyaLogo } from './YenepoyaLogo';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenBrochureModal: () => void;
  onOpenSubmitModal: () => void;
  onOpenRegisterModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBrochureModal,
  onOpenSubmitModal,
  onOpenRegisterModal,
}) => {
  const scrollToTop = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-850">
          <div>
            <YenepoyaLogo variant="light" showDual={false} />
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 max-w-md">
              ICCAQI 2026 • International Conference on Computing, AI, Quantum Intelligence and Future Technologies. Mangaluru, Karnataka, India.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenBrochureModal}
              className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Brochure
            </button>
            <button
              onClick={onOpenRegisterModal}
              className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Register
            </button>
            <button
              onClick={onOpenSubmitModal}
              className="text-xs font-bold text-white bg-[#7cb305] hover:bg-[#689803] px-3.5 py-1 rounded-full transition-colors"
            >
              Submit Paper
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500">
          <p>© 2026 ICCAQI • Yenepoya (Deemed to be University). All Rights Reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
