import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FilterBar from './FilterBar';
import Flashcard from './Flashcard';
import CardControls from './CardControls';
import rawData from '../../data/data.json';

export default function FlashcardView() {
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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

  // Filtered cards list
  const filteredCards = useMemo(() => {
    return rawData.cards.filter((card) => {
      const parts = card.category ? card.category.split(' - ') : ['General'];
      const mod = parts[0] ? parts[0].trim() : 'General';
      const cat = parts[1] ? parts[1].trim() : parts[0] || 'General';

      const matchModule = selectedModule === 'All' || mod === selectedModule;
      const matchCategory = selectedCategory === 'All' || cat === selectedCategory;

      return matchModule && matchCategory;
    });
  }, [selectedModule, selectedCategory]);

  // Reset index & flip state when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filteredCards]);

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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center min-h-[calc(100vh-100px)]">
      <FilterBar
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {filteredCards.length > 0 ? (
        <>
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
          />

          <CardControls
            currentIndex={currentIndex}
            totalCards={filteredCards.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-[#161b22]/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 font-semibold text-lg">No cards found matching your selection.</p>
        </div>
      )}
    </div>
  );
}
