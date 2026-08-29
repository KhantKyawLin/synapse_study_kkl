import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FilterBar from './FilterBar';
import Flashcard from './Flashcard';
import CardControls from './CardControls';
import rawData from '../../data/data.json';
import { Bookmark, CheckCircle2, Cloud } from 'lucide-react';
import { useFlashcardSync } from '../../hooks/useFlashcardSync';

export default function FlashcardView() {
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'review' | 'mastered'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Use the cloud-synced flashcard hook (with automatic localStorage fallback)
  const { cardStatusMap, handleToggleStatus, getCardId, isSyncing, cloudSynced } = useFlashcardSync();

  // Parse modules and categories from rawData
  const { modules, categoryMap } = useMemo(() => {
    const mods = new Set();
    const map = {};

    rawData.cards.forEach((card) => {
      const parts = card.category ? card.category.split(' - ') : ['General'];
      const mod = parts[0] ? parts[0].trim() : 'General';
      const cat = parts[1] ? parts[1].trim() : parts[0] || 'General';

      mods.add(mod);
      if (!map[mod]) map[mod] = new Set();
      map[mod].add(cat);
    });

    return {
      modules: Array.from(mods).sort(),
      categoryMap: map,
    };
  }, []);

  // Compute available categories based on selected module
  const categories = useMemo(() => {
    if (selectedModule === 'All') {
      const allCats = new Set();
      Object.values(categoryMap).forEach((catSet) => {
        catSet.forEach((c) => allCats.add(c));
      });
      return Array.from(allCats).sort();
    }
    return categoryMap[selectedModule]
      ? Array.from(categoryMap[selectedModule]).sort()
      : [];
  }, [selectedModule, categoryMap]);

  // Reset category selection when module changes
  useEffect(() => {
    setSelectedCategory('All');
  }, [selectedModule]);

  // Subject/Category Filtered Cards
  const moduleCategoryFilteredCards = useMemo(() => {
    return rawData.cards.filter((card) => {
      const parts = card.category ? card.category.split(' - ') : ['General'];
      const mod = parts[0] ? parts[0].trim() : 'General';
      const cat = parts[1] ? parts[1].trim() : parts[0] || 'General';

      const matchModule = selectedModule === 'All' || mod === selectedModule;
      const matchCategory = selectedCategory === 'All' || cat === selectedCategory;

      return matchModule && matchCategory;
    });
  }, [selectedModule, selectedCategory]);

  // Compute Counts for Status Badges
  const { totalCount, reviewCount, masteredCount } = useMemo(() => {
    let review = 0;
    let mastered = 0;

    moduleCategoryFilteredCards.forEach((card) => {
      const id = getCardId(card);
      const st = cardStatusMap[id];
      if (st === 'review') review++;
      else if (st === 'mastered') mastered++;
    });

    return {
      totalCount: moduleCategoryFilteredCards.length,
      reviewCount: review,
      masteredCount: mastered,
    };
  }, [moduleCategoryFilteredCards, cardStatusMap, getCardId]);

  // Final Filtered Cards (Subject/Category + Status Filter)
  const filteredCards = useMemo(() => {
    if (statusFilter === 'all') {
      return moduleCategoryFilteredCards;
    }
    return moduleCategoryFilteredCards.filter((card) => {
      const id = getCardId(card);
      return cardStatusMap[id] === statusFilter;
    });
  }, [moduleCategoryFilteredCards, statusFilter, cardStatusMap, getCardId]);

  // Reset index & flip state ONLY when dropdown filters or status tab changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedModule, selectedCategory, statusFilter]);

  // Safely clamp index if cards leave filtered view (e.g., untoggling review status inside Review Tab)
  useEffect(() => {
    if (filteredCards.length > 0 && currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
  }, [filteredCards.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const currentCard = filteredCards[currentIndex];
  const currentCardStatus = currentCard ? cardStatusMap[getCardId(currentCard)] : undefined;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col justify-start">
      <FilterBar
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={totalCount}
        reviewCount={reviewCount}
        masteredCount={masteredCount}
      />

      {filteredCards.length > 0 ? (
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          cardStatus={currentCardStatus}
          onToggleStatus={(status) => handleToggleStatus(currentCard, status)}
        />
      ) : (
        <div className="w-full max-w-2xl h-[390px] sm:h-[430px] mx-auto bg-white dark:bg-[#161b22]/90 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/60 dark:shadow-black/40 backdrop-blur-xl">
          {statusFilter === 'review' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md shadow-amber-500/10">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Cards Marked for Review</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm">
                Click the <span className="text-amber-600 dark:text-amber-300 font-semibold">📌 Review</span> button on any flashcard to save it here for targeted revision!
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-amber-500/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                View All Cards ({totalCount})
              </button>
            </div>
          ) : statusFilter === 'mastered' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Cards Marked as Mastered</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm">
                Click the <span className="text-emerald-600 dark:text-emerald-300 font-semibold">💚 Know</span> button on cards you've mastered to track your progress!
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                View All Cards ({totalCount})
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-600 dark:text-slate-400 font-semibold text-base">No cards found matching your selection.</p>
              <button
                onClick={() => {
                  setSelectedModule('All');
                  setSelectedCategory('All');
                  setStatusFilter('all');
                }}
                className="mt-2 px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      <CardControls
        currentIndex={currentIndex}
        totalCards={filteredCards.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
