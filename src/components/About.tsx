import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  Lightbulb, 
  Share2, 
  Users, 
  BookOpen, 
  Cpu, 
  Sparkles,
  Award,
  ArrowRight
} from 'lucide-react';

export const About: React.FC = () => {
  const visionOpportunities = [
    {
      title: 'Present',
      desc: 'Share original research and innovative ideas with an international audience.',
      icon: Lightbulb,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
    {
      title: 'Connect',
      desc: 'Build academic, research, and industry networks.',
      icon: Users,
      color: 'text-sky-600 bg-sky-50 border-sky-200/80',
    },
    {
      title: 'Collaborate',
      desc: 'Identify opportunities for interdisciplinary and institutional collaboration.',
      icon: Share2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      title: 'Learn',
      desc: 'Engage with experts working in emerging areas of computing and AI.',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50 border-purple-200/80',
    },
    {
      title: 'Innovate',
      desc: 'Explore the transition from research ideas to practical technological solutions.',
      icon: Cpu,
      color: 'text-blue-600 bg-blue-50 border-blue-200/80',
    },
    {
      title: 'Publish',
      desc: "Provide publication opportunities through the conference's associated publication pathways, subject to the applicable peer-review and editorial processes.",
      icon: Award,
      color: 'text-rose-600 bg-rose-50 border-rose-200/80',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 sm:space-y-16">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            About The Conference
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            About ICCAQI 2026
          </h2>
          <p className="text-base sm:text-lg font-semibold text-slate-700">
            International Conference on Computing, AI, Quantum Intelligence and Future Technologies
          </p>
        </div>

        {/* Clean Editorial Intro Card */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-slate-200/80">
            {/* Host Institution Logos */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya (Deemed to be University)"
                width={200}
                height={44}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <div className="h-6 w-[1.5px] bg-slate-300 hidden sm:block" />
              <img
                src="/yenepoya-school-engineering-and-technologynew-02.svg"
                alt="Yenepoya School of Engineering & Technology"
                width={240}
                height={44}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>

            {/* Conference Emblem & Publication Partner Logos */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="h-7 w-[1.5px] bg-slate-200 hidden md:block" />
              <img
                src="/iccaqi-logo.webp"
                alt="ICCAQI 2026 Official Conference Logo"
                width={180}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div className="h-6 w-[1.5px] bg-slate-300 hidden sm:block" />
              <img
                src="/imanager-publications-logo.webp"
                alt="i-manager Publications Partner"
                width={180}
                height={44}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>

          <div className="space-y-4 text-slate-800 leading-relaxed text-base sm:text-lg">
            <p>
              ICCAQI 2026 is an international conference organized by the Yenepoya School of Engineering &amp; Technology (YSET), Yenepoya (Deemed to be University), Mangaluru, Karnataka, India, bringing together researchers, academicians, industry professionals, innovators, research scholars, and students to share ideas, research findings, emerging technologies, and innovative solutions in computing and next-generation technologies.
            </p>
            <p className="text-slate-700 text-sm sm:text-base">
              The conference focuses on the rapidly evolving landscape of <strong>Computing, Artificial Intelligence, Quantum Intelligence, and Future Technologies</strong>. It aims to provide a platform for meaningful academic exchange, interdisciplinary collaboration, research dissemination, and industry–academia interaction.
            </p>
          </div>
        </div>

        {/* About University & About YSET Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* About Yenepoya University */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Host University
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    About Yenepoya (Deemed to be University)
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Yenepoya (Deemed to be University) is a higher-education institution in Mangaluru with a stated vision of providing quality higher education, creating a vibrant knowledge capital, and developing future leaders. Its mission emphasizes academic excellence, global competencies, meaningful research, ethical academic practices, and extending knowledge for community development. The University also identifies research, innovation, seminars, workshops, and collaboration with academia and industry as important institutional objectives.
                </p>
                <p>
                  Yenepoya was granted Deemed-to-be-University status under Section 3A of the UGC Act in 2008. The University currently offers programmes across multiple disciplines, including engineering, science, health sciences, and other areas, with research and interdisciplinary education forming important components of its academic ecosystem.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Mangaluru, Karnataka, India • UGC Recognized Deemed-to-be-University</span>
            </div>
          </div>

          {/* About YSET */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                    Organizing Institute
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Yenepoya School of Engineering &amp; Technology (YSET)
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Yenepoya School of Engineering &amp; Technology (YSET) is a constituent unit of Yenepoya (Deemed to be University), located at Yenepoya Complex, Balmatta, Mangaluru, Karnataka. YSET offers B.Tech programmes in areas including Artificial Intelligence and Machine Learning, Computer Science and Engineering, Computer Science and Engineering (Artificial Intelligence), and Software Engineering, along with programmes in other emerging technology domains.
                </p>
                <p>
                  YSET also offers a Certification Course in Quantum Computing and Quantum AI, reflecting its commitment to emerging and transformative technologies.
                </p>
                <p>
                  YSET emphasizes interdisciplinary education, research, practical learning, industry interaction, and emerging technologies, while fostering creative, innovative, and analytical skills among students. With modern laboratories and a stimulating academic environment, YSET provides opportunities for students and faculty to engage in cutting-edge areas of technology and research, with a strong focus on technical excellence, innovation, research, ethical conduct, and societal impact.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Sparkles className="w-4 h-4 text-[#7cb305]" />
              <span>Balmatta, Mangaluru • Centre for Quantum AI &amp; Emerging Technologies</span>
            </div>
          </div>

        </div>

        {/* Conference Vision */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 space-y-8">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              Strategic Purpose
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Conference Vision
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              ICCAQI 2026 aims to create a platform where research, innovation, emerging technologies, and interdisciplinary collaboration converge. The conference seeks to encourage participants to move beyond conventional approaches and explore how advances in Artificial Intelligence, Quantum Computing, intelligent systems, and future technologies can address contemporary academic, industrial, healthcare, and societal challenges.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
              ICCAQI 2026 provides an opportunity to:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visionOpportunities.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-sm sm:text-base text-slate-900">
                        {item.title}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
