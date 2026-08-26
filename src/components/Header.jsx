import React, { useState } from 'react';
import { 
  Layers, LayoutDashboard, HelpCircle, User, LogOut, Cloud, 
  Sparkles, AlertTriangle, KeyRound, CheckCircle2, Loader2, Settings, ShieldCheck, Award 
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';
import { PRESTIGE_FRAMES } from './auth/AccountSettingsModal';

// Preset avatar emoji mapping
const AVATAR_EMOJIS = {
  student_freshman: '🧑‍🎓',
  student_reader: '📖',
  student_dedicated: '⚡',
  student_synapse: '🧠',
  student_clinical: '🩺',
  student_master: '👑',
  avatar_doc_m: '👨‍⚕️',
  avatar_doc_f: '👩‍⚕️',
  avatar_neuro: '🧠',
  avatar_surgeon: '🥼',
  avatar_lab: '🔬',
  avatar_pharma: '💊',
};

export default function Header({ activeView, setActiveView }) {
  const { user, signOut, openAuthModal, openAccountSettings } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const avatarKey = user?.user_metadata?.avatar_url || 'student_freshman';
  const frameKey = user?.user_metadata?.avatar_frame || 'frame_bronze';

  const activeFrame = PRESTIGE_FRAMES.find(f => f.id === frameKey) || PRESTIGE_FRAMES[0];

  const handleConfirmSignOut = async () => {
    try {
      setSignOutLoading(true);
      await signOut();
      setSignOutLoading(false);
      setSignOutSuccess(true);
      setTimeout(() => {
        setSignOutSuccess(false);
        setShowSignOutConfirm(false);
        setActiveView('flashcards');
      }, 1100);
    } catch (err) {
      console.error('Sign out error:', err);
      setSignOutLoading(false);
      setShowSignOutConfirm(false);
    }
  };

  return (
    <>
      <header className="w-full bg-[#161b22]/90 backdrop-blur-xl border-b border-sky-500/20 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Top Row / Logo Container */}
          <div className="w-full md:w-auto flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" 
              onClick={() => setActiveView('flashcards')}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-cyanPrimary/40 shadow-lg shadow-cyanPrimary/10 group-hover:border-cyanPrimary transition-all shrink-0">
                <img src={logoImg} alt="Synapse Study" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-none">
                  <span className="text-cyanPrimary">SYNAPSE</span> STUDY
                </h1>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-0.5">
                  Medical Exam Prep Platform
                </span>
              </div>
            </div>

            {/* Mobile-only Compact Auth Trigger with Active Prestige Frame */}
            <div className="flex md:hidden items-center gap-1.5">
              {user ? (
                <button
                  onClick={() => openAccountSettings('profile')}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d1117] border border-cyanPrimary/40 rounded-xl text-xs font-bold text-white shadow-sm"
                >
                  <div className={`${activeFrame.headerClass} w-6 h-6 shrink-0 flex items-center justify-center`}>
                    <span className="text-xs">
                      {avatarKey.startsWith('http') ? '📷' : (AVATAR_EMOJIS[avatarKey] || '🧑‍🎓')}
                    </span>
                  </div>
                  <span className="truncate max-w-[80px] text-[11px]">{displayName}</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-cyanPrimary text-white rounded-lg shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs & Desktop User Profile */}
          <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
            {/* Navigation Tabs */}
            <nav className="flex items-center bg-[#0d1117] p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveView('flashcards')}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeView === 'flashcards'
                    ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards</span>
              </button>

              <button
                onClick={() => setActiveView('dashboards')}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeView === 'dashboards'
                    ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboards</span>
              </button>

              <button
                onClick={() => setActiveView('quiz')}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeView === 'quiz'
                    ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>
            </nav>

            {/* Desktop User Profile Badge with Active Prestige Frame */}
            {user ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-cyanPrimary/30 hover:border-cyanPrimary/60 rounded-xl transition-all">
                <button
                  onClick={() => openAccountSettings('profile')}
                  className="flex items-center gap-2 text-left group"
                  title={`Open Account Settings (${activeFrame.title})`}
                >
                  <div className={`${activeFrame.headerClass} w-8 h-8 shrink-0 flex items-center justify-center transition-all duration-300`}>
                    <div className="w-full h-full bg-[#161b22] rounded-md overflow-hidden flex items-center justify-center text-sm">
                      {avatarKey.startsWith('http') ? (
                        <img src={avatarKey} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{AVATAR_EMOJIS[avatarKey] || '🧑‍🎓'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[110px] group-hover:text-cyanGlow transition-colors">
                      {displayName}
                    </span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium leading-none">
                      <Cloud className="w-2.5 h-2.5" /> Synced
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-1.5">
                  <button
                    onClick={() => openAccountSettings('profile')}
                    title="Account Settings"
                    className="p-1 rounded-lg text-slate-400 hover:text-cyanGlow hover:bg-cyanPrimary/10 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => { setSignOutSuccess(false); setShowSignOutConfirm(true); }}
                    title="Sign Out"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In / Sync</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation & Success Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-sm bg-[#161b22] border border-cyanPrimary/30 rounded-2xl p-6 shadow-2xl shadow-cyanPrimary/10 relative text-slate-200 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {signOutSuccess ? (
              <div className="py-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-1">Signed Out successfully!</h3>
                <p className="text-xs text-slate-400">Your study progress will remain safely saved.</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Sign Out Confirmation</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Are you sure you want to sign out? Your study progress will remain safely saved.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    disabled={signOutLoading}
                    className="py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSignOut}
                    disabled={signOutLoading}
                    className="py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {signOutLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing out...</span>
                      </>
                    ) : (
                      'Yes, Sign Out'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
