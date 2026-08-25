import React, { useState } from 'react';
import Header from './components/Header';
import FlashcardView from './components/flashcards/FlashcardView';
import DashboardView from './components/dashboard/DashboardView';
import QuizView from './components/quiz/QuizView';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [activeView, setActiveView] = useState('flashcards');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans">
        <Header activeView={activeView} setActiveView={setActiveView} />

        <main className="flex-1">
          {activeView === 'flashcards' && <FlashcardView />}
          {activeView === 'dashboards' && <DashboardView />}
          {activeView === 'quiz' && <QuizView />}
        </main>

        <AuthModal />
      </div>
    </AuthProvider>
  );
}
