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
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#161b22] border border-cyanPrimary/40 text-cyanPrimary hover:bg-cyanPrimary/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-black/20"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Counter */}
        <div className="px-5 py-2.5 rounded-xl bg-[#161b22] border border-slate-700/60 font-semibold text-xs sm:text-sm text-slate-300 text-center min-w-[130px]">
          Card <span className="text-cyanPrimary font-bold text-base">{totalCards > 0 ? currentIndex + 1 : 0}</span> of <span className="font-bold text-slate-100">{totalCards}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={totalCards === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-cyanPrimary border border-cyanPrimary text-white hover:bg-cyanPrimary/90 active:scale-[0.98] transition-all shadow-lg shadow-cyanPrimary/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center text-[11px] font-medium text-slate-400 hidden sm:block">
        Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> arrow keys to navigate, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> to flip
      </div>
    </div>
  );
}
