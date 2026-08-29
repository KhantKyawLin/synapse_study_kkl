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

    // Shuffle cards for active retrieval training
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setDrillCards(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsFinished(false);
    setSessionResults({ easy: 0, practice: 0, hard: 0 });
  }, [drillDeckType, definitions, questions, isOpen]);

  // Persist ratings to localStorage
  const saveRating = (cardId, rating) => {
    const updated = { ...ratings, [cardId]: rating };
    setRatings(updated);
    try {
      localStorage.setItem('synapse_sq_ratings', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const currentCard = drillCards[currentIndex];

  // Handle rating click
  const handleRate = (rating) => {
    if (!currentCard) return;

    saveRating(currentCard.id, rating);
    setSessionResults((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    if (currentIndex + 1 >= drillCards.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  // Keyboard Shortcuts (Space/Enter to reveal, 1=Hard, 2=Practice, 3=Easy)
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen || isFinished) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!isRevealed) {
          setIsRevealed(true);
        }
      } else if (isRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('practice');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    },
    [isOpen, isRevealed, isFinished, currentIndex, drillCards]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const progressPercent = drillCards.length > 0 ? Math.round(((currentIndex) / drillCards.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-3xl h-[620px] max-h-[92vh] bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-cyanPrimary/40 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-cyanPrimary/10 overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-sky-700 dark:text-cyanPrimary shadow-md shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  ⚡ Speed-Drill Recall Mode
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/30">
                  Active Retrieval
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rapid term & mechanism testing with spaced self-assessment
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onStopAudio();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Mode Selector & Progress Bar */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-[#12161c] border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Deck Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setDrillDeckType('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'questions'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
              }`}
            >
              Short Questions (27)
            </button>
            <button
              onClick={() => setDrillDeckType('definitions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'definitions'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
              }`}
            >
              Definitions (36)
            </button>
            <button
              onClick={() => setDrillDeckType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                drillDeckType === 'all'
                  ? 'bg-cyanPrimary text-white shadow-md'
                  : 'bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
              }`}
            >
              All (63)
            </button>
            <button
              onClick={() => setDrillDeckType('hard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                drillDeckType === 'hard'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#161b22] text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white border border-slate-200 dark:border-transparent'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hard Review</span>
            </button>
          </div>

          {/* Counter Badge */}
          {!isFinished && drillCards.length > 0 && (
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Card <span className="text-sky-600 dark:text-cyanPrimary text-sm font-black">{currentIndex + 1}</span> of{' '}
              <span className="text-slate-900 dark:text-white font-black">{drillCards.length}</span>
            </div>
          )}
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-cyanPrimary to-sky-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
          {isFinished ? (
            /* Session Completed Screen */
            <div className="my-auto py-6 px-4 text-center flex flex-col items-center justify-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Speed-Drill Completed!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                Awesome work! Spaced active recall reinforces long-term medical memory.
              </p>

              {/* Stats Summary Card */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md my-5">
                <div className="p-3.5 bg-white dark:bg-[#161b22] border border-emerald-500/40 rounded-xl text-center shadow-sm">
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold block mb-1">Easy 🟢</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{sessionResults.easy}</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-[#161b22] border border-amber-500/40 rounded-xl text-center shadow-sm">
                  <span className="text-amber-700 dark:text-amber-400 text-xs font-bold block mb-1">Need Practice 🟡</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{sessionResults.practice}</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-[#161b22] border border-rose-500/40 rounded-xl text-center shadow-sm">
                  <span className="text-rose-700 dark:text-rose-400 text-xs font-bold block mb-1">Hard 🔴</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{sessionResults.hard}</span>
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-[#161b22] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Deck</span>
                </button>

                {sessionResults.hard + sessionResults.practice > 0 && (
                  <button
                    onClick={() => {
                      setDrillDeckType('hard');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/25"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Drill Hard Cards ({sessionResults.hard + sessionResults.practice})</span>
                  </button>
                )}
              </div>
            </div>
          ) : currentCard ? (
            /* Active Card */
            <div className="flex-1 flex flex-col justify-between min-h-[420px] bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md dark:shadow-none relative">
              <div className="flex-1 flex flex-col">
                {/* Card Badges & Audio Action */}
                <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-cyanPrimary/15 dark:bg-cyanPrimary/20 text-sky-700 dark:text-cyanGlow border border-cyanPrimary/40">
                      {currentCard.badge}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {currentCard.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onSpeak(currentCard.title + '. ' + (currentCard.questionText || '') + '. ' + (isRevealed ? (currentCard.answerText || '') : ''), currentCard.id)}
                    title={playingAudioId === currentCard.id ? 'Stop Audio' : 'Listen to Pronunciation'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      playingAudioId === currentCard.id
                        ? 'bg-cyanPrimary text-white border-cyanPrimary animate-pulse shadow-md shadow-cyanPrimary/30'
                        : 'bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-cyanPrimary/50'
                    }`}
                  >
                    {playingAudioId === currentCard.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question / Term Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {currentCard.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-4 font-medium">
                  {currentCard.questionText}
                </p>

                {/* Answer Reveal Area */}
                {!isRevealed ? (
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full flex-1 min-h-[180px] py-8 px-6 bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117]/80 dark:hover:bg-[#0d1117] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyanPrimary rounded-2xl text-center text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-cyanGlow transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-inner my-auto"
                  >
                    <Sparkles className="w-6 h-6 text-sky-600 dark:text-cyanPrimary group-hover:scale-110 transition-transform" />
                    <span>Click to Reveal Answer & Key Points</span>
                    <span className="text-[10px] text-slate-500 font-normal">or press Space / Enter</span>
                  </button>
                ) : (
                  <div className="flex-1 p-4 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl animate-fadeIn space-y-3 overflow-y-auto max-h-[220px]">
                    {/* Summary / Definition */}
                    {currentCard.answerText && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {currentCard.answerText}
                      </p>
                    )}

                    {/* Properties (if Definition) */}
                    {currentCard.properties && (
                      <div className="space-y-1 pl-2 border-l-2 border-cyanPrimary/40">
                        {currentCard.properties.map((p, pIdx) => (
                          <p key={pIdx} className="text-[11px] text-slate-600 dark:text-slate-400">
                            • {p}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Comparison Table (if SQ) */}
                    {currentCard.table && (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] shadow-sm">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 dark:bg-[#0d1117] text-slate-800 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
                            <tr>
                              {currentCard.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 last:border-none">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {currentCard.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((c, cIdx) => (
                                  <td key={cIdx} className={`px-3 py-2 border-r border-slate-200 dark:border-slate-800 last:border-none ${cIdx === 0 ? 'font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0d1117]/30' : 'text-slate-700 dark:text-slate-300'}`}>
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
                      <div className="p-2.5 bg-sky-50 dark:bg-[#161b22] border border-sky-200 dark:border-slate-800 rounded-lg text-[11px] text-sky-900 dark:text-cyanGlow flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyanPrimary shrink-0 mt-0.5" />
                        <span><strong>High-Yield:</strong> {currentCard.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Self-Rating Controls (Shown when revealed) */}
              {isRevealed && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 animate-fadeIn shrink-0">
                  <div className="text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                    How well did you recall this topic?
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleRate('hard')}
                      className="py-2 px-3 rounded-xl font-bold text-xs bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>🔴 Hard</span>
                      <span className="hidden sm:inline text-[10px] opacity-75">(1)</span>
                    </button>

                    <button
                      onClick={() => handleRate('practice')}
                      className="py-2 px-3 rounded-xl font-bold text-xs bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>🟡 Practice</span>
                      <span className="hidden sm:inline text-[10px] opacity-75">(2)</span>
                    </button>

                    <button
                      onClick={() => handleRate('easy')}
                      className="py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>🟢 Easy</span>
                      <span className="hidden sm:inline text-[10px] opacity-75">(3)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty Deck State - Consistent Height & Clear Guidance */
            <div className="flex-1 min-h-[420px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm my-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shadow-md">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No Cards in this Deck Selection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                {drillDeckType === 'hard'
                  ? "You haven't marked any cards as 'Hard' yet! Practice Definitions or Short Questions and rate cards to build your revision queue."
                  : "No study items found for this selection."}
              </p>
              <button
                onClick={() => setDrillDeckType('all')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Practice All 63 Items</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Shortcuts Tip */}
        <div className="px-5 py-3 bg-white dark:bg-[#161b22] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">Space</kbd>
            <span>Reveal</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">1</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">2</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">3</kbd>
            <span>Rate</span>
          </div>

          <button
            onClick={() => {
              onStopAudio();
              onClose();
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close Drill
          </button>
        </div>

      </div>
    </div>
  );
}
