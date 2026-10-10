'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  Check, 
  FileText, 
  AlertCircle, 
  RefreshCw,
  Building,
  Mail,
  Phone,
  User,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Trash2,
  Eye,
  Tag,
  QrCode
} from 'lucide-react';

interface DelegateDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  paperId: string;
  paperTitle: string;
  currency: string;
  amount: string;
  paymentStatus: string;
}

function CompletePaymentContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id') || searchParams.get('registrationId') || searchParams.get('paperId') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [delegate, setDelegate] = useState<DelegateDetails>({
    id: idFromUrl || 'REG-2026',
    name: '',
    email: '',
    phone: '',
    institution: '',
    category: 'Research Scholars / Academicians',
    paperId: '',
    paperTitle: '',
    currency: 'INR',
    amount: '₹750',
    paymentStatus: 'Pending',
  });

  // Upload Screenshot State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedProofUrl, setSubmittedProofUrl] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isDelegateNameInvalid = attemptedSubmit && !delegate.name.trim();
  const isDelegateEmailInvalid = attemptedSubmit && (!delegate.email.trim() || !delegate.email.includes('@'));
  const isDelegateInstitutionInvalid = attemptedSubmit && !delegate.institution.trim();
  const isFileInvalid = attemptedSubmit && !selectedFile;

  useEffect(() => {
    fetchDelegateDetails();
  }, [idFromUrl]);

  const normalizeCategory = (categoryName: string): string => {
    const cat = (categoryName || '').toLowerCase().trim();
    if (cat.includes('attendee') || cat.includes('observer') || cat.includes('participant')) {
      return 'Attendees / Observers (Participants)';
    }
    if (cat.includes('student') || cat.includes('ug') || cat.includes('pg')) {
      return 'Students (UG / PG)';
    }
    if (cat.includes('industry')) {
      return 'Industry Delegates';
    }
    if (cat.includes('international')) {
      return 'International Delegates';
    }
    return 'Research Scholars / Academicians';
  };

  const calculateFee = (categoryName: string, currentCurrency?: string) => {
    const norm = normalizeCategory(categoryName);
    const isUsd = (currentCurrency || '').toUpperCase() === 'USD' || norm === 'International Delegates';

    switch (norm) {
      case 'Attendees / Observers (Participants)':
        return isUsd ? { amount: '$5', currency: 'USD' } : { amount: '₹300', currency: 'INR' };
      case 'Students (UG / PG)':
        return isUsd ? { amount: '$10', currency: 'USD' } : { amount: '₹500', currency: 'INR' };
      case 'Industry Delegates':
        return isUsd ? { amount: '$20', currency: 'USD' } : { amount: '₹1,500', currency: 'INR' };
      case 'International Delegates':
        return { amount: '$50', currency: 'USD' };
      case 'Research Scholars / Academicians':
      default:
        return isUsd ? { amount: '$15', currency: 'USD' } : { amount: '₹750', currency: 'INR' };
    }
  };

  const fetchDelegateDetails = async () => {
    setIsLoading(true);
    try {
      if (idFromUrl) {
        const res = await fetch('/api/admin/data');
        if (res.ok) {
          const data = await res.json();
          const foundReg = (data.registrations || []).find(
            (r: any) =>
              (r.id && r.id.toLowerCase() === idFromUrl.toLowerCase()) ||
              (r.paperId && r.paperId.toLowerCase() === idFromUrl.toLowerCase())
          );

          if (foundReg) {
            const normCat = normalizeCategory(foundReg.category || '');
            const fee = calculateFee(normCat, foundReg.currency);
            setDelegate({
              id: foundReg.id,
              name: foundReg.name || '',
              email: foundReg.email || '',
              phone: foundReg.phone || '',
              institution: foundReg.institution || '',
              category: normCat,
              paperId: foundReg.paperId || '',
              paperTitle: foundReg.paperTitle || '',
              currency: fee.currency,
              amount: fee.amount,
              paymentStatus: foundReg.paymentStatus || 'Pending',
            });
            setIsLoading(false);
            return;
          }

          // Search in paper submissions if not found in registrations
          const foundSub = (data.submissions || []).find(
            (s: any) =>
              (s.id && s.id.toLowerCase() === idFromUrl.toLowerCase()) ||
              (s.submissionId && s.submissionId.toLowerCase() === idFromUrl.toLowerCase())
          );

          if (foundSub) {
            const rawCat = foundSub.authorCategory || foundSub.category || '';
            const normCat = normalizeCategory(rawCat);
            const fee = calculateFee(normCat, 'INR');
            setDelegate({
              id: foundSub.submissionId || foundSub.id,
              name: foundSub.authorName || '',
              email: foundSub.email || '',
              phone: foundSub.phone || '',
              institution: foundSub.institution || '',
              category: normCat,
              paperId: foundSub.submissionId || '',
              paperTitle: foundSub.paperTitle || '',
              currency: fee.currency,
              amount: fee.amount,
              paymentStatus: 'Pending',
            });
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Notice loading registration details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    const norm = normalizeCategory(newCategory);
    const fee = calculateFee(norm, delegate.currency);
    setDelegate((prev) => ({
      ...prev,
      category: norm,
      amount: fee.amount,
      currency: fee.currency,
    }));
  };

  const processFile = (file: File) => {
    setUploadError('');
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('File size exceeds the 10 MB limit. Please select a smaller receipt screenshot.');
      setSelectedFile(null);
      setFileName(null);
      setPreviewUrl(null);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setUploadError('');

    if (!selectedFile) {
      setUploadError('Payment receipt screenshot is required. Please upload your file below.');
      return;
    }

    if (!delegate.name.trim() || !delegate.email.trim() || !delegate.institution.trim()) {
      setUploadError('Please fill in mandatory delegate details (Name, Email, Institution) highlighted in red above.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('registrationId', delegate.id);
      data.append('paperId', delegate.paperId);
      data.append('transactionRef', transactionRef);
      data.append('file', selectedFile);

      const res = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsSubmitted(true);
        setSubmittedProofUrl(result.proofUrl || previewUrl || '');
      } else {
        setUploadError(result.error || 'Failed to submit payment proof. Please try again.');
      }
    } catch {
      setUploadError('Server connection error. Please verify internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya (Deemed to be University)"
                className="h-8 w-auto object-contain"
              />
              <div className="h-5 w-[1px] bg-slate-300 hidden sm:block" />
              <img
                src="/yenepoya-school-engineering-and-technologynew-02.svg"
                alt="Yenepoya School of Engineering & Technology"
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#7cb305]/10 text-[#7cb305] text-xs font-bold font-mono border border-[#7cb305]/20">
                ICCAQI 2026 Payment Gateway
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registration Fee Payment &amp; Proof Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify your auto-filled delegate details, confirm participation category, and upload your payment transaction screenshot.
            </p>
          </div>
        </div>

        {isSubmitted ? (
          /* SUCCESS SUBMISSION ACKNOWLEDGEMENT */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                Verification Pending
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Payment Proof Uploaded Successfully!
              </h2>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Delegate Name:</span>
                <span className="font-bold text-slate-900">{delegate.name || 'Delegate'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Registration Reference ID:</span>
                <span className="font-mono font-bold text-[#7cb305]">{delegate.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Participant Category:</span>
                <span className="font-bold text-slate-800">{delegate.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Calculated Fee Amount:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{delegate.amount} ({delegate.currency})</span>
              </div>
              {transactionRef && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{transactionRef}</span>
                </div>
              )}
            </div>

            {previewUrl && (
              <div className="max-w-md mx-auto space-y-2">
                <span className="text-xs font-bold text-slate-700 block text-left">Uploaded Screenshot Preview:</span>
                <div className="p-2 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Uploaded Payment Receipt"
                    className="max-h-64 mx-auto object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your payment receipt screenshot has been transmitted to the <strong>ICCAQI 2026 Admin Portal</strong>. Once verified by our finance team, an official receipt will be generated.
            </p>

            {/* Official WhatsApp Group Join Card */}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 max-w-md mx-auto space-y-3 text-center shadow-xs">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm">
                <svg className="w-5 h-5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Join Official Conference WhatsApp Group</span>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Connect with delegates and researchers, receive technical session updates, track presentation schedules, and get live conference announcements.
              </p>
              <div className="pt-1">
                <a
                  href="https://chat.whatsapp.com/C3WhJfbWn0x1WxJmymx9EM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Join Conference WhatsApp Group</span>
                </a>
              </div>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all"
            >
              Return to Conference Website &rarr;
            </a>
          </div>
        ) : (
          /* FORM & UPLOAD MAIN SECTION */
          <div className="space-y-6">

            {/* Step 1: Auto-Filled Delegate Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Step 1: Auto-Filled Delegate Information</span>
                </div>
              </div>

              {isLoading ? (
                <div className="py-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#7cb305]" />
                  <span>Auto-filling participant records...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Delegate Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={delegate.name}
                        onChange={(e) => setDelegate({ ...delegate, name: e.target.value })}
                        placeholder="Enter full name..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
                          isDelegateNameInvalid
                            ? 'border-rose-500 bg-rose-50/25 ring-2 ring-rose-200 text-rose-950 placeholder:text-rose-300'
                            : 'border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-[#7cb305]'
                        }`}
                      />
                      {isDelegateNameInvalid && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" /> Delegate name is required
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
                        value={delegate.email}
                        onChange={(e) => setDelegate({ ...delegate, email: e.target.value })}
                        placeholder="Enter email address..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
                          isDelegateEmailInvalid
                            ? 'border-rose-500 bg-rose-50/25 ring-2 ring-rose-200 text-rose-950 placeholder:text-rose-300'
                            : 'border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-[#7cb305]'
                        }`}
                      />
                      {isDelegateEmailInvalid && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" /> Valid email address is required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={delegate.phone}
                        onChange={(e) => setDelegate({ ...delegate, phone: e.target.value })}
                        placeholder="Enter phone number..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:border-[#7cb305] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Institution / University *
                      </label>
                      <input
                        type="text"
                        required
                        value={delegate.institution}
                        onChange={(e) => setDelegate({ ...delegate, institution: e.target.value })}
                        placeholder="Enter university / institution..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden transition-all ${
                          isDelegateInstitutionInvalid
                            ? 'border-rose-500 bg-rose-50/25 ring-2 ring-rose-200 text-rose-950 placeholder:text-rose-300'
                            : 'border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-[#7cb305]'
                        }`}
                      />
                      {isDelegateInstitutionInvalid && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" /> Institution is required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Participant Category Selector with Auto-Fee Calculation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Participant Category &amp; Registration Fee *
                      </label>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            const fee = calculateFee(delegate.category, 'INR');
                            setDelegate((prev) => ({ ...prev, currency: 'INR', amount: fee.amount }));
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            delegate.currency !== 'USD'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          INR (₹)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const fee = calculateFee(delegate.category, 'USD');
                            setDelegate((prev) => ({ ...prev, currency: 'USD', amount: fee.amount }));
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            delegate.currency === 'USD'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          USD ($)
                        </button>
                      </div>
                    </div>
                    <select
                      value={normalizeCategory(delegate.category)}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:border-[#7cb305] focus:outline-hidden shadow-2xs cursor-pointer"
                    >
                      <option value="Students (UG / PG)">
                        Students (UG / PG) — {delegate.currency === 'USD' ? '$10 USD' : '₹500'}
                      </option>
                      <option value="Research Scholars / Academicians">
                        Research Scholars / Academicians — {delegate.currency === 'USD' ? '$15 USD' : '₹750'}
                      </option>
                      <option value="Industry Delegates">
                        Industry Delegates — {delegate.currency === 'USD' ? '$20 USD' : '₹1,500'}
                      </option>
                      <option value="Attendees / Observers (Participants)">
                        Attendees / Observers (Participants) — {delegate.currency === 'USD' ? '$5 USD' : '₹300'}
                      </option>
                      <option value="International Delegates">
                        International Delegates — $50 USD
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Auto-Calculated Fee Amount & Payment Options */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Step 2: Calculated Fee &amp; Payment Options</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Payable Fee</span>
                  <span className="text-2xl font-black text-[#7cb305]">{delegate.amount}</span>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Method A: Direct Bank / UPI Transfer Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-extrabold text-slate-900">Direct Bank / UPI Transfer</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">UPI ID:</span>
                      <span className="font-bold text-slate-900">yenepoya@upi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Name:</span>
                      <span className="font-bold text-slate-900">Yenepoya University</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-bold text-slate-900">State Bank of India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-bold text-slate-900">SBIN0007621</span>
                    </div>
                  </div>
                </div>

                {/* Method B: Razorpay Online Payment Checkout Button */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-extrabold text-slate-900">Razorpay Card / NetBanking</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Instant online payment via Credit/Debit Cards, UPI apps, or NetBanking.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const rzpBase = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK || 'https://pages.razorpay.com/pl_ThkevehUyi20yw/view';
                      const params = new URLSearchParams();
                      const cleanAmount = (delegate.amount || '').replace(/[^0-9]/g, '');
                      if (cleanAmount) params.set('amount', cleanAmount);
                      if (delegate.name) params.set('name', delegate.name);
                      if (delegate.email) params.set('email', delegate.email);
                      if (delegate.phone) params.set('phone', delegate.phone);

                      const targetUrl = rzpBase.includes('?') ? `${rzpBase}&${params.toString()}` : `${rzpBase}?${params.toString()}`;
                      window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Pay {delegate.amount} via Razorpay &rarr;</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-sky-700 font-medium text-center">
                    Opens official Yenepoya Razorpay gateway with prefilled details. After paying, upload receipt screenshot below.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Proof Screenshot Upload Section */}
            <form onSubmit={handleUploadSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>Step 3: Upload Payment Receipt Screenshot</span>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI/123456789012 or Razorpay Ref..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#7cb305] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Receipt Screenshot File * (PNG / JPG / PDF, Max 10MB)
                </label>

                {fileName ? (
                  /* Uploaded Image UX Card */
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
                            {fileName}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileName(null);
                          setPreviewUrl(null);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {previewUrl && (
                      <div className="pt-2 border-t border-slate-200 text-center">
                        <img
                          src={previewUrl}
                          alt="Screenshot Preview"
                          className="max-h-48 mx-auto object-contain rounded-xl border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                    isFileInvalid
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200 shadow-sm'
                      : 'border-slate-300 hover:border-[#7cb305] bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <UploadCloud className={`w-8 h-8 mb-2 transition-all ${
                      isFileInvalid ? 'text-rose-500' : 'text-slate-400'
                    }`} />
                    <span className={`text-xs font-bold ${isFileInvalid ? 'text-rose-700' : 'text-slate-800'}`}>
                      Click or Drag &amp; Drop Payment Screenshot Image Here
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 font-medium">
                      Supports JPG, PNG, WEBP, or PDF • Max file size: 10 MB
                    </span>
                    {isFileInvalid && (
                      <span className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1.5 animate-pulse bg-rose-100/80 px-3 py-1 rounded-full border border-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        Payment receipt screenshot is required. Please upload your file.
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading Screenshot &amp; Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Payment Proof for Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompletePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-[#7cb305]" />
            <span>Loading Payment Portal...</span>
          </div>
        </div>
      }
    >
      <CompletePaymentContent />
    </Suspense>
  );
}
