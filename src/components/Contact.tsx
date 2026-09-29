'use client';

import React, { useState } from 'react';
import { Mail, Phone, Globe, Send, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="contact" className="py-20 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Secretariat
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Us
          </h2>
          <p className="text-sm text-slate-600">
            For submissions, registrations, or general inquiries, contact the ICCAQI 2026 secretariat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Secretariat Details - Bright Clean Style */}
          <div className="md:col-span-5 bg-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Office
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                ICCAQI 2026 Secretariat
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Yenepoya School of Engineering &amp; Technology<br />
                Yenepoya (Deemed to be University), Mangaluru, India
              </p>
            </div>

            <div className="space-y-3 text-xs pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Email</span>
                  <a href="mailto:iccaqi2026@yenepoya.edu.in" className="font-semibold text-emerald-800 hover:underline">
                    iccaqi2026@yenepoya.edu.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#0284c7]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                  <a href="tel:+919895102959" className="font-semibold text-[#0284c7] hover:underline">
                    +91 98951 02959
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Website</span>
                  <a href="https://yenepoya.edu.in/iccaqi-2026" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-800 hover:underline">
                    yenepoya.edu.in/iccaqi-2026
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="md:col-span-7 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Enquiry Received!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you. Our organizing team will respond to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', institution: '', message: '' });
                  }}
                  className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-[#7cb305] text-white"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yenepoya (Deemed to be University)"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Your inquiry or track question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
