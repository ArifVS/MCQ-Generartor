
import React from 'react';
import { MCQ } from '../types';

interface ResultsViewProps {
  mcqs: MCQ[];
  userAnswers: (string | null)[];
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ mcqs, userAnswers, onRestart }) => {
  const score = userAnswers.reduce((acc, answer, index) => {
    return answer === mcqs[index].correctAnswer ? acc + 1 : acc;
  }, 0);
  const percentage = Math.round((score / mcqs.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
      <h2 className="text-3xl font-bold text-center text-indigo-400 mb-4">Quiz Results</h2>
      <div className="text-center bg-slate-900 rounded-lg p-6 mb-8 border border-slate-700">
        <p className="text-xl text-slate-300">You scored</p>
        <p className="text-6xl font-bold text-white my-2">{score} / {mcqs.length}</p>
        <p className="text-2xl font-semibold text-green-400">{percentage}%</p>
      </div>

      <div className="space-y-6">
        {mcqs.map((mcq, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === mcq.correctAnswer;
          
          return (
            <div key={index} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="font-semibold text-slate-200 mb-3">{index + 1}. {mcq.question}</p>
              <div className="space-y-2">
                {mcq.options.map((option, optIndex) => {
                  let optionClass = "text-slate-400";
                  let indicator = ' ';

                  if (option === mcq.correctAnswer) {
                    optionClass = "text-green-400 font-semibold";
                    indicator = '✔';
                  }
                  if (option === userAnswer && !isCorrect) {
                    optionClass = "text-red-400 font-semibold";
                    indicator = '✖';
                  }
                  
                  return (
                    <div key={optIndex} className={`flex items-start p-2 rounded ${option === userAnswer ? 'bg-slate-800' : ''}`}>
                      <span className={`w-5 text-center ${optionClass}`}>{indicator}</span>
                      <span className={optionClass}>{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <button onClick={onRestart} className="py-3 px-8 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          New Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
