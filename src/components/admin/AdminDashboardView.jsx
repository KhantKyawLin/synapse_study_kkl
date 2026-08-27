import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { sendApprovalEmail, sendRejectionEmail, openMailClient } from '../../lib/emailService';
import { 
  ShieldCheck, Users, Clock, CheckCircle2, XCircle, Search, 
  RefreshCw, Mail, Check, X, AlertCircle, Loader2, Award, Calendar, 
  ExternalLink, UserPlus, Copy, Terminal, ChevronDown, ChevronUp 
} from 'lucide-react';

const SQL_SETUP_SCRIPT = `-- 1. Ensure status and role columns exist on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop any restrictive old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow full access" ON public.profiles;

-- 4. Allow full access so Admin can view and approve all student registrations
CREATE POLICY "Allow full access" ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Guarantee Khant Kyaw Lin is set as approved admin
UPDATE public.profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'khantkyawlinn.kkl@gmail.com';`;

export default function AdminDashboardView() {
  const { user, isAdmin, refreshPendingCount } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [toastMsg, setToastMsg] = useState(null);

  // Quick Approve by Email Input
  const [quickEmail, setQuickEmail] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchAllProfiles = useCallback(async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      refreshPendingCount();
    } catch (err) {
      console.error('Error loading profiles for admin:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    fetchAllProfiles();
  }, [fetchAllProfiles]);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Quick Approve / Add Student by Email Directly
  const handleQuickApprove = async (e) => {
    e.preventDefault();
    if (!quickEmail.trim() || !supabase) return;

    try {
      setQuickLoading(true);
      const targetEmail = quickEmail.trim().toLowerCase();
      const targetName = quickName.trim() || targetEmail.split('@')[0];

      // Update or Upsert in profiles table
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', targetEmail)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('profiles')
          .update({
            full_name: targetName,
            status: 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('profiles').insert([
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined,
            email: targetEmail,
            full_name: targetName,
            status: 'approved',
            role: 'student',
            avatar_url: 'student_freshman',
            avatar_frame: 'frame_bronze',
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      // Send automated approval email
      await sendApprovalEmail({
        studentName: targetName,
        studentEmail: targetEmail,
      });

      showToast(`✅ Approved ${targetEmail} & sent confirmation email!`);
      setQuickEmail('');
      setQuickName('');
      fetchAllProfiles();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setQuickLoading(false);
    }
  };

  // Handle Approve from List
  const handleApprove = async (profile) => {
    if (!supabase || actionLoadingId) return;
    try {
      setActionLoadingId(profile.id);

      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      // Send automated approval email
      await sendApprovalEmail({
        studentName: profile.full_name || 'Student',
        studentEmail: profile.email,
      });

      // Update state locally
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, status: 'approved' } : p))
      );

      refreshPendingCount();
      showToast(`✅ Approved ${profile.full_name || profile.email} & sent confirmation email!`);
    } catch (err) {
      showToast(`Error approving user: ${err.message}`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject
  const handleReject = async (profile) => {
    if (!supabase || actionLoadingId) return;
    try {
      setActionLoadingId(profile.id);

      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      // Send automated rejection email
      await sendRejectionEmail({
        studentName: profile.full_name || 'Student',
        studentEmail: profile.email,
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, status: 'rejected' } : p))
      );

      refreshPendingCount();
      showToast(`❌ Rejected ${profile.full_name || profile.email} & sent notification.`, 'info');
    } catch (err) {
      showToast(`Error rejecting user: ${err.message}`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics computation
  const pendingStudents = profiles.filter((p) => p.status === 'pending');
  const approvedStudents = profiles.filter((p) => p.status === 'approved' || p.role === 'admin');
  const rejectedStudents = profiles.filter((p) => p.status === 'rejected');

  // Filter & Search
  const filteredProfiles = profiles.filter((p) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? p.status === 'pending'
        : statusFilter === 'approved'
        ? p.status === 'approved' || p.role === 'admin'
        : p.status === 'rejected';

    const matchesSearch =
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="p-8 bg-[#161b22] border border-rose-500/30 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-400">
            This dashboard is reserved for the platform administrator (Khant Kyaw Lin).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-bold shadow-2xl animate-slideUp ${
          toastMsg.type === 'error'
            ? 'bg-rose-950/90 border-rose-500 text-rose-200'
            : toastMsg.type === 'info'
            ? 'bg-amber-950/90 border-amber-500 text-amber-200'
            : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
        }`}>
          {toastMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-cyanPrimary/40 rounded-2xl shadow-xl shadow-cyanPrimary/5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Administrator Control Center
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyanPrimary/20 text-cyanGlow border border-cyanPrimary/30">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review student registrations, grant account approvals, and send automated confirmation emails
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllProfiles}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0d1117] border border-slate-700 text-slate-300 hover:text-white hover:border-cyanPrimary/50 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 bg-[#161b22] border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-medium block">Total Registered</span>
            <span className="text-2xl font-black text-white mt-1 block">{profiles.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">All student accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#161b22] border border-emerald-500/40 bg-emerald-500/5 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/5">
          <div>
            <span className="text-emerald-400 text-xs font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Current Verified Users</span>
            </span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">{approvedStudents.length}</span>
            <span className="text-[10px] text-emerald-400/80 font-medium block mt-0.5">
              {profiles.length > 0 ? `${Math.round((approvedStudents.length / profiles.length) * 100)}% approved rate` : 'Active users'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#161b22] border border-amber-500/40 bg-amber-500/5 rounded-xl flex items-center justify-between shadow-lg shadow-amber-500/5">
          <div>
            <span className="text-amber-400 text-xs font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">{pendingStudents.length}</span>
            <span className="text-[10px] text-amber-400/80 font-medium block mt-0.5">Awaiting your approval</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#161b22] border border-rose-500/30 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-rose-400 text-xs font-medium block">Rejected Accounts</span>
            <span className="text-2xl font-black text-rose-300 mt-1 block">{rejectedStudents.length}</span>
            <span className="text-[10px] text-rose-400/70 block mt-0.5">Declined access</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Direct Quick Approve by Email Box */}
      <div className="p-4 sm:p-5 bg-[#161b22] border border-cyanPrimary/30 rounded-2xl mb-6 shadow-lg shadow-cyanPrimary/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-cyanPrimary" />
          <span>Quick Approve / Register Student by Email</span>
        </h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Approve any student email directly (e.g. <span className="text-cyanGlow font-mono">helium.7498@gmail.com</span>) and immediately dispatch their approval notification.
        </p>

        <form onSubmit={handleQuickApprove} className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="email"
            required
            placeholder="Student email (e.g. helium.7498@gmail.com)"
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
            className="flex-1 w-full bg-[#0d1117] border border-slate-700 text-white text-xs font-medium rounded-xl px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />

          <input
            type="text"
            placeholder="Student Full Name (optional)"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            className="w-full sm:w-56 bg-[#0d1117] border border-slate-700 text-white text-xs font-medium rounded-xl px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />

          <button
            type="submit"
            disabled={quickLoading || !quickEmail.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {quickLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Direct Approve & Notify</span>
          </button>
        </form>
      </div>

      {/* Supabase RLS Permission Fix Accordion */}
      <div className="mb-6 bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowSqlGuide(!showSqlGuide)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyanPrimary" />
            <span>Supabase RLS Permissions Setup (Run Once in Supabase SQL Editor)</span>
          </div>
          {showSqlGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSqlGuide && (
          <div className="p-4 border-t border-slate-800 bg-[#0a0d12] animate-fadeIn">
            <p className="text-[11px] text-slate-400 mb-2">
              If registered users aren't showing in your list automatically, run this SQL script in your{' '}
              <a 
                href="https://supabase.com/dashboard/project/rfecpnaxoaetnjslccsb/sql" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyanGlow font-bold underline"
              >
                Supabase SQL Editor
              </a>{' '}
              to grant your admin account full visibility:
            </p>

            <div className="relative bg-[#161b22] border border-slate-800 rounded-xl p-3 mb-2 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <pre>{SQL_SETUP_SCRIPT}</pre>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-cyanGlow hover:bg-slate-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? 'Copied SQL Script!' : 'Copy SQL Script'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-[#161b22] border border-slate-800 rounded-2xl mb-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search student by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-700 text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-cyanPrimary text-white shadow-md'
                : 'bg-[#0d1117] text-slate-400 hover:text-white'
            }`}
          >
            All ({profiles.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-[#0d1117] text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-black">
              {pendingStudents.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'approved'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-[#0d1117] text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Approved ({approvedStudents.length})
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'rejected'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-[#0d1117] text-rose-400/80 hover:text-rose-300'
            }`}
          >
            Rejected ({rejectedStudents.length})
          </button>
        </div>
      </div>

      {/* Student Profiles List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 bg-[#161b22] border border-slate-800 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-cyanPrimary mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading student accounts...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16 bg-[#161b22] border border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No Student Registrations Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Use the <strong>"Quick Approve by Email"</strong> box above to approve accounts directly, or run the SQL setup script in your Supabase SQL Editor.
            </p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isPending = profile.status === 'pending';
            const isApproved = profile.status === 'approved' || profile.role === 'admin';
            const isRejected = profile.status === 'rejected';
            const isTargetLoading = actionLoadingId === profile.id;
            const isOwnerAdmin = profile.email?.toLowerCase() === 'khantkyawlinn.kkl@gmail.com';

            return (
              <div
                key={profile.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? 'bg-gradient-to-r from-[#1b170e] to-[#161b22] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isRejected
                    ? 'bg-[#161b22]/70 border-rose-500/30'
                    : 'bg-[#161b22] border-slate-800 hover:border-cyanPrimary/30'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-inner">
                    {profile.avatar_url?.startsWith('data:') || profile.avatar_url?.startsWith('http') ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      '🧑‍🎓'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{profile.full_name || 'Student'}</span>
                      {isOwnerAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyanPrimary/20 text-cyanGlow border border-cyanPrimary/40">
                          👑 Platform Admin
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Pending Review
                        </span>
                      )}
                      {isApproved && !isOwnerAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {profile.email}
                      </span>
                      {profile.updated_at && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(profile.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isOwnerAdmin && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(profile)}
                        disabled={isTargetLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isTargetLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Send Email</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        onClick={() => handleReject(profile)}
                        disabled={isTargetLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0d1117] border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isTargetLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Reject</span>
                      </button>
                    )}

                    {/* 1-Click Launch Email Client */}
                    <button
                      onClick={() => openMailClient({ studentEmail: profile.email, studentName: profile.full_name, type: isApproved ? 'approval' : 'rejection' })}
                      title="Open in Gmail/Mail client"
                      className="p-2 rounded-xl bg-[#0d1117] border border-slate-700 text-slate-400 hover:text-cyanGlow hover:border-cyanPrimary/50 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
