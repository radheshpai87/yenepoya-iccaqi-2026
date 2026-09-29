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
  ExternalLink
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
  fileUrl: string;
  reviewStatus: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'registrations' | 'submissions' | 'system'>('registrations');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
      'Name',
      'Email',
      'Phone',
      'Institution',
      'Category',
      'Currency',
      'Amount',
      'Mode',
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#7cb305]" />
          <span className="text-sm font-semibold tracking-wide">Verifying Secure Admin Authorization...</span>
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
                <ShieldCheck className="w-3.5 h-3.5" />
                Backend Control Portal
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                ICCAQI 2026 Admin Login
              </h2>
              <p className="text-xs text-slate-400">
                Server-side protected access to registrations &amp; manuscript database
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
                Admin Access Key *
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
                  <span>Verifying Server Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate &amp; Open Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 border-t border-slate-800/80">
            <Lock className="w-3 h-3 text-[#7cb305]" />
            <span>Encrypted Server HMAC Session • No Client Credentials Leaked</span>
          </div>
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
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl flex items-center gap-2 shadow-xs">
            <img
              src="/yenepoya-university-logonew3.svg"
              alt="Yenepoya Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-none">ICCAQI 2026 Admin Portal</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Yenepoya School of Engineering &amp; Technology</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server Session Active</span>
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Live Data"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Registrations</span>
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalRegistrations}</div>
            <p className="text-[11px] text-slate-400">{verifiedCount} Verified • {pendingCount} Pending</p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Paper Submissions</span>
              <FileText className="w-5 h-5 text-[#7cb305]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalSubmissions}</div>
            <p className="text-[11px] text-slate-400">Across 8 Conference Tracks</p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Verified Payments</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{verifiedCount}</div>
            <p className="text-[11px] text-slate-400">Payment receipts confirmed</p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingCount}</div>
            <p className="text-[11px] text-slate-400">Awaiting payment token verification</p>
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

            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-[#7cb305] text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>System &amp; Security</span>
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
                    <th className="py-3.5 px-4 text-right">Actions</th>
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
                      <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-white text-sm">{reg.name}</div>
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
                          <select
                            value={reg.paymentStatus}
                            onChange={(e) => updateRegistrationStatus(reg.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-hidden focus:border-[#7cb305]"
                          >
                            <option value="Pending">Mark Pending</option>
                            <option value="Verified">Mark Verified</option>
                            <option value="Cancelled">Mark Cancelled</option>
                          </select>
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
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7cb305] bg-[#7cb305]/10 px-2 py-0.5 rounded-md border border-[#7cb305]/20">
                            {sub.submissionId}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{sub.track}</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{sub.paperTitle}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={sub.reviewStatus}
                          onChange={(e) => updateSubmissionStatus(sub.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#7cb305]"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-850 italic">
                      &ldquo;{sub.abstract}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-200">{sub.authorName}</span>
                        <span>{sub.email}</span>
                        <span>{sub.institution}</span>
                      </div>

                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#7cb305] font-bold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Manuscript PDF</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM & SECURITY */}
        {activeTab === 'system' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7cb305]" />
                Server Security &amp; Authentication Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero-leak backend security verification running on Next.js server runtime
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-500 font-mono">AUTH_STRATEGY</span>
                <div className="text-sm font-bold text-white">Constant-Time Server Crypto (`timingSafeEqual`)</div>
                <p className="text-[11px] text-slate-400">
                  Prevents side-channel timing attacks by checking input byte-by-byte in fixed time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-500 font-mono">SESSION_STORAGE</span>
                <div className="text-sm font-bold text-white">HTTP-Only SameSite Signed Cookie</div>
                <p className="text-[11px] text-slate-400">
                  Cookie is inaccessible to JavaScript (XSS safe) and signed with HMAC SHA-256 secret.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-300 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Custom Password Configuration</span>
              </div>
              <p className="text-slate-300">
                To change the admin password, set `ADMIN_PASSWORD` in your Cloudflare Pages / Vercel Environment Variables or inside `.env.local`:
              </p>
              <pre className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-sky-400 border border-slate-800">
                ADMIN_PASSWORD=your_new_strong_password_here
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
