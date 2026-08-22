import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuizSetup from './QuizSetup';
import QuizCard from './QuizCard';
import QuizResult from './QuizResult';
import rawQuizData from '../../data/quizzes_data.json';

export default function QuizView() {
  const modules = useMemo(() => Object.keys(rawQuizData || {}), []);
  const [selectedModule, setSelectedModule] = useState(modules[0] || '');
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

  const availableQuestions = useMemo(() => {
    return rawQuizData[selectedModule] || [];
  }, [selectedModule]);

  // Handle quiz timer interval
  useEffect(() => {
    let timer = null;
    if (quizState === 'active' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeExpired(true);
            setQuizState('result'); // Auto-submit when time expires
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
    if (availableQuestions.length === 0) return;
    const count = questionCount === 'all' ? availableQuestions.length : Math.min(parseInt(questionCount, 10), availableQuestions.length);
    const selected = availableQuestions.slice(0, count);

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
    setQuizState('active');
  };

  const handleSelectOption = (optIdx) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizState('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const timeSpent = totalAllocatedSeconds - timeRemaining;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {quizState === 'setup' && (
        <QuizSetup
          modules={modules}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          totalAvailable={availableQuestions.length}
          studentName={studentName}
          setStudentName={setStudentName}
          onStartQuiz={handleStartQuiz}
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
        />
      )}
    </div>
  );
}
