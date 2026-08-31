import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuizSetup from './QuizSetup';
import QuizCard from './QuizCard';
import QuizResult from './QuizResult';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { useAuth } from '../../context/AuthContext';
import { Lock, Award, Clock, Sparkles, ShieldCheck, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import rawQuizData from '../../data/quizzes_data.json';

export default function QuizView() {
  const { user, openAuthModal, openAccountSettings } = useAuth();
  const { history, saveQuizAttempt } = useQuizHistory();

  const modules = useMemo(() => Object.keys(rawQuizData || {}), []);
  const [selectedModule, setSelectedModule] = useState(modules[0] || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [questionCount, setQuestionCount] = useState('10');
  const [studentName, setStudentName] = useState('');

  const [quizState, setQuizState] = useState('setup'); // 'setup' | 'active' | 'result'
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  // Timer states
  const [totalAllocatedSeconds, setTotalAllocatedSeconds] = useState(1200);
  const [timeRemaining, setTimeRemaining] = useState(1200);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  const isAttemptSaved = useRef(false);

  // All questions in the selected module
  const moduleQuestions = useMemo(() => {
    return rawQuizData[selectedModule] || [];
  }, [selectedModule]);

  // Extract available sub-categories / topics for the selected module
  const categories = useMemo(() => {
    const cats = new Set();
    moduleQuestions.forEach((q) => {
      if (q.category && q.category !== selectedModule) {
        cats.add(q.category);
      }
    });
    return Array.from(cats).sort();
  }, [moduleQuestions, selectedModule]);

  // Reset selected category to 'All' when selected module changes
  useEffect(() => {
    setSelectedCategory('All');
  }, [selectedModule]);

  // Questions filtered by both module and sub-category
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'All') return moduleQuestions;
    return moduleQuestions.filter((q) => q.category === selectedCategory);
  }, [moduleQuestions, selectedCategory]);

  // Handle quiz timer interval
  useEffect(() => {
    let timer = null;
    if (quizState === 'active' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeExpired(true);
            completeAndSubmitQuiz(); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizState, timeRemaining]);

  const handleStartQuiz = () => {
    if (filteredQuestions.length === 0) return;
    const count = questionCount === 'all' ? filteredQuestions.length : Math.min(parseInt(questionCount, 10), filteredQuestions.length);
    const selected = filteredQuestions.slice(0, count);

    // Calculate time limit (5 -> 10m, 10 -> 20m, 20 -> 40m, etc.)
    let allocatedMinutes = 10;
    if (questionCount === '5') allocatedMinutes = 10;
    else if (questionCount === '10') allocatedMinutes = 20;
    else if (questionCount === '20') allocatedMinutes = 40;
    else allocatedMinutes = Math.max(10, selected.length * 2);

    const seconds = allocatedMinutes * 60;
    setTotalAllocatedSeconds(seconds);
    setTimeRemaining(seconds);
    setIsTimeExpired(false);

    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    isAttemptSaved.current = false;
    setQuizState('active');
  };

  const handleSelectOption = (optIdx) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  // Complete Quiz & Log attempt to Supabase / Local Storage
  const completeAndSubmitQuiz = () => {
    if (!isAttemptSaved.current && activeQuestions.length > 0) {
      let score = 0;
      activeQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) score++;
      });

      const percentage = Math.round((score / activeQuestions.length) * 100);
      const timeSpentSecs = totalAllocatedSeconds - timeRemaining;
      const isFullQuiz = questionCount === 'all' || activeQuestions.length === filteredQuestions.length;

      saveQuizAttempt({
        student_name: studentName.trim() || user?.user_metadata?.full_name || 'Student',
        module_name: selectedModule,
        category: selectedCategory,
        score: score,
        total_questions: activeQuestions.length,
        percentage: percentage,
        is_full_quiz: isFullQuiz,
        time_spent_seconds: timeSpentSecs,
        total_allocated_seconds: totalAllocatedSeconds,
        completed_at: new Date().toISOString(),
      });

      isAttemptSaved.current = true;
    }
    setQuizState('result');
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      completeAndSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const timeSpent = totalAllocatedSeconds - timeRemaining;

  // GUEST LOCK SCREEN: If not logged in, restrict Quiz feature
  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
        <div className="bg-white dark:bg-[#161b22]/90 border border-slate-200 dark:border-cyanPrimary/30 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/70 backdrop-blur-xl text-center relative overflow-hidden transition-colors duration-200">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-cyanPrimary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Lock Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-cyanPrimary/15 dark:bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-4 text-sky-700 dark:text-cyanPrimary shadow-lg shadow-cyanPrimary/20">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Student Sign-In Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
            Timed exam assessments, verified completion certificates, and prestige frames require a student account to save your study scores and progress.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8 text-xs text-slate-800 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold shadow-sm">
              <Clock className="w-4 h-4 text-sky-700 dark:text-cyanPrimary shrink-0" />
              <span>Timed Board Exam Countdown</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold shadow-sm">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Downloadable Verified Certificates</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Unlockable Prestige Borders</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Cloud Sync Across All Devices</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyanPrimary to-sky-600 text-white shadow-md shadow-cyanPrimary/25 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-slate-100 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW: Full Quiz Experience
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8">
      {quizState === 'setup' && (
        <QuizSetup
          modules={modules}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          totalAvailable={filteredQuestions.length}
          studentName={studentName}
          setStudentName={setStudentName}
          onStartQuiz={handleStartQuiz}
          onOpenHistory={() => openAccountSettings('history')}
          historyCount={history.length}
        />
      )}

      {quizState === 'active' && activeQuestions.length > 0 && (
        <QuizCard
          question={activeQuestions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={activeQuestions.length}
          selectedOption={userAnswers[currentIndex] !== undefined ? userAnswers[currentIndex] : null}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
          onPrev={handlePrev}
          studentName={studentName}
          timeRemaining={timeRemaining}
        />
      )}

      {quizState === 'result' && (
        <QuizResult
          questions={activeQuestions}
          userAnswers={userAnswers}
          studentName={studentName}
          timeSpent={timeSpent}
          totalAllocatedSeconds={totalAllocatedSeconds}
          isTimeExpired={isTimeExpired}
          onRestart={handleStartQuiz}
          onChooseNewQuiz={() => setQuizState('setup')}
          onOpenHistory={() => openAccountSettings('history')}
        />
      )}
    </div>
  );
}
