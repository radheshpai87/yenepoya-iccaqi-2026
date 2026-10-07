import React from 'react';
import { Users, GraduationCap, Crown } from 'lucide-react';

export const Committee: React.FC = () => {
  const chiefPatron = {
    name: 'Dr. Yenepoya Abdulla Kunhi',
    designation: 'Hon\'ble Chancellor',
    affiliation: 'Yenepoya (Deemed to be University)',
    role: 'Chief Patron',
  };

  const patrons = [
    { name: 'Mr. Mohammed Farhaad Yenepoya', designation: 'Pro Chancellor' },
    { name: 'Dr. M. Vijayakumar', designation: 'Pro Chancellor' },
    { name: 'Dr. K. S. Gangadhara Somayaji', designation: 'Vice Chancellor' },
    { name: 'Dr. B. H. Sripathi Rao', designation: 'Pro Vice Chancellor' },
    { name: 'Dr. Aswini Dutt R', designation: 'Registrar' },
  ];

  const leadership = [
    {
      role: 'Organizing Chair',
      name: 'Dr. Rajesh Gratian D\'Souza',
      designation: 'Dean, Faculty of Engineering & Technology',
      affiliation: 'Yenepoya (Deemed to be University)',
    },
    {
      role: 'Organizing Co-Chair',
      name: 'Dr. Prabhakara B.K',
      designation: 'Head, Department of CSE',
      affiliation: 'Yenepoya School of Engineering & Technology',
    },
    {
      role: 'Chief Coordinator',
      name: 'Dr. Mohammed Sidheeque',
      designation: 'Associate Professor, Department of CSE',
      affiliation: 'Yenepoya School of Engineering & Technology',
    },
    {
      role: 'Chair, Advisory Committee',
      name: 'Dr. Rakesh K K',
      designation: 'Senior Assistant Professor, Dept. of Computer Science',
      affiliation: 'YIASCM',
    },
  ];

  return (
    <section id="committee" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Organizing Committee
          </h2>
          <p className="text-sm text-slate-600">
            Official conference leadership and organizing committee of ICCAQI 2026.
          </p>
        </div>

        {/* Chief Patron Card - Bright Executive Style */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 text-slate-900 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm border-2 border-emerald-200">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pb-3 border-b border-slate-200/80">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya (Deemed to be University)"
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <div className="h-5 w-[1px] bg-slate-300 hidden sm:block" />
              <img
                src="/yenepoya-school-engineering-and-technologynew-02.svg"
                alt="Yenepoya School of Engineering & Technology"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              {chiefPatron.role}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{chiefPatron.name}</h3>
            <p className="text-[#659b02] text-xs sm:text-sm font-bold">{chiefPatron.designation}</p>
            <p className="text-slate-600 text-xs">{chiefPatron.affiliation}</p>
          </div>
        </div>

        {/* Patrons */}
        <div className="mb-10">
          <h4 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Patrons
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {patrons.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1"
              >
                <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                <p className="text-[11px] text-emerald-700 font-semibold">{p.designation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organizing Chairs */}
        <div>
          <h4 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Organizing Team
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leadership.map((lead, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1"
              >
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
                  {lead.role}
                </span>
                <h5 className="text-sm font-bold text-slate-900">{lead.name}</h5>
                <p className="text-xs text-slate-600 font-medium">{lead.designation}</p>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">{lead.affiliation}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
