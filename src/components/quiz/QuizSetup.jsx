import React, { useEffect } from 'react';
import { User, Clock, Award, Filter, AlertCircle, History, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  onOpenHistory,
  historyCount = 0,
}) {
  const { user } = useAuth();

  // Auto pre-populate student name if logged in
  useEffect(() => {
    if (!studentName && user?.user_metadata?.full_name) {
      setStudentName(user.user_metadata.full_name);
    }
  }, [user, studentName, setStudentName]);

  // Clamp count if exceeds totalAvailable
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
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      {/* Top Banner with Exam History Trigger */}
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#161b22]/90 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center text-sky-700 dark:text-cyanPrimary">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">Exam Prep Assessments</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Verified medical certification exams</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#0d1117] border border-slate-300 dark:border-cyanPrimary/40 text-sky-700 dark:text-cyanGlow hover:bg-cyanPrimary hover:text-white transition-all shadow-sm"
        >
          <History className="w-3.5 h-3.5" />
          <span>My History {historyCount > 0 && `(${historyCount})`}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#161b22]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl animate-fadeIn">
        <div className="w-12 h-12 rounded-xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-3 text-sky-700 dark:text-cyanPrimary">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 text-center">Interactive Quiz Setup</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">Enter your name and select topic options to begin</p>

        <form onSubmit={(e) => { e.preventDefault(); if (studentName.trim()) onStartQuiz(); }} className="flex flex-col gap-5">
          {/* Student Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              Student Full Name <span className="text-rose-500">*</span>
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
                className="w-full bg-slate-50 dark:bg-[#1a1e24] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyanPrimary focus:ring-1 focus:ring-cyanPrimary transition-all"
              />
            </div>
          </div>

          {/* Module Select Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              System / Module
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

          {/* Topic / Sub-Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Topic / Category Filter
              </label>
              {categories.length > 0 && (
                <span className="text-[11px] text-sky-700 dark:text-cyanPrimary font-semibold">
                  {categories.length} topics available
                </span>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="custom-select w-full"
            >
              <option value="All">All Topics ({modules.find((m) => m === selectedModule) ? totalAvailable : 0} Questions)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Number of Questions
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {totalAvailable} available in selection
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '5 Qs', value: '5', count: 5 },
                { label: '10 Qs', value: '10', count: 10 },
                { label: '20 Qs', value: '20', count: 20 },
                { label: `All (${totalAvailable})`, value: 'all', count: totalAvailable },
              ].map((opt) => {
                const isSelected = questionCount === opt.value;
                const isSelectable = opt.value === 'all' ? totalAvailable > 0 : totalAvailable >= opt.count;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isSelectable && opt.value !== 'all'}
                    onClick={() => setQuestionCount(opt.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isSelected
                        ? 'bg-cyanPrimary text-white border-cyanPrimary shadow-md shadow-cyanPrimary/30'
                        : isSelectable
                        ? 'bg-slate-100 dark:bg-[#1a1e24] border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Details Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 dark:text-cyanPrimary" />
              <span>Time Allowed: <strong className="text-slate-900 dark:text-white font-bold">{minutes} Minutes</strong></span>
            </div>
            <span>(2 mins / question)</span>
          </div>

          {/* Start Quiz Button */}
          <button
            type="submit"
            disabled={totalAvailable === 0 || !studentName.trim()}
            className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-lg shadow-cyanPrimary/25 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Start Timed Assessment
          </button>
        </form>
      </div>
    </div>
  );
}
