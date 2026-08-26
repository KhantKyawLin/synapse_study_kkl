import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AuthModal({ onAuthSuccess }) {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode,
    setAuthModalMode,
    signIn, 
    signUp, 
    resetPassword, 
    updatePassword, 
    isConfigured 
  } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'newpassword'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with authModalMode whenever modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setPassword('');
      setMode(authModalMode || 'signin');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setIsAuthModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet. Please check your environment variables.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        await signUp(email.trim(), password, fullName.trim());
        setSuccessMsg('Account created successfully!');
        
        // Clear sensitive inputs
        setPassword('');
        setEmail('');
        setFullName('');

        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMsg('');
          if (onAuthSuccess) onAuthSuccess();
        }, 1200);
      } else if (mode === 'signin') {
        await signIn(email.trim(), password);
        setSuccessMsg('Signed In successfully!');
        
        // Clear sensitive inputs
        setPassword('');
        setEmail('');
        setFullName('');

        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMsg('');
          if (onAuthSuccess) onAuthSuccess();
        }, 1200);
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMsg('Password reset link sent!');
        setPassword('');
      } else if (mode === 'newpassword') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await updatePassword(password);
        setSuccessMsg('Password updated successfully!');
        setPassword('');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMsg('');
          if (onAuthSuccess) onAuthSuccess();
        }, 1300);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#161b22] border border-cyanPrimary/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyanPrimary/10 relative overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success View */}
        {successMsg ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {successMsg}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'forgot' 
                ? 'Please check your email inbox to reset your password.' 
                : mode === 'newpassword'
                ? 'Your password has been updated securely.'
                : 'Directing to your flashcards...'}
            </p>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-3 text-cyanPrimary shadow-md">
                {mode === 'newpassword' ? <KeyRound className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {mode === 'signup' 
                  ? 'Create Student Account' 
                  : mode === 'signin' 
                  ? 'Sign In to Synapse Study' 
                  : mode === 'forgot'
                  ? 'Reset Your Password'
                  : 'Change Account Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signup' 
                  ? 'Save and sync your review flashcards & quiz certificates across all devices' 
                  : mode === 'signin'
                  ? 'Access your saved cards and verified certificates anywhere'
                  : mode === 'forgot'
                  ? 'Enter your registered email to receive a password reset link'
                  : 'Enter your new password below to update your account'}
              </p>
            </div>

            {/* Mode Tabs (only in signin/signup mode) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="grid grid-cols-2 p-1 bg-[#0d1117] border border-slate-800 rounded-xl mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setAuthModalMode('signin'); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setAuthModalMode('signup'); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khant Kyaw Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
                    />
                  </div>
                </div>
              )}

              {mode !== 'newpassword' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      {mode === 'newpassword' ? 'Enter New Password' : 'Password'}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setAuthModalMode('forgot'); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
                        className="text-xs text-cyanGlow hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyanGlow transition-colors"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'signup' ? (
                  'Create Free Account'
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : mode === 'forgot' ? (
                  'Send Reset Link'
                ) : (
                  'Save New Password'
                )}
              </button>
            </form>

            {mode === 'forgot' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setAuthModalMode('signin'); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
