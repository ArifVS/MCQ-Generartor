
import React, { useState, useEffect } from 'react';
import { MCQ } from '../types';

interface QuizViewProps {
  mcqs: MCQ[];
  onFinish: (answers: (string | null)[]) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ mcqs, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(mcqs.length).fill(null));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentQuestionIndex + 1) / mcqs.length) * 100);
    setSelectedOption(userAnswers[currentQuestionIndex]);
  }, [currentQuestionIndex, mcqs.length, userAnswers]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = mcqs[currentQuestionIndex];

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-indigo-400">Question {currentQuestionIndex + 1} of {mcqs.length}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-semibold text-slate-100 mb-6">{currentQuestion.question}</h2>

      {/* Options */}
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const baseClasses = "flex items-center p-4 w-full text-left rounded-lg border transition-all duration-200 cursor-pointer";
          const selectedClasses = "bg-indigo-900 border-indigo-500 ring-2 ring-indigo-500 text-white";
          const unselectedClasses = "bg-slate-900 border-slate-700 hover:bg-slate-700 text-slate-300";

          return (
            <button key={index} onClick={() => handleOptionSelect(option)} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
              <span className={`flex items-center justify-center w-6 h-6 mr-4 text-sm font-bold rounded-full ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        {currentQuestionIndex < mcqs.length - 1 ? (
          <button onClick={handleNext} className="py-2 px-6 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 transition-colors">
            Next
          </button>
        ) : (
          <button onClick={() => onFinish(userAnswers)} className="py-2 px-6 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
