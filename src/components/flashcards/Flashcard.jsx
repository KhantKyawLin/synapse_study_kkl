import React from 'react';
import KatexText from '../KatexText';
import { RotateCw } from 'lucide-react';

export default function Flashcard({ card, isFlipped, setIsFlipped }) {
  if (!card) return null;

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="w-full max-w-2xl h-[380px] sm:h-[420px] mx-auto cursor-pointer perspective-1000 select-none group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT FACE (Question) */}
        <div className="absolute inset-0 w-full h-full bg-[#161b22]/90 border border-slate-700/60 group-hover:border-cyanPrimary/60 rounded-2xl p-6 sm:p-10 flex flex-col justify-between backface-hidden shadow-xl shadow-black/40 backdrop-blur-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyanPrimary/15 text-cyanPrimary border border-cyanPrimary/30">
              {card.category || 'General'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <RotateCw className="w-3.5 h-3.5" /> Tap to flip
            </span>
          </div>

          <div className="my-auto text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-relaxed">
              <KatexText text={card.question} />
            </h2>
          </div>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-cyanGlow/80 tracking-wide">
              Click or press Space to reveal answer
            </p>
          </div>
        </div>

        {/* BACK FACE (Answer) */}
        <div className="absolute inset-0 w-full h-full bg-[#1c222b]/95 border border-cyanPrimary/40 rounded-2xl p-6 sm:p-10 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl shadow-cyanPrimary/10 backdrop-blur-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Answer
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <RotateCw className="w-3.5 h-3.5" /> Tap to flip
            </span>
          </div>

          <div className="my-auto text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-300 leading-relaxed">
              <KatexText text={card.answer} />
            </h2>
          </div>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 tracking-wide">
              Click or press Space to view question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
