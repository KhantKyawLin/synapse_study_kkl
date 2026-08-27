import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2, 
  Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, Clock 
} from 'lucide-react';

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

  const [mode, setMode] = useState(authModalMode || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPendingReviewScreen, setIsPendingReviewScreen] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPendingReviewScreen(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsPendingReviewScreen(false);
    setIsAuthModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);

      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        const res = await signUp(email.trim(), password, fullName.trim());
        
        if (res?.isPending) {
          setIsPendingReviewScreen(true);
          setPassword('');
          return;
        }

        setSuccessMsg('Account created successfully!');
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
        setSuccessMsg('Password reset link sent! Please check your email inbox.');
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PENDING APPROVAL NOTICE SCREEN */}
        {isPendingReviewScreen ? (
          <div className="text-center py-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl shadow-amber-500/10 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Registration Submitted!
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your student account registration for <strong className="text-cyanGlow">{email}</strong> has been submitted for administrator review (Khant Kyaw Lin).
            </p>

            <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-xl text-left text-xs text-slate-400 mb-6 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Verification Request Queued</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-5">
                You will receive an automated approval confirmation email as soon as your account is reviewed and activated.
              </p>
            </div>

            <button
              onClick={() => {
                setIsPendingReviewScreen(false);
                setMode('signin');
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20 hover:bg-cyanPrimary/90 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyanPrimary/10 border border-cyanPrimary/30 text-cyanPrimary mb-3">
                {mode === 'newpassword' || mode === 'forgot' ? (
                  <KeyRound className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create Student Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'newpassword' && 'Set New Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signin' && 'Sign in to access quizzes and track your study analytics'}
                {mode === 'signup' && 'Register for admin approval to unlock quizzes & certificates'}
                {mode === 'forgot' && 'Enter your registered email to receive a password reset link'}
                {mode === 'newpassword' && 'Enter your new secure account password below'}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Sign Up */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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

              {/* Email (except for set new password) */}
              {mode !== 'newpassword' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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

              {/* Password (except for forgot password) */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {mode === 'newpassword' ? 'New Password' : 'Password'}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] text-cyanGlow hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Register Account for Review'}
                      {mode === 'forgot' && 'Send Reset Link'}
                      {mode === 'newpassword' && 'Update Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Links */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              {mode === 'signin' && (
                <p>
                  Need a student account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="font-bold text-cyanGlow hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}

              {mode === 'signup' && (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="font-bold text-cyanGlow hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-semibold text-slate-400 hover:text-white hover:underline"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
