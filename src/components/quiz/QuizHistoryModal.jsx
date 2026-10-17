import React, { useState, useRef } from 'react';
import { 
  X, Award, CheckCircle, Clock, Calendar, Download, Copy, 
  Check, Sparkles, TrendingUp, BookOpen, Layers, Eye, ArrowLeft, Trash2 
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import logoImg from '../../assets/logo.jpg';

export default function QuizHistoryModal({ isOpen, onClose, history = [], stats = {}, onDeleteAttempt }) {
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [deleteConfirmAttemptId, setDeleteConfirmAttemptId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const certRef = useRef(null);

  if (!isOpen) return null;

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

  // Download Certificate PNG (only if score >= 60%)
  const handleDownloadImage = async () => {
    if (!selectedAttempt || (selectedAttempt.percentage || 0) < 60 || !certRef.current || isExporting) return;
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

  // Copy Certificate Image to Clipboard (only if score >= 60%)
  const handleCopyImage = async () => {
    if (!selectedAttempt || (selectedAttempt.percentage || 0) < 60 || !certRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const blob = await toBlob(certRef.current, { cacheBust: true, pixelRatio: 2 });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-slate-50 dark:bg-[#161b22] border border-slate-300 dark:border-cyanPrimary/40 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-cyanPrimary/10 flex flex-col overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Bar */}
        <div className="h-1 bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-sky-700 dark:text-cyanPrimary shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {selectedAttempt ? 'Exam Certificate Preview' : 'Student Exam History & Certificates'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedAttempt 
                  ? `Completed by ${selectedAttempt.student_name} on ${new Date(selectedAttempt.completed_at).toLocaleDateString()}` 
                  : 'Track your quiz scores, progress, and re-download verified certificates'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedAttempt) setSelectedAttempt(null);
              else onClose();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {selectedAttempt ? (
            /* Certificate Detail View */
            <div className="flex flex-col items-center gap-6 animate-fadeIn">
              {/* Back & Delete Header */}
              <div className="w-full flex items-center justify-between">
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to History</span>
                </button>

                {onDeleteAttempt && (
                  <button
                    onClick={() => setDeleteConfirmAttemptId(selectedAttempt.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                )}
              </div>

              {/* Printable Certificate Box */}
              <div 
                ref={certRef}
                className={`w-full max-w-2xl bg-gradient-to-b from-[#11161d] to-[#0a0d12] border-2 ${
                  (selectedAttempt.percentage || 0) >= 60 ? 'border-cyanPrimary/40' : 'border-rose-500/40'
                } rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-200`}
              >
                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${
                  (selectedAttempt.percentage || 0) >= 60 ? 'bg-cyanPrimary/10' : 'bg-rose-500/10'
                } rounded-full blur-2xl pointer-events-none`}></div>
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
                        {(selectedAttempt.percentage || 0) >= 60 ? 'Medical Certificate of Completion' : 'Assessment Score Report'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-black ${(selectedAttempt.percentage || 0) >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedAttempt.percentage}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Score: {selectedAttempt.score} / {selectedAttempt.total_questions}
                    </span>
                  </div>
                </div>

                {/* Candidate Content */}
                <div className="text-center py-4 space-y-3">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    {(selectedAttempt.percentage || 0) >= 60 ? 'This certifies that' : 'Assessment Candidate'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b-2 border-cyanPrimary/30 pb-2 max-w-md mx-auto">
                    {selectedAttempt.student_name}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed pt-2">
                    {(selectedAttempt.percentage || 0) >= 60 ? (
                      <>
                        has successfully completed the comprehensive exam assessment in{' '}
                        <strong className="text-cyanPrimary font-bold">{selectedAttempt.module_name}</strong>
                        {selectedAttempt.category && selectedAttempt.category !== 'All' && (
                          <span> ({selectedAttempt.category})</span>
                        )}.
                      </>
                    ) : (
                      <>
                        completed the examination assessment in{' '}
                        <strong className="text-cyanPrimary font-bold">{selectedAttempt.module_name}</strong>
                        {selectedAttempt.category && selectedAttempt.category !== 'All' && (
                          <span> ({selectedAttempt.category})</span>
                        )}.
                      </>
                    )}
                  </p>
                  {(selectedAttempt.percentage || 0) < 60 && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs max-w-md mx-auto">
                      <strong>Certificate Not Awarded:</strong> A minimum passing score of <strong>60%</strong> is required to earn a verified completion certificate.
                    </div>
                  )}
                </div>

                {/* Certificate Footer Metadata */}
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
                    <span className={`font-bold ${(selectedAttempt.percentage || 0) >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(selectedAttempt.percentage || 0) >= 60 ? 'PASSED (≥60%)' : 'NOT PASSED (<60%)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (ONLY if passed) */}
              {(selectedAttempt.percentage || 0) >= 60 ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadImage}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25 hover:brightness-105 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save Certificate Image (PNG)</span>
                  </button>

                  <button
                    onClick={handleCopyImage}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-cyanPrimary/40 text-sky-700 dark:text-cyanGlow hover:bg-sky-50 dark:hover:bg-cyanPrimary/10 active:scale-95 transition-all shadow-sm"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Image to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  <span>Score 60% or higher on a quiz retake to earn and download your certificate.</span>
                </div>
              )}
            </div>
          ) : (
            /* History List View */
            <div className="flex flex-col gap-6">
              {/* Analytics Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary" />
                    <span>Total Quizzes</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.totalQuizzes || 0}</div>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Average Score</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.averageScore || 0}%</div>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Passed (≥70%)</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.passedQuizzes || 0}</div>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Full Exams (100%)</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.fullExamsCount || 0}</div>
                </div>
              </div>

              {/* Attempts List */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600 dark:text-cyanPrimary" />
                  <span>Exam Attempt History ({history.length})</span>
                </h3>

                {history.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0d1117]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                    <Award className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No Quiz Attempts Recorded Yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Take your first quiz assessment to generate verified certificates and log your medical study analytics!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {history.map((item, index) => {
                      const isPassed = (item.percentage || 0) >= 60;
                      return (
                        <div
                          key={item.id || index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800/90 hover:border-cyanPrimary/40 rounded-xl transition-all shadow-sm"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                              isPassed 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                            }`}>
                              {item.percentage}%
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.module_name}</span>
                                {item.category && item.category !== 'All' && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyanPrimary/10 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/20">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-slate-400" />
                                  {item.score} / {item.total_questions} Correct
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {formatTime(item.time_spent_seconds)}
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
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

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {isPassed ? (
                              <button
                                onClick={() => setSelectedAttempt(item)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyanPrimary/10 border border-cyanPrimary/30 text-sky-700 dark:text-cyanGlow hover:bg-cyanPrimary hover:text-white transition-all shadow-sm cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>View Certificate</span>
                              </button>
                            ) : (
                              <span className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20">
                                No Certificate (&lt;60%)
                              </span>
                            )}

                            {onDeleteAttempt && (
                              <button
                                onClick={() => setDeleteConfirmAttemptId(item.id)}
                                title="Delete attempt record"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Attempt Confirmation Modal */}
      {deleteConfirmAttemptId && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setDeleteConfirmAttemptId(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#161b22] border border-slate-300 dark:border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-black/50 relative text-slate-800 dark:text-slate-200 text-center animate-fadeIn transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/10">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Delete Exam Record?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete this exam attempt record from your history? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmAttemptId(null)}
                className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onDeleteAttempt) {
                    onDeleteAttempt(deleteConfirmAttemptId);
                  }
                  if (selectedAttempt?.id === deleteConfirmAttemptId) {
                    setSelectedAttempt(null);
                  }
                  setDeleteConfirmAttemptId(null);
                }}
                className="py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
