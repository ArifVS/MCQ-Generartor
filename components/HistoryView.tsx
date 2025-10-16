
import React from 'react';
import { QuizHistoryItem } from '../types';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';

interface HistoryViewProps {
  history: QuizHistoryItem[];
  onViewResult: (item: QuizHistoryItem) => void;
  onClose: () => void;
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onViewResult, onClose, onClearHistory }) => {
  const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-indigo-400">Quiz History</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
                <button
                onClick={onClearHistory}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Clear history"
                >
                <TrashIcon className="w-5 h-5" />
                </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Close history"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        
        <div className="p-6 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-slate-400 text-center py-10">No past quizzes found.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 flex justify-between items-center gap-4">
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-slate-200 truncate" title={item.contextTopic}>
                      {truncate(item.contextTopic, 60)}
                    </p>
                    <p className="text-sm text-slate-400">
                      {item.date} &bull; Score: {item.score}/{item.mcqs.length}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewResult(item)}
                    className="py-2 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex-shrink-0"
                  >
                    View Results
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
