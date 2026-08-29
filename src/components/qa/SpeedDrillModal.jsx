import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Zap, Sparkles, Volume2, VolumeX, ChevronRight, ChevronLeft, 
  RotateCcw, CheckCircle2, AlertTriangle, Flame, ArrowRight, Table,
  Layers, BookOpen, RefreshCw
} from 'lucide-react';

export default function SpeedDrillModal({
  isOpen,
  onClose,
  definitions = [],
  questions = [],
  playingAudioId,
  onSpeak,
  onStopAudio
}) {
  const [drillDeckType, setDrillDeckType] = useState('questions'); // 'questions' | 'definitions' | 'all' | 'hard'
  const [drillCards, setDrillCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_sq_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [sessionResults, setSessionResults] = useState({ easy: 0, practice: 0, hard: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Cards based on selected Deck Type
  useEffect(() => {
    let pool = [];
    if (drillDeckType === 'definitions') {
      pool = definitions.map((d) => ({
        id: d.id,
        type: 'def',
        badge: 'Definition',
        category: d.category,
        title: d.term,
        questionText: `What is the medical definition and key concept of "${d.term}"?`,
        answerText: d.definition,
        properties: d.properties,
        notes: d.notes,
      }));
    } else if (drillDeckType === 'questions') {
      pool = questions.map((q) => ({
        id: q.id,
        type: 'sq',
        badge: `SQ ${q.num}`,
        category: q.category,
        title: q.title,
        questionText: q.question,
        answerText: q.summary,
        table: q.table,
        sections: q.sections,
      }));
    } else if (drillDeckType === 'hard') {
      const hardIds = Object.keys(ratings).filter((id) => ratings[id] === 'hard' || ratings[id] === 'practice');
      const hardDefs = definitions
        .filter((d) => hardIds.includes(d.id))
        .map((d) => ({
          id: d.id,
          type: 'def',
          badge: 'Definition',
          category: d.category,
          title: d.term,
          questionText: `What is the medical definition and key concept of "${d.term}"?`,
          answerText: d.definition,
          properties: d.properties,
          notes: d.notes,
        }));
      const hardSQs = questions
        .filter((q) => hardIds.includes(q.id))
        .map((q) => ({
          id: q.id,
          type: 'sq',
          badge: `SQ ${q.num}`,
          category: q.category,
          title: q.title,
          questionText: q.question,
          answerText: q.summary,
          table: q.table,
          sections: q.sections,
        }));
      pool = [...hardSQs, ...hardDefs];
    } else {
      // All
      const defPool = definitions.map((d) => ({
        id: d.id,
        type: 'def',
        badge: 'Definition',
        category: d.category,
        title: d.term,
        questionText: `What is the medical definition and key concept of "${d.term}"?`,
        answerText: d.definition,
        properties: d.properties,
        notes: d.notes,
      }));
      const sqPool = questions.map((q) => ({
        id: q.id,
        type: 'sq',
        badge: `SQ ${q.num}`,
        category: q.category,
        title: q.title,
        questionText: q.question,
        answerText: q.summary,
        table: q.table,
        sections: q.sections,
      }));
      pool = [...sqPool, ...defPool];
    }

    // Shuffle pool for effective spaced retrieval
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDrillCards(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsFinished(false);
    setSessionResults({ easy: 0, practice: 0, hard: 0 });
  }, [drillDeckType, definitions, questions]);

  // Handle Rating Click
  const handleRate = useCallback((rateType) => {
    if (drillCards.length === 0) return;
    const currentCard = drillCards[currentIndex];

    // Save rating
    const updated = { ...ratings, [currentCard.id]: rateType };
    setRatings(updated);
    try {
      localStorage.setItem('synapse_sq_ratings', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    setSessionResults((prev) => ({
      ...prev,
      [rateType]: prev[rateType] + 1,
    }));

    // Advance
    if (currentIndex + 1 < drillCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
    }
  }, [drillCards, currentIndex, ratings]);

  // Keyboard Shortcuts (Space to reveal, 1=Hard, 2=Practice, 3=Easy)
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
      } else if (isRevealed) {
        if (e.key === '1') {
          handleRate('hard');
        } else if (e.key === '2') {
          handleRate('practice');
        } else if (e.key === '3') {
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, isRevealed, handleRate]);

  if (!isOpen) return null;

  const currentCard = drillCards[currentIndex];
  const progressPercent = drillCards.length > 0 ? Math.round(((currentIndex + 1) / drillCards.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0d1117] border border-cyanPrimary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-cyanPrimary shadow-md">
              <Zap className="w-5 h-5 fill-cyanPrimary/30" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Speed-Drill Recall Mode</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Active retrieval practice with spaced self-ratings
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onStopAudio();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Mode Selector & Progress Bar */}
        <div className="px-5 py-3 bg-[#12161c] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Deck Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setDrillDeckType('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'questions'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-[#161b22] text-slate-400 hover:text-white'
              }`}
            >
              Short Questions (27)
            </button>
            <button
              onClick={() => setDrillDeckType('definitions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'definitions'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-[#161b22] text-slate-400 hover:text-white'
              }`}
            >
              Definitions (36)
            </button>
            <button
              onClick={() => setDrillDeckType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'all'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-[#161b22] text-slate-400 hover:text-white'
              }`}
            >
              All (63)
            </button>
            <button
              onClick={() => setDrillDeckType('hard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                drillDeckType === 'hard'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-[#161b22] text-rose-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hard Review</span>
            </button>
          </div>

          {/* Counter Badge */}
          {!isFinished && drillCards.length > 0 && (
            <div className="text-xs font-bold text-slate-300 shrink-0">
              Card <span className="text-cyanPrimary text-sm font-black">{currentIndex + 1}</span> of{' '}
              <span className="text-white font-black">{drillCards.length}</span>
            </div>
          )}
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyanPrimary to-sky-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isFinished ? (
            /* Session Completed Screen */
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white">Speed-Drill Completed!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Awesome work! Spaced active recall reinforces long-term medical memory.
              </p>

              {/* Stats Summary Card */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md my-6">
                <div className="p-3.5 bg-[#161b22] border border-emerald-500/40 rounded-xl text-center">
                  <span className="text-emerald-400 text-xs font-bold block mb-1">Easy 🟢</span>
                  <span className="text-2xl font-black text-white">{sessionResults.easy}</span>
                </div>
                <div className="p-3.5 bg-[#161b22] border border-amber-500/40 rounded-xl text-center">
                  <span className="text-amber-400 text-xs font-bold block mb-1">Need Practice 🟡</span>
                  <span className="text-2xl font-black text-white">{sessionResults.practice}</span>
                </div>
                <div className="p-3.5 bg-[#161b22] border border-rose-500/40 rounded-xl text-center">
                  <span className="text-rose-400 text-xs font-bold block mb-1">Hard 🔴</span>
                  <span className="text-2xl font-black text-white">{sessionResults.hard}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const shuffled = [...drillCards].sort(() => Math.random() - 0.5);
                    setDrillCards(shuffled);
                    setCurrentIndex(0);
                    setIsRevealed(false);
                    setIsFinished(false);
                    setSessionResults({ easy: 0, practice: 0, hard: 0 });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#161b22] border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Deck</span>
                </button>

                {sessionResults.hard + sessionResults.practice > 0 && (
                  <button
                    onClick={() => {
                      setDrillDeckType('hard');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/25"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Drill Hard Cards ({sessionResults.hard + sessionResults.practice})</span>
                  </button>
                )}
              </div>
            </div>
          ) : currentCard ? (
            /* Active Card */
            <div className="flex flex-col justify-between min-h-[380px] bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl relative">
              <div>
                {/* Card Badges & Audio Action */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-cyanPrimary/20 text-cyanGlow border border-cyanPrimary/40">
                      {currentCard.badge}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {currentCard.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onSpeak(currentCard.title + '. ' + (currentCard.questionText || '') + '. ' + (isRevealed ? (currentCard.answerText || '') : ''), currentCard.id)}
                    title={playingAudioId === currentCard.id ? 'Stop Audio' : 'Listen to Pronunciation'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      playingAudioId === currentCard.id
                        ? 'bg-cyanPrimary text-white border-cyanPrimary animate-pulse shadow-md shadow-cyanPrimary/30'
                        : 'bg-[#0d1117] text-slate-300 border-slate-700 hover:border-cyanPrimary/50'
                    }`}
                  >
                    {playingAudioId === currentCard.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-cyanPrimary" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question / Term Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                  {currentCard.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 font-medium">
                  {currentCard.questionText}
                </p>

                {/* Answer Reveal Area */}
                {!isRevealed ? (
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-12 px-6 bg-[#0d1117]/80 hover:bg-[#0d1117] border-2 border-dashed border-slate-700 hover:border-cyanPrimary rounded-2xl text-center text-sm font-bold text-slate-300 hover:text-cyanGlow transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-inner"
                  >
                    <Sparkles className="w-6 h-6 text-cyanPrimary group-hover:scale-110 transition-transform" />
                    <span>Click to Reveal Answer & Key Points</span>
                    <span className="text-[10px] text-slate-500 font-normal">or press Space / Enter</span>
                  </button>
                ) : (
                  <div className="p-4 bg-[#0d1117] border border-slate-800 rounded-xl animate-fadeIn space-y-3">
                    {/* Summary / Definition */}
                    {currentCard.answerText && (
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {currentCard.answerText}
                      </p>
                    )}

                    {/* Properties (if Definition) */}
                    {currentCard.properties && (
                      <div className="space-y-1 pl-2 border-l-2 border-cyanPrimary/40">
                        {currentCard.properties.map((p, pIdx) => (
                          <p key={pIdx} className="text-[11px] text-slate-400">
                            • {p}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Comparison Table (if SQ) */}
                    {currentCard.table && (
                      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#161b22]">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-[#0d1117] text-slate-300 font-bold border-b border-slate-800 uppercase">
                            <tr>
                              {currentCard.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-3 py-2 border-r border-slate-800 last:border-none">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {currentCard.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((c, cIdx) => (
                                  <td key={cIdx} className={`px-3 py-2 border-r border-slate-800 last:border-none ${cIdx === 0 ? 'font-bold text-white bg-[#0d1117]/30' : 'text-slate-300'}`}>
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* High Yield Note */}
                    {currentCard.notes && (
                      <div className="p-2.5 bg-[#161b22] border border-slate-800 rounded-lg text-[11px] text-cyanGlow flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyanPrimary shrink-0 mt-0.5" />
                        <span><strong>High-Yield:</strong> {currentCard.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Self-Rating Controls (Shown when revealed) */}
              {isRevealed && (
                <div className="mt-6 pt-4 border-t border-slate-800/80 animate-fadeIn">
                  <div className="text-center text-[11px] font-bold text-slate-400 mb-2.5">
                    How well did you recall this topic?
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleRate('hard')}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🔴 Hard</span>
                      <span className="hidden sm:inline text-[10px] opacity-60">(1)</span>
                    </button>

                    <button
                      onClick={() => handleRate('practice')}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🟡 Practice</span>
                      <span className="hidden sm:inline text-[10px] opacity-60">(2)</span>
                    </button>

                    <button
                      onClick={() => handleRate('easy')}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🟢 Easy</span>
                      <span className="hidden sm:inline text-[10px] opacity-60">(3)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              No cards in this deck selection.
            </div>
          )}
        </div>

        {/* Modal Footer Shortcuts Tip */}
        <div className="px-5 py-3 bg-[#161b22] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd>
            <span>Reveal</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">1</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">2</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">3</kbd>
            <span>Rate</span>
          </div>

          <button
            onClick={() => {
              onStopAudio();
              onClose();
            }}
            className="text-xs font-bold text-slate-300 hover:text-white"
          >
            Close Drill
          </button>
        </div>

      </div>
    </div>
  );
}
