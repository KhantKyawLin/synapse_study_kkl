import React, { useState } from 'react';
import Header from './components/Header';
import FlashcardView from './components/flashcards/FlashcardView';
import DashboardView from './components/dashboard/DashboardView';

export default function App() {
  const [activeView, setActiveView] = useState('flashcards');

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
      <Header activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1">
        {activeView === 'flashcards' && <FlashcardView />}
        {activeView === 'dashboards' && <DashboardView />}
      </main>
    </div>
  );
}
