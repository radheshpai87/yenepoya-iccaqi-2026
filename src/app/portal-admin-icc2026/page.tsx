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
  Sparkles,
  FileCode,
  ArrowUpRight
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
  institution: string;
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

  // Selected Item Modals
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Search & Filters
  const [regSearch, setRegSearch] = useState('');
  const [regCategoryFilter, setRegCategoryFilter] = useState('All');
  const [regStatusFilter, setRegStatusFilter] = useState('All');

  const [subSearch, setSubSearch] = useState('');
  const [subTrackFilter, setSubTrackFilter] = useState('All');
  const [subStatusFilter, setSubStatusFilter] = useState('All');

  // Check auth session on load & set up live auto-sync without page reload
  useEffect(() => {
    checkSession();
  }, []);

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
            };
            setRegistrations((prev) => {
              if (prev.some((item) => item.id === formatted.id)) return prev;
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

    // Re-sync snapshot when tab becomes visible after backgrounding or switching windows
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
        setLoginError(data.error || 'Authentication failed. Please check the administrator password.');
      }
    } catch {
      setLoginError('Server error while authenticating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
    }
  };

  const updateRegistrationStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'registration', id, paymentStatus: newStatus }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((reg) => (reg.id === id ? { ...reg, paymentStatus: newStatus } : reg))
        );
        if (selectedRegistration && selectedRegistration.id === id) {
          setSelectedRegistration((prev) => (prev ? { ...prev, paymentStatus: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating registration status:', err);
    }
  };

  const updateSubmissionStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'submission', id, reviewStatus: newStatus }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, reviewStatus: newStatus } : sub))
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission((prev) => (prev ? { ...prev, reviewStatus: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating submission status:', err);
    }
  };

  // Export registrations CSV
  const exportRegistrationsCSV = () => {
    if (registrations.length === 0) return;

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

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(regSearch.toLowerCase()) ||
      reg.email.toLowerCase().includes(regSearch.toLowerCase()) ||
      reg.institution.toLowerCase().includes(regSearch.toLowerCase()) ||
      (reg.paperId && reg.paperId.toLowerCase().includes(regSearch.toLowerCase()));

    const matchesCategory = regCategoryFilter === 'All' || reg.category === regCategoryFilter;
    const matchesStatus = regStatusFilter === 'All' || reg.paymentStatus === regStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.authorName.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.paperTitle.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.submissionId.toLowerCase().includes(subSearch.toLowerCase());

    const matchesTrack = subTrackFilter === 'All' || sub.track === subTrackFilter;
    const matchesStatus = subStatusFilter === 'All' || sub.reviewStatus === subStatusFilter;

    return matchesSearch && matchesTrack && matchesStatus;
  });

  // Loading initial authentication state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-700 font-sans">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7cb305]" />
          <span className="text-sm font-semibold tracking-wide text-slate-800">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  // --- MINIMALIST WHITE THEME: LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 font-sans relative">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <img
                src="/yenepoya-university-logonew3.svg"
                alt="Yenepoya University"
                className="h-7 w-auto object-contain"
              />
              <div className="h-4 w-[1px] bg-slate-300" />
              <img
                src="/yenepoya-school-engineering-and-technologynew-02.svg"
                alt="Yenepoya SET"
                className="h-7 w-auto object-contain"
              />
            </div>

            <div className="space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-[#7cb305]" />
                Administration Portal
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                ICCAQI 2026 Admin Login
              </h2>
              <p className="text-xs text-slate-500">
                Enter your access password to manage registrations &amp; paper submissions
              </p>
            </div>
          </div>

          {/* Login Error Alert */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{loginError}</span>
            </div>
          )}

          {/* Login Form */}
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
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MINIMALIST WHITE THEME: DASHBOARD VIEW ---
  const totalRegistrations = registrations.length;
  const totalSubmissions = submissions.length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verified').length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === 'Pending').length;

  // Find paper submission associated with delegate registration (if any)
  const getAssociatedSubmission = (paperId: string) => {
    if (!paperId) return null;
    return (
      submissions.find(
        (s) => s.submissionId.toLowerCase() === paperId.toLowerCase()
      ) || null
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-16">
      {/* Clean Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/yenepoya-university-logonew3.svg"
              alt="Yenepoya Logo"
              className="h-7 w-auto object-contain"
            />
            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />
            <img
              src="/yenepoya-school-engineering-and-technologynew-02.svg"
              alt="Yenepoya SET Logo"
              className="h-7 w-auto object-contain hidden sm:block"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-none">ICCAQI 2026 Admin Portal</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Yenepoya (Deemed to be University)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Connected to Supabase Realtime WebSockets">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Realtime Sync</span>
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Live Data Snapshot"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Metric Cards Grid - Clean White Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registrations</span>
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalRegistrations}</div>
            <p className="text-xs text-slate-500 font-medium">{verifiedCount} Verified • {pendingCount} Pending</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Paper Submissions</span>
              <FileText className="w-5 h-5 text-[#7cb305]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalSubmissions}</div>
            <p className="text-xs text-slate-500 font-medium">Across 8 Conference Tracks</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Payments</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{verifiedCount}</div>
            <p className="text-xs text-slate-500 font-medium">Official receipt tokens issued</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Actions</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700">{pendingCount}</div>
            <p className="text-xs text-slate-500 font-medium">Awaiting payment verification</p>
          </div>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-[#7cb305] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Delegate Registrations ({registrations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-[#7cb305] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paper Submissions ({submissions.length})</span>
            </button>
          </div>

          {activeTab === 'registrations' && (
            <button
              onClick={exportRegistrationsCSV}
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV (Excel)</span>
            </button>
          )}
        </div>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, institution..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={regCategoryFilter}
                  onChange={(e) => setRegCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                >
                  <option value="All">All Participant Categories</option>
                  <option value="Students (UG / PG)">Students (UG / PG)</option>
                  <option value="Research scholars / Academicians">Research Scholars / Academicians</option>
                  <option value="Industry Delegates">Industry Delegates</option>
                  <option value="Participants only">Participants Only</option>
                </select>
              </div>

              <div>
                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                >
                  <option value="All">All Payment Statuses</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Delegate Name</th>
                    <th className="py-3.5 px-4">Category &amp; Mode</th>
                    <th className="py-3.5 px-4">Fee &amp; Currency</th>
                    <th className="py-3.5 px-4">Paper ID</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No registration records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedRegistration(reg)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-[#7cb305] transition-colors">
                            {reg.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{reg.email}</span>
                            <span>•</span>
                            <span>{reg.institution}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-semibold text-slate-800">{reg.category}</div>
                          <div className="text-[11px] text-slate-500">{reg.mode}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                          {reg.amount} ({reg.currency})
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {reg.paperId ? (
                            <span className="font-bold text-[#7cb305] bg-[#7cb305]/10 px-2 py-0.5 rounded border border-[#7cb305]/20">
                              {reg.paperId}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
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
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRegistration(reg);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#7cb305] hover:text-white text-slate-700 text-[11px] font-bold transition-all border border-slate-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, author, ID..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={subTrackFilter}
                  onChange={(e) => setSubTrackFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                >
                  <option value="All">All Conference Tracks</option>
                  <option value="Artificial Intelligence and Machine Learning">AI &amp; Machine Learning</option>
                  <option value="Quantum Computing and Quantum Intelligence">Quantum Computing</option>
                  <option value="Cyber-Physical Systems and IoT">IoT &amp; Cyber-Physical Systems</option>
                </select>
              </div>

              <div>
                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-[#7cb305] focus:bg-white"
                >
                  <option value="All">All Review Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* List Cards */}
            <div className="space-y-3">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                  No manuscript submissions match your filter criteria.
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-[#7cb305] shadow-xs transition-all cursor-pointer group text-left"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7cb305] bg-[#7cb305]/10 px-2 py-0.5 rounded-md border border-[#7cb305]/20">
                            {sub.submissionId}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{sub.track}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7cb305] transition-colors">
                          {sub.paperTitle}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#7cb305] hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200"
                      >
                        Full Submission Details
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 italic line-clamp-2">
                      &ldquo;{sub.abstract}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-800">{sub.authorName}</span>
                        <span>{sub.email}</span>
                        <span>{sub.institution}</span>
                      </div>

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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- DELEGATE REGISTRATION DETAILS MODAL WITH ELEVATED BORDER & DOCUMENT VIEWER --- */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with Soft Blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRegistration(null)}
          />

          {/* Modal Container with Gradient Accent Top Border & Shadow Ring */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-slate-200/90 ring-1 ring-slate-900/5 my-8 overflow-hidden text-left">
            {/* Top Gradient Accent Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#7cb305] via-emerald-500 to-sky-500" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedRegistration(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 font-mono text-xs font-bold border border-sky-200">
                    {selectedRegistration.id}
                  </span>
                  <span className="text-xs text-slate-400">Registered on {new Date(selectedRegistration.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">{selectedRegistration.name}</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7cb305]/10 text-[#7cb305] border border-[#7cb305]/20 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{selectedRegistration.category}</span>
                </div>
              </div>

              {/* Submitted Form Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" /> Registered Email Address
                  </span>
                  <div className="font-bold text-slate-900">{selectedRegistration.email}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number
                  </span>
                  <div className="font-bold text-slate-900">{selectedRegistration.phone || 'Not Provided'}</div>
                </div>

                <div className="space-y-0.5 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-600" /> Institution / University / Organization
                  </span>
                  <div className="font-bold text-slate-900">{selectedRegistration.institution}</div>
                </div>
              </div>

              {/* Fee & Participation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4.5 rounded-2xl bg-sky-50/30 border border-sky-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Participation Mode:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedRegistration.mode}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Payable Amount &amp; Currency:</span>
                  <div className="font-extrabold text-sky-700 text-base mt-0.5">
                    {selectedRegistration.amount} ({selectedRegistration.currency})
                  </div>
                </div>
              </div>

              {/* Associated Document / Paper Viewer Section */}
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 space-y-3 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#7cb305]" /> Associated Manuscript / Research Paper
                  </span>
                  {selectedRegistration.paperId && (
                    <span className="font-mono text-xs font-bold text-[#7cb305] bg-[#7cb305]/10 px-2.5 py-0.5 rounded-md border border-[#7cb305]/20">
                      {selectedRegistration.paperId}
                    </span>
                  )}
                </div>

                {selectedRegistration.paperId ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {getAssociatedSubmission(selectedRegistration.paperId)?.paperTitle || 'Manuscript Document Available'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Track: {getAssociatedSubmission(selectedRegistration.paperId)?.track || 'Conference Technical Track'}
                      </div>
                    </div>

                    <a
                      href={getAssociatedSubmission(selectedRegistration.paperId)?.fileUrl || '/sample-manuscript.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open &amp; Review PDF Document</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center italic">
                    No Paper ID attached. Registered as Listener / Non-Author Delegate.
                  </div>
                )}
              </div>

              {/* Quick Status Updater */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                <span className="text-xs font-bold text-slate-700 block">Update Payment Verification Status</span>
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

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white cursor-pointer shadow-xs"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PAPER SUBMISSION DETAILS MODAL WITH ELEVATED BORDER & DIRECT DOCUMENT OPEN --- */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedSubmission(null)}
          />

          {/* Modal Container with Gradient Top Bar & Ring Border */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-slate-200/90 ring-1 ring-slate-900/5 my-8 overflow-hidden text-left">
            <div className="h-2 w-full bg-gradient-to-r from-[#7cb305] via-emerald-500 to-sky-500" />

            <div className="p-6 sm:p-8 space-y-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#7cb305]/10 text-[#7cb305] font-mono text-xs font-bold border border-[#7cb305]/20">
                    {selectedSubmission.submissionId}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{selectedSubmission.track}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{selectedSubmission.paperTitle}</h3>
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7cb305]" /> Corresponding Author
                  </span>
                  <div className="font-bold text-slate-900">{selectedSubmission.authorName}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" /> Author Email
                  </span>
                  <div className="font-bold text-slate-900">{selectedSubmission.email}</div>
                </div>

                <div className="space-y-0.5 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-600" /> Institution / University
                  </span>
                  <div className="font-bold text-slate-900">{selectedSubmission.institution}</div>
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Submitted Manuscript Abstract</span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto italic">
                  &ldquo;{selectedSubmission.abstract}&rdquo;
                </div>
              </div>

              {/* Direct Document Open Button & Review Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <a
                  href={selectedSubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open &amp; View Manuscript PDF</span>
                </a>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Review Status:</span>
                  <select
                    value={selectedSubmission.reviewStatus}
                    onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                    className="bg-white border border-slate-300 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#7cb305]"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer shadow-xs"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
