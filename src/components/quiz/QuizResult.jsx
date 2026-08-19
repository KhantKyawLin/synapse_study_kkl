import React from 'react';
import KatexText from '../KatexText';
import { Award, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function QuizResult({ questions, userAnswers, onRestart }) {
  let score = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Score Header Card */}
      <div className="bg-[#161b22]/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyanPrimary/20 border border-cyanPrimary/40 flex items-center justify-center mx-auto mb-4 text-cyanPrimary">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Quiz Completed!</h2>
        <p className="text-slate-400 text-sm mb-6">Here is your score breakdown</p>

        <div className="text-5xl font-black text-cyanPrimary mb-2">
          {percentage}%
        </div>
        <p className="text-sm font-semibold text-slate-300 mb-6">
          You scored <span className="text-emerald-400 font-bold">{score}</span> out of <span className="text-white font-bold">{questions.length}</span> questions correctly
        </p>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyanPrimary text-white shadow-lg shadow-cyanPrimary/25 hover:bg-cyanPrimary/90"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
      </div>

      {/* Itemized Answer Breakdown */}
      <h3 className="text-xl font-bold text-white mt-4">Detailed Answer Review</h3>

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
          const userAns = userAnswers[idx];
          const isCorrect = userAns === q.correctIndex;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isCorrect ? 'bg-[#16221c]/70 border-emerald-500/30' : 'bg-[#221618]/70 border-rose-500/30'
              } backdrop-blur-md flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                {isCorrect ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white leading-relaxed">
                <KatexText text={q.question} />
              </h4>

              <div className="text-xs font-medium space-y-1">
                <p className="text-slate-300">
                  <span className="text-slate-400">Your Answer:</span>{' '}
                  <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    <KatexText text={q.options[userAns] !== undefined ? q.options[userAns] : 'Not answered'} />
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Correct Answer:</span>{' '}
                    <span className="text-emerald-400 font-bold">
                      <KatexText text={q.options[q.correctIndex]} />
                    </span>
                  </p>
                )}
              </div>

              {q.explanation && (
                <div className="mt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-cyanGlow">Explanation:</span>{' '}
                  <KatexText text={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
