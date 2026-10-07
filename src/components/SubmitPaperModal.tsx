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
  Lock
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
    authorCategory: 'Research Scholars / Academicians',
    publicationCategory: 'Category 2: Scopus Indexed Journals / Book Chapters',
    paperTitle: '',
    track: preselectedTrack || 'Artificial Intelligence and Machine Learning',
    abstract: '',
    mode: 'Hybrid (Online / Offline)',
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
  const attempt = useRef<(RequestAttempt & { file: File }) | null>(null);
  const [step, setStep] = useState<'guidelines' | 'form'>('guidelines');
  const [category3Consent, setCategory3Consent] = useState<'yes' | 'no'>('no');
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackError, setAckError] = useState('');

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
      publicationCategory: category3Consent === 'yes'
        ? 'Category I & II + Category III (Opted for Scopus Chapters/Journals - Yes)'
        : 'Category I & II: Proceedings & Double-Blind Peer-Reviewed Journals (No Category III)',
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
    setUploadError('');
    if (submitting) return;

    if (!selectedFile) {
      setUploadError('Please choose or drag & drop your manuscript file before submitting.');
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

      {/* Modal Container */}
      <div
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-8 md:p-10 z-10 border border-slate-200 overflow-y-auto overscroll-contain max-h-[90vh] my-auto"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
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
                <span className="text-slate-500 font-medium">Author Category:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{formData.authorCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Publication Track:</span>
                <span className="font-semibold text-sky-800 truncate max-w-[200px]">{formData.publicationCategory}</span>
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
                The conference offers three distinct publication categories to accommodate the diverse publication requirements of researchers and authors. Authors are requested to carefully review the publication guidelines, eligibility criteria, plagiarism policies, registration fees, and publication charges before submitting their manuscripts.
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
                    Paper Review &amp; Acceptance
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    All submitted manuscripts will undergo the conference review process conducted by the Conference Review Committee. Authors of manuscripts accepted for presentation will receive an official Acceptance Notification.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-lime-100 text-[#547903] text-[11px] font-extrabold flex items-center justify-center shrink-0">2</span>
                    Registration &amp; Payment
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
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7cb305]/10 text-[#547903] border border-[#7cb305]/30">
                    Category I
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Included with Conference Registration
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  CATEGORY I: Conference Proceedings and E-Certificate
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The abstracts of all accepted, registered, and presented papers will be published in the Conference Proceedings.
                </p>
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#7cb305] mt-0.5 shrink-0" />
                    <span>A soft copy of the Conference Proceedings will be provided free of cost to the authors.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#7cb305] mt-0.5 shrink-0" />
                    <span>Authors of accepted, presented papers will receive a free E-Certificate from the conference organizers.</span>
                  </div>
                </div>
              </div>

              {/* Category II */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Category II
                  </span>
                  <span className="text-[11px] font-bold text-[#547903] bg-lime-50 px-2.5 py-0.5 rounded-full border border-lime-300">
                    NO ADDITIONAL APC / PUBLICATION CHARGE
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  CATEGORY II: Publication in Double-Blind Peer-Reviewed Journals
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All accepted, registered, and presented papers will be considered for publication in the double-blind peer-reviewed journals associated with the conference.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>No additional Article Processing Charge (APC) or publication charge</strong> is required for Category II journal publication.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">
                    However, conference acceptance and presentation do not automatically guarantee journal publication. All papers considered for journal publication will be subject to:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    <li>The respective journal&apos;s double-blind peer-review process;</li>
                    <li>Compliance with the prescribed plagiarism and AI-generated content limits;</li>
                    <li>The journal&apos;s editorial and publication policies; and</li>
                    <li>The final approval of the Editor-in-Chief of the respective journal.</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 pt-1">
                    The final decision regarding journal publication rests with the respective journal and its editorial team. Authors will be informed about the further publication process, wherever applicable.
                  </p>
                </div>

                {/* Policy Table Category II */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <div className="bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700">
                    Plagiarism and AI-Generated Content Policy (Category II)
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
                        <td className="py-2 px-3 font-bold text-emerald-700">Below 30%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category III */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white via-sky-50/20 to-sky-50/40 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                    Category III • Optional Pathway
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Applicable Additional APC
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  CATEGORY III: Scopus-Indexed Book Chapters and Journals
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selected high-quality papers may be considered for publication in Scopus-indexed book chapters and journals. Category III is an optional publication pathway and is intended for authors who wish to pursue publication in Scopus-indexed publication outlets.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selection for Category III will be based on the quality, relevance, originality, and suitability of the manuscript, as well as the scope and publication requirements of the respective publisher or journal. Authors who are interested in pursuing this publication option may express their willingness to opt for Category III and will be required to pay the applicable additional publication charge/APC.
                </p>

                {/* Charges Table */}
                <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white">
                  <div className="bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-900">
                    Indicative Publication Charges (Category III)
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
                    *The exact APC for a Scopus-indexed journal will depend on the respective journal, its applicable APC, publication requirements, and Scopus quartile/category. The final applicable amount will be communicated to the author before proceeding with publication.
                  </div>
                </div>

                {/* Plagiarism Table Category III */}
                <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white">
                  <div className="bg-sky-50/80 px-3 py-1.5 text-xs font-bold text-sky-900">
                    Plagiarism and AI-Generated Content Policy – Category III
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
                        <td className="py-2 px-3 font-bold text-sky-900">Below 15%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">AI-Generated Content</td>
                        <td className="py-2 px-3 font-bold text-rose-700">0% (Strictly not permitted)</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 leading-normal border-t border-sky-100">
                    Authors opting for Category III must comply with all publication ethics, editorial requirements, formatting guidelines, and other conditions prescribed by the respective publisher or journal.
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
              {/* Category III Consent Option (Yes / No Buttons) */}
              <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Category III Willingness / Consent (Scopus-Indexed Chapters &amp; Journals)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Do you consent and wish to be considered for <strong>Category III (Scopus-Indexed Book Chapters / Journals)</strong>? Additional APC applies only if selected.
                  </p>
                </div>

                {/* Interactive Yes / No Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCategory3Consent('yes')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      category3Consent === 'yes'
                        ? 'border-sky-500 bg-sky-50/90 shadow-sm ring-1 ring-sky-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        category3Consent === 'yes' ? 'border-sky-600 bg-sky-600' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {category3Consent === 'yes' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${category3Consent === 'yes' ? 'text-sky-950' : 'text-slate-800'}`}>
                          YES — I Consent to Category III
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Opt-in for Scopus book chapters / journals evaluation. Additional APC applies upon selection.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory3Consent('no')}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      category3Consent === 'no'
                        ? 'border-[#7cb305] bg-lime-50/90 shadow-sm ring-1 ring-[#7cb305]/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        category3Consent === 'no' ? 'border-[#7cb305] bg-[#7cb305]' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {category3Consent === 'no' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${category3Consent === 'no' ? 'text-slate-900' : 'text-slate-800'}`}>
                          NO — Standard Track Only
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Category I Proceedings &amp; Category II Double-Blind Peer-Reviewed Journals (No extra APC).
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
                {category3Consent === 'yes' ? (
                  <span className="text-sky-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Category III Scopus Consideration: <strong>YES (Consented)</strong>
                  </span>
                ) : (
                  <span className="text-slate-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7cb305]" /> Publication Track: <strong>Standard Category I &amp; II (NO Category III)</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleProceedToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Manuscript Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Stage / Policy banner and back button */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Publication Option:</span>
                <span className="font-bold text-slate-900 bg-lime-100/80 text-[#547903] px-2.5 py-0.5 rounded-full border border-lime-300 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#547903]" />
                  {category3Consent === 'yes'
                    ? 'Category I & II + Category III (Scopus Opted: YES)'
                    : 'Category I & II (Proceedings & Peer-Reviewed Journals)'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Policy Acknowledged
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('guidelines')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Review Guidelines &amp; Consent</span>
              </button>
            </div>

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
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Stage 2 of 2 • Manuscript Submission Form
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Submit Research Manuscript
              </h3>
              <p className="text-xs text-slate-500">
                Deadline: <strong>October 20, 2026</strong> • Max File Size: <strong>10 MB</strong>
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
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                  />
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
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                  />
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
                    {category3Consent === 'yes'
                      ? '✓ Category III (Scopus) willingness consented. Additional APC applies upon selection.'
                      : 'Category I & II standard track (No additional APC).'}
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
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                  />
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
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                />
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
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60"
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Manuscript (PDF / Word / LaTeX) *
                </label>

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
                      isDragging
                        ? 'border-[#7cb305] bg-lime-50/80 scale-[1.01]'
                        : 'border-slate-200 hover:border-[#7cb305] bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <UploadCloud className={`w-8 h-8 transition-all mb-1.5 ${isDragging ? 'text-[#7cb305] scale-110' : 'text-slate-400 group-hover:text-[#7cb305]'}`} />
                    <span className="text-xs font-bold text-slate-800">
                      {isDragging ? 'Drop your manuscript file here' : 'Click or Drag & Drop manuscript file here'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 font-medium">
                      PDF (.pdf), Word (.doc/.docx), LaTeX (.tex/.zip) • Max file size: 10 MB
                    </span>
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
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading &amp; Registering Manuscript ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Manuscript for Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
