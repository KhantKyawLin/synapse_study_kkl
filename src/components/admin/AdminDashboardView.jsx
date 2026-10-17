import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { sendApprovalEmail, sendRejectionEmail, openMailClient } from '../../lib/emailService';
import { 
  ShieldCheck, Users, Clock, CheckCircle2, XCircle, Search, 
  RefreshCw, Mail, Check, X, AlertCircle, Loader2, Award, Calendar, ExternalLink,
  RotateCcw, Trash2
} from 'lucide-react';

export default function AdminDashboardView() {
  const { user, isAdmin, refreshPendingCount } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [toastMsg, setToastMsg] = useState(null);

  // Certificate Recovery States
  const [activeAdminTab, setActiveAdminTab] = useState('students'); // 'students' | 'certificates'
  const [deletedAttempts, setDeletedAttempts] = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletedSearchQuery, setDeletedSearchQuery] = useState('');

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

  const fetchDeletedAttempts = useCallback(async () => {
    if (!supabase) return;
    try {
      setDeletedLoading(true);
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('is_deleted', true)
        .order('completed_at', { ascending: false });

      if (error) {
        console.warn('quiz_attempts soft-delete query note:', error.message);
        return;
      }
      setDeletedAttempts(data || []);
    } catch (err) {
      console.error('Error fetching soft-deleted attempts:', err);
    } finally {
      setDeletedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProfiles();
    fetchDeletedAttempts();
  }, [fetchAllProfiles, fetchDeletedAttempts]);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRestoreAttempt = async (attempt) => {
    if (!supabase || actionLoadingId) return;
    try {
      setActionLoadingId(attempt.id);

      const { error } = await supabase
        .from('quiz_attempts')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', attempt.id);

      if (error) throw error;

      setDeletedAttempts((prev) => prev.filter((a) => a.id !== attempt.id));
      showToast(`✅ Successfully restored exam certificate for ${attempt.student_name} (${attempt.module_name})!`);
    } catch (err) {
      showToast(`Error restoring certificate: ${err.message}`, 'error');
    } finally {
      setActionLoadingId(null);
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

  const filteredDeletedAttempts = deletedAttempts.filter((a) => {
    if (!deletedSearchQuery.trim()) return true;
    const q = deletedSearchQuery.toLowerCase();
    return (
      (a.student_name || '').toLowerCase().includes(q) ||
      (a.module_name || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q)
    );
  });

  if (!isAdmin) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="p-8 bg-white dark:bg-[#161b22] border border-rose-500/30 rounded-2xl shadow-sm">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-slate-100 to-white dark:from-[#161b22] dark:to-[#0d1117] border border-slate-200 dark:border-cyanPrimary/40 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-cyanPrimary/5 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-sky-700 dark:text-cyanPrimary shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Administrator Control Center
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/30">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Review student registrations, grant account approvals, and send automated confirmation emails
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchAllProfiles();
            fetchDeletedAttempts();
          }}
          disabled={loading || deletedLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyanPrimary/50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || deletedLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Module Tabs: Student Registrations vs Certificate Recovery */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeAdminTab === 'students'
              ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/25'
              : 'bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Approvals ({profiles.length})</span>
          {pendingStudents.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">
              {pendingStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('certificates');
            fetchDeletedAttempts();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeAdminTab === 'certificates'
              ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/25'
              : 'bg-white dark:bg-[#161b22] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Certificate Recovery Hub</span>
          {deletedAttempts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {deletedAttempts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STUDENT REGISTRATIONS & APPROVALS */}
      {activeAdminTab === 'students' && (
        <>
          {/* Analytics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium block">Total Registered</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{profiles.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">All student accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-emerald-500/40 bg-emerald-500/5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Current Verified Users</span>
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1 block">{approvedStudents.length}</span>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium block mt-0.5">
              {profiles.length > 0 ? `${Math.round((approvedStudents.length / profiles.length) * 100)}% approved rate` : 'Active users'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-amber-500/40 bg-amber-500/5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-amber-700 dark:text-amber-400 text-xs font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1 block">{pendingStudents.length}</span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium block mt-0.5">Awaiting your approval</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#161b22] border border-rose-500/30 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-rose-600 dark:text-rose-400 text-xs font-medium block">Rejected Accounts</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 block">{rejectedStudents.length}</span>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block mt-0.5">Declined access</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl mb-5 shadow-sm">
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
            className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-cyanPrimary text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({profiles.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#0d1117] text-amber-700 dark:text-amber-400/80 hover:text-amber-900 dark:hover:text-amber-300'
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
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#0d1117] text-emerald-700 dark:text-emerald-400/80 hover:text-emerald-900 dark:hover:text-emerald-300'
            }`}
          >
            Approved ({approvedStudents.length})
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#0d1117] text-rose-700 dark:text-rose-400/80 hover:text-rose-900 dark:hover:text-rose-300'
            }`}
          >
            Rejected ({rejectedStudents.length})
          </button>
        </div>
      </div>

      {/* Student Profiles List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-cyanPrimary mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading student accounts...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No Student Registrations Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Student accounts will appear here for 1-click verification upon sign up.
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
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                  isPending
                    ? 'bg-gradient-to-r from-amber-50 to-white dark:from-[#1b170e] dark:to-[#161b22] border-amber-300 dark:border-amber-500/40 shadow-md shadow-amber-500/5'
                    : isRejected
                    ? 'bg-rose-50/50 dark:bg-[#161b22]/70 border-rose-300 dark:border-rose-500/30'
                    : 'bg-white dark:bg-[#161b22] border-slate-200 dark:border-slate-800 hover:border-cyanPrimary/30'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-inner">
                    {profile.avatar_url?.startsWith('data:') || profile.avatar_url?.startsWith('http') ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      '🧑‍🎓'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{profile.full_name || 'Student'}</span>
                      {isOwnerAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/40">
                          👑 Platform Admin
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Pending Review
                        </span>
                      )}
                      {isApproved && !isOwnerAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {profile.email}
                      </span>
                      {profile.updated_at && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
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
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800/80">
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(profile)}
                        disabled={isTargetLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-95 transition-all disabled:opacity-50"
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
                      title="Send Email via Gmail / Mail Client"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0d1117] border border-slate-300 dark:border-cyanPrimary/40 text-sky-700 dark:text-cyanGlow hover:bg-sky-50 dark:hover:bg-cyanPrimary/10 active:scale-95 transition-all text-xs font-semibold shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Student</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
          </div>
        </>
      )}

      {/* TAB 2: CERTIFICATE RECOVERY HUB */}
      {activeAdminTab === 'certificates' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Recovery Hub Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-[#161b22] border border-rose-500/30 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-rose-600 dark:text-rose-400 text-xs font-semibold block">
                  Soft-Deleted Records
                </span>
                <span className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 block">
                  {deletedAttempts.length}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Archived quiz attempts
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#161b22] border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold block">
                  Passed Certificates
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1 block">
                  {deletedAttempts.filter((a) => (a.percentage || 0) >= 60).length}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium block mt-0.5">
                  Eligible for verified restore (≥60%)
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium block">
                  Instant Restoration
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                  1-Click Restore
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Instantly returns to student hub
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyanPrimary/10 border border-cyanPrimary/30 flex items-center justify-center text-sky-700 dark:text-cyanGlow">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search deleted records by student name, module, or category..."
                value={deletedSearchQuery}
                onChange={(e) => setDeletedSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyanPrimary"
              />
            </div>
          </div>

          {/* Deleted Records List */}
          <div className="space-y-3">
            {deletedLoading ? (
              <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-cyanPrimary mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Scanning for soft-deleted records...</p>
              </div>
            ) : filteredDeletedAttempts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300">
                  {deletedSearchQuery ? 'No Matching Deleted Records Found' : 'No Soft-Deleted Certificates'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {deletedSearchQuery 
                    ? 'Try adjusting your search query.' 
                    : 'All student certificates and quiz attempt records are active in their respective accounts.'}
                </p>
              </div>
            ) : (
              filteredDeletedAttempts.map((attempt) => {
                const isPassed = (attempt.percentage || 0) >= 60;
                const isActionLoading = actionLoadingId === attempt.id;

                return (
                  <div
                    key={attempt.id}
                    className="p-4 rounded-2xl border border-rose-300/60 dark:border-rose-500/30 bg-rose-50/40 dark:bg-[#161b22] hover:border-cyanPrimary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                          isPassed
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {attempt.percentage}%
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {attempt.module_name}
                          </span>
                          {attempt.category && attempt.category !== 'All' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyanPrimary/10 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/20">
                              {attempt.category}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            Soft-Deleted
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Student: {attempt.student_name}
                          </span>
                          <span className="text-slate-400">
                            Score: {attempt.score} / {attempt.total_questions} Correct
                          </span>
                          {attempt.completed_at && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar className="w-3 h-3" />
                              Completed: {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                          {attempt.deleted_at && (
                            <span className="text-[11px] text-rose-500/90 dark:text-rose-400 font-medium">
                              Deleted: {new Date(attempt.deleted_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Restore Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleRestoreAttempt(attempt)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Restore Certificate</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
