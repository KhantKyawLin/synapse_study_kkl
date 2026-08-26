import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { 
  X, User, Mail, Lock, KeyRound, Award, CheckCircle2, AlertCircle, 
  Loader2, Eye, EyeOff, Camera, Sparkles, BookOpen, TrendingUp, Clock, 
  Calendar, Check, Download, Copy, ArrowLeft, Layers, ShieldCheck, Lock as LockIcon, Crown, Upload, Image as ImageIcon 
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import logoImg from '../../assets/logo.jpg';

// Preset Base Avatars
export const BASE_AVATARS = [
  { id: 'student_freshman', label: 'Scholar 🧑‍🎓', emoji: '🧑‍🎓', bg: 'from-blue-600 to-cyan-500' },
  { id: 'avatar_doc_m', label: 'Doctor 🩺', emoji: '👨‍⚕️', bg: 'from-blue-600 to-cyan-500' },
  { id: 'avatar_doc_f', label: 'Physician 👩‍⚕️', emoji: '👩‍⚕️', bg: 'from-cyan-600 to-teal-500' },
  { id: 'avatar_neuro', label: 'Neurologist 🧠', emoji: '🧠', bg: 'from-purple-600 to-indigo-500' },
  { id: 'avatar_surgeon', label: 'Surgeon 🥼', emoji: '🥼', bg: 'from-emerald-600 to-teal-500' },
  { id: 'avatar_lab', label: 'Researcher 🔬', emoji: '🔬', bg: 'from-amber-500 to-orange-500' },
  { id: 'avatar_pharma', label: 'Pharmacist 💊', emoji: '💊', bg: 'from-rose-500 to-pink-500' },
];

// Unique Progression Frames & Borders
export const PRESTIGE_FRAMES = [
  {
    id: 'frame_bronze',
    title: 'Initiate Bronze Frame',
    tier: 'Tier I',
    badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-900 to-slate-800 ring-2 ring-amber-600/70 shadow-md',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 ring-1 ring-amber-600/70',
    description: 'Starting border for medical scholars',
    requirement: 'Unlocked by default',
  },
  {
    id: 'frame_silver',
    title: 'Diligent Silver Frame',
    tier: 'Tier II',
    badgeColor: 'text-teal-300 bg-teal-500/10 border-teal-500/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-br from-teal-300 via-slate-100 to-teal-600 ring-2 ring-teal-300 shadow-lg shadow-teal-500/30',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-br from-teal-300 to-slate-200 ring-1 ring-teal-300',
    description: 'Awarded for completing 1 assessment',
    requirement: 'Complete 1 Quiz Assessment',
  },
  {
    id: 'frame_gold',
    title: 'Radiant Gold Frame',
    tier: 'Tier III',
    badgeColor: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 ring-2 ring-yellow-300 shadow-xl shadow-amber-500/40',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-br from-amber-300 to-yellow-400 ring-1 ring-yellow-300',
    description: 'Awarded for consistent exam testing',
    requirement: 'Complete 3 Quiz Assessments',
  },
  {
    id: 'frame_cyber',
    title: 'Diamond Cyber Frame',
    tier: 'Tier IV',
    badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-300 to-blue-600 ring-2 ring-cyan-300 shadow-xl shadow-cyan-500/40 animate-pulse',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 ring-1 ring-cyan-300',
    description: 'Awarded for scoring 80%+ on any quiz',
    requirement: 'Score 80%+ on any Quiz',
  },
  {
    id: 'frame_cosmic',
    title: 'Cosmic Synapse Frame',
    tier: 'Tier V',
    badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-400 to-indigo-600 ring-2 ring-fuchsia-400 shadow-xl shadow-purple-500/50',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 ring-1 ring-purple-300',
    description: 'Awarded for dedicated study time',
    requirement: '15+ Mins Study or 5 Quizzes',
  },
  {
    id: 'frame_mythic',
    title: 'Mythic Grandmaster Crown',
    tier: 'Mythic',
    badgeColor: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
    frameClass: 'p-1 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-pink-600 ring-2 ring-amber-300 shadow-2xl shadow-rose-500/60',
    headerClass: 'p-0.5 rounded-lg bg-gradient-to-r from-rose-500 via-amber-400 to-pink-600 ring-1 ring-amber-300',
    description: 'Prestige crown for top medical achievers',
    requirement: 'Pass 3 Exams (≥70%)',
  },
];

export default function AccountSettingsModal({ onSaveSuccess }) {
  const { 
    user, 
    isAccountSettingsOpen, 
    setIsAccountSettingsOpen, 
    accountSettingsTab, 
    setAccountSettingsTab, 
    updateProfile, 
    updatePassword, 
    isConfigured 
  } = useAuth();

  const { history, stats } = useQuizHistory();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'history'

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('student_freshman');
  const [selectedFrame, setSelectedFrame] = useState('frame_bronze');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Security Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProfileUpdatedSuccess, setIsProfileUpdatedSuccess] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef(null);

  // Certificate Detail View in History
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const certRef = useRef(null);

  // Track previous open state to avoid tab jumping on window blur/focus
  const prevIsOpen = useRef(false);

  // Frame unlock checks
  const getFrameStatus = (frameId) => {
    switch (frameId) {
      case 'frame_bronze':
        return { isUnlocked: true, progress: 'Unlocked' };
      case 'frame_silver': {
        const unlocked = (stats.totalQuizzes || 0) >= 1;
        return { isUnlocked: unlocked, progress: `${Math.min(1, stats.totalQuizzes || 0)}/1 Completed` };
      }
      case 'frame_gold': {
        const unlocked = (stats.totalQuizzes || 0) >= 3;
        return { isUnlocked: unlocked, progress: `${Math.min(3, stats.totalQuizzes || 0)}/3 Completed` };
      }
      case 'frame_cyber': {
        const unlocked = (history || []).some((h) => (h.percentage || 0) >= 80);
        const best = history.length ? Math.max(...history.map(h => h.percentage || 0)) : 0;
        return { isUnlocked: unlocked, progress: unlocked ? 'Unlocked!' : `Best: ${best}%` };
      }
      case 'frame_cosmic': {
        const unlocked = (stats.totalTimeSpentSeconds || 0) >= 900 || (stats.totalQuizzes || 0) >= 5;
        const mins = Math.min(15, Math.floor((stats.totalTimeSpentSeconds || 0) / 60));
        return { isUnlocked: unlocked, progress: `${mins}/15 Mins` };
      }
      case 'frame_mythic': {
        const unlocked = (stats.passedQuizzes || 0) >= 3 || (stats.totalQuizzes || 0) >= 10;
        return { isUnlocked: unlocked, progress: `${Math.min(3, stats.passedQuizzes || 0)}/3 Passed` };
      }
      default:
        return { isUnlocked: true, progress: 'Unlocked' };
    }
  };

  // Populate data when modal opens
  useEffect(() => {
    if (isAccountSettingsOpen && !prevIsOpen.current) {
      setActiveTab(accountSettingsTab || 'profile');
      setErrorMsg('');
      setSuccessMsg('');
      setIsProfileUpdatedSuccess(false);
      setSelectedAttempt(null);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);

      if (user) {
        setFullName(user.user_metadata?.full_name || '');
        const avatar = user.user_metadata?.avatar_url || 'student_freshman';
        const frame = user.user_metadata?.avatar_frame || 'frame_bronze';
        setSelectedFrame(frame);

        if (avatar.startsWith('http') || avatar.startsWith('data:image')) {
          setCustomAvatarUrl(avatar);
          setSelectedAvatar('custom');
          setShowCustomUrlInput(false);
        } else {
          setSelectedAvatar(avatar);
          setShowCustomUrlInput(false);
        }
      }
    }
    prevIsOpen.current = isAccountSettingsOpen;
  }, [isAccountSettingsOpen, accountSettingsTab, user]);

  if (!isAccountSettingsOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsProfileUpdatedSuccess(false);
    setSelectedAttempt(null);
    setIsAccountSettingsOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setAccountSettingsTab) setAccountSettingsTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedAttempt(null);
  };

  // Handle Local Device Image Upload with Automatic 256x256 Compression & 5MB Limit
  const handleLocalImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and scale to max 256x256 avatar canvas
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG dataURL (~25-40KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setCustomAvatarUrl(compressedDataUrl);
        setSelectedAvatar('custom');
        setErrorMsg('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Reset file input so user can pick the same file again if desired
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    try {
      setLoading(true);
      const avatarToSave = selectedAvatar === 'custom' && customAvatarUrl.trim() 
        ? customAvatarUrl.trim() 
        : selectedAvatar;

      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarToSave,
        avatarFrame: selectedFrame,
      });

      setLoading(false);
      setIsProfileUpdatedSuccess(true);

      // Redirect to homepage after 1.2 seconds
      setTimeout(() => {
        setIsProfileUpdatedSuccess(false);
        setIsAccountSettingsOpen(false);
        if (onSaveSuccess) onSaveSuccess();
      }, 1200);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  // Save Password Changes
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      setSuccessMsg('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  // Format Helpers for History Tab
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Certificate Exporter Helpers
  const handleDownloadImage = async () => {
    if (!certRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      const safeName = (selectedAttempt?.student_name || 'Student').replace(/[^a-z0-9]/gi, '_');
      link.download = `Certificate_${safeName}_${selectedAttempt?.module_name || 'Exam'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!certRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const blob = await toBlob(certRef.current, { cacheBust: true, pixelRatio: 2 });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Failed to copy certificate image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Render Base Avatar Inner
  const renderAvatarInner = (avatarKey) => {
    if (avatarKey && (avatarKey.startsWith('http') || avatarKey.startsWith('data:image'))) {
      return (
        <img src={avatarKey} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
      );
    }
    const found = BASE_AVATARS.find((a) => a.id === avatarKey) || BASE_AVATARS[0];
    return (
      <div className={`w-full h-full rounded-xl bg-gradient-to-br ${found.bg} flex items-center justify-center text-3xl sm:text-4xl shadow-inner`}>
        <span>{found.emoji}</span>
      </div>
    );
  };

  const activeFrameObj = PRESTIGE_FRAMES.find((f) => f.id === selectedFrame) || PRESTIGE_FRAMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Fixed Uniform Viewport Dimensions Across All Tabs */}
      <div 
        className="w-full max-w-4xl h-[650px] max-h-[92vh] bg-[#161b22] border border-cyanPrimary/40 rounded-2xl shadow-2xl shadow-cyanPrimary/10 flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Line */}
        <div className="h-1 bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-[#0d1117]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary shadow-md shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-tight">
                Student Account & Academic Hub
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Upload device photo, equip prestige borders, and track study analytics
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#0d1117] border-b border-slate-800 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Section</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'security'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'history'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Exam History & Certificates ({history.length})</span>
          </button>
        </div>

        {/* Scrollable Modal Content (Consistent across all 3 tabs) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
          {/* Success Screen when Profile is Updated */}
          {isProfileUpdatedSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fadeIn my-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                Your profile data is successfully updated!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Redirecting you to the home page...
              </p>
            </div>
          ) : (
            <>
              {/* Notifications */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: PROFILE SECTION */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-fadeIn">
                  
                  {/* Spotlight Card with Active Prestige Frame */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#0d1117] border border-slate-800 rounded-2xl">
                    <div className={`${activeFrameObj.frameClass} w-20 h-20 sm:w-24 sm:h-24 shrink-0 transition-all duration-300`}>
                      {renderAvatarInner(selectedAvatar === 'custom' ? customAvatarUrl : selectedAvatar)}
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {activeFrameObj.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeFrameObj.badgeColor}`}>
                          {activeFrameObj.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeFrameObj.description}
                      </p>
                      <p className="text-[11px] text-cyanGlow mt-1 font-medium">
                        Complete assessments and score high to unlock unique glowing prestige borders!
                      </p>
                    </div>
                  </div>

                  {/* Prestige Borders Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 ml-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unlockable Prestige Borders</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {PRESTIGE_FRAMES.filter(f => getFrameStatus(f.id).isUnlocked).length} / {PRESTIGE_FRAMES.length} Unlocked
                      </span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESTIGE_FRAMES.map((frame) => {
                        const status = getFrameStatus(frame.id);
                        const isEquipped = selectedFrame === frame.id;
                        return (
                          <button
                            key={frame.id}
                            type="button"
                            onClick={() => {
                              if (status.isUnlocked) setSelectedFrame(frame.id);
                            }}
                            disabled={!status.isUnlocked}
                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                              isEquipped
                                ? 'bg-cyanPrimary/10 border-cyanPrimary ring-1 ring-cyanPrimary shadow-md'
                                : status.isUnlocked
                                ? 'bg-[#0d1117] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
                                : 'bg-[#0a0d12] border-slate-900 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className={`${frame.frameClass} w-9 h-9 shrink-0 flex items-center justify-center`}>
                                <div className="w-full h-full bg-[#161b22] rounded-lg overflow-hidden flex items-center justify-center text-xs">
                                  {selectedAvatar === 'custom' ? (
                                    customAvatarUrl ? (
                                      <img src={customAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : '📷'
                                  ) : (
                                    BASE_AVATARS.find(a => a.id === selectedAvatar)?.emoji || '🧑‍🎓'
                                  )}
                                </div>
                              </div>

                              {!status.isUnlocked ? (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  <LockIcon className="w-2.5 h-2.5" /> Locked
                                </span>
                              ) : isEquipped ? (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-cyanGlow bg-cyanPrimary/20 px-1.5 py-0.5 rounded">
                                  <Check className="w-2.5 h-2.5" /> Equipped
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  Unlocked
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="text-xs font-bold text-white block leading-tight">
                                {frame.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                                {frame.requirement}
                              </span>
                              {!status.isUnlocked && (
                                <span className="text-[9px] text-amber-400/90 font-medium block mt-1">
                                  Progress: {status.progress}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profile Photo & Avatar Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 ml-1">
                      Choose Avatar Icon or Upload Photo
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {BASE_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => { setSelectedAvatar(avatar.id); setShowCustomUrlInput(false); }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                            selectedAvatar === avatar.id && !showCustomUrlInput
                              ? 'ring-2 ring-cyanPrimary scale-110 bg-slate-800'
                              : 'bg-slate-800/80 hover:bg-slate-700 opacity-70 hover:opacity-100'
                          }`}
                          title={avatar.label}
                        >
                          {avatar.emoji}
                        </button>
                      ))}

                      {/* Device Photo Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/20 hover:brightness-110 active:scale-95 flex items-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Device Photo</span>
                      </button>

                      {/* URL Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          showCustomUrlInput 
                            ? 'bg-slate-700 text-white shadow-md' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Image URL</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                      📁 Max size 5MB • Automatically scaled & optimized for instant avatar loading
                    </p>

                    {showCustomUrlInput && (
                      <div className="mt-2.5 p-3 bg-[#0d1117] border border-cyanPrimary/30 rounded-xl animate-fadeIn">
                        <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                          Direct Image Link (URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/my-photo.jpg"
                          value={customAvatarUrl.startsWith('data:') ? '' : customAvatarUrl}
                          onChange={(e) => { setCustomAvatarUrl(e.target.value); setSelectedAvatar('custom'); }}
                          className="w-full bg-[#161b22] border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-cyanPrimary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Student Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                      Student Full Name <span className="text-rose-400">*</span>
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
                    <span className="text-[11px] text-slate-500 ml-1 mt-1 block">
                      This name appears automatically on your earned quiz certificates.
                    </span>
                  </div>

                  {/* Registered Email (Read-Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Registered Email
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Verified Student Account
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={user?.email || 'student@example.com'}
                        className="w-full bg-[#0d1117]/60 border border-slate-800 text-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: PASSWORD & SECURITY */}
              {activeTab === 'security' && (
                <form onSubmit={handleSavePassword} className="flex flex-col gap-5 max-w-xl mx-auto w-full py-2 animate-fadeIn">
                  <div className="p-4 bg-[#0d1117] border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">Account Password Security</h3>
                      <p className="text-xs text-slate-400">Update your password to keep your academic profile secure</p>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                      New Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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

                  {/* Confirm New Password with Eye Icon */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
                      Confirm New Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyanGlow transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !newPassword}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Account Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: EXAM HISTORY & CERTIFICATES */}
              {activeTab === 'history' && (
                <div className="flex flex-col gap-6 w-full animate-fadeIn">
                  {selectedAttempt ? (
                    /* Certificate Preview */
                    <div className="flex flex-col items-center gap-6 animate-fadeIn">
                      <div className="w-full flex justify-start">
                        <button
                          onClick={() => setSelectedAttempt(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-[#0d1117] border border-slate-800 hover:border-slate-700 transition-all"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to All Attempts</span>
                        </button>
                      </div>

                      {/* Printable Certificate Box */}
                      <div 
                        ref={certRef}
                        className="w-full max-w-2xl bg-gradient-to-b from-[#11161d] to-[#0a0d12] border-2 border-cyanPrimary/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-200"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyanPrimary/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                        {/* Certificate Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyanPrimary/40 shadow-md">
                              <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white tracking-tight leading-none">
                                <span className="text-cyanPrimary">SYNAPSE</span> STUDY
                              </h3>
                              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                                Medical Certificate of Completion
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`text-2xl font-black ${selectedAttempt.percentage >= 70 ? 'text-emerald-400' : 'text-cyanGlow'}`}>
                              {selectedAttempt.percentage}%
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Score: {selectedAttempt.score} / {selectedAttempt.total_questions}
                            </span>
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="text-center py-4 space-y-3">
                          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">This certifies that</span>
                          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b-2 border-cyanPrimary/30 pb-2 max-w-md mx-auto">
                            {selectedAttempt.student_name}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed pt-2">
                            has successfully completed the comprehensive exam assessment in{' '}
                            <strong className="text-cyanPrimary font-bold">{selectedAttempt.module_name}</strong>
                            {selectedAttempt.category && selectedAttempt.category !== 'All' && (
                              <span> ({selectedAttempt.category})</span>
                            )}.
                          </p>
                        </div>

                        {/* Certificate Metadata */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 mt-6 text-xs text-slate-400">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Date Completed</span>
                            <span className="text-white font-medium">
                              {new Date(selectedAttempt.completed_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Time Taken</span>
                            <span className="text-white font-medium">{formatTime(selectedAttempt.time_spent_seconds)}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Status</span>
                            <span className={`font-bold ${selectedAttempt.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {selectedAttempt.percentage >= 70 ? 'PASSED (Mastery)' : 'COMPLETED'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleDownloadImage}
                          disabled={isExporting}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-lg shadow-cyanPrimary/25 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Save Certificate Image (PNG)</span>
                        </button>

                        <button
                          onClick={handleCopyImage}
                          disabled={isExporting}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0d1117] border border-cyanPrimary/40 text-cyanGlow hover:bg-cyanPrimary/10 active:scale-95 transition-all"
                        >
                          {copiedSuccess ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Image to Clipboard</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* History List */
                    <>
                      {/* Metrics Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                            <BookOpen className="w-3.5 h-3.5 text-cyanPrimary" />
                            <span>Total Quizzes</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-white">{stats.totalQuizzes || 0}</div>
                        </div>

                        <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Average Score</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-white">{stats.averageScore || 0}%</div>
                        </div>

                        <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Passed (≥70%)</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-white">{stats.passedQuizzes || 0}</div>
                        </div>

                        <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Study Time</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-white">{formatTotalTime(stats.totalTimeSpentSeconds)}</div>
                        </div>
                      </div>

                      {/* Attempts List */}
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyanPrimary" />
                          <span>Exam Attempt History ({history.length})</span>
                        </h3>

                        {history.length === 0 ? (
                          <div className="text-center py-10 bg-[#0d1117]/60 border border-slate-800/80 rounded-2xl p-6">
                            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-300">No Quiz Attempts Recorded Yet</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              Take your first quiz assessment to generate verified certificates and log your medical study analytics!
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {history.map((item, index) => {
                              const isPassed = (item.percentage || 0) >= 70;
                              return (
                                <div
                                  key={item.id || index}
                                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#0d1117] border border-slate-800/90 hover:border-cyanPrimary/40 rounded-xl transition-all"
                                >
                                  <div className="flex items-start sm:items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                                      isPassed 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    }`}>
                                      {item.percentage}%
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-white">{item.module_name}</span>
                                        {item.category && item.category !== 'All' && (
                                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyanPrimary/10 text-cyanGlow border border-cyanPrimary/20">
                                            {item.category}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                                          {item.score} / {item.total_questions} Correct
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-500" />
                                          {formatTime(item.time_spent_seconds)}
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-500">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(item.completed_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setSelectedAttempt(item)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyanPrimary/10 border border-cyanPrimary/30 text-cyanGlow hover:bg-cyanPrimary hover:text-white transition-all shadow-sm"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>View Certificate</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
