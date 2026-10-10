import React from 'react';
import { Calendar, MapPin, Globe, Sparkles, ShieldCheck } from 'lucide-react';

export const ConferenceStrip: React.FC = () => {
  return (
    <section className="relative z-20 -mt-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-r from-[#0b1f3a] via-[#0f2942] to-[#061325] text-white rounded-2xl shadow-xl border border-slate-700/60 p-5 md:p-6 backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
          
          {/* Item 1: Date */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                Conference Dates
              </span>
              <p className="text-sm md:text-base font-extrabold text-white">
                Nov 25–26, 2026
              </p>
              <span className="text-[10px] text-slate-400">Wednesday – Thursday</span>
            </div>
          </div>

          {/* Item 2: Location */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-bold text-sky-400">
                Conference Venue
              </span>
              <p className="text-sm md:text-base font-extrabold text-white">
                Mangaluru, India
              </p>
              <span className="text-[10px] text-slate-400">Yenepoya Campus, Karnataka</span>
            </div>
          </div>

          {/* Item 3: Mode */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-bold text-indigo-400">
                Conference Mode
              </span>
              <p className="text-sm md:text-base font-extrabold text-white">
                Hybrid Format
              </p>
              <span className="text-[10px] text-slate-400">Online &amp; In-Person Options</span>
            </div>
          </div>

          {/* Item 4: Accreditations */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-bold text-amber-400">
                Institutional Standing
              </span>
              <p className="text-sm md:text-base font-extrabold text-white">
                NAAC &apos;A+&apos; Grade
              </p>
              <span className="text-[10px] text-slate-400">Peer-Reviewed &amp; Indexed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
