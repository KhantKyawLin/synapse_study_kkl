import React from 'react';
import { Layers, LayoutDashboard, HelpCircle } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function Header({ activeView, setActiveView }) {
  return (
    <header className="w-full bg-[#161b22]/70 backdrop-blur-md border-b border-sky-500/20 px-4 py-3 sm:px-8 sm:py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo Container */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('flashcards')}>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-cyanPrimary/40 shadow-lg shadow-cyanPrimary/10">
            <img src={logoImg} alt="Synapse Study" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            <span className="text-cyanPrimary">SYNAPSE</span> STUDY
          </h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-[#0d1117] p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveView('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeView === 'flashcards'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveView('dashboards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeView === 'dashboards'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboards</span>
          </button>

          <button
            onClick={() => setActiveView('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeView === 'quiz'
                ? 'bg-cyanPrimary text-white shadow-md shadow-cyanPrimary/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quiz</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
