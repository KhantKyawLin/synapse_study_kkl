import React, { useState } from 'react';
import { Layers, LayoutDashboard, HelpCircle, User, LogOut, Cloud, Sparkles, AlertTriangle, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeView, setActiveView }) {
  const { user, signOut, setIsAuthModalOpen } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const handleConfirmSignOut = async () => {
    setShowSignOutConfirm(false);
    await signOut();
    setActiveView('flashcards');
  };

  return (
    <>
      <header className="w-full bg-[#161b22]/80 backdrop-blur-md border-b border-sky-500/20 px-4 py-3 sm:px-8 sm:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Container */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('flashcards')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-cyanPrimary/40 shadow-lg shadow-cyanPrimary/10">
              <img src={logoImg} alt="Synapse Study" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none">
                <span className="text-cyanPrimary">SYNAPSE</span> STUDY
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Medical Exam Prep</span>
            </div>
          </div>

          {/* Right Navigation & User Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Navigation Tabs */}
            <nav className="flex items-center bg-[#0d1117] p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveView('flashcards')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  activeView === 'quiz'
                    ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz</span>
              </button>
            </nav>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-cyanPrimary/30 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                      {displayName}
                    </span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium leading-none">
                      <Cloud className="w-2.5 h-2.5" /> Synced
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  title="Sign Out"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In / Sync</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-sm bg-[#161b22] border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-rose-500/10 relative text-slate-200 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to sign out? Your cloud progress will remain safely saved.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-colors"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
