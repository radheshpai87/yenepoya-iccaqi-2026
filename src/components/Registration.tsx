'use client';

import React, { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';

interface RegistrationProps {
  onOpenRegisterModal: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onOpenRegisterModal }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const tiers = [
    {
      title: 'Participants Only',
      desc: 'Attendees & Observers',
      feeInr: '₹300',
      feeUsd: '$5.00',
      highlight: false,
    },
    {
      title: 'Students (UG / PG)',
      desc: 'Subsidized Student Category',
      feeInr: '₹500',
      feeUsd: '$10.00',
      highlight: true,
    },
    {
      title: 'Research Scholars / Faculty',
      desc: 'Academicians & Scientists',
      feeInr: '₹750',
      feeUsd: '$15.00',
      highlight: false,
    },
    {
      title: 'Industry Delegates',
      desc: 'Corporate & R&D Professionals',
      feeInr: '₹1,500',
      feeUsd: '$20.00',
      highlight: false,
    },
  ];

  return (
    <section id="registration" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Participation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Registration Fees
          </h2>
          <p className="text-sm text-slate-600">
            Participant Category &amp; Fees (All fees inclusive of applicable GST)
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currency === 'INR' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* 4 Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                t.highlight
                  ? 'bg-gradient-to-b from-white to-emerald-50/60 border-2 border-emerald-500 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-900 border-slate-200/80 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <span className={`text-[10.5px] font-bold uppercase tracking-wider block mb-1 ${
                  t.highlight ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  {t.desc}
                </span>

                <h3 className="text-base font-bold text-slate-900 mb-4">
                  {t.title}
                </h3>

                <div className={`text-3xl font-black mb-1 ${
                  t.highlight ? 'text-emerald-800' : 'text-slate-900'
                }`}>
                  {currency === 'INR' ? t.feeInr : t.feeUsd}
                </div>
                <span className="text-[11px] text-slate-500 block mb-6">
                  Inclusive of GST
                </span>
              </div>

              <button
                onClick={onOpenRegisterModal}
                className={`w-full py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  t.highlight
                    ? 'bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                Register
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500">
          * Note: <strong>Register upon intimation of acceptance.</strong> Authors will receive official payment instructions upon paper acceptance.
        </p>

      </div>
    </section>
  );
};
