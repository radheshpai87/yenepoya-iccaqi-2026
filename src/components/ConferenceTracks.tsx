'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Atom, 
  Database, 
  CloudLightning, 
  Wifi, 
  Cpu, 
  HeartPulse, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight 
} from 'lucide-react';

interface TracksProps {
  onSelectTrackForSubmission: (trackName: string) => void;
}

export const ConferenceTracks: React.FC<TracksProps> = ({ onSelectTrackForSubmission }) => {
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);

  const tracks = [
    {
      id: 1,
      num: '01',
      title: 'Artificial Intelligence and Machine Learning',
      desc: 'Deep Learning, NLP, Foundation Models, Computer Vision, and Reinforcement Learning.',
      icon: Bot,
      topics: [
        'Deep Neural Architectures & LLMs',
        'Computer Vision & Multimodal Perception',
        'Explainable & Trustworthy AI (XAI)',
        'Edge AI & Model Optimization',
      ],
    },
    {
      id: 2,
      num: '02',
      title: 'Quantum Computing and Quantum Intelligence',
      desc: 'Quantum algorithms, Quantum Machine Learning, Quantum Cryptography, and Hardware.',
      icon: Atom,
      topics: [
        'Quantum Machine Learning (QML)',
        'Post-Quantum Cryptography & QKD',
        'Quantum Algorithms & Simulators',
        'Fault-Tolerant Quantum Architecture',
      ],
    },
    {
      id: 3,
      num: '03',
      title: 'Data Science, Big Data and Analytics',
      desc: 'Distributed systems, Predictive Analytics, Knowledge Graphs, and Real-Time Stream Mining.',
      icon: Database,
      topics: [
        'Scalable Big Data Pipelines',
        'Predictive Modeling & Statistical AI',
        'Knowledge Graphs & Semantic Web',
        'Privacy-Preserving Data Mining',
      ],
    },
    {
      id: 4,
      num: '04',
      title: 'Emerging Computing Technologies',
      desc: 'Edge & Fog Computing, Neuromorphic Hardware, High-Performance Computing, and Cloud.',
      icon: CloudLightning,
      topics: [
        'Edge-to-Cloud Continuum',
        'Neuromorphic & Bio-Inspired Systems',
        'High-Performance & Green Computing',
        'Serverless & Distributed Computing',
      ],
    },
    {
      id: 5,
      num: '05',
      title: 'Cyber-Physical Systems and IoT',
      desc: 'Sensor networks, Autonomous Robotics, Smart Industrial IoT, and CPS Security.',
      icon: Wifi,
      topics: [
        'Industrial IoT (IIoT) & Automation',
        'Autonomous Robotics & Swarm Systems',
        'Wireless Sensor Networks & Protocols',
        'CPS Resiliency & Zero-Trust Firmware',
      ],
    },
    {
      id: 6,
      num: '06',
      title: 'Smart Systems and Intelligent Applications',
      desc: 'Smart Grids, Intelligent Transportation, Smart Cities, and Agro-tech solutions.',
      icon: Cpu,
      topics: [
        'Smart Grid & Energy Balancing',
        'Intelligent Transportation (ITS)',
        'Precision Agriculture & Sensing',
        'Smart Cities & Urban Computing',
      ],
    },
    {
      id: 7,
      num: '07',
      title: 'AI for Healthcare and Biomedical Applications',
      desc: 'Medical Imaging, Genomic Computing, Clinical Decision Support, and Bioinformatics.',
      icon: HeartPulse,
      topics: [
        'Medical Image Analysis (MRI, CT)',
        'Genomics & Computational Drug Discovery',
        'Clinical Decision Support Systems',
        'Wearable Health Monitors & Tele-Health',
      ],
    },
    {
      id: 8,
      num: '08',
      title: 'Ethics, Society and Future Technologies',
      desc: 'Algorithmic Fairness, Digital Privacy, AI Policy, Governance, and Sustainability.',
      icon: ShieldAlert,
      topics: [
        'Algorithmic Fairness & Bias Mitigation',
        'Data Privacy & Digital Rights',
        'AI Alignment & Safety Frameworks',
        'Green Computing & Environmental Policy',
      ],
    },
  ];

  return (
    <section id="tracks" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Research Tracks
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Conference Themes
          </h2>
          <p className="text-sm text-slate-600">
            Research areas include, but are not limited to the following eight interdisciplinary tracks:
          </p>
        </div>

        {/* 8 Clean Modern Theme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((track) => {
            const IconComponent = track.icon;
            const isExpanded = expandedTrack === track.id;

            return (
              <div
                key={track.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <IconComponent className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {track.num}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {track.desc}
                  </p>

                  {/* Expandable sub-topics */}
                  {isExpanded && (
                    <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      {track.topics.map((tp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0" />
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                    className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{isExpanded ? 'Less' : 'Topics'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onSelectTrackForSubmission(track.title)}
                    className="font-bold text-[#7cb305] hover:text-[#659b02] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Submit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
