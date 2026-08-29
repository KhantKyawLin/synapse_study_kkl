import React from 'react';
import KatexText from '../KatexText';
import { RotateCw, CheckCircle2, Bookmark } from 'lucide-react';

export default function Flashcard({
  card,
  isFlipped,
  setIsFlipped,
  cardStatus,
  onToggleStatus,
}) {
  if (!card) return null;

  const isMastered = cardStatus === 'mastered';
  const isReview = cardStatus === 'review';

  const handleAction = (e, status) => {
    e.stopPropagation(); // Prevent card from flipping when clicking status buttons
    onToggleStatus(status);
  };

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="w-full max-w-2xl h-[390px] sm:h-[430px] mx-auto cursor-pointer perspective-1000 select-none group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT FACE (Question) */}
        <div className={`absolute inset-0 w-full h-full bg-white dark:bg-[#161b22]/90 border rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-xl shadow-slate-200/60 dark:shadow-black/40 backdrop-blur-xl transition-all ${
          isMastered
            ? 'border-emerald-500/60 shadow-emerald-500/10'
            : isReview
            ? 'border-amber-500/60 shadow-amber-500/10'
            : 'border-slate-200 dark:border-slate-700/60 group-hover:border-cyanPrimary/60'
        }`}>
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyanPrimary/10 dark:bg-cyanPrimary/15 text-sky-700 dark:text-cyanPrimary border border-cyanPrimary/30 truncate max-w-[60%]">
              {card.category || 'General'}
            </span>
            
            {/* Status Quick Badges / Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleAction(e, 'review')}
                title="Bookmark for Needs Review"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  isReview
                    ? 'bg-amber-500/25 text-amber-600 dark:text-amber-300 border-amber-500/60'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-500/40'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isReview ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Review</span>
              </button>

              <button
                onClick={(e) => handleAction(e, 'mastered')}
                title="Mark as Know (Mastered)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  isMastered
                    ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-500/40'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">Know</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-auto text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
              <KatexText text={card.question} />
            </h2>
          </div>

          {/* Bottom Flip Prompt */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-sky-600 dark:text-cyanGlow/80 flex items-center gap-1 font-bold">
              <RotateCw className="w-3.5 h-3.5" /> Tap to reveal answer
            </span>
            {isMastered && <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Mastered</span>}
            {isReview && <span className="text-amber-600 dark:text-amber-400 font-bold">📌 Needs Review</span>}
          </div>
        </div>

        {/* BACK FACE (Answer) */}
        <div className={`absolute inset-0 w-full h-full bg-slate-50/95 dark:bg-[#1c222b]/95 border rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl backdrop-blur-xl transition-all ${
          isMastered
            ? 'border-emerald-500/60 shadow-emerald-500/10'
            : isReview
            ? 'border-amber-500/60 shadow-amber-500/10'
            : 'border-cyanPrimary/40 shadow-cyanPrimary/10'
        }`}>
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Answer
            </span>
            
            {/* Status Quick Badges / Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleAction(e, 'review')}
                title="Bookmark for Needs Review"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  isReview
                    ? 'bg-amber-500/25 text-amber-600 dark:text-amber-300 border-amber-500/60'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-500/40'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isReview ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Review</span>
              </button>

              <button
                onClick={(e) => handleAction(e, 'mastered')}
                title="Mark as Know (Mastered)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  isMastered
                    ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-500/40'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">Know</span>
              </button>
            </div>
          </div>

          {/* Answer Text */}
          <div className="my-auto text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <KatexText text={card.answer} />
            </h2>
          </div>

          {/* Bottom Flip Prompt */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold">
              <RotateCw className="w-3.5 h-3.5" /> Tap to view question
            </span>
            {isMastered && <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Mastered</span>}
            {isReview && <span className="text-amber-600 dark:text-amber-400 font-bold">📌 Needs Review</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
