'use client';

import React, { useState, useEffect } from 'react';
import { YenepoyaLogo } from './YenepoyaLogo';
import { ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenSubmitModal: () => void;
  onOpenBrochureModal?: () => void;
  onOpenRegisterModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmitModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5 sm:py-3'
          : 'bg-white/85 backdrop-blur-sm border-b border-slate-200/40 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo with Yenepoya University and NAAC A+ Badge */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const lenis = (window as any).__lenis;
              if (lenis) lenis.scrollTo(0, { duration: 0.6 });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center focus:outline-hidden"
            aria-label="ICCAQI 2026 Home"
          >
            <YenepoyaLogo />
          </a>

          {/* Primary CTA */}
          <div className="flex items-center">
            <button
              onClick={onOpenSubmitModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>Submit Your Paper</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
