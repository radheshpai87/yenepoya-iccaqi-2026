'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  Award, 
  Building2, 
  ExternalLink, 
  X, 
  Download,
  Calendar,
  MapPin,
  Laptop
} from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  role: 'Chief Guest & Keynote Speaker' | 'Expert Speaker';
  image: string;
  country: string;
  flagUrl: string;
  designation: string;
  organization: string;
  talkType: 'Keynote Talk' | 'Expert Talk';
  talkTitle: string;
  isFeatured?: boolean;
}

export const Speakers: React.FC = () => {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const speakers: Speaker[] = [
    {
      id: 'dr-hasan-firdaus',
      name: 'Dr. Hasan Firdaus Bin Mohd. Zaki',
      role: 'Chief Guest & Keynote Speaker',
      image: '/speakers/dr-hasan-firdaus.webp',
      country: 'Malaysia',
      flagUrl: '/speakers/flag-malaysia.webp',
      designation: 'Director, Centre for Unmanned Technologies (CUTe)',
      organization: 'Associate Professor, IIUM, Malaysia',
      talkType: 'Keynote Talk',
      talkTitle: 'Perception to Action: Embodied AI for Unmanned Systems and Real-World Impact',
      isFeatured: true,
    },
    {
      id: 'prof-joerg-molt',
      name: 'Prof. (Dr.) H. C. Joerg Molt',
      role: 'Expert Speaker',
      image: '/speakers/prof-joerg-molt.webp',
      country: 'Germany',
      flagUrl: '/speakers/flag-germany.webp',
      designation: 'Head, Smart world Education',
      organization: 'AI & Smart Systems Architect, Germany',
      talkType: 'Expert Talk',
      talkTitle: 'From Punch Cards to Quantum Intelligence: The Evolution Towards a Decentralized Intelligent World',
    },
    {
      id: 'dr-shahriar-kaisar',
      name: 'Dr. Shahriar Kaisar',
      role: 'Expert Speaker',
      image: '/speakers/dr-shahriar-kaisar.webp',
      country: 'Australia',
      flagUrl: '/speakers/flag-australia.webp',
      designation: 'Deputy Head, Department of Information Systems & Business Analytics',
      organization: 'RMIT University, Sydney, Australia',
      talkType: 'Expert Talk',
      talkTitle: 'The AI-Powered Future: Rethinking Security, Privacy and Digital Trust',
    },
    {
      id: 'dr-araceli-venegas-gomez',
      name: 'Dr. Araceli Venegas-Gomez',
      role: 'Expert Speaker',
      image: '/speakers/dr-araceli-venegas-gomez.webp',
      country: 'Spain',
      flagUrl: '/speakers/flag-spain.webp',
      designation: 'Founder and Director, QURECA Spain',
      organization: 'The Quantum Ambassador & Quantum Technologies Expert, Spain',
      talkType: 'Expert Talk',
      talkTitle: 'Quantum Computing and Quantum Simulation: Emerging Opportunities, Applications, and Career Pathways',
    },
    {
      id: 'dr-hazrat-ali',
      name: 'Dr. Hazrat Ali',
      role: 'Expert Speaker',
      image: '/speakers/dr-hazrat-ali.webp',
      country: 'United Kingdom',
      flagUrl: '/speakers/flag-uk.webp',
      designation: 'Lecturer in AI, School of Computing, Data, and Mathematical Sciences',
      organization: 'University of Stirling, United Kingdom',
      talkType: 'Expert Talk',
      talkTitle: 'Where Generative AI and Large Language Models meet Healthcare?',
    },
  ];

  const keynoteSpeaker = speakers.find((s) => s.isFeatured) || speakers[0];
  const expertSpeakers = speakers.filter((s) => !s.isFeatured);

  return (
    <section id="speakers" className="pt-20 md:pt-24 pb-16 md:pb-20 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keynotes &amp; Global Leaders</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Distinguished Speakers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            World-renowned scholars, research directors, and technology architects delivering visionary keynotes on Artificial Intelligence, Quantum Computing, and Next-Generation Systems.
          </p>
        </div>

        {/* 1. Chief Guest & Keynote Speaker Highlight Card */}
        <div className="mb-8">
          <div className="relative rounded-3xl bg-white border border-purple-200/80 shadow-md p-6 sm:p-8 md:p-10 overflow-hidden hover:shadow-lg transition-all">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
              {/* Speaker Avatar & Country */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-purple-100 shadow-md bg-purple-50">
                    <img
                      src={keynoteSpeaker.image}
                      alt={keynoteSpeaker.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-xs">
                    <Award className="w-3.5 h-3.5 text-purple-700" />
                    <span>{keynoteSpeaker.role}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-2 pt-1 text-slate-700 font-semibold text-xs sm:text-sm">
                    <img 
                      src={keynoteSpeaker.flagUrl} 
                      alt={`${keynoteSpeaker.country} flag`} 
                      width={24}
                      height={16}
                      className="h-3.5 w-5 rounded-xs object-cover border border-slate-300 shadow-2xs shrink-0" 
                    />
                    <span>{keynoteSpeaker.country}</span>
                  </div>
                </div>
              </div>

              {/* Speaker Content & Talk Details */}
              <div className="lg:col-span-8 space-y-5 text-left">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {keynoteSpeaker.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                    <p className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-[#7cb305] shrink-0 mt-0.5" />
                      <span>{keynoteSpeaker.designation}</span>
                    </p>
                    <p className="pl-6 text-slate-500">
                      {keynoteSpeaker.organization}
                    </p>
                  </div>
                </div>

                {/* Keynote Talk Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/50 border border-purple-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900">
                    <Mic className="w-4 h-4 text-purple-700" />
                    <span>{keynoteSpeaker.talkType}</span>
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-purple-950 leading-snug">
                    &ldquo;{keynoteSpeaker.talkTitle}&rdquo;
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Expert Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
          {expertSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header with Photo and Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 ring-2 ring-slate-100 shadow-xs bg-slate-100">
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        <Award className="w-3 h-3 text-sky-600" />
                        {speaker.role}
                      </span>
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <img 
                          src={speaker.flagUrl} 
                          alt={`${speaker.country} flag`} 
                          width={20}
                          height={14}
                          className="h-3.5 w-5 rounded-xs object-cover border border-slate-300 shadow-2xs shrink-0" 
                        />
                        <span>{speaker.country}</span>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                      {speaker.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">
                      {speaker.designation}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {speaker.organization}
                    </p>
                  </div>
                </div>

                {/* Expert Talk Title Box */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{speaker.talkType}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    &ldquo;{speaker.talkTitle}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Conference Quick Meta & View Poster Card */}
        <div className="mt-10 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Dates</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">25–26 Nov 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Venue</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">Seminar Hall, Balmatta</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Mode</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">Hybrid (In-Person / Online)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-center">
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs transition-all active:scale-98 cursor-pointer w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Official Announcement Poster</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Full Announcement Poster */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                ICCAQI 2026 — Distinguished Speakers Poster
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/distinguished-speakers-poster.webp"
                  download="ICCAQI-2026-Distinguished-Speakers.webp"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all"
                  title="Download Poster"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsPosterModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Poster Image */}
            <div className="overflow-y-auto p-4 flex justify-center bg-slate-100">
              <img
                src="/distinguished-speakers-poster.webp"
                alt="ICCAQI 2026 Distinguished Speakers Announcement Poster"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
