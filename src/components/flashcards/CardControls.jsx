import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CardControls({
  currentIndex,
  totalCards,
  onPrev,
  onNext,
}) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={totalCards === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white dark:bg-[#161b22] border border-slate-300 dark:border-cyanPrimary/40 text-sky-600 dark:text-cyanPrimary hover:bg-sky-50 dark:hover:bg-cyanPrimary/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm dark:shadow-md dark:shadow-black/20"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Counter */}
        <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-300 dark:border-slate-700/60 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 text-center min-w-[130px] shadow-sm">
          Card <span className="text-sky-600 dark:text-cyanPrimary font-bold text-base">{totalCards > 0 ? currentIndex + 1 : 0}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalCards}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={totalCards === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 border border-cyanPrimary text-white hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-cyanPrimary/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
        Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">→</kbd> arrow keys to navigate, <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">Space</kbd> to flip
      </div>
    </div>
  );
}
