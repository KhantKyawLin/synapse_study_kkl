import React, { useRef, useState } from 'react';
import KatexText from '../KatexText';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowLeft, User, Clock, Check, Download, Copy, History, AlertTriangle } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';

export default function QuizResult({
  questions,
  userAnswers,
  studentName,
  timeSpent,
  totalAllocatedSeconds,
  isTimeExpired,
  onRestart,
  onChooseNewQuiz,
  onOpenHistory,
}) {
  const certRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  let score = 0;
  questions.forEach((q, idx) => {
    const userChoice = userAnswers[idx];
    if (userChoice !== undefined && userChoice !== null && Number(userChoice) === Number(q.correctIndex)) {
      score++;
    }
  });

  const percentage = Math.round((score / questions.length) * 100);
  const isPassed = percentage >= 60;

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    if (seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Download Certificate PNG (only if score >= 60%)
  const handleDownloadImage = async () => {
    if (!isPassed || !certRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(certRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      const safeName = (studentName || 'Student').replace(/[^a-z0-9]/gi, '_');
      link.download = `Quiz_Certificate_${safeName}.png`;
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
    if (!isPassed || !certRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const blob = await toBlob(certRef.current, { cacheBust: true, pixelRatio: 2 });
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      } else {
        // Fallback to downloading if clipboard API is not permitted
        handleDownloadImage();
      }
    } catch (err) {
      console.error('Failed to copy certificate image:', err);
      // Fallback
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Official Score Card (Certificate ONLY if score >= 60%) */}
      <div
        ref={isPassed ? certRef : null}
        className={`bg-[#161b22] border-2 ${
          isPassed ? 'border-cyanPrimary/40' : 'border-rose-500/40'
        } rounded-2xl p-6 sm:p-10 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden text-white`}
      >
        {/* Top Decorative Banner */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${
          isPassed 
            ? 'bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400' 
            : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
        }`}></div>

        <div className={`w-16 h-16 rounded-2xl ${
          isPassed 
            ? 'bg-cyanPrimary/20 border-cyanPrimary/40 text-cyanPrimary shadow-cyanPrimary/10' 
            : 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-rose-500/10'
        } border flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          {isPassed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border inline-block mb-2 ${
          isPassed 
            ? 'text-cyanPrimary bg-cyanPrimary/10 border-cyanPrimary/30' 
            : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
        }`}>
          {isPassed ? 'Certificate of Completion' : 'Assessment Score Report'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {isPassed ? 'Congratulations, Assessment Passed!' : 'Assessment Completed — Not Passed'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isPassed 
            ? 'Verified Synapse Study Medical Examination' 
            : 'A minimum score of 60% is required to earn a certificate of completion'}
        </p>

        {/* Recipient Details */}
        <div className="p-4 rounded-xl bg-[#0d1117]/80 border border-slate-800/80 inline-block min-w-[280px] mb-6">
          <div className="flex items-center justify-center gap-2 text-cyanGlow text-sm font-bold">
            <User className="w-4 h-4 text-cyanPrimary" />
            <span className="text-base text-white">{studentName || 'Student'}</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Module: <strong className="text-slate-200">{questions[0]?.category || 'Clinical Module'}</strong>
          </span>
        </div>

        {/* Score Radial Box */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
          <div className="p-3.5 bg-[#0d1117] border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-slate-400 block mb-1">Total Score</span>
            <span className="text-xl font-black text-cyanPrimary">{score} / {questions.length}</span>
          </div>
          <div className="p-3.5 bg-[#0d1117] border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-slate-400 block mb-1">Percentage</span>
            <span className={`text-xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {percentage}%
            </span>
          </div>
          <div className="p-3.5 bg-[#0d1117] border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-slate-400 block mb-1">Status</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {isPassed ? 'PASSED (≥60%)' : 'RETRY (<60%)'}
            </span>
          </div>
        </div>

        {/* Callout Alert when score < 60% */}
        {!isPassed && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 max-w-lg mx-auto mb-6 text-xs sm:text-sm text-slate-300 flex items-start gap-3 text-left">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-400 block mb-0.5">Certificate Not Issued</span>
              <span>
                You scored <strong>{percentage}%</strong>. A minimum score of <strong>60%</strong> is required to earn a verified Medical Certificate of Completion. Review the detailed rationales below and retake the quiz to qualify.
              </span>
            </div>
          </div>
        )}

        {/* Time and Verification Footer */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyanPrimary" /> Time: {formatTime(timeSpent)} / {formatTime(totalAllocatedSeconds)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Verified: {currentDate}
          </span>
        </div>

        {/* Certificate Image Export Action Bar (ONLY if score >= 60%) */}
        {isPassed ? (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-slate-800/80">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PNG...' : 'Save Certificate Image (PNG)'}</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copied Image to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyanPrimary" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-slate-800/80">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz to Earn Certificate (Score ≥ 60%)</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <button
          onClick={onChooseNewQuiz}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Choose Another Quiz
        </button>
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-cyanPrimary/40 text-sky-700 dark:text-cyanGlow hover:bg-sky-50 dark:hover:bg-cyanPrimary/10 active:scale-[0.98] transition-all shadow-sm"
          >
            <History className="w-4 h-4" /> Exam History
          </button>
        )}
      </div>

      {/* Itemized Answer Breakdown */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Detailed Answer Review</h3>

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
          const userAns = userAnswers[idx];
          const isCorrect = userAns === q.correctIndex;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isCorrect 
                  ? 'bg-emerald-50/80 dark:bg-[#16221c]/70 border-emerald-300 dark:border-emerald-500/30' 
                  : 'bg-rose-50/80 dark:bg-[#221618]/70 border-rose-300 dark:border-rose-500/30'
              } backdrop-blur-md flex flex-col gap-3 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Question {idx + 1}</span>
                {isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                <KatexText text={q.question} />
              </h4>

              <div className="text-xs font-medium space-y-1">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Your Answer:</span>{' '}
                  <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                    <KatexText text={q.options[userAns] !== undefined ? q.options[userAns] : 'Not answered'} />
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400">Correct Answer:</span>{' '}
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      <KatexText text={q.options[q.correctIndex]} />
                    </span>
                  </p>
                )}
              </div>

              {q.explanation && (
                <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 shadow-sm">
                  <span className="font-bold text-sky-700 dark:text-cyanGlow">Explanation:</span>{' '}
                  <KatexText text={q.explanation.replace(/\s*\(\s*(?:Passage|Slide|Page|Source)\b[^)]*\)/gi, '').trim()} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
