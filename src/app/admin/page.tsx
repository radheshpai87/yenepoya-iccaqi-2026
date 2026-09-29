'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Users,
  FileText,
  CreditCard,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  FileSpreadsheet,
  Layers,
  Filter,
  Check,
  XCircle,
  ExternalLink,
  X,
  UserCheck,
  Tag,
  Globe,
  FileCheck,
  User
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
  paperTitle: string;
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

export default function AdminPage() {
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

  // Check auth session on load
  useEffect(() => {
    checkSession();
  }, []);

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
        setLoginError(data.error || 'Authentication failed. Please check the password.');
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
      console.error('Error updating status:', err);
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
      'ID',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Institution / Organization',
      'Category',
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#7cb305]" />
          <span className="text-sm font-semibold tracking-wide">Authenticating Admin Access...</span>
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED: LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7cb305]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          {/* Institution Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center gap-3 bg-white/95 p-3 rounded-2xl border border-slate-200">
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

            <div className="space-y-1 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7cb305]/15 border border-[#7cb305]/30 text-[#7cb305] text-[11px] font-bold uppercase tracking-widest">
                <UserCheck className="w-3.5 h-3.5" />
                Delegate Administration Portal
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                ICCAQI 2026 Admin Login
              </h2>
              <p className="text-xs text-slate-400">
                Server-authenticated database management portal
              </p>
            </div>
          </div>

          {/* Login Error Alert */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Password *
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
                  placeholder="Enter administrator password..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 rounded-xl border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#7cb305] focus:ring-1 focus:ring-[#7cb305] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#7cb305] hover:bg-[#689803] text-white shadow-lg shadow-[#7cb305]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Server Password...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Authenticate &amp; Open Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED: DASHBOARD VIEW ---
  const totalRegistrations = registrations.length;
  const totalSubmissions = submissions.length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'Verified').length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Header - Cleaned up without status badges */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl flex items-center gap-2 shadow-xs">
            <img
              src="/yenepoya-university-logonew3.svg"
              alt="Yenepoya Logo"
              className="h-6 w-auto object-contain"
            />
            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />
            <img
              src="/yenepoya-school-engineering-and-technologynew-02.svg"
              alt="Yenepoya SET Logo"
              className="h-6 w-auto object-contain hidden sm:block"
            />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-none">ICCAQI 2026 Admin Portal</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Yenepoya (Deemed to be University)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh Live Data"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Registrations</span>
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalRegistrations}</div>
            <p className="text-[11px] text-slate-400">{verifiedCount} Verified • {pendingCount} Pending</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Paper Submissions</span>
              <FileText className="w-5 h-5 text-[#7cb305]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalSubmissions}</div>
            <p className="text-[11px] text-slate-400">Across 8 Conference Tracks</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Verified Payments</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{verifiedCount}</div>
            <p className="text-[11px] text-slate-400">Payment receipts confirmed</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingCount}</div>
            <p className="text-[11px] text-slate-400">Awaiting payment verification</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 gap-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'registrations'
                  ? 'bg-[#7cb305] text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Delegate Registrations ({registrations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-[#7cb305] text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paper Submissions ({submissions.length})</span>
            </button>
          </div>

          {activeTab === 'registrations' && (
            <button
              onClick={exportRegistrationsCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, email, institution..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#7cb305]"
                />
              </div>

              <div>
                <select
                  value={regCategoryFilter}
                  onChange={(e) => setRegCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-[#7cb305]"
                >
                  <option value="All">All Categories</option>
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
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-[#7cb305]"
                >
                  <option value="All">All Payment Statuses</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Delegate Name</th>
                    <th className="py-3.5 px-4">Category &amp; Mode</th>
                    <th className="py-3.5 px-4">Fee &amp; Currency</th>
                    <th className="py-3.5 px-4">Paper ID</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No registration records matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedRegistration(reg)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-white text-sm group-hover:text-[#7cb305] transition-colors">
                            {reg.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{reg.email}</span>
                            <span>•</span>
                            <span>{reg.institution}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-semibold text-slate-200">{reg.category}</div>
                          <div className="text-[11px] text-slate-400">{reg.mode}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                          {reg.amount} ({reg.currency})
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {reg.paperId || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              reg.paymentStatus === 'Verified'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {reg.paymentStatus === 'Verified' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
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
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-[#7cb305] hover:text-white text-slate-300 text-[11px] font-bold transition-all"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search title, author, ID..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#7cb305]"
                />
              </div>

              <div>
                <select
                  value={subTrackFilter}
                  onChange={(e) => setSubTrackFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-[#7cb305]"
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
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-[#7cb305]"
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
                <div className="p-8 text-center bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No manuscript submissions matching filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-[#7cb305]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7cb305] bg-[#7cb305]/10 px-2 py-0.5 rounded-md border border-[#7cb305]/20">
                            {sub.submissionId}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{sub.track}</span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#7cb305] transition-colors">
                          {sub.paperTitle}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-[#7cb305] hover:text-white text-slate-300 text-xs font-bold transition-all"
                      >
                        Full Manuscript Details
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-850 italic line-clamp-2">
                      &ldquo;{sub.abstract}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-200">{sub.authorName}</span>
                        <span>{sub.email}</span>
                        <span>{sub.institution}</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.reviewStatus === 'Accepted'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : sub.reviewStatus === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
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

      {/* --- DELEGATE REGISTRATION DETAILS MODAL --- */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRegistration(null)}
          />

          <div className="relative bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-slate-800 my-8 space-y-6 text-left">
            <button
              onClick={() => setSelectedRegistration(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-400 font-mono text-xs font-bold border border-sky-500/30">
                  {selectedRegistration.id}
                </span>
                <span className="text-xs text-slate-400">Registered on {new Date(selectedRegistration.createdAt).toLocaleString()}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{selectedRegistration.name}</h3>
              <p className="text-xs text-[#7cb305] font-semibold">{selectedRegistration.category}</p>
            </div>

            {/* Contact & Institution Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> Email Address
                </span>
                <div className="font-semibold text-slate-200">{selectedRegistration.email}</div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone
                </span>
                <div className="font-semibold text-slate-200">{selectedRegistration.phone || 'Not Provided'}</div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" /> Institution / Organization
                </span>
                <div className="font-semibold text-slate-200">{selectedRegistration.institution}</div>
              </div>
            </div>

            {/* Registration & Fee Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Participation Mode:</span>
                <div className="font-bold text-white mt-0.5">{selectedRegistration.mode}</div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Payable Fee &amp; Currency:</span>
                <div className="font-extrabold text-sky-400 text-base mt-0.5">
                  {selectedRegistration.amount} ({selectedRegistration.currency})
                </div>
              </div>

              {selectedRegistration.paperId && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-850">
                  <span className="text-slate-500 font-medium">Associated Paper ID:</span>
                  <div className="font-mono font-bold text-[#7cb305] text-sm mt-0.5">
                    {selectedRegistration.paperId}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Updater */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Update Payment Verification Status</span>
              <div className="flex gap-3">
                <button
                  onClick={() => updateRegistrationStatus(selectedRegistration.id, 'Verified')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedRegistration.paymentStatus === 'Verified'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-emerald-600/30 text-slate-300'
                  }`}
                >
                  <Check className="w-4 h-4" /> Mark Payment Verified
                </button>

                <button
                  onClick={() => updateRegistrationStatus(selectedRegistration.id, 'Pending')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedRegistration.paymentStatus === 'Pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 hover:bg-amber-600/30 text-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Set Pending
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7cb305] hover:bg-[#689803] text-white"
              >
                Close Details Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAPER SUBMISSION DETAILS MODAL --- */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="relative bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 border border-slate-800 my-8 space-y-6 text-left">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#7cb305]/15 text-[#7cb305] font-mono text-xs font-bold border border-[#7cb305]/30">
                  {selectedSubmission.submissionId}
                </span>
                <span className="text-xs text-slate-400">{selectedSubmission.track}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">{selectedSubmission.paperTitle}</h3>
            </div>

            {/* Author Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7cb305]" /> Corresponding Author
                </span>
                <div className="font-semibold text-slate-200">{selectedSubmission.authorName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> Author Email
                </span>
                <div className="font-semibold text-slate-200">{selectedSubmission.email}</div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" /> Institution / University
                </span>
                <div className="font-semibold text-slate-200">{selectedSubmission.institution}</div>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">Manuscript Abstract</span>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                {selectedSubmission.abstract}
              </div>
            </div>

            {/* Download Link & Status Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <a
                href={selectedSubmission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7cb305] hover:bg-[#689803] text-white text-xs font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open / Download Manuscript PDF</span>
              </a>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Review Status:</span>
                <select
                  value={selectedSubmission.reviewStatus}
                  onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#7cb305]"
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
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
