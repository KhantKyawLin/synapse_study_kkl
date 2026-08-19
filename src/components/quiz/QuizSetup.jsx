import React from 'react';

export default function QuizSetup({
  modules,
  selectedModule,
  setSelectedModule,
  questionCount,
  setQuestionCount,
  totalAvailable,
  onStartQuiz,
}) {
  return (
    <div className="w-full max-w-xl mx-auto bg-[#161b22]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Interactive Quiz Setup</h2>
      <p className="text-slate-400 text-sm text-center mb-6">Choose a module and question count to begin</p>

      <div className="flex flex-col gap-5">
        {/* Quiz Module Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
            Select Quiz Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="custom-select w-full"
          >
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Question Quantity Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
            Number of Questions
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="custom-select w-full"
          >
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="20">20 Questions</option>
            <option value="all">All Available ({totalAvailable})</option>
          </select>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartQuiz}
          disabled={totalAvailable === 0}
          className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all disabled:opacity-40"
        >
          Start Quiz Now
        </button>
      </div>
    </div>
  );
}
