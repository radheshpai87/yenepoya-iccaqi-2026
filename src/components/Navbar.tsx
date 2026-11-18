'use client';

import React, { useState, useEffect } from 'react';
import { YenepoyaLogo } from './YenepoyaLogo';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenSubmitModal: () => void;
  onOpenBrochureModal: () => void;
  onOpenRegisterModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmitModal,
  onOpenBrochureModal,
  onOpenRegisterModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Speakers', href: '#speakers' },
    { name: 'Dates', href: '#dates' },
    { name: 'Registration', href: '#registration' },
    { name: 'Publication', href: '#publication' },
    { name: 'Venue', href: '#venue' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['about', 'speakers', 'dates', 'registration', 'publication', 'venue', 'contact'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(target, { offset: -70, duration: 0.6 });
      } else {
        const topOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Running Announcement Ticker Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 shadow-xs border-b border-red-700/40 flex items-center gap-2 sm:gap-3 overflow-hidden select-none">
          {/* Static Alert Badge */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-black/25 text-white font-extrabold text-[10px] sm:text-[11px] tracking-wider uppercase shrink-0 z-10 shadow-2xs border border-white/20">
            <span className="animate-pulse">📢</span>
            <span>IMPORTANT</span>
          </div>

          {/* Scrolling Marquee Area */}
          <div 
            className="overflow-hidden whitespace-nowrap flex-1 flex items-center cursor-pointer"
            onClick={(e) => scrollToSection(e as any, '#dates')}
            title="Click to view updated deadlines"
          >
            <div className="animate-marquee flex items-center gap-10 sm:gap-14 font-medium text-white/95">
              <span className="flex items-center gap-2">
                <span>The <strong>Paper Registration Deadline</strong> for ICCAQI 2026 has been preponed to <span className="bg-white text-red-700 font-black px-1.5 py-0.5 rounded shadow-2xs">20 November 2026</span>. Participant Registration remains open until <span className="bg-white/20 text-white font-black px-1.5 py-0.5 rounded border border-white/30">23 November 2026</span>. Register within the respective deadlines!</span>
              </span>
              <span className="flex items-center gap-2">
                <span>The <strong>Paper Registration Deadline</strong> for ICCAQI 2026 has been preponed to <span className="bg-white text-red-700 font-black px-1.5 py-0.5 rounded shadow-2xs">20 November 2026</span>. Participant Registration remains open until <span className="bg-white/20 text-white font-black px-1.5 py-0.5 rounded border border-white/30">23 November 2026</span>. Register within the respective deadlines!</span>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-amber-100 text-red-700 font-extrabold text-[10.5px] shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Register</span>
            <span>→</span>
          </button>
        </div>

        {/* Main Navbar */}
        <div
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2 sm:py-2.5'
              : 'bg-white/90 backdrop-blur-sm border-b border-slate-200/40 py-2.5 sm:py-3.5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
            
            {/* Logo */}
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

            {/* Desktop Navigation Links (with Themes, Call for Papers, and Committee removed) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
                      isActive
                        ? 'text-slate-950 bg-slate-100 font-bold'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </nav>

            {/* Header Right Action */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={onOpenBrochureModal}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-full transition-colors cursor-pointer"
              >
                Brochure
              </button>
              <button
                onClick={onOpenSubmitModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>Submit Your Paper</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle (< sm) */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={onOpenSubmitModal}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#7cb305] text-white shadow-xs whitespace-nowrap active:scale-95"
              >
                Submit Your Paper
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl z-50 flex flex-col pt-20 pb-6 px-6 overflow-y-auto">
            <div className="flex flex-col gap-1.5 flex-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegisterModal();
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md text-center"
              >
                Register as Participant
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubmitModal();
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md text-center"
              >
                Submit Your Paper
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBrochureModal();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 text-center"
              >
                View Official Brochure
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
