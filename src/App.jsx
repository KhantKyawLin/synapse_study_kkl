import React, { useState } from 'react';
import Header from './components/Header';
import FlashcardView from './components/flashcards/FlashcardView';
import DashboardView from './components/dashboard/DashboardView';
import QuizView from './components/quiz/QuizView';
import HighYieldQAView from './components/qa/HighYieldQAView';
import AdminDashboardView from './components/admin/AdminDashboardView';
import AuthModal from './components/auth/AuthModal';
import AccountSettingsModal from './components/auth/AccountSettingsModal';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [activeView, setActiveView] = useState('flashcards');

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#0f141c] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          <Header activeView={activeView} setActiveView={setActiveView} />

          <main className="flex-1">
            {activeView === 'flashcards' && <FlashcardView />}
            {activeView === 'dashboards' && <DashboardView />}
            {activeView === 'qa' && <HighYieldQAView />}
            {activeView === 'quiz' && <QuizView />}
            {activeView === 'admin' && <AdminDashboardView />}
          </main>

          <AuthModal onAuthSuccess={() => setActiveView('flashcards')} />
          <AccountSettingsModal onSaveSuccess={() => setActiveView('flashcards')} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
