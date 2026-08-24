import React, { useRef, useState } from 'react';
import KatexText from '../KatexText';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowLeft, User, Clock, Check, Download, Copy } from 'lucide-react';
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
}) {
  const certRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  let score = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);

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

  // Download Certificate PNG
  const handleDownloadImage = async () => {
    if (!certRef.current || isExporting) return;
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

  // Copy Certificate Image to Clipboard
  const handleCopyImage = async () => {
    if (!certRef.current || isExporting) return;
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
      {/* Exportable Official Score Certificate Card */}
      <div
        ref={certRef}
        className="bg-[#161b22] border-2 border-cyanPrimary/40 rounded-2xl p-6 sm:p-10 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden"
      >
        {/* Top Decorative Banner */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyanPrimary via-cyanGlow to-emerald-400"></div>

        <div className="w-16 h-16 rounded-2xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-4 text-cyanPrimary shadow-lg shadow-cyanPrimary/10">
          <Award className="w-8 h-8" />
        </div>

        {/* Certificate Title & Student Name */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
          Quiz Assessment Certificate
        </h2>

        {/* Prominent Student Name Badge for Screenshot Verification */}
        {studentName && (
          <div className="inline-flex items-center gap-2 px-5 py-2 mt-2 mb-4 rounded-xl bg-cyanPrimary/15 border border-cyanPrimary/40 text-cyanGlow font-extrabold text-base sm:text-lg shadow-sm">
            <User className="w-5 h-5 text-cyanPrimary" />
            <span>Student: {studentName}</span>
          </div>
        )}

        {isTimeExpired && (
          <div className="mb-4 text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full inline-block">
            ⏱️ Time Expired — Auto Submitted
          </div>
        )}

        {/* Score Percentage Display */}
        <div className="text-5xl sm:text-6xl font-black text-cyanPrimary mb-2 tracking-tight">
          {percentage}%
        </div>
        <p className="text-sm font-semibold text-slate-300 mb-6">
          Scored <span className="text-emerald-400 font-extrabold text-base">{score}</span> out of <span className="text-white font-extrabold text-base">{questions.length}</span> questions correctly
        </p>

        {/* Details Meta Bar (Time Spent, Completion Date) */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-[#0f141c]/80 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 max-w-md mx-auto mb-6">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyanPrimary" /> Time: {formatTime(timeSpent)} / {formatTime(totalAllocatedSeconds)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Verified: {currentDate}
          </span>
        </div>

        {/* Certificate Image Export Action Bar */}
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
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <button
          onClick={onChooseNewQuiz}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Choose Another Quiz
        </button>
      </div>

      {/* Itemized Answer Breakdown */}
      <h3 className="text-xl font-bold text-white mt-4">Detailed Answer Review</h3>

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
          const userAns = userAnswers[idx];
          const isCorrect = userAns === q.correctIndex;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isCorrect ? 'bg-[#16221c]/70 border-emerald-500/30' : 'bg-[#221618]/70 border-rose-500/30'
              } backdrop-blur-md flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                {isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white leading-relaxed">
                <KatexText text={q.question} />
              </h4>

              <div className="text-xs font-medium space-y-1">
                <p className="text-slate-300">
                  <span className="text-slate-400">Your Answer:</span>{' '}
                  <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    <KatexText text={q.options[userAns] !== undefined ? q.options[userAns] : 'Not answered'} />
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Correct Answer:</span>{' '}
                    <span className="text-emerald-400 font-bold">
                      <KatexText text={q.options[q.correctIndex]} />
                    </span>
                  </p>
                )}
              </div>

              {q.explanation && (
                <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-cyanGlow">Explanation:</span>{' '}
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
