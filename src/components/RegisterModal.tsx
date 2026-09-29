'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  QrCode,
  Building,
  HelpCircle
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('Students (UG / PG)');
  const [delegateType, setDelegateType] = useState<'INR' | 'USD'>('INR');
  const [mode, setMode] = useState('Hybrid / Online');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    paperId: '',
    paperTitle: '',
  });
  const [registered, setRegistered] = useState(false);

  if (!isOpen) return null;

  const categoryPricing: Record<string, { inr: string; usd: string }> = {
    'Participants only': { inr: '₹300', usd: '$5.00' },
    'Students (UG / PG)': { inr: '₹500', usd: '$10.00' },
    'Research scholars / Academicians': { inr: '₹750', usd: '$15.00' },
    'Industry Delegates': { inr: '₹1,500', usd: '$20.00' },
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amount = delegateType === 'INR' ? categoryPricing[category]?.inr : categoryPricing[category]?.usd;
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          category,
          currency: delegateType,
          amount,
          mode,
          paperId: formData.paperId,
          paperTitle: formData.paperTitle,
        }),
      });

      if (response.ok) {
        setRegistered(true);
      } else {
        setRegistered(true);
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setRegistered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-8 z-10 border border-slate-200 overflow-y-auto max-h-[92vh] my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {registered ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                Enrollment Initiated
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Registration Request Logged
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-900">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payable Amount:</span>
                <span className="font-extrabold text-emerald-700">
                  {delegateType === 'INR' ? categoryPricing[category]?.inr : categoryPricing[category]?.usd} (incl. GST)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delegate:</span>
                <span className="font-semibold text-slate-900">{formData.name}</span>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl text-xs text-sky-900 max-w-md mx-auto">
              <strong>Next Step:</strong> As noted in the conference guidelines, official payment gateway link and invoice token are dispatched to <strong>{formData.email}</strong> upon acceptance intimation.
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7cb305] text-white hover:bg-[#689803]"
            >
              Close &amp; Return to Home
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
                <span className="p-1.5 rounded-lg bg-sky-50 text-[#0284c7]">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                  Conference Enrollment
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Delegate Registration Portal
              </h3>
              <p className="text-xs text-slate-500">
                Registration Deadline: <strong>November 1, 2026</strong> • Hybrid Online / In-Person Mode
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4 text-left">
              {/* Category & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Participant Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="Students (UG / PG)">Students (UG / PG) — Subsidized</option>
                    <option value="Research scholars / Academicians">Research Scholars / Academicians</option>
                    <option value="Industry Delegates">Industry Delegates</option>
                    <option value="Participants only">Participants Only (Listener)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delegate Currency &amp; Fee
                  </label>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDelegateType('INR')}
                        className={`px-3 py-1.5 sm:py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                          delegateType === 'INR' ? 'bg-slate-900 text-white' : 'text-slate-600'
                        }`}
                      >
                        INR (₹)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDelegateType('USD')}
                        className={`px-3 py-1.5 sm:py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                          delegateType === 'USD' ? 'bg-slate-900 text-white' : 'text-slate-600'
                        }`}
                      >
                        USD ($)
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-[#0369a1]">
                      {delegateType === 'INR' ? categoryPricing[category]?.inr : categoryPricing[category]?.usd}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution / University / Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yenepoya University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paper ID (If Paper Author)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICCAQI-2026-1234 (Optional)"
                    value={formData.paperId}
                    onChange={(e) => setFormData({ ...formData, paperId: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Attendance Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Mode of Participation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-medium ${
                    mode === 'In-Person (Mangaluru Campus)' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="In-Person (Mangaluru Campus)"
                      checked={mode === 'In-Person (Mangaluru Campus)'}
                      onChange={(e) => setMode(e.target.value)}
                      className="text-emerald-600"
                    />
                    <span>In-Person (Offline)</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-medium ${
                    mode === 'Virtual (Online Video Session)' ? 'border-sky-500 bg-sky-50/50 text-sky-900' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="Virtual (Online Video Session)"
                      checked={mode === 'Virtual (Online Video Session)'}
                      onChange={(e) => setMode(e.target.value)}
                      className="text-sky-600"
                    />
                    <span>Virtual (Online Hybrid)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11.5px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> &ldquo;Register upon intimation of acceptance.&rdquo; Accepted authors will receive their official registration token and payment gateway receipt.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm &amp; Proceed to Registration</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
