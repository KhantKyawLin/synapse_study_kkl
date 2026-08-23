import React, { useEffect } from 'react';
import { User, Clock, Award, Filter, AlertCircle } from 'lucide-react';

export default function QuizSetup({
  modules,
  selectedModule,
  setSelectedModule,
  categories,
  selectedCategory,
  setSelectedCategory,
  questionCount,
  setQuestionCount,
  totalAvailable,
  studentName,
  setStudentName,
  onStartQuiz,
}) {
  // If totalAvailable is smaller than currently selected questionCount (e.g. topic has 7, but 20 selected),
  // auto-adjust or clamp to 'all' so student gets clean options
  useEffect(() => {
    if (questionCount !== 'all') {
      const requested = parseInt(questionCount, 10);
      if (!isNaN(requested) && requested > totalAvailable && totalAvailable > 0) {
        setQuestionCount('all');
      }
    }
  }, [totalAvailable, questionCount, setQuestionCount]);

  // Calculate actual questions that will be loaded
  const actualCount = questionCount === 'all'
    ? totalAvailable
    : Math.min(parseInt(questionCount, 10) || totalAvailable, totalAvailable);

  // Calculate allocated minutes (2 mins per question, min 10 mins)
  const minutes = Math.max(10, actualCount * 2);

  return (
    <div className="w-full max-w-xl mx-auto bg-[#161b22]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-fadeIn">
      <div className="w-12 h-12 rounded-xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-3 text-cyanPrimary">
        <Award className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1 text-center">Interactive Quiz Setup</h2>
      <p className="text-slate-400 text-sm text-center mb-6">Enter your name and select topic options to begin</p>

      <form onSubmit={(e) => { e.preventDefault(); if (studentName.trim()) onStartQuiz(); }} className="flex flex-col gap-5">
        {/* Student Name Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
            Student Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Khant Kyaw Lin"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-[#1a1e24] border border-sky-500/30 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
            />
          </div>
        </div>

        {/* Quiz Module Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
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

        {/* Sub-Category / Topic Selector */}
        {categories && categories.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyanPrimary" /> Filter by Sub-Topic / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="custom-select w-full"
            >
              <option value="All">All Sub-Topics</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Question Quantity Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 ml-1">
            Number of Questions
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="custom-select w-full"
          >
            {totalAvailable >= 5 && <option value="5">5 Questions (10 Minutes)</option>}
            {totalAvailable >= 10 && <option value="10">10 Questions (20 Minutes)</option>}
            {totalAvailable >= 20 && <option value="20">20 Questions (40 Minutes)</option>}
            <option value="all">
              All Available ({totalAvailable} Questions - {Math.max(10, totalAvailable * 2)} Mins)
            </option>
          </select>
        </div>

        {/* Info Note if Question Count Clamped */}
        {questionCount !== 'all' && parseInt(questionCount, 10) > totalAvailable && totalAvailable > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>This topic has {totalAvailable} questions. All {totalAvailable} questions will be loaded.</span>
          </div>
        )}

        {/* Timer Badge Preview */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#13171f] border border-slate-800 rounded-xl text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyanPrimary" /> Allocated Time ({actualCount} Questions):
          </span>
          <span className="text-cyanGlow font-bold">
            {minutes} Minutes ({minutes * 60} Seconds)
          </span>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          disabled={totalAvailable === 0 || !studentName.trim()}
          className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Timed Quiz ({actualCount} Questions)
        </button>
      </form>
    </div>
  );
}
