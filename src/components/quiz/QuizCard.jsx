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
    <div className="w-full max-w-3xl mx-auto bg-[#161b22]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fadeIn">
      {/* Top Header Bar: Student Name, Category, Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {studentName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
              <User className="w-3.5 h-3.5 text-cyanPrimary" /> {studentName}
            </span>
          )}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyanPrimary/20 text-cyanGlow border border-cyanPrimary/40">
            {question.category || 'Practice Exam'}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          {timeRemaining !== undefined && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
              isLowTime
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          <span className="text-xs font-bold text-slate-400">
            Question <span className="text-cyanPrimary text-sm">{currentIndex + 1}</span> of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Stem */}
      <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
        <KatexText text={question.question} />
      </h2>

      {/* 5 Options List */}
      <div className="flex flex-col gap-3 mb-8">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-cyanPrimary/15 border-cyanPrimary text-white shadow-md shadow-cyanPrimary/10'
                  : 'bg-[#1c222b]/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#1c222b]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected ? 'bg-cyanPrimary text-white' : 'bg-slate-800 text-slate-400'
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
                <Circle className="w-5 h-5 text-slate-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={selectedOption === null}
          className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentIndex === totalQuestions - 1 ? 'Finish & See Score' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
