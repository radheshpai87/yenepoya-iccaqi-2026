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
  Settings,
  MoreVertical,
  Download,
  Filter
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
  const [searchQuery, setSearchQuery] = useState('');
  const [regCategoryFilter, setRegCategoryFilter] = useState('All');
  const [regStatusFilter, setRegStatusFilter] = useState('All');
  const [subTrackFilter, setSubTrackFilter] = useState('All');
  const [subStatusFilter, setSubStatusFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

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

  // Helper to extract initials for avatar badge
  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filtered registrations
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

  // Filtered submissions
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

  // Render Login Modal if not authenticated
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1e5bb8]" />
          <span>Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200/90 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3.5 rounded-2xl bg-[#1e5bb8]/10 text-[#1e5bb8] border border-[#1e5bb8]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e5bb8]">
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
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#1e5bb8] focus:bg-white transition-all"
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
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold bg-[#1e5bb8] hover:bg-[#164996] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 font-sans flex">
      
      {/* ========================================================= */}
      {/* 1. MOUSE-ACTIVATED HOVER COLLAPSIBLE SIDEBAR (LEFT)       */}
      {/* ========================================================= */}
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-16 hover:w-60 bg-[#1e5bb8] text-white transition-all duration-300 ease-in-out flex flex-col justify-between shadow-2xl group overflow-hidden">
        {/* Top Logo Badge */}
        <div>
          <div className="h-16 px-4 flex items-center gap-3 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white text-[#1e5bb8] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
              Y
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              <span className="font-extrabold text-sm tracking-wide block">ICCAQI 2026</span>
              <span className="text-[10px] text-blue-200 block font-mono">YENEPOYA PORTAL</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-200 opacity-0 group-hover:opacity-100 ml-auto transition-opacity shrink-0" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                Delegate Registrations
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                Paper Submissions
              </span>
            </button>

            <div className="h-[1px] bg-white/10 my-2" />

            <button
              onClick={() => {
                setActiveTab('registrations');
                setRegStatusFilter('Verified');
              }}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                Verified Payments
              </span>
            </button>

            <button
              onClick={exportRegistrationsCSV}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 shrink-0 text-amber-300" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                Export Reports (CSV)
              </span>
            </button>

            <button
              onClick={() => alert('Yenepoya ICCAQI 2026 Admin System — Live Supabase Connected')}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <Settings className="w-5 h-5 shrink-0 text-blue-200" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                Portal Settings
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile & Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            title="Logout Session"
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-bold text-rose-200 hover:bg-rose-500/20 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              Logout Admin
            </span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN BODY CONTENT AREA (WITH PL-16 FOR COLLAPSED SIDEBAR) */}
      {/* ========================================================= */}
      <div className="flex-1 pl-16 min-w-0">
        
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'registrations' ? 'Delegate Registrations' : 'Paper Submissions'}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#1e5bb8] focus:bg-white transition-all"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              title="Refresh Live Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#1e5bb8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                A
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-extrabold text-slate-900 block leading-tight">Admin</span>
                <span className="text-[10px] text-slate-400 block font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY DASHBOARD */}
        <main className="p-6 space-y-6">

          {/* ========================================================= */}
          {/* 3. STAGE / CATEGORY CARDS CAROUSEL (TOP STAGE TILES)       */}
          {/* ========================================================= */}
          <div className="relative">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              
              {/* Card 1: Delegate Registrations */}
              <div
                onClick={() => setActiveTab('registrations')}
                className={`min-w-[210px] flex-1 p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'registrations'
                    ? 'bg-[#eef4ff] border-2 border-[#1e5bb8] shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
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
                    ? 'bg-[#eef4ff] border-2 border-[#1e5bb8] shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
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
                className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
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
                className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">Pending Actions</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Awaiting : {pendingCount}</div>
              </div>

              {/* Card 5: Technical Tracks */}
              <div className="min-w-[210px] flex-1 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    8 Tracks
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">Conference Tracks</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Active Track Domains</div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. TITLE & FILTER CONTROLS BAR                            */}
          {/* ========================================================= */}
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
                    className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1e5bb8] shadow-xs"
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
                    className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1e5bb8] shadow-xs"
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
                    className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1e5bb8] shadow-xs"
                  >
                    <option value="All">All Conference Tracks</option>
                    <option value="Artificial Intelligence and Machine Learning">AI &amp; Machine Learning</option>
                    <option value="Quantum Computing and Quantum Intelligence">Quantum Computing</option>
                    <option value="Cyber-Physical Systems and IoT">IoT &amp; Cyber-Physical Systems</option>
                  </select>

                  <select
                    value={subStatusFilter}
                    onChange={(e) => setSubStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1e5bb8] shadow-xs"
                  >
                    <option value="All">All Review Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. DATA TABLE SECTION (MATCHING REFERENCE UI)             */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === 'registrations' ? (
                /* REGISTRATIONS TABLE */
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#dbe7f6] text-[#1e5bb8] uppercase tracking-wider text-[11px] font-extrabold border-b border-blue-200">
                    <tr>
                      <th className="py-3.5 px-4">Delegate Name</th>
                      <th className="py-3.5 px-4">Category &amp; Mode</th>
                      <th className="py-3.5 px-4">Fee &amp; Currency</th>
                      <th className="py-3.5 px-4">Paper ID</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Recent Activity</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No registration records match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.slice(0, itemsPerPage).map((reg) => (
                        <tr
                          key={reg.id}
                          onClick={() => setSelectedRegistration(reg)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Name + Initial Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1e5bb8]/10 text-[#1e5bb8] font-bold text-xs flex items-center justify-center shrink-0">
                                {getInitials(reg.name)}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <div className="font-bold text-slate-900 text-xs group-hover:text-[#1e5bb8] transition-colors truncate max-w-[200px]">
                                  {reg.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                  {reg.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category & Mode */}
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="font-semibold text-slate-800">{reg.category}</div>
                            <div className="text-[11px] text-slate-500">{reg.mode}</div>
                          </td>

                          {/* Fee */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1e5bb8]">
                            {reg.amount} ({reg.currency})
                          </td>

                          {/* Paper ID */}
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {reg.paperId ? (
                              <span className="font-bold text-[#1e5bb8] bg-[#1e5bb8]/10 px-2 py-0.5 rounded border border-[#1e5bb8]/20">
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

                          {/* Date */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                            {new Date(reg.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRegistration(reg);
                              }}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#1e5bb8] hover:text-white text-slate-700 text-[11px] font-bold transition-all border border-slate-200"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                /* PAPER SUBMISSIONS TABLE */
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#dbe7f6] text-[#1e5bb8] uppercase tracking-wider text-[11px] font-extrabold border-b border-blue-200">
                    <tr>
                      <th className="py-3.5 px-4">Author &amp; Paper Title</th>
                      <th className="py-3.5 px-4">Submission ID</th>
                      <th className="py-3.5 px-4">Track Domain</th>
                      <th className="py-3.5 px-4">Review Status</th>
                      <th className="py-3.5 px-4">Submitted Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No manuscript submissions match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.slice(0, itemsPerPage).map((sub) => (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubmission(sub)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Title & Author */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {getInitials(sub.authorName)}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <div className="font-bold text-slate-900 text-xs group-hover:text-[#1e5bb8] transition-colors truncate max-w-[280px]">
                                  {sub.paperTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                                  {sub.authorName} • {sub.institution}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Submission ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1e5bb8]">
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

                          {/* Date */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                            {new Date(sub.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> PDF
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubmission(sub);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1e5bb8] hover:text-white text-slate-700 text-[11px] font-bold transition-all border border-slate-200"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* ========================================================= */}
            {/* 6. PAGINATION & ROWS CONTROL BAR                           */}
            {/* ========================================================= */}
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
                  <span className="px-2.5 py-1 rounded-lg bg-[#1e5bb8] text-white font-bold text-xs">
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

      {/* ========================================================= */}
      {/* 7. DELEGATE REGISTRATION DETAILS MODAL                     */}
      {/* ========================================================= */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRegistration(null)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-slate-200/90 ring-1 ring-slate-900/5 my-8 overflow-hidden text-left">
            <div className="h-2 w-full bg-gradient-to-r from-[#1e5bb8] via-emerald-500 to-sky-500" />

            <div className="p-6 sm:p-8 space-y-6">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 font-mono text-xs font-bold border border-sky-200">
                    {selectedRegistration.id}
                  </span>
                  <span className="text-xs text-slate-400">Registered on {new Date(selectedRegistration.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">{selectedRegistration.name}</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e5bb8]/10 text-[#1e5bb8] border border-[#1e5bb8]/20 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{selectedRegistration.category}</span>
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4.5 rounded-2xl bg-sky-50/30 border border-sky-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Participation Mode:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedRegistration.mode}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Payable Amount &amp; Currency:</span>
                  <div className="font-extrabold text-[#1e5bb8] text-base mt-0.5">
                    {selectedRegistration.amount} ({selectedRegistration.currency})
                  </div>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 space-y-3 ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#1e5bb8]" /> Associated Manuscript / Research Paper
                  </span>
                  {selectedRegistration.paperId && (
                    <span className="font-mono text-xs font-bold text-[#1e5bb8] bg-[#1e5bb8]/10 px-2.5 py-0.5 rounded-md border border-[#1e5bb8]/20">
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e5bb8] hover:bg-[#164996] text-white text-xs font-bold transition-all shadow-xs shrink-0"
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1e5bb8] hover:bg-[#164996] text-white cursor-pointer shadow-xs"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. PAPER SUBMISSION DETAILS MODAL                          */}
      {/* ========================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-slate-200/90 ring-1 ring-slate-900/5 my-8 overflow-hidden text-left">
            <div className="h-2 w-full bg-gradient-to-r from-[#1e5bb8] via-emerald-500 to-sky-500" />

            <div className="p-6 sm:p-8 space-y-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1e5bb8]/10 text-[#1e5bb8] font-mono text-xs font-bold border border-[#1e5bb8]/20">
                    {selectedSubmission.submissionId}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{selectedSubmission.track}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{selectedSubmission.paperTitle}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1e5bb8]" /> Corresponding Author
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

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Submitted Manuscript Abstract</span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto italic">
                  &ldquo;{selectedSubmission.abstract}&rdquo;
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <a
                  href={selectedSubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#1e5bb8] hover:bg-[#164996] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open &amp; View Manuscript PDF</span>
                </a>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Review Status:</span>
                  <select
                    value={selectedSubmission.reviewStatus}
                    onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                    className="bg-white border border-slate-300 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#1e5bb8]"
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
