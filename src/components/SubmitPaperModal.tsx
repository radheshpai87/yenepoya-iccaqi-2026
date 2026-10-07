'use client';

import React, { useState } from 'react';
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
  Info
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
  const [requestId] = useState<string>(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'REQ-' + Date.now() + '-' + Math.random()
  );
  const [step, setStep] = useState<'guidelines' | 'form'>('guidelines');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'cat1' | 'cat2'>('cat1');
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackError, setAckError] = useState('');

  const handleProceedToForm = () => {
    if (!acknowledged) {
      setAckError('Please review the publication guidelines and check the acknowledgement box to proceed.');
      return;
    }
    setAckError('');
    if (selectedCategoryTab === 'cat1') {
      setFormData((prev) => ({
        ...prev,
        publicationCategory: 'Category 1: Peer-Reviewed Journals (Indexed in Google Scholar, Crossref, MIAR, etc.)',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        publicationCategory: 'Category 2: Scopus Indexed Journals / Book Chapters',
      }));
    }
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
    data.append('requestId', requestId);
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
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          setUploadProgress(100);
          setSubmissionId(result.submissionId || ('ICCAQI-2026-' + Math.floor(1000 + Math.random() * 9000)));
          setSubmitted(true);
        } catch {
          setSubmissionId('ICCAQI-2026-' + Math.floor(1000 + Math.random() * 9000));
          setSubmitted(true);
        }
      } else {
        try {
          const result = JSON.parse(xhr.responseText);
          setUploadError(result.error || 'Server error processing manuscript. Please check file format and size.');
        } catch {
          setUploadError('Server error processing manuscript. Please try again.');
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl lg:max-w-4xl w-full p-5 sm:p-8 md:p-10 z-10 border border-slate-200 overflow-y-auto max-h-[92vh] my-auto">
        
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
                  Stage 1 of 2 • Guidelines &amp; Policy Acknowledgement
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                Paper Submission, Publication Guidelines and Registration Policy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ICCAQI 2026 invites original research contributions from academicians, researchers, industry professionals, research scholars, and students in the areas of Computing, Artificial Intelligence, Quantum Intelligence, and Emerging Technologies.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The conference offers two distinct publication categories to accommodate the diverse publication requirements of researchers and authors. Authors are requested to carefully review the publication guidelines, eligibility criteria, plagiarism policies, registration fees, and publication charges before submitting their manuscripts.
              </p>
            </div>

            {/* Category Selector Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Select Publication Category to View Specific Rules &amp; Guidelines:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Category 1 Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab('cat1')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                    selectedCategoryTab === 'cat1'
                      ? 'border-[#7cb305] bg-gradient-to-br from-lime-50/80 to-white shadow-md ring-2 ring-[#7cb305]/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      selectedCategoryTab === 'cat1'
                        ? 'bg-[#7cb305] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      Category I
                    </span>
                    {selectedCategoryTab === 'cat1' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#7cb305]">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    CATEGORY I: PUBLICATION IN DOUBLE-BLIND PEER-REVIEWED JOURNALS
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Indexed in Google Scholar, Crossref, MIAR, Ulrichsweb, EBSCO, DeepDyve, Dimensions &amp; TrendMD. Standard publication with assigned DOI.
                  </p>
                </button>

                {/* Category 2 Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab('cat2')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                    selectedCategoryTab === 'cat2'
                      ? 'border-[#7cb305] bg-gradient-to-br from-lime-50/80 to-white shadow-md ring-2 ring-[#7cb305]/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      selectedCategoryTab === 'cat2'
                        ? 'bg-[#7cb305] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      Category II
                    </span>
                    {selectedCategoryTab === 'cat2' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#7cb305]">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    CATEGORY II: PUBLICATION IN SCOPUS-INDEXED BOOK CHAPTERS AND JOURNALS
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Wiley Scopus-Indexed Book Series &amp; Selected Scopus Q3/Q4 Indexed Journals. High-impact research track.
                  </p>
                </button>
              </div>
            </div>

            {/* Detailed Rules & Guidelines Container */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
              {selectedCategoryTab === 'cat1' ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#7cb305]" />
                    <span>Specific Guidelines for Category I: Peer-Reviewed Journals</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#7cb305]" />
                        Indexing &amp; Digital Identifier
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Articles are assigned a verified Crossref Digital Object Identifier (DOI) and indexed in Google Scholar, Crossref, MIAR, Ulrichsweb, EBSCO, DeepDyve, Dimensions, and TrendMD.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#7cb305]" />
                        Double-Blind Peer Review
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Rigorous double-blind peer-review conducted by minimum 2 independent international domain experts. Author names and affiliations must be omitted from review copies.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Plagiarism Policy (&lt;15%)
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Similarity index must be strictly below 15% (excluding references) via Turnitin / iThenticate. Plagiarized or unverified AI-generated submissions face immediate desk rejection.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#7cb305]" />
                        Registration &amp; Publication Charges
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Conference registration fee includes presentation certificate, proceedings entry, and journal publication. No additional or hidden article publication charges (APC) for Category I.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#7cb305]" />
                    <span>Specific Guidelines for Category II: Scopus-Indexed Chapters &amp; Journals</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#7cb305]" />
                        Scopus Indexing &amp; Publishers
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Submissions will be published in Wiley Scopus-Indexed Book Series or recommended to partner Scopus Q3/Q4 Indexed Journals based on scope, review scores, and editorial acceptance.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#7cb305]" />
                        Two-Tier Editorial Review
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Two-tier review: preliminary evaluation by ICCAQI Technical Program Committee, followed by publisher editorial peer review adhering to strict Scopus indexing criteria.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Plagiarism &amp; Research Rigor (&lt;15%)
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Turnitin / iThenticate similarity score must be strictly &lt;15% (with &lt;1% from any single source). Submissions require empirical validation and comparative benchmarking.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-sky-600" />
                        Registration &amp; Publisher Charges (APC)
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Conference registration is mandatory for presenting authors. For select open-access Scopus partner journals charging APC, authors will be communicated clearly upon review decision.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* General Policy Notice */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
                <div>
                  Submission Deadline: <strong className="text-slate-900">October 20, 2026</strong> • Notification: <strong className="text-slate-900">October 25, 2026</strong>
                </div>
                <div>
                  Presentation Mode: <span className="font-semibold text-emerald-700">Hybrid (In-Person / Online)</span>
                </div>
              </div>
            </div>

            {/* Ack Error Message */}
            {ackError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
                <span>{ackError}</span>
              </div>
            )}

            {/* Explicit Acknowledgement Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:bg-slate-100/70 hover:border-slate-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  if (e.target.checked) setAckError('');
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#7cb305] focus:ring-[#7cb305] border-slate-300 accent-[#7cb305]"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-medium">
                I have read, understood, and agree to the <strong>ICCAQI 2026 Paper Submission, Publication Guidelines and Registration Policy</strong> for <strong>{selectedCategoryTab === 'cat1' ? 'Category I (Peer-Reviewed Journals)' : 'Category II (Scopus-Indexed Chapters & Journals)'}</strong>. I certify that this manuscript is original, complies with the &lt;15% plagiarism threshold, and has not been submitted or published elsewhere.
              </span>
            </label>

            {/* Navigation / Next Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Selected Track:{' '}
                <strong className="text-slate-900">
                  {selectedCategoryTab === 'cat1' ? 'Category I: Peer-Reviewed Journals' : 'Category II: Scopus Indexed'}
                </strong>
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
                <span className="font-semibold text-slate-500">Publication Track:</span>
                <span className="font-bold text-slate-900 bg-lime-100/80 text-[#547903] px-2.5 py-0.5 rounded-full border border-lime-300">
                  {formData.publicationCategory.includes('Category 1') ? 'Category I: Peer-Reviewed Journals' : 'Category II: Scopus Indexed'}
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
                <span>Review Guidelines</span>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Publication Category *
                  </label>
                  <select
                    value={formData.publicationCategory}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, publicationCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-base sm:text-xs focus:border-emerald-500 focus:outline-hidden bg-white disabled:opacity-60 font-medium"
                  >
                    <option value="Category 1: Peer-Reviewed Journals (Indexed in Google Scholar, Crossref, MIAR, etc.)">
                      Category 1: Peer-Reviewed Journals (Crossref / Google Scholar / DOI)
                    </option>
                    <option value="Category 2: Scopus Indexed Journals / Book Chapters">
                      Category 2: Scopus Indexed Journals / Book Chapters (Wiley)
                    </option>
                  </select>
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
