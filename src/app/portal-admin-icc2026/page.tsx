'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Users,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  FileSpreadsheet,
  Check,
  ExternalLink,
  X,
  UserCheck,
  Tag,
  Globe,
  FileCheck,
  User,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileCode,
  ArrowUpRight,
  Home,
  Award,
  BarChart3,
  MoreVertical,
  Download,
  Filter,
  GripVertical,
  Trash2,
  Menu,
  MapPin,
  Video
} from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  currency: string;
  amount: string;
  mode: string;
  paperId: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
}

interface Submission {
  id: string;
  submissionId: string;
  authorName: string;
  email: string;
  phone: string;
  gender?: string;
  institution: string;
  authorCategory?: string;
  publicationCategory?: string;
  track: string;
  paperTitle: string;
  abstract: string;
  mode: string;
  fileUrl: string;
  reviewStatus: string;
  createdAt: string;
  reviewerNotes?: string;
}

export default function PortalAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'registrations' | 'submissions'>('registrations');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected Item for Side-by-Side Split View
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Resizable Split Pane Width State (in pixels)
  const [splitPanelWidth, setSplitPanelWidth] = useState<number>(500);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [regCategoryFilter, setRegCategoryFilter] = useState('All');
  const [regStatusFilter, setRegStatusFilter] = useState('All');
  const [subTrackFilter, setSubTrackFilter] = useState('All');
  const [subStatusFilter, setSubStatusFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Bulk Email State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTargetType, setEmailTargetType] = useState<'verified_registrations' | 'accepted_submissions'>('verified_registrations');
  const [emailSubject, setEmailSubject] = useState('ICCAQI 2026 — Official Registration Verification & Conference Information');
  const [emailBody, setEmailBody] = useState(
    `<p>We are pleased to inform you that your delegate registration for <strong>ICCAQI 2026</strong> at Yenepoya (Deemed to be University) has been <strong>OFFICIALLY VERIFIED & CONFIRMED</strong>.</p><div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 16px 0; font-size: 13px;"><p style="margin: 0 0 6px 0;"><strong>Delegate Name:</strong> {{name}}</p><p style="margin: 0 0 6px 0;"><strong>Registration Reference ID:</strong> {{registration_id}}</p><p style="margin: 0 0 6px 0;"><strong>Institution / University:</strong> {{institution}}</p><p style="margin: 0;"><strong>Associated Paper ID:</strong> {{paper_id}}</p></div><p>We look forward to welcoming you to Mangaluru for the conference on <strong>November 6–7, 2026</strong>.</p>`
  );
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendReport, setEmailSendReport] = useState<any>(null);
  const [emailError, setEmailError] = useState('');

  // Check auth session on load & set up live auto-sync without page reload
  useEffect(() => {
    checkSession();
  }, []);

  // Resizable Split Panel Drag Listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      // Enforce bounds so both left admin page and right details panel stay visible & readable
      if (newWidth >= 320 && newWidth <= window.innerWidth - 450) {
        setSplitPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Initial data fetch snapshot on mount
    fetchDashboardData();

    // Subscribe to Supabase Realtime WebSocket events for zero-polling database load
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('admin-realtime-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const r = payload.new;
            const formatted: Registration = {
              id: r.id,
              name: r.name,
              email: r.email,
              phone: r.phone || '',
              institution: r.institution,
              category: r.category,
              currency: r.currency,
              amount: r.amount,
              mode: r.mode,
              paperId: r.paper_id || '',
              paymentStatus: r.payment_status || 'Pending',
              createdAt: r.created_at,
              notes: r.notes || '',
            };
            setRegistrations((prev) => {
              if (
                prev.some(
                  (item) =>
                    item.id === formatted.id ||
                    (formatted.paperId && item.paperId === formatted.paperId) ||
                    (item.email.toLowerCase() === formatted.email.toLowerCase() &&
                      item.name.toLowerCase() === formatted.name.toLowerCase())
                )
              ) {
                return prev;
              }
              return [formatted, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const r = payload.new;
            setRegistrations((prev) =>
              prev.map((item) =>
                item.id === r.id
                  ? {
                      ...item,
                      paymentStatus: r.payment_status || item.paymentStatus,
                      name: r.name || item.name,
                      email: r.email || item.email,
                      notes: r.notes !== undefined ? r.notes : item.notes,
                    }
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = payload.old.id;
            setRegistrations((prev) => prev.filter((item) => item.id !== oldId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'paper_submissions' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const s = payload.new;
            const formatted: Submission = {
              id: s.id,
              submissionId: s.submission_id,
              authorName: s.author_name,
              email: s.email,
              phone: s.phone || '',
              institution: s.institution,
              authorCategory: s.author_category || 'Research Scholars / Academicians',
              publicationCategory: s.publication_category || 'Category 1: Peer-Reviewed Journals',
              track: s.track,
              paperTitle: s.paper_title,
              abstract: s.abstract,
              mode: s.participation_mode || 'Hybrid',
              fileUrl: s.file_url,
              reviewStatus: s.review_status || 'Under Review',
              createdAt: s.created_at,
            };
            setSubmissions((prev) => {
              if (prev.some((item) => item.id === formatted.id)) return prev;
              return [formatted, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const s = payload.new;
            setSubmissions((prev) =>
              prev.map((item) =>
                item.id === s.id
                  ? {
                      ...item,
                      reviewStatus: s.review_status || item.reviewStatus,
                    }
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = payload.old.id;
            setSubmissions((prev) => prev.filter((item) => item.id !== oldId));
          }
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'Invalid administrator password');
      }
    } catch {
      setLoginError('Server error while verifying password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Ignore errors on logout
    } finally {
      setIsAuthenticated(false);
    }
  };

  const updateRegistrationStatus = async (id: string, paymentStatus: string) => {
    try {
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, paymentStatus } : reg))
      );
      if (selectedRegistration && selectedRegistration.id === id) {
        setSelectedRegistration({ ...selectedRegistration, paymentStatus });
      }

      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'registration', id, paymentStatus }),
      });
    } catch (err) {
      console.error('Failed to update registration status:', err);
    }
  };

  const updateSubmissionStatus = async (id: string, reviewStatus: string) => {
    try {
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, reviewStatus } : sub))
      );
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, reviewStatus });
      }

      await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'submission', id, reviewStatus }),
      });
    } catch (err) {
      console.error('Failed to update submission status:', err);
    }
  };

  const handleDeleteRecord = async (type: 'registration' | 'submission', id: string, label?: string) => {
    const confirmMsg = type === 'registration'
      ? `Are you sure you want to permanently delete delegate registration "${label || id}"? This will remove the database record.`
      : `Are you sure you want to permanently delete paper submission "${label || id}"? This will delete the manuscript PDF from storage, the paper submission database record, and any linked delegate registration.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/data?type=${type}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (type === 'registration') {
          setRegistrations((prev) => prev.filter((r) => r.id !== id));
          if (selectedRegistration?.id === id) {
            setSelectedRegistration(null);
          }
        } else {
          setSubmissions((prev) => prev.filter((s) => s.id !== id));
          if (selectedSubmission?.id === id) {
            setSelectedSubmission(null);
          }
        }
      } else {
        const errData = await res.json();
        alert(`Failed to delete record: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Delete record error:', err);
      alert('An unexpected error occurred while deleting.');
    }
  };

  const getTargetRecipients = () => {
    if (emailTargetType === 'verified_registrations') {
      return registrations
        .filter((r) => r.paymentStatus === 'Verified')
        .map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          paperId: r.paperId,
          institution: r.institution,
        }));
    } else {
      return submissions
        .filter((s) => s.reviewStatus === 'Accepted')
        .map((s) => ({
          id: s.id,
          name: s.authorName,
          email: s.email,
          paperId: s.submissionId,
          institution: s.institution,
        }));
    }
  };

  const handleSendTestEmail = async () => {
    setEmailError('');
    setEmailSendReport(null);
    setIsSendingEmail(true);

    try {
      const res = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest: true,
          testEmail: testEmailAddress,
          subject: emailSubject,
          messageBody: emailBody,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Test preview email sent successfully!');
      } else {
        setEmailError(data.error || 'Failed to send test preview email.');
      }
    } catch (err) {
      setEmailError('Network error while sending test preview email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendBulkEmail = async () => {
    const recipients = getTargetRecipients();
    if (recipients.length === 0) {
      alert(`No verified recipients found for ${emailTargetType === 'verified_registrations' ? 'Verified Delegate Registrations' : 'Accepted Paper Submissions'}.`);
      return;
    }

    const confirmMsg = `Are you sure you want to dispatch bulk emails to all ${recipients.length} VERIFIED recipients via SMTP?`;
    if (!window.confirm(confirmMsg)) return;

    setEmailError('');
    setEmailSendReport(null);
    setIsSendingEmail(true);

    try {
      const res = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: emailSubject,
          messageBody: emailBody,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSendReport(data.report);
      } else {
        setEmailError(data.error || 'Failed to complete bulk email dispatch.');
      }
    } catch (err) {
      setEmailError('Server connection error during email queue processing.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const exportRegistrationsCSV = () => {
    const headers = [
      'Registration ID',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Institution / University',
      'Participant Category',
      'Currency',
      'Amount Payable',
      'Participation Mode',
      'Paper ID',
      'Payment Status',
      'Registration Date',
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.institution}"`,
      `"${r.category}"`,
      `"${r.currency}"`,
      `"${r.amount}"`,
      `"${r.mode}"`,
      `"${r.paperId || 'N/A'}"`,
      `"${r.paymentStatus}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ICCAQI_2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSubmissionsCSV = () => {
    const headers = [
      'Submission ID',
      'Paper Title',
      'Author Name',
      'Gender',
      'Email Address',
      'Phone Number',
      'Institution / University',
      'Author Category',
      'Publication Category',
      'Conference Track',
      'Presentation Mode',
      'Review Status',
      'Submission Date',
      'Manuscript URL',
    ];

    const rows = filteredSubmissions.map((s) => [
      `"${s.submissionId}"`,
      `"${(s.paperTitle || '').replace(/"/g, '""')}"`,
      `"${(s.authorName || '').replace(/"/g, '""')}"`,
      `"${s.gender || 'Not Specified'}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${(s.institution || '').replace(/"/g, '""')}"`,
      `"${s.authorCategory || 'N/A'}"`,
      `"${s.publicationCategory || 'Category 1: Peer-Reviewed Journals'}"`,
      `"${(s.track || '').replace(/"/g, '""')}"`,
      `"${s.mode || 'Offline'}"`,
      `"${s.reviewStatus || 'Submitted'}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.fileUrl || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ICCAQI_2026_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.paperId && reg.paperId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = regCategoryFilter === 'All' || reg.category === regCategoryFilter;
    const matchesStatus = regStatusFilter === 'All' || reg.paymentStatus === regStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.submissionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack = subTrackFilter === 'All' || sub.track === subTrackFilter;
    const matchesStatus = subStatusFilter === 'All' || sub.reviewStatus === subStatusFilter;

    return matchesSearch && matchesTrack && matchesStatus;
  });

  const totalRegistrations = registrations.length;
  const totalSubmissions = submissions.length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verified').length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === 'Pending').length;

  const getAssociatedSubmission = (paperId: string) => {
    if (!paperId) return null;
    return (
      submissions.find(
        (s) => s.submissionId.toLowerCase() === paperId.toLowerCase()
      ) || null
    );
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7cb305]" />
          <span>Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3.5 rounded-2xl bg-[#7cb305]/10 text-[#7cb305] border border-[#7cb305]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7cb305]">
              Yenepoya ICCAQI 2026
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Admin Portal Security
            </h2>
            <p className="text-xs text-slate-500">
              Enter administrator password to access live portal data
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Administrator Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#7cb305] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Access...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate &amp; Open Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isSplitOpen = (activeTab === 'registrations' && selectedRegistration !== null) || (activeTab === 'submissions' && selectedSubmission !== null);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. SOLID CLEAN SIDEBAR WITH YENEPOYA OFFICIAL LOGO AT TOP  */}
      {/* ========================================================= */}
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 z-50 shadow-xs transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Top Logo & Brand Info with Official Yenepoya Logo */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya (Deemed to be University)"
                className="h-9 w-auto object-contain shrink-0"
              />
              <div className="overflow-hidden border-l border-slate-200 pl-3">
                <span className="font-extrabold text-xs tracking-tight text-slate-900 block leading-tight">
                  ICCAQI 2026
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#7cb305] uppercase block font-mono">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Capsule Pill active state) */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('registrations');
                setSelectedRegistration(null);
                setSelectedSubmission(null);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-[#7cb305] text-white shadow-md shadow-[#7cb305]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-4.5 h-4.5 shrink-0" />
              <span>Delegate Registrations</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('submissions');
                setSelectedRegistration(null);
                setSelectedSubmission(null);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-[#7cb305] text-white shadow-md shadow-[#7cb305]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4.5 h-4.5 shrink-0" />
              <span>Paper Submissions</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-3" />

            <button
              onClick={() => {
                setActiveTab('registrations');
                setRegStatusFilter('Verified');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
              <span>Verified Payments</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'submissions') {
                  exportSubmissionsCSV();
                } else {
                  exportRegistrationsCSV();
                }
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4.5 h-4.5 shrink-0 text-amber-600" />
              <span>Export CSV ({activeTab === 'submissions' ? 'Submissions' : 'Registrations'})</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <Mail className="w-4.5 h-4.5 shrink-0 text-[#7cb305]" />
              <span>Broadcast Email</span>
            </button>
          </nav>
        </div>

        {/* User Profile Card & Log Out at Bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#7cb305]/10 text-[#7cb305] font-bold text-sm flex items-center justify-center shrink-0 border border-[#7cb305]/20">
              A
            </div>
            <div className="overflow-hidden text-left flex-1">
              <div className="font-extrabold text-xs text-slate-900 truncate">Admin User</div>
              <div className="text-[10px] font-medium text-slate-500">Administrator</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. SPLIT LAYOUT: MAIN ADMIN PAGE (LEFT) + DETAILS (RIGHT)  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-row min-h-screen min-w-0 overflow-hidden">
        
        {/* LEFT PANEL: MAIN ADMIN PAGE CONTENT (HEADER, STATS, TABLE) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
          
          {/* TOP HEADER BAR */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'registrations' ? 'Delegate Registrations' : 'Paper Submissions'}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Realtime Live</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Box */}
              <div className="relative w-36 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#7cb305] focus:bg-white transition-all"
                />
              </div>

              {/* Broadcast Email CTA Button */}
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Broadcast SMTP email to verified delegates"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Broadcast Email ({registrations.filter((r) => r.paymentStatus === 'Verified').length})</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                title="Refresh Live Data"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          {/* MAIN BODY DASHBOARD */}
          <main className="p-6 space-y-6 flex-1">

            {/* STAGE / CATEGORY CARDS CAROUSEL */}
            <div className="relative">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                
                {/* Card 1: Delegate Registrations */}
                <div
                  onClick={() => setActiveTab('registrations')}
                  className={`min-w-[210px] flex-1 p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === 'registrations'
                      ? 'bg-lime-50/60 border-2 border-[#7cb305] shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-lime-100 text-[#7cb305]">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#7cb305] bg-lime-50 px-2 py-0.5 rounded-full border border-lime-200">
                      {totalRegistrations} Total
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Delegate Registrations</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Participants : {totalRegistrations}</div>
                </div>

                {/* Card 2: Paper Submissions */}
                <div
                  onClick={() => setActiveTab('submissions')}
                  className={`min-w-[210px] flex-1 p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === 'submissions'
                      ? 'bg-lime-50/60 border-2 border-[#7cb305] shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      {totalSubmissions} Papers
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Paper Submissions</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Manuscripts : {totalSubmissions}</div>
                </div>

                {/* Card 3: Verified Payments */}
                <div
                  onClick={() => {
                    setActiveTab('registrations');
                    setRegStatusFilter('Verified');
                  }}
                  className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Verified Payments</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Issued Receipts : {verifiedCount}</div>
                </div>

                {/* Card 4: Pending Verification */}
                <div
                  onClick={() => {
                    setActiveTab('registrations');
                    setRegStatusFilter('Pending');
                  }}
                  className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Pending Actions</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Awaiting : {pendingCount}</div>
                </div>

                {/* Card 5: Technical Tracks */}
                <div className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      8 Tracks
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">Conference Tracks</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Active Track Domains</div>
                </div>

              </div>
            </div>

            {/* TITLE & FILTER CONTROLS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {activeTab === 'registrations' ? 'All Delegates' : 'All Manuscripts'}
                </h2>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'registrations' ? (
                  <>
                    <select
                      value={regCategoryFilter}
                      onChange={(e) => setRegCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#7cb305] shadow-xs"
                    >
                      <option value="All">All Participant Categories</option>
                      <option value="Students (UG / PG)">Students (UG / PG)</option>
                      <option value="Research scholars / Academicians">Research Scholars / Academicians</option>
                      <option value="Industry Delegates">Industry Delegates</option>
                      <option value="Participants only">Participants Only</option>
                    </select>

                    <select
                      value={regStatusFilter}
                      onChange={(e) => setRegStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#7cb305] shadow-xs"
                    >
                      <option value="All">All Payment Statuses</option>
                      <option value="Verified">Verified Only</option>
                      <option value="Pending">Pending Only</option>
                    </select>

                    <button
                      onClick={exportRegistrationsCSV}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={subTrackFilter}
                      onChange={(e) => setSubTrackFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#7cb305] shadow-xs"
                    >
                      <option value="All">All Conference Tracks</option>
                      <option value="Artificial Intelligence and Machine Learning">AI &amp; Machine Learning</option>
                      <option value="Quantum Computing and Quantum Intelligence">Quantum Computing</option>
                      <option value="Cyber-Physical Systems and IoT">IoT &amp; Cyber-Physical Systems</option>
                    </select>

                    <select
                      value={subStatusFilter}
                      onChange={(e) => setSubStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#7cb305] shadow-xs"
                    >
                      <option value="All">All Review Statuses</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={exportSubmissionsCSV}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                {activeTab === 'registrations' ? (
                  /* REGISTRATIONS TABLE */
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Delegate Name</th>
                        <th className="py-3.5 px-4">Category &amp; Mode</th>
                        <th className="py-3.5 px-4">Fee &amp; Currency</th>
                        <th className="py-3.5 px-4">Paper ID</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No registration records match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.slice(0, itemsPerPage).map((reg) => {
                          const isSelected = selectedRegistration?.id === reg.id;
                          return (
                            <tr
                              key={reg.id}
                              onClick={() => setSelectedRegistration(reg)}
                              className={`transition-all cursor-pointer group ${
                                isSelected
                                  ? 'bg-lime-50/90 border-l-4 border-[#7cb305]'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Name + Initial Avatar */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                                    isSelected
                                      ? 'bg-[#7cb305] text-white border-[#7cb305]'
                                      : 'bg-[#7cb305]/10 text-[#7cb305] border-[#7cb305]/20'
                                  }`}>
                                    {getInitials(reg.name)}
                                  </div>
                                  <div className="space-y-0.5 overflow-hidden">
                                    <div className="font-bold text-slate-900 text-xs group-hover:text-[#7cb305] transition-colors truncate max-w-[200px]">
                                      {reg.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                      {reg.email}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category & Mode */}
                              <td className="py-3.5 px-4 space-y-1">
                                <div className="font-semibold text-slate-800 truncate max-w-[150px]">{reg.category}</div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                  reg.mode === 'Online'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {reg.mode === 'Online' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                  {reg.mode || 'Offline'}
                                </span>
                              </td>

                              {/* Fee */}
                              <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                                {reg.amount} ({reg.currency})
                              </td>

                              {/* Paper ID */}
                              <td className="py-3.5 px-4 font-mono text-slate-500">
                                {reg.paperId ? (
                                  <span className="font-bold text-[#7cb305] bg-[#7cb305]/10 px-2 py-0.5 rounded border border-[#7cb305]/20">
                                    {reg.paperId}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>

                              {/* Status Pill Badge */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    reg.paymentStatus === 'Verified'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {reg.paymentStatus === 'Verified' ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-amber-600" />
                                  )}
                                  {reg.paymentStatus}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRegistration(reg);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                      isSelected
                                        ? 'bg-[#7cb305] text-white border-[#7cb305]'
                                        : 'bg-slate-100 hover:bg-[#7cb305] hover:text-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    Split Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecord('registration', reg.id, reg.name);
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                    title="Delete Delegate Registration"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  /* PAPER SUBMISSIONS TABLE */
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Author &amp; Paper Title</th>
                        <th className="py-3.5 px-4">Paper ID</th>
                        <th className="py-3.5 px-4">Track Domain</th>
                        <th className="py-3.5 px-4">Review Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No manuscript submissions match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.slice(0, itemsPerPage).map((sub) => {
                          const isSelected = selectedSubmission?.id === sub.id;
                          return (
                            <tr
                              key={sub.id}
                              onClick={() => setSelectedSubmission(sub)}
                              className={`transition-all cursor-pointer group ${
                                isSelected
                                  ? 'bg-lime-50/90 border-l-4 border-[#7cb305]'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Title & Author */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-[#7cb305] text-white' : 'bg-sky-100 text-sky-700'
                                  }`}>
                                    {getInitials(sub.authorName)}
                                  </div>
                                  <div className="space-y-0.5 overflow-hidden">
                                    <div className="font-bold text-slate-900 text-xs group-hover:text-[#7cb305] transition-colors truncate max-w-[280px]">
                                      {sub.paperTitle}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                                      {sub.authorName} • {sub.institution}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                      {sub.gender && (
                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                          sub.gender === 'Female'
                                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                            : sub.gender === 'Male'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                        }`}>
                                          {sub.gender}
                                        </span>
                                      )}
                                      {sub.phone && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200">
                                          <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                          {sub.phone}
                                        </span>
                                      )}
                                      {sub.authorCategory && (
                                        <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                          {sub.authorCategory}
                                        </span>
                                      )}
                                      {sub.publicationCategory && (
                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                          sub.publicationCategory.includes('Category 2')
                                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                                        }`}>
                                          {sub.publicationCategory.includes('Category 2') ? 'Cat 2: Scopus' : 'Cat 1: Peer-Reviewed'}
                                        </span>
                                      )}
                                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                        sub.mode === 'Online'
                                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      }`}>
                                        {sub.mode === 'Online' ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                        {sub.mode === 'Online' ? 'Online' : 'Offline'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Submission ID */}
                              <td className="py-3.5 px-4 font-mono font-bold text-[#7cb305]">
                                {sub.submissionId}
                              </td>

                              {/* Track */}
                              <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">
                                {sub.track}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    sub.reviewStatus === 'Accepted'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : sub.reviewStatus === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                                  }`}
                                >
                                  {sub.reviewStatus}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSubmission(sub);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                      isSelected
                                        ? 'bg-[#7cb305] text-white border-[#7cb305]'
                                        : 'bg-slate-100 hover:bg-[#7cb305] hover:text-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    Split Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRecord('submission', sub.id, sub.paperTitle);
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                                    title="Delete Paper Submission"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* PAGINATION BAR */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span>Show rows:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span>
                    1-{activeTab === 'registrations' ? Math.min(itemsPerPage, filteredRegistrations.length) : Math.min(itemsPerPage, filteredSubmissions.length)} of {activeTab === 'registrations' ? filteredRegistrations.length : filteredSubmissions.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 py-1 rounded-lg bg-[#7cb305] text-white font-bold text-xs">
                      1
                    </span>
                    <button className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>

        {/* RIGHT PANEL: RESIZABLE SPLIT DETAILS PANE (IN-LAYOUT ON DESKTOP, FULL-SCREEN DRAWER ON MOBILE) */}
        {isSplitOpen && (
          <>
            {/* DRAGGABLE RESIZER VERTICAL DIVIDER HANDLE (Hidden on mobile) */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
              className="hidden lg:flex w-2.5 hover:w-3.5 bg-slate-200 hover:bg-[#7cb305] cursor-col-resize h-screen sticky top-0 shrink-0 transition-colors items-center justify-center group z-30 select-none border-x border-slate-300/80 shadow-xs"
              title="Click and drag horizontally to resize left admin page and right details panel"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </div>

            {/* Mobile backdrop for details pane */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => {
                setSelectedRegistration(null);
                setSelectedSubmission(null);
              }}
            />

            {/* RIGHT DETAILS PANE */}
            <div
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : `${splitPanelWidth}px` }}
              className="fixed lg:sticky top-0 right-0 h-screen w-full lg:w-auto shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-4 sm:p-6 space-y-6 shadow-2xl z-50 lg:z-20 text-left transition-all max-w-full"
            >
              {/* REGISTRATION SPLIT DETAILS */}
              {activeTab === 'registrations' && selectedRegistration && (
                <div className="space-y-6">
                  {/* Top Bar with Close button */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#7cb305] text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                        {getInitials(selectedRegistration.name)}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                          {selectedRegistration.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 font-mono text-xs font-bold border border-sky-200">
                            {selectedRegistration.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {selectedRegistration.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDeleteRecord('registration', selectedRegistration.id, selectedRegistration.name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        title="Delete Delegate Registration Record"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => setSelectedRegistration(null)}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Close Split Details"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Payment Verification Quick Action Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 block">Payment Verification Status</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateRegistrationStatus(selectedRegistration.id, 'Verified')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          selectedRegistration.paymentStatus === 'Verified'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <Check className="w-4 h-4" /> Mark Payment Verified
                      </button>

                      <button
                        onClick={() => updateRegistrationStatus(selectedRegistration.id, 'Pending')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          selectedRegistration.paymentStatus === 'Pending'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-300'
                        }`}
                      >
                        <Clock className="w-4 h-4" /> Set Pending
                      </button>
                    </div>
                  </div>

                  {/* Comprehensive Info Grid */}
                  <div className="space-y-3.5 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sky-600" /> Email Address
                        </span>
                        <span className="font-bold text-slate-900">{selectedRegistration.email}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number
                        </span>
                        <span className="font-bold text-slate-900">{selectedRegistration.phone || 'Not Provided'}</span>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200 space-y-0.5">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-amber-600" /> Institution / University
                        </span>
                        <div className="font-bold text-slate-900">{selectedRegistration.institution}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-sky-50/40 border border-sky-100">
                      <div>
                        <span className="text-slate-500 font-medium">Participation Mode</span>
                        <div className="font-bold text-slate-900 mt-1 text-xs flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            selectedRegistration.mode === 'Online'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {selectedRegistration.mode === 'Online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {selectedRegistration.mode || 'Offline'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium">Payable Fee</span>
                        <div className="font-extrabold text-[#7cb305] text-base mt-0.5">
                          {selectedRegistration.amount} ({selectedRegistration.currency})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered: {new Date(selectedRegistration.createdAt).toLocaleString()}
                      </span>
                      <span className="font-semibold text-slate-700">Category: {selectedRegistration.category}</span>
                    </div>
                  </div>

                  {/* Submitted Research Paper Details (Title, Track, Abstract & File Card) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#7cb305]" /> Submitted Research Paper Details
                      </span>
                      {selectedRegistration.paperId && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#7cb305]/10 text-[#7cb305] font-mono text-xs font-bold border border-[#7cb305]/20">
                          {selectedRegistration.paperId}
                        </span>
                      )}
                    </div>
                    
                    {selectedRegistration.paperId ? (
                      <div className="space-y-3">
                        {/* Paper Title & Track */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="font-extrabold text-slate-900 text-sm leading-snug">
                            {getAssociatedSubmission(selectedRegistration.paperId)?.paperTitle || 'Research Manuscript Submission'}
                          </div>
                          <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#7cb305]" />
                            <span>Track: {getAssociatedSubmission(selectedRegistration.paperId)?.track || 'Conference Technical Track'}</span>
                          </div>
                        </div>

                        {/* Submitted Abstract */}
                        {getAssociatedSubmission(selectedRegistration.paperId)?.abstract && (
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-slate-800 block">Submitted Abstract</span>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 italic leading-relaxed max-h-40 overflow-y-auto">
                              &ldquo;{getAssociatedSubmission(selectedRegistration.paperId)?.abstract}&rdquo;
                            </div>
                          </div>
                        )}

                        {/* Uploaded File UX Card Matching Reference Image */}
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 block">Uploaded Manuscript Document</span>
                          <div className="p-3.5 rounded-2xl bg-[#edf4ff] border border-[#d0e2ff] flex items-center justify-between gap-3 text-left shadow-xs">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <div className="text-xs font-bold text-slate-900 truncate max-w-[190px] flex items-center gap-1">
                                  <span>Paper_{selectedRegistration.paperId}.pdf</span>
                                  <span className="text-slate-600 font-semibold">• Uploaded</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  1.45 MB • Verified PDF Document
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="p-1 rounded-full bg-blue-100 text-[#3b82f6]">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                              <a
                                href={getAssociatedSubmission(selectedRegistration.paperId)?.fileUrl || '/sample-manuscript.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-white border border-[#d0e2ff] text-[#3b82f6] hover:bg-blue-50 transition-colors shadow-2xs font-bold text-xs flex items-center gap-1"
                                title="Open Document"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Open PDF
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
                        No Paper ID attached. Listener / Attendee Delegate.
                      </div>
                    )}
                  </div>

                  {/* Payment Receipt / Screenshot Verification Card */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#7cb305]" /> Payment Proof &amp; Verification
                    </span>

                    {selectedRegistration.notes ? (
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Proof Submitted
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {selectedRegistration.notes.match(/Ref:\s*([^.\s]+)/i)?.[1] ? `Ref: ${selectedRegistration.notes.match(/Ref:\s*([^.\s]+)/i)?.[1]}` : 'Uploaded'}
                          </span>
                        </div>

                        {selectedRegistration.notes.match(/Image:\s*(https?:\/\/[^\s]+)/i)?.[1] ? (
                          <div className="space-y-2">
                            <a
                              href={selectedRegistration.notes.match(/Image:\s*(https?:\/\/[^\s]+)/i)![1]}
                              target="_blank"
                              rel="noreferrer"
                              className="block relative rounded-xl overflow-hidden border border-amber-300 group bg-slate-900"
                            >
                              <img
                                src={selectedRegistration.notes.match(/Image:\s*(https?:\/\/[^\s]+)/i)![1]}
                                alt="Payment Proof Screenshot"
                                className="w-full max-h-48 object-contain bg-slate-950 group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="p-2.5 bg-slate-900/90 text-white font-bold text-[11px] flex items-center justify-between border-t border-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <ExternalLink className="w-3.5 h-3.5 text-[#7cb305]" /> View Full Resolution Payment Receipt Screenshot
                                </span>
                                <span className="bg-[#7cb305] text-white text-[10px] px-2 py-0.5 rounded font-extrabold">Open File</span>
                              </div>
                            </a>
                          </div>
                        ) : (
                          <div className="text-slate-700 bg-white p-2.5 rounded-xl border border-amber-200 font-mono text-[11px] break-all">
                            {selectedRegistration.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
                        No payment proof screenshot uploaded yet for this delegate.
                      </div>
                    )}
                  </div>

                  {/* Delete Action Bar */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleDeleteRecord('registration', selectedRegistration.id, selectedRegistration.name)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Registration Record</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMISSION SPLIT DETAILS */}
              {activeTab === 'submissions' && selectedSubmission && (
                <div className="space-y-6">
                  {/* Top Bar with Close button */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1.5 overflow-hidden pr-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#7cb305]/10 text-[#7cb305] font-mono text-xs font-bold border border-[#7cb305]/20">
                          {selectedSubmission.submissionId}
                        </span>
                        <span className="text-xs text-slate-500 font-medium truncate">{selectedSubmission.track}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {selectedSubmission.paperTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDeleteRecord('submission', selectedSubmission.id, selectedSubmission.paperTitle)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        title="Delete Paper Submission & Manuscript"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Close Split Details"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Review Status Selector Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700">Update Review Status:</span>
                    <select
                      value={selectedSubmission.reviewStatus}
                      onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                      className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#7cb305] shadow-xs"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Author Details Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#7cb305]" /> Author Name
                      </span>
                      <span className="font-bold text-slate-900">{selectedSubmission.authorName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-600" /> Author Email
                      </span>
                      <span className="font-bold text-slate-900">{selectedSubmission.email}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Author Phone
                      </span>
                      <span className="font-bold text-slate-900">{selectedSubmission.phone || 'Not Provided'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-pink-600" /> Gender
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        selectedSubmission.gender === 'Female'
                          ? 'bg-pink-100 text-pink-800 border border-pink-200'
                          : selectedSubmission.gender === 'Male'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {selectedSubmission.gender || 'Not Specified'}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 space-y-0.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-600" /> Institution / University
                      </span>
                      <div className="font-bold text-slate-900">{selectedSubmission.institution}</div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" /> Author Category
                      </span>
                      <span className="font-bold text-slate-900">{selectedSubmission.authorCategory || 'Research Scholars / Academicians'}</span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        {selectedSubmission.mode === 'Online' ? <Video className="w-3.5 h-3.5 text-purple-600" /> : <MapPin className="w-3.5 h-3.5 text-teal-600" />} Presentation Mode
                      </span>
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        selectedSubmission.mode === 'Online'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {selectedSubmission.mode === 'Online' ? 'Online (Virtual)' : 'Offline (In-Person)'}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Submitted On
                      </span>
                      <span className="font-semibold text-slate-700">{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" /> Publication Track
                      </span>
                      <div className="font-bold text-emerald-800 text-[11.5px] bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        {selectedSubmission.publicationCategory || 'Category 1: Peer-Reviewed Journals'}
                      </div>
                    </div>
                  </div>

                  {/* Abstract */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-800 block">Abstract</span>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 italic leading-relaxed max-h-48 overflow-y-auto">
                      &ldquo;{selectedSubmission.abstract}&rdquo;
                    </div>
                  </div>

                  {/* Uploaded File UX Card Matching Reference Image */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Uploaded Manuscript File</span>
                    <div className="p-4 rounded-2xl bg-[#edf4ff] border border-[#d0e2ff] flex items-center justify-between gap-3 text-left shadow-xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="text-xs font-bold text-slate-900 truncate max-w-[220px] flex items-center gap-1">
                            <span>Manuscript_{selectedSubmission.submissionId}.pdf</span>
                            <span className="text-slate-600 font-semibold">• Uploaded</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            2.85 MB • Verified PDF Document
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="p-1 rounded-full bg-blue-100 text-[#3b82f6]">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <a
                          href={selectedSubmission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white border border-[#d0e2ff] text-[#3b82f6] hover:bg-blue-50 transition-colors shadow-2xs font-bold text-xs flex items-center gap-1"
                          title="Open Manuscript PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open PDF
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Delete Action Bar */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleDeleteRecord('submission', selectedSubmission.id, selectedSubmission.paperTitle)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Submission &amp; Manuscript PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* ========================================================= */}
      {/* BULK EMAIL DISPATCH COMPOSER MODAL FOR VERIFIED DELEGATES  */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto my-auto text-left">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#7cb305]/10 text-[#7cb305]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7cb305]">
                    SMTP Bulk Email Dispatch Gateway
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Broadcast Email Communication
                </h3>
                <p className="text-xs text-slate-500">
                  Send throttled, personalized emails via SMTP without rate limit errors
                </p>
              </div>

              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Audience Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Recipient Group *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEmailTargetType('verified_registrations')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    emailTargetType === 'verified_registrations'
                      ? 'border-[#7cb305] bg-lime-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Verified Delegates Only</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#7cb305] text-white text-[10px]">
                      {registrations.filter((r) => r.paymentStatus === 'Verified').length} Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Paid / Verified Conference Participants</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailTargetType('accepted_submissions')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    emailTargetType === 'accepted_submissions'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Accepted Paper Authors</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px]">
                      {submissions.filter((s) => s.reviewStatus === 'Accepted').length} Accepted
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Authors of Accepted Manuscripts</div>
                </button>
              </div>
            </div>

            {/* Quick Template Shortcuts */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quick Template Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSubject('ICCAQI 2026 — Official Registration Verification & Payment Receipt');
                    setEmailBody(
                      `<p>We are pleased to inform you that your delegate registration fee for <strong>ICCAQI 2026</strong> at Yenepoya (Deemed to be University) has been <strong>OFFICIALLY VERIFIED & CONFIRMED</strong>.</p><div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 16px 0; font-size: 13px;"><p style="margin: 0 0 6px 0;"><strong>Delegate Name:</strong> {{name}}</p><p style="margin: 0 0 6px 0;"><strong>Registration Reference ID:</strong> {{registration_id}}</p><p style="margin: 0 0 6px 0;"><strong>Institution / University:</strong> {{institution}}</p><p style="margin: 0;"><strong>Associated Paper ID:</strong> {{paper_id}}</p></div><p>Your delegate badge and official payment receipt will be issued at the conference desk upon arrival on <strong>November 6, 2026</strong>.</p>`
                    );
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Payment Verified Receipt
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSubject('ICCAQI 2026 — Official Paper Acceptance Notification');
                    setEmailBody(
                      `<p>We are delighted to inform you that your manuscript (Paper ID: <strong>{{paper_id}}</strong>) has been <strong>accepted</strong> for presentation at ICCAQI 2026.</p><p>Please prepare your presentation slides and keep them ready for presenting your paper at the conference.</p><p><strong>Official Paper Authors WhatsApp Group:</strong> Please join our presenters WhatsApp group for schedule announcements and technical session links: <a href="https://chat.whatsapp.com/JhShh9sbV840L8gQEMHWip">https://chat.whatsapp.com/JhShh9sbV840L8gQEMHWip</a></p><p>We wish you all the very best for your presentation!</p><p>Be confident, present your research clearly, and make the most of this opportunity to share your ideas and connect with fellow researchers.</p><p>Best wishes for a successful and impactful presentation!</p><p>We look forward to your excellent presentations.</p><p>All the best!</p>`
                    );
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Paper Acceptance Notice
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSubject('ICCAQI 2026 — Conference Schedule & Travel Advisory');
                    setEmailBody(
                      `<p>Greetings from Yenepoya School of Engineering & Technology, Mangaluru.</p><p>The technical program schedule for ICCAQI 2026 is now available. Hybrid session links for virtual attendees and campus directions for offline participants have been updated on our portal.</p>`
                    );
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Schedule &amp; Travel Notice
                </button>
              </div>
            </div>

            {/* Email Subject Line */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Email Subject Line *
              </label>
              <input
                type="text"
                required
                disabled={isSendingEmail}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject line..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#7cb305] focus:outline-hidden bg-white"
              />
            </div>

            {/* Email Message Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Message Body (HTML / Text) *
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Tags: {"{{name}}"}, {"{{paper_id}}"}, {"{{institution}}"}
                </span>
              </div>
              <textarea
                rows={5}
                required
                disabled={isSendingEmail}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#7cb305] focus:outline-hidden bg-white font-mono leading-relaxed"
              />
            </div>

            {/* Test Email Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex-1 min-w-[220px]">
                <span className="font-bold text-slate-800 block">Send Test Preview Email</span>
                <span className="text-[11px] text-slate-500">Test formatting before launching to verified delegates</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter test email..."
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-[#7cb305]"
                />
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={handleSendTestEmail}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Send Test Preview
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {emailError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{emailError}</span>
              </div>
            )}

            {/* Dispatch Summary Report */}
            {emailSendReport && (() => {
              const allSent = emailSendReport.failedCount === 0;
              const partiallySent = emailSendReport.successCount > 0 && !allSent;
              const tone = allSent
                ? 'bg-emerald-50 border-emerald-200'
                : partiallySent
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200';
              const headingTone = allSent
                ? 'text-emerald-800'
                : partiallySent
                  ? 'text-amber-800'
                  : 'text-rose-800';
              const detailTone = allSent
                ? 'text-emerald-700'
                : partiallySent
                  ? 'text-amber-700'
                  : 'text-rose-700';

              return (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 text-left ${tone}`} role="status">
                  <div className={`font-extrabold flex items-center gap-1.5 ${headingTone}`}>
                    {allSent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className={`w-4 h-4 shrink-0 ${partiallySent ? 'text-amber-600' : 'text-rose-600'}`} />
                    )}
                    <span>
                      {allSent
                        ? 'Emails sent successfully'
                        : partiallySent
                          ? 'Email sending partially completed'
                          : 'Email sending failed'}
                    </span>
                  </div>
                  <div className={`${detailTone} font-medium`}>
                    Sent <strong>{emailSendReport.successCount}</strong> of <strong>{emailSendReport.total}</strong> emails.
                  </div>
                  {emailSendReport.failedCount > 0 && (
                    <div className={`${detailTone} font-medium`}>
                      {emailSendReport.failedCount} {emailSendReport.failedCount === 1 ? 'email could' : 'emails could'} not be sent. Check your email settings and try again.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* CTA Controls */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingEmail}
                onClick={handleSendBulkEmail}
                className="px-6 py-2.5 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching via SMTP (Paced)...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Launch Bulk Dispatch ({getTargetRecipients().length} Recipients)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
