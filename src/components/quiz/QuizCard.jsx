import React from 'react';
import KatexText from '../KatexText';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

export default function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  studentName,
  timeRemaining,
}) {
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== undefined && timeRemaining <= 120; // < 2 mins

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#161b22]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl animate-fadeIn">
      {/* Top Header Bar: Student Name, Category, Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {studentName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              <User className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary" /> {studentName}
            </span>
          )}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/40">
            {question.category || 'Practice Exam'}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          {timeRemaining !== undefined && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
              isLowTime
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/50 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Question <span className="text-sky-600 dark:text-cyanPrimary text-sm font-black">{currentIndex + 1}</span> of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Stem */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
        <KatexText text={question.question} />
      </h2>

      {/* Options List */}
      <div className="flex flex-col gap-3 mb-8">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-cyanPrimary/15 border-cyanPrimary text-slate-900 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-[#1c222b]/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1c222b]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected ? 'bg-cyanPrimary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                }`}>
                  {optionLabels[idx]}
                </span>
                <span className="mt-0.5 leading-snug">
                  <KatexText text={optionText} />
                </span>
              </div>
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-cyanPrimary shrink-0 ml-2" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-[#1a1e24] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          {currentIndex === totalQuestions - 1 ? 'Submit Assessment' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
