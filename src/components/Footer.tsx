'use client';

import React from 'react';
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
      lenis.scrollTo(0, { duration: 1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Logo & Copyright */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
          <img
            src="/yenepoya-university-logonew3-white.svg"
            alt="Yenepoya (Deemed to be University)"
            className="h-6 w-auto object-contain"
          />
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span>© 2026 ICCAQI • Yenepoya (Deemed to be University). All Rights Reserved.</span>
        </div>

        {/* Right: Quick Action Links & Back to top */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={onOpenBrochureModal}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Brochure
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Register (₹300)
          </button>
          <button
            onClick={onOpenSubmitModal}
            className="font-semibold text-[#94cf1b] hover:text-[#a8e822] transition-colors cursor-pointer"
          >
            Submit Paper
          </button>
          <span className="text-slate-800">|</span>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
