'use client';

import React, { useState, useEffect, useRef } from 'react';
import { requestAttempt, type RequestAttempt } from '@/lib/clientRequestId';
import { 
  X, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  Check,
  FileText, 
  AlertCircle, 
  Sparkles,
  Layers,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Info,
  Lock,
  Copy,
  Calendar,
  Mail,
  Download
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
    gender: 'Male',
    institution: '',
    authorCategory: 'Research Scholars / Academicians',
    publicationCategory: 'Category 2: Scopus Indexed Journals / Book Chapters',
    paperTitle: '',
    track: preselectedTrack || 'Artificial Intelligence and Machine Learning',
    abstract: '',
    mode: 'Offline',
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const attempt = useRef<(RequestAttempt & { file: File }) | null>(null);
  const [step, setStep] = useState<'guidelines' | 'form'>('guidelines');
  const [category2Consent, setCategory2Consent] = useState<'yes' | 'no'>('no');
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackError, setAckError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isAuthorNameInvalid = attemptedSubmit && !formData.authorName.trim();
  const isEmailInvalid = attemptedSubmit && (!formData.email.trim() || !formData.email.includes('@'));
  const isPhoneInvalid = attemptedSubmit && !formData.phone.trim();
  const isInstitutionInvalid = attemptedSubmit && !formData.institution.trim();
  const isTitleInvalid = attemptedSubmit && !formData.paperTitle.trim();
  const isAbstractInvalid = attemptedSubmit && !formData.abstract.trim();
  const isFileInvalid = attemptedSubmit && !selectedFile;

  const isStage1Complete = acknowledged;
  const isStage2Complete = Boolean(
    formData.authorName.trim() &&
    formData.email.trim() &&
    formData.email.includes('@') &&
    formData.phone.trim() &&
    formData.institution.trim() &&
    formData.paperTitle.trim() &&
    formData.abstract.trim() &&
    selectedFile
  );

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

  const handleProceedToForm = () => {
    if (!acknowledged) {
      setAckError('Please review and check the mandatory policy acknowledgement box before proceeding.');
      return;
    }
    setAckError('');
    setFormData((prev) => ({
      ...prev,
      publicationCategory: category2Consent === 'yes'
        ? 'Category I + Category II (Scopus-Indexed Book Chapters & Journals - Consented)'
        : 'Category I: Proceedings & Double-Blind Peer-Reviewed Journals (Standard Track)',
    }));
    setStep('form');
  };

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

  const processFile = (file: File) => {
    setUploadError('');
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File size (${sizeMB} MB) exceeds the maximum limit of 10 MB. Please select a smaller document.`);
      setSelectedFile(null);
      setFileName(null);
      return;
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'tex', 'zip'];
    if (!allowed.includes(ext)) {
      setUploadError('Invalid file format. Only PDF (.pdf), Word (.doc/.docx), or LaTeX (.tex/.zip) documents are permitted.');
      setSelectedFile(null);
      setFileName(null);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setUploadError('');
    if (submitting) return;

    if (!formData.authorName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.institution.trim() || !formData.paperTitle.trim() || !formData.abstract.trim()) {
      setUploadError('Please complete all mandatory fields highlighted in red below.');
      return;
    }

    if (!selectedFile) {
      setUploadError('Manuscript file is required. Please upload or drag & drop your document (highlighted in red below).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit. Please select a smaller manuscript file.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setUploadStep('Connecting to server upload gateway...');

    const data = new FormData();
    try {
      const previous = attempt.current?.file === selectedFile ? attempt.current : null;
      attempt.current = { ...requestAttempt(previous, JSON.stringify(formData)), file: selectedFile };
      data.append('requestId', attempt.current.requestId);
    } catch {
      setUploadError('Unable to prepare a safe submission. Please use an up-to-date browser.');
      setSubmitting(false);
      return;
    }
    data.append('authorName', formData.authorName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('gender', formData.gender);
    data.append('institution', formData.institution);
    data.append('authorCategory', formData.authorCategory);
    data.append('publicationCategory', formData.publicationCategory);
    data.append('track', formData.track);
    data.append('paperTitle', formData.paperTitle);
    data.append('abstract', formData.abstract);
    data.append('mode', formData.mode);
    data.append('file', selectedFile);

    // Use XMLHttpRequest for real-time upload progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
        if (percentComplete < 35) {
          setUploadStep('Uploading manuscript file to secure storage...');
        } else if (percentComplete < 75) {
          setUploadStep('Verifying PDF structure & virus scan...');
        } else if (percentComplete < 99) {
          setUploadStep('Registering submission details...');
        } else {
          setUploadStep('Finalizing paper registration...');
        }
      }
    };

    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300 || result.success !== true || result.supabaseSaved !== true || !result.submissionId) {
          setUploadError(result.error || 'Manuscript save could not be confirmed. Please retry with the same file.');
          return;
        }
        setUploadProgress(100);
        setSubmissionId(result.submissionId);
        setSubmitted(true);
      } catch {
        setUploadError('Manuscript save could not be confirmed. Please retry with the same file.');
      } finally {
        setSubmitting(false);
      }
    };

    xhr.onerror = () => {
      setUploadError('Network connection error during file upload. Please verify internet connection and try again.');
      setSubmitting(false);
    };

    xhr.open('POST', '/api/submit-paper');
    xhr.send(data);
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

        {submitted ? (
          <div className="max-w-2xl mx-auto py-2 sm:py-4 space-y-6 text-center">
            {/* Header with badge & title */}
            <div className="space-y-3">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Submission Acknowledged</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Paper Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your manuscript has been logged into the technical review system. A confirmation email has been dispatched to <strong>{formData.email}</strong>.
                </p>
              </div>
            </div>

            {/* Official Submission Reference Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-lg border border-slate-700/60 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Official Submission Reference ID
                  </span>
                  <div className="font-mono text-sm sm:text-base font-extrabold text-lime-400 select-all break-all sm:break-normal">
                    {submissionId}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Quote this ID in all future correspondence with the conference committee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(submissionId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-xs font-bold text-white transition-all border border-white/10 shrink-0 cursor-pointer shadow-xs"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-lime-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6 text-left shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#7cb305]" />
                  Manuscript Registration Details
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Status: Under Review
                </span>
              </div>

              {/* Title highlight */}
              {formData.paperTitle && (
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Paper Title
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                    {formData.paperTitle}
                  </p>
                </div>
              )}

              {/* Responsive grid for metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Conference Track
                  </span>
                  <span className="font-semibold text-emerald-800 leading-snug block break-words">
                    {formData.track}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Publication Category
                  </span>
                  <span className="font-semibold text-sky-800 leading-snug block break-words">
                    {formData.publicationCategory}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Primary Author
                  </span>
                  <span className="font-bold text-slate-900 leading-snug block break-words">
                    {formData.authorName}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {formData.authorCategory}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Institution / University
                  </span>
                  <span className="font-semibold text-slate-800 leading-snug block break-words">
                    {formData.institution || 'Yenepoya (Deemed to be University)'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Presentation Mode
                  </span>
                  <span className="font-semibold text-slate-900 leading-snug block break-words">
                    {formData.mode === 'Offline' ? 'Offline (In-Person Presentation)' : 'Online (Virtual Presentation)'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Contact &amp; Gender
                  </span>
                  <span className="font-semibold text-slate-900 leading-snug block break-words">
                    {formData.phone ? `${formData.phone} • ${formData.gender}` : formData.gender}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Confirmation &amp; Manuscript Document
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {formData.email}
                    </span>
                    {fileName && (
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <FileCheck2 className="w-3 h-3 text-[#7cb305]" />
                        {fileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Next Steps &amp; Review Schedule</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-1.5 leading-relaxed pl-5 list-disc">
                <li>
                  Your manuscript is being routed to the <strong>Conference Review Committee</strong> for technical evaluation.
                </li>
                <li>
                  Official <strong>Notification of Acceptance</strong> will be communicated via email by <strong>November 20, 2026</strong>.
                </li>
                <li>
                  Upon acceptance notification, authors will receive payment instructions and their designated presentation schedule.
                </li>
              </ul>
            </div>

            {/* Official Authors WhatsApp Group Invite Card */}
            <div className="p-4 sm:p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2.5 text-center shadow-xs">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm">
                <svg className="w-5 h-5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Join Official Paper Authors WhatsApp Group</span>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                Connect with the organizing committee and fellow authors, receive review progress notifications, presentation slot updates, and important announcements.
              </p>
              <div className="pt-1">
                <a
                  href="https://chat.whatsapp.com/JhShh9sbV840L8gQEMHWip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Join Official Authors WhatsApp Group</span>
                </a>
              </div>
            </div>

            {/* CTA Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer"
              >
                <span>Done &amp; Return to Conference Site</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : step === 'guidelines' ? (
          <div className="space-y-6 text-left">
            {/* Header */}
            <div className="space-y-2.5 pr-8">
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
              <div className="flex items-center gap-2 pt-1">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Stage 1 of 2 • Submission &amp; Publication Policy
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                Paper Submission, Publication Guidelines and Registration Policy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ICCAQI 2026 invites original research contributions from academicians, researchers, industry professionals, research scholars, and students in the areas of Computing, Artificial Intelligence, Quantum Intelligence, and Emerging Technologies. Authors are responsible for ensuring the originality and authenticity of their submitted manuscripts and for appropriately citing all sources used in their work.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The conference offers two distinct publication categories to accommodate the diverse publication requirements of researchers and authors. Authors are requested to carefully review the publication guidelines, eligibility criteria, plagiarism policies, registration fees, and publication charges before submitting their manuscripts.
              </p>
            </div>

            {/* Section 1: Review & Registration Policies */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7cb305]" />
                Review, Registration &amp; Presentation Policies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-lime-100 text-[#547903] text-[11px] font-extrabold flex items-center justify-center shrink-0">1</span>
                    Paper Review and Acceptance
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    All submitted manuscripts will undergo the conference review process conducted by the Conference Review Committee. Authors of manuscripts accepted for presentation will receive an official Acceptance Notification.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-lime-100 text-[#547903] text-[11px] font-extrabold flex items-center justify-center shrink-0">2</span>
                    Conference Registration and Payment
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Upon receiving the acceptance notification, authors are required to complete the conference registration and payment within the stipulated deadline communicated by the conference organizers.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-lime-100 text-[#547903] text-[11px] font-extrabold flex items-center justify-center shrink-0">3</span>
                    Mandatory Presentation
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Authors of accepted and registered papers are required to present their research work at the conference according to the schedule allotted by the organizers.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Publication Opportunities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileCheck2 className="w-4 h-4 text-[#7cb305]" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Publication Opportunities
                </h4>
              </div>

              {/* Category I */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7cb305]/10 text-[#547903] border border-[#7cb305]/30">
                    Category I
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Included with Conference Registration
                  </span>
                </div>

                {/* Sub-section: Conference Proceedings and E-Certificate */}
                <div className="space-y-2">
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Conference Proceedings and E-Certificate
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The abstracts of all accepted, registered, and presented papers will be published in the Conference Proceedings.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700 pt-0.5">
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#7cb305] mt-0.5 shrink-0" />
                      <span>The URL and DOI of the ISBN-registered Conference Proceedings will be provided to the authors for access and reference.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#7cb305] mt-0.5 shrink-0" />
                      <span>Authors of accepted, presented papers will receive a free E-Certificate from the conference organizers.</span>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Publication in Double-Blind Peer-Reviewed Journals */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Publication in Double-Blind Peer-Reviewed Journals
                    </h5>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#547903] bg-lime-50 px-2.5 py-0.5 rounded-full border border-lime-300">
                      NO ADDITIONAL APC / PUBLICATION CHARGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All accepted, registered, and presented papers will be considered for publication in the double-blind peer-reviewed journals associated with the conference.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      No additional Article Processing Charge (APC) or publication charge is required for Category I journal publication.
                    </p>
                    <p className="text-[11px] text-slate-600">
                      All papers considered for journal publication will be subject to the respective journal&apos;s double-blind peer-review process.
                    </p>
                  </div>
                </div>

                {/* Plagiarism and AI-Generated Content Policy (Category I) */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <div className="bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700">
                    Plagiarism and AI-Generated Content Policy (Category I)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-t border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-2 px-3 font-semibold">Parameter</th>
                        <th className="py-2 px-3 font-semibold">Permissible Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-medium">Plagiarism / Similarity Index</td>
                        <td className="py-2 px-3 font-bold text-emerald-700">Below 20%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">AI-Generated Content</td>
                        <td className="py-2 px-3 font-bold text-emerald-700">Below 20%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Abstract Plagiarism / Similarity Index*</td>
                        <td className="py-2 px-3 font-bold text-emerald-700">Below 20%</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="px-3 py-2 bg-slate-50/70 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    * Abstract must individually have a plagiarism/similarity index below 20% to be eligible for inclusion in the Conference Proceedings.
                  </div>
                </div>

                {/* APA 7th Edition Sample Paper & Formatting Guide */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-[#7cb305] shrink-0" />
                      <span>APA 7th Edition Sample Paper &amp; Formatting Guide</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Download the reference sample paper formatted with standard APA 7th edition headings, tables, figures, citations, and layout.
                    </p>
                  </div>
                  <a
                    href="/APA7_sample_paper_with_tables_figures-92QdmbdX.pdf"
                    download="APA7_sample_paper_with_tables_figures-92QdmbdX.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-xs transition-all shrink-0 cursor-pointer active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample Paper (PDF)</span>
                  </a>
                </div>
              </div>

              {/* Category II */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white via-sky-50/20 to-sky-50/40 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                    Category II • Optional Pathway
                  </span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    Applicable Additional APC
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  CATEGORY II: Scopus-Indexed Book Chapters and Journals
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selected high-quality papers may be considered for publication in Scopus-indexed book series chapters and journals. Category II is an optional publication pathway and is intended for authors who wish to pursue publication in Scopus-indexed publication outlets.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selection for Category II will be based on the quality, relevance, originality, and suitability of the manuscript, as well as the scope and publication requirements of the respective publisher or journal.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authors who are interested in pursuing this publication option may express their willingness to opt for Category II and will be required to pay the applicable additional Article publication charge/APC.
                </p>

                {/* Charges Table */}
                <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white">
                  <div className="bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-900">
                    Indicative Publication Charges
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-t border-b border-sky-200 bg-sky-50/40 text-slate-600">
                        <th className="py-2 px-3 font-semibold">Publication Option</th>
                        <th className="py-2 px-3 font-semibold">Additional APC / Publication Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 text-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-medium">Scopus-Indexed Book Chapter</td>
                        <td className="py-2 px-3 font-bold text-sky-900">₹9,750</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Scopus-Indexed Journal</td>
                        <td className="py-2 px-3 font-bold text-sky-900">₹30,000 – ₹50,000*</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 leading-normal border-t border-sky-100">
                    *The exact APC for a Scopus-indexed journal will depend on the respective journal, its applicable APC, and Scopus quartile(Q1-Q4). The final applicable amount will be communicated to the author before proceeding with publication.
                  </div>
                </div>

                {/* Plagiarism Table Category II */}
                <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white">
                  <div className="bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-900">
                    Plagiarism and AI-Generated Content Policy – Category II
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-t border-b border-sky-200 bg-sky-50/40 text-slate-600">
                        <th className="py-2 px-3 font-semibold">Parameter</th>
                        <th className="py-2 px-3 font-semibold">Permissible Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 text-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-medium">Plagiarism / Similarity Index</td>
                        <td className="py-2 px-3 font-bold text-sky-900">Below 10%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">AI-Generated Content</td>
                        <td className="py-2 px-3 font-bold text-rose-700">0%</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 leading-normal border-t border-sky-100">
                    Authors opting for Category II must comply with all publication ethics, editorial requirements, formatting guidelines, and other conditions prescribed by the respective publisher or journal.
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message if not acknowledged */}
            {ackError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
                <span>{ackError}</span>
              </div>
            )}

            {/* Consents & Acknowledgements */}
            <div className="space-y-3 pt-2">
              {/* Category II Consent Option (Yes / No Buttons) */}
              <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Category II Willingness / Consent (Scopus-Indexed Chapters &amp; Journals)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Do you consent and wish to be considered for <strong>Category II (Scopus-Indexed Book Chapters / Journals)</strong>? Additional Article publication charge/APC applies only if selected.
                  </p>
                </div>

                {/* Interactive Yes / No Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCategory2Consent('yes')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      category2Consent === 'yes'
                        ? 'border-sky-500 bg-sky-50/90 shadow-sm ring-1 ring-sky-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        category2Consent === 'yes' ? 'border-sky-600 bg-sky-600' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {category2Consent === 'yes' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${category2Consent === 'yes' ? 'text-sky-950' : 'text-slate-800'}`}>
                          YES — I Consent to Category II
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Opt-in for Scopus book series chapters / journals evaluation. Additional APC applies upon selection.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory2Consent('no')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      category2Consent === 'no'
                        ? 'border-[#7cb305] bg-lime-50/90 shadow-sm ring-1 ring-[#7cb305]/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        category2Consent === 'no' ? 'border-[#7cb305] bg-[#7cb305]' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {category2Consent === 'no' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${category2Consent === 'no' ? 'text-slate-900' : 'text-slate-800'}`}>
                          NO — Category I Only (Standard Track)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Conference Proceedings &amp; Double-Blind Peer-Reviewed Journals (No extra APC).
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mandatory Policy Acknowledgement */}
              <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:bg-slate-100/70 hover:border-slate-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={acknowledged}
                  onChange={(e) => {
                    setAcknowledged(e.target.checked);
                    if (e.target.checked) setAckError('');
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-[#7cb305] focus:ring-[#7cb305] border-slate-300 accent-[#7cb305] cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">
                    Mandatory Policy Acknowledgement *
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    I have read, understood, and agree to the <strong>ICCAQI 2026 Paper Submission, Publication Guidelines and Registration Policy</strong>. I certify that my submitted manuscript is original, authentic, appropriately cited, and adheres to the specified plagiarism and AI content limits.
                  </p>
                </div>
              </label>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 font-medium">
                {category2Consent === 'yes' ? (
                  <span className="text-sky-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Category II Scopus Consideration: <strong>YES (Consented)</strong>
                  </span>
                ) : (
                  <span className="text-slate-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7cb305]" /> Publication Track: <strong>Category I Standard Track (NO Category II)</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleProceedToForm}
                disabled={!isStage1Complete}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isStage1Complete
                    ? 'bg-[#7cb305] hover:bg-[#689803] text-white shadow-md cursor-pointer active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                }`}
              >
                <span>Proceed to Manuscript Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 space-y-2 pr-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                <button
                  type="button"
                  onClick={() => setStep('guidelines')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Guidelines</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Stage 2 of 2 • Manuscript Submission Form
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Submit Research Manuscript
              </h3>
              <p className="text-xs text-slate-500">
                Deadline: <strong>November 15, 2026</strong> • Max File Size: <strong>10 MB</strong>
              </p>
            </div>

            {/* Error Message Alert Banner */}
            {uploadError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Real-time Upload Progress Indicator */}
            {submitting && (
              <div className="mb-4 p-4 rounded-2xl bg-lime-50/80 border border-[#7cb305]/40 space-y-2.5 shadow-xs text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2 text-[#7cb305]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{uploadStep || 'Uploading manuscript...'}</span>
                  </div>
                  <span className="font-mono text-[#7cb305] text-sm font-extrabold">{uploadProgress}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7cb305] to-emerald-500 h-full rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium font-mono">
                  <span>
                    {selectedFile
                      ? `${((selectedFile.size * (uploadProgress / 100)) / (1024 * 1024)).toFixed(2)} MB of ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Uploading...'}
                  </span>
                  <span className="text-[#7cb305] font-semibold">Realtime Sync Active</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corresponding Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    placeholder="e.g. Dr. John Doe"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
                      isAuthorNameInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isAuthorNameInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Author name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={submitting}
                    placeholder="e.g. author@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
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
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={submitting}
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
                      isPhoneInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isPhoneInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Mobile / phone number is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author Category *
                  </label>
                  <select
                    value={formData.authorCategory}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, authorCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60 font-medium"
                  >
                    <option value="Students (UG / PG)">Students (UG / PG)</option>
                    <option value="Research Scholars / Academicians">Research Scholars / Academicians</option>
                    <option value="Industry Delegates">Industry Delegates</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Target Publication Track (Locked)
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('guidelines')}
                      className="text-[11px] font-bold text-[#7cb305] hover:text-[#689803] hover:underline cursor-pointer"
                    >
                      Change Consent / Review
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formData.publicationCategory}
                      className="w-full pl-3.5 pr-10 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-semibold text-slate-700 bg-slate-100 cursor-not-allowed select-none shadow-xs"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {category2Consent === 'yes'
                      ? '✓ Category II (Scopus) willingness consented. Additional APC applies upon selection.'
                      : 'Category I standard track (No additional APC).'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    placeholder="e.g. Yenepoya (Deemed to be University)"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
                      isInstitutionInvalid
                        ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                  {isInstitutionInvalid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Institution / University is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Conference Track *
                  </label>
                  <select
                    value={formData.track}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                  >
                    {tracks.map((t, idx) => (
                      <option key={idx} value={t}>
                        Track 0{idx + 1}: {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Presentation Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Presentation Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-all ${
                    formData.mode === 'Offline'
                      ? 'border-[#7cb305] bg-lime-50/80 text-slate-900 shadow-xs ring-1 ring-[#7cb305]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="presentationMode"
                      value="Offline"
                      disabled={submitting}
                      checked={formData.mode === 'Offline'}
                      onChange={() => setFormData({ ...formData, mode: 'Offline' })}
                      className="text-[#7cb305] accent-[#7cb305]"
                    />
                    <div>
                      <span className="font-bold block">Offline (In-Person Presentation)</span>
                      <span className="text-[11px] text-slate-500 font-normal">Present at Yenepoya University campus, Mangaluru</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-all ${
                    formData.mode === 'Online'
                      ? 'border-sky-500 bg-sky-50/80 text-slate-900 shadow-xs ring-1 ring-sky-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="presentationMode"
                      value="Online"
                      disabled={submitting}
                      checked={formData.mode === 'Online'}
                      onChange={() => setFormData({ ...formData, mode: 'Online' })}
                      className="text-sky-600 accent-sky-600"
                    />
                    <div>
                      <span className="font-bold block">Online (Virtual Presentation)</span>
                      <span className="text-[11px] text-slate-500 font-normal">Present remotely via live video session</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manuscript Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  placeholder="Enter full paper title..."
                  value={formData.paperTitle}
                  onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
                  className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
                    isTitleInvalid
                      ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                  }`}
                />
                {isTitleInvalid && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Manuscript title is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Abstract (150–250 words) *
                </label>
                <textarea
                  rows={3}
                  required
                  disabled={submitting}
                  placeholder="Provide concise summary of problem, methodology, findings, and technical novelty..."
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl border text-base sm:text-xs focus:outline-hidden transition-all disabled:opacity-60 ${
                    isAbstractInvalid
                      ? 'border-rose-500 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 ring-2 ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                  }`}
                />
                {isAbstractInvalid && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Abstract is required
                  </p>
                )}
              </div>

              {/* File Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Manuscript (PDF / Word / LaTeX) *
                  </label>
                  <a
                    href="/APA7_sample_paper_with_tables_figures-92QdmbdX.pdf"
                    download="APA7_sample_paper_with_tables_figures-92QdmbdX.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7cb305] hover:text-[#547903] hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    <span>APA 7th Sample Paper</span>
                  </a>
                </div>

                {fileName ? (
                  /* Uploaded File UX Card Matching Reference Image */
                  <div className="p-3.5 rounded-2xl bg-[#edf4ff] border border-[#d0e2ff] flex items-center justify-between gap-3 text-left shadow-xs transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Document Icon Box */}
                      <div className="w-10 h-10 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>

                      {/* File Info */}
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[260px] flex items-center gap-1">
                          <span>{fileName}</span>
                          <span className="text-slate-600 font-semibold">• Uploaded</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {selectedFile
                            ? selectedFile.size > 1024 * 1024
                              ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                              : `${(selectedFile.size / 1024).toFixed(2)} KB`
                            : '96.47 KB'}
                        </p>
                      </div>
                    </div>

                    {/* Checkmark & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="p-1 rounded-full bg-blue-100 text-[#3b82f6]">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>

                      {selectedFile && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            const url = URL.createObjectURL(selectedFile);
                            window.open(url, '_blank');
                          }}
                          title="Preview Document"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setFileName(null);
                          setSelectedFile(null);
                          setUploadError('');
                        }}
                        title="Remove Document"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Interactive Drag & Drop Upload Zone */
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                      isFileInvalid
                        ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200 shadow-sm'
                        : isDragging
                        ? 'border-[#7cb305] bg-lime-50/80 scale-[1.01]'
                        : 'border-slate-200 hover:border-[#7cb305] bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <UploadCloud className={`w-8 h-8 transition-all mb-1.5 ${
                      isFileInvalid ? 'text-rose-500' : isDragging ? 'text-[#7cb305] scale-110' : 'text-slate-400 group-hover:text-[#7cb305]'
                    }`} />
                    <span className={`text-xs font-bold ${isFileInvalid ? 'text-rose-700' : 'text-slate-800'}`}>
                      {isDragging ? 'Drop your manuscript file here' : 'Click or Drag & Drop manuscript file here'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 font-medium">
                      PDF (.pdf), Word (.doc/.docx), LaTeX (.tex/.zip) • Max file size: 10 MB
                    </span>
                    {isFileInvalid && (
                      <span className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1.5 animate-pulse bg-rose-100/80 px-3 py-1 rounded-full border border-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        Manuscript document is required. Please upload your file.
                      </span>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.tex,.zip"
                      required
                      disabled={submitting}
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

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!isStage2Complete || submitting}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold transition-all ${
                    isStage2Complete && !submitting
                      ? 'bg-[#7cb305] hover:bg-[#689803] text-white shadow-md cursor-pointer active:scale-98'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading &amp; Registering Manuscript ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Your Paper</span>
                    </>
                  )}
                </button>
                {!isStage2Complete && (
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                    Fill in all required fields and upload your manuscript file to enable submission.
                  </p>
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
