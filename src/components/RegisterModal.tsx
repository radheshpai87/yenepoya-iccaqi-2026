'use client';

import React, { useState, useEffect, useRef } from 'react';
import { requestAttempt, type RequestAttempt } from '@/lib/clientRequestId';
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
  onOpenSubmitModal?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenSubmitModal 
}) => {
  const [category, setCategory] = useState('Participants only');
  const [delegateType, setDelegateType] = useState<'INR' | 'USD'>('INR');
  const [mode, setMode] = useState<'Offline' | 'Online'>('Offline');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    paperId: '',
    paperTitle: '',
  });
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const attempt = useRef<RequestAttempt | null>(null);

  const isNameInvalid = attemptedSubmit && !formData.name.trim();
  const isEmailInvalid = attemptedSubmit && (!formData.email.trim() || !formData.email.includes('@'));
  const isPhoneInvalid = attemptedSubmit && !formData.phone.trim();
  const isInstitutionInvalid = attemptedSubmit && !formData.institution.trim();

  // Lock body scroll and pause Lenis while modal is open so mouse wheel scrolls inside modal
  useEffect(() => {
    if (!isOpen) return;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.stop();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      if (lenis) lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isParticipant = category === 'Participants only';

  const categoryPricing: Record<string, { inr: string; usd: string }> = {
    'Participants only': { inr: '₹300', usd: '$5.00' },
    'Students (UG / PG)': { inr: '₹500', usd: '$10.00' },
    'Research scholars / Academicians': { inr: '₹750', usd: '$15.00' },
    'Industry Delegates': { inr: '₹1,500', usd: '$20.00' },
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (isSubmitting) return;
    setRegistrationError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.institution.trim()) {
      setRegistrationError('Please fill in all mandatory fields highlighted in red below.');
      return;
    }

    setIsSubmitting(true);

    const amount = delegateType === 'INR' ? categoryPricing[category]?.inr : categoryPricing[category]?.usd;
    
    // Construct Razorpay URL with prefilled Amount (300) and user details
    const rzpBase = 'https://pages.razorpay.com/pl_ThkevehUyi20yw/view';
    const params = new URLSearchParams();
    params.set('amount', '300');
    if (formData.name) params.set('name', formData.name);
    if (formData.email) params.set('email', formData.email);
    if (formData.phone) params.set('phone', formData.phone);
    const generatedPaymentUrl = `${rzpBase}?${params.toString()}`;
    setPaymentUrl(generatedPaymentUrl);

    try {
      const payload = {
        ...formData, category, currency: delegateType, amount, mode,
        paymentStatus: isParticipant ? 'Redirected to Razorpay' : 'Pending Acceptance',
      };
      attempt.current = requestAttempt(attempt.current, JSON.stringify(payload));
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, requestId: attempt.current.requestId }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || result.supabaseSaved !== true || !result.registration?.id) {
        throw new Error(result.error || 'Registration save could not be confirmed. Please retry.');
      }
      setRegistered(true);
      if (isParticipant) {
        window.open(generatedPaymentUrl, '_blank') || (window.location.href = generatedPaymentUrl);
      }
    } catch (err) {
      setRegistrationError(err instanceof Error ? err.message : 'Registration save could not be confirmed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl lg:max-w-4xl w-full z-10 border border-slate-200 overflow-hidden max-h-[90vh] my-auto flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-30"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="overflow-y-auto overscroll-contain p-5 sm:p-8 md:p-10 flex-1"
        >

        {registered ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                {isParticipant ? 'Redirecting to Payment' : 'Enrollment Initiated'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {isParticipant ? 'Participant Registration & Payment' : 'Registration Request Logged'}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-900">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Fee Amount:</span>
                <span className="font-extrabold text-emerald-700">
                  {delegateType === 'INR' ? categoryPricing[category]?.inr : categoryPricing[category]?.usd}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delegate:</span>
                <span className="font-semibold text-slate-900">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Participation Mode:</span>
                <span className="font-semibold text-slate-900">
                  {mode === 'Offline' ? 'Offline (In-Person)' : 'Online (Virtual)'}
                </span>
              </div>
            </div>

            {isParticipant ? (
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-950 max-w-md mx-auto space-y-3">
                <p>
                  <strong>Payment Page Opened:</strong> We have opened the official Razorpay payment page with the <strong>Amount (₹300)</strong>, Name, and Email autofilled.
                </p>
                <div className="pt-1">
                  <a
                    href={paymentUrl || 'https://rzp.io/rzp/6wlQVvT3'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs transition-colors"
                  >
                    <span>Click Here to Complete Payment on Razorpay (₹300)</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  Direct short link: <a href="https://rzp.io/rzp/6wlQVvT3" target="_blank" rel="noopener noreferrer" className="underline font-mono">rzp.io/rzp/6wlQVvT3</a>
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 max-w-md mx-auto">
                <strong>Next Step for Authors:</strong> As per conference guidelines, official payment gateway link and invoice token are dispatched to <strong>{formData.email}</strong> upon paper acceptance intimation.
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              Close &amp; Return to Conference Site
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
              {registrationError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{registrationError}</p>
              )}
              {/* Category & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Type *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="Participants only">Participant Only (Attendee / Listener) — ₹300</option>
                    <option value="Students (UG / PG)">Student Paper Author (UG / PG) — ₹500</option>
                    <option value="Research scholars / Academicians">Faculty / Scholar Paper Author — ₹750</option>
                    <option value="Industry Delegates">Industry Delegate Paper Author — ₹1,500</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Fee
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <span>{isParticipant ? 'Participant Fee:' : 'Author Fee:'}</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#0369a1]">
                      {categoryPricing[category]?.inr || '₹300'} <span className="text-[11px] font-normal text-slate-500">(incl. GST)</span>
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
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all ${
                      isNameInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isNameInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Full name is required
                    </p>
                  )}
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
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all ${
                      isEmailInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isEmailInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Valid email address is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (for payment invoice) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all ${
                      isPhoneInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isPhoneInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Phone number is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution / University / Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yenepoya (Deemed to be University)"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all ${
                      isInstitutionInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isInstitutionInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Institution is required
                    </p>
                  )}
                </div>
              </div>

              {/* Attendance Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Participation Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-all ${
                    mode === 'Offline'
                      ? 'border-[#7cb305] bg-lime-50/80 text-slate-900 shadow-xs ring-1 ring-[#7cb305]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="Offline"
                      checked={mode === 'Offline'}
                      onChange={() => setMode('Offline')}
                      className="text-[#7cb305] accent-[#7cb305]"
                    />
                    <div>
                      <span className="font-bold block">Offline (In-Person)</span>
                      <span className="text-[11px] text-slate-500 font-normal">Attend at Yenepoya campus, Mangaluru</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-all ${
                    mode === 'Online'
                      ? 'border-sky-500 bg-sky-50/80 text-slate-900 shadow-xs ring-1 ring-sky-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="mode"
                      value="Online"
                      checked={mode === 'Online'}
                      onChange={() => setMode('Online')}
                      className="text-sky-600 accent-sky-600"
                    />
                    <div>
                      <span className="font-bold block">Online (Virtual)</span>
                      <span className="text-[11px] text-slate-500 font-normal">Attend remotely via live video session</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Informational Callout based on Category */}
              {isParticipant ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-xs text-emerald-950 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-slate-900">
                      Razorpay Payment for Participants (₹300)
                    </span>
                    <p className="text-slate-600 leading-relaxed text-[11.5px]">
                      Upon confirming, you will be redirected to the official Yenepoya University Razorpay gateway with the <strong>Amount (₹300)</strong>, Name, and Phone automatically filled in.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-amber-900">
                      Notice for Paper Authors
                    </span>
                    <p className="text-amber-800 leading-relaxed text-[11.5px]">
                      Paper authors do not pay now. Per university guidelines, authors submit papers first and only complete registration upon intimation of acceptance.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                {isParticipant ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isSubmitting ? 'Opening Razorpay Gateway...' : 'Proceed to Pay ₹300 via Razorpay'}</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {onOpenSubmitModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenSubmitModal();
                        }}
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white text-center cursor-pointer"
                      >
                        Submit Paper Manuscript Instead
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 text-center cursor-pointer"
                    >
                      Log Pre-Registration Details
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
