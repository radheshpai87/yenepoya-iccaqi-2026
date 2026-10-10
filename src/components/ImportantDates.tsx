'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const ImportantDates: React.FC = () => {
  const targetDate = new Date('2026-11-15T23:59:59').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const dates = [
    { title: 'Paper Submission Deadline', date: 'November 15, 2026', highlight: true },
    { title: 'Notification of Acceptance', date: 'November 20, 2026', highlight: false },
    { title: 'Registration Deadline', date: 'November 23, 2026', highlight: false },
    { title: 'Conference Dates', date: 'November 25 – 26, 2026', highlight: true, subtext: 'Wednesday – Thursday' },
  ];

  return (
    <section id="dates" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Schedule &amp; Milestones
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Important Dates
          </h2>
          <p className="text-sm text-slate-600">
            Please note all submission and registration deadlines for ICCAQI 2026.
          </p>
        </div>

        {/* Minimal Bright Countdown Banner */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/80 text-slate-900 rounded-3xl p-5 sm:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-5 border border-emerald-200/80 shadow-xs">
          <div className="text-center md:text-left">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Submission Deadline Countdown
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">November 15, 2026</h3>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto max-w-sm">
            <div className="text-center px-2 py-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xl sm:text-3xl font-black font-mono leading-none text-slate-900">{timeLeft.days}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-tight">Days</span>
            </div>
            <div className="text-center px-2 py-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xl sm:text-3xl font-black font-mono leading-none text-slate-900">{timeLeft.hours}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-tight">Hours</span>
            </div>
            <div className="text-center px-2 py-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xl sm:text-3xl font-black font-mono leading-none text-slate-900">{timeLeft.minutes}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mins</span>
            </div>
            <div className="text-center px-2 py-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="block text-xl sm:text-3xl font-black font-mono leading-none text-[#7cb305]">{timeLeft.seconds}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-tight">Secs</span>
            </div>
          </div>
        </div>

        {/* Clean Modern Dates List */}
        <div className="space-y-3">
          {dates.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border transition-all ${
                item.highlight
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.highlight ? 'bg-[#7cb305] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  0{idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {item.subtext && <p className="text-[11px] text-slate-500">{item.subtext}</p>}
                </div>
              </div>

              <div className="sm:text-right">
                <span className={`text-sm sm:text-base font-extrabold ${
                  item.highlight ? 'text-emerald-800' : 'text-slate-800'
                }`}>
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
