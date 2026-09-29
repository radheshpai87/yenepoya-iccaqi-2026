'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SubmitPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTrack?: string;
}

export const SubmitPaperModal: React.FC<SubmitPaperModalProps> = ({
  isOpen,
  onClose,
  preselectedTrack = '',
}) => {
  const [formData, setFormData] = useState({
    authorName: '',
    email: '',
    phone: '',
    institution: '',
    paperTitle: '',
    track: preselectedTrack || 'Artificial Intelligence and Machine Learning',
    abstract: '',
    mode: 'Hybrid (Online / Offline)',
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  if (!isOpen) return null;

  const tracks = [
    'Artificial Intelligence and Machine Learning',
    'Quantum Computing and Quantum Intelligence',
    'Data Science, Big Data and Analytics',
    'Emerging Computing Technologies',
    'Cyber-Physical Systems and IoT',
    'Smart Systems and Intelligent Applications',
    'AI for Healthcare and Biomedical Applications',
    'Ethics, Society and Future Technologies',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const randomId = 'ICCAQI-2026-' + Math.floor(1000 + Math.random() * 9000);
      setSubmissionId(randomId);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-slate-200 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                Submission Acknowledged
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Paper Submitted Successfully!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Submission ID:</span>
                <span className="font-mono font-bold text-slate-900">{submissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Track:</span>
                <span className="font-semibold text-emerald-700 truncate max-w-[200px]">{formData.track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Primary Author:</span>
                <span className="font-semibold text-slate-900">{formData.authorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Confirmation Sent To:</span>
                <span className="font-semibold text-slate-900">{formData.email}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your manuscript has been logged into the ICCAQI 2026 technical review system. Notification of Acceptance will be communicated by <strong>October 25, 2026</strong>.
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7cb305] text-white hover:bg-[#689803]"
            >
              Done &amp; Return to Conference Site
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src="/yenepoya-university-logonew3.svg"
                  alt="Yenepoya (Deemed to be University)"
                  className="h-7 w-auto object-contain"
                />
                <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />
                <img
                  src="/yenepoya-school-engineering-and-technologynew-02.svg"
                  alt="Yenepoya School of Engineering & Technology"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Paper Submission Portal
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Submit Research Manuscript
              </h3>
              <p className="text-xs text-slate-500">
                Deadline: <strong>October 20, 2026</strong> • Notification: <strong>October 25, 2026</strong>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corresponding Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. John Doe"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. author@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yenepoya (Deemed to be University)"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Conference Track *
                  </label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  >
                    {tracks.map((t, idx) => (
                      <option key={idx} value={t}>
                        Track 0{idx + 1}: {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manuscript Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full paper title..."
                  value={formData.paperTitle}
                  onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Abstract (150–250 words) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide concise summary of problem, methodology, findings, and technical novelty..."
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Manuscript (PDF / DOCX) *
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    {fileName ? fileName : 'Click to select or drag & drop PDF/Word file'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Standard 6–8 page IEEE format • Max 15MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required={!fileName}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Uploading & Registering Submission...' : 'Submit Manuscript for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
