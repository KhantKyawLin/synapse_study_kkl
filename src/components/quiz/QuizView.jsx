import React, { useState, useMemo } from 'react';
import QuizSetup from './QuizSetup';
import QuizCard from './QuizCard';
import QuizResult from './QuizResult';
import rawQuizData from '../../data/quizzes_data.json';

export default function QuizView() {
  const modules = useMemo(() => Object.keys(rawQuizData || {}), []);
  const [selectedModule, setSelectedModule] = useState(modules[0] || '');
  const [questionCount, setQuestionCount] = useState('10');

  const [quizState, setQuizState] = useState('setup'); // 'setup' | 'active' | 'result'
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const availableQuestions = useMemo(() => {
    return rawQuizData[selectedModule] || [];
  }, [selectedModule]);

  const handleStartQuiz = () => {
    if (availableQuestions.length === 0) return;
    const count = questionCount === 'all' ? availableQuestions.length : Math.min(parseInt(questionCount, 10), availableQuestions.length);
    setActiveQuestions(availableQuestions.slice(0, count));
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
        />
      )}

      {quizState === 'result' && (
        <QuizResult
          questions={activeQuestions}
          userAnswers={userAnswers}
          onRestart={handleStartQuiz}
          onChooseNewQuiz={() => setQuizState('setup')}
        />
      )}
    </div>
  );
}
