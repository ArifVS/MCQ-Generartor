
import React, { useState, useCallback, useEffect } from 'react';
import { MCQ, QuizState, QuizHistoryItem } from './types';
import { generateMCQs } from './services/geminiService';
import { getHistory, saveQuizToHistory, clearHistory } from './services/historyService';
import InputForm from './components/InputForm';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import Loader from './components/Loader';
import HistoryView from './components/HistoryView';
import HistoryIcon from './components/icons/HistoryIcon';

const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [quizContext, setQuizContext] = useState('');

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleGenerateQuiz = useCallback(async (context: string, numQuestions: number) => {
    setQuizState('generating');
    setError(null);
    setQuizContext(context);
    try {
      const generatedMcqs = await generateMCQs(context, numQuestions);
      if (generatedMcqs && generatedMcqs.length > 0) {
        setMcqs(generatedMcqs);
        setUserAnswers(Array(generatedMcqs.length).fill(null));
        setQuizState('active');
      } else {
        throw new Error("The generated quiz is empty. Please try a different topic.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setQuizState('configuring');
    }
  }, []);

  const handleFinishQuiz = useCallback((answers: (string | null)[]) => {
    setUserAnswers(answers);
    setQuizState('finished');

    const score = answers.reduce((acc, answer, index) => {
        return answer === mcqs[index].correctAnswer ? acc + 1 : acc;
    }, 0);

    const historyEntry = {
        mcqs,
        userAnswers: answers,
        contextTopic: quizContext,
        score,
    };

    saveQuizToHistory(historyEntry);
    setHistory(getHistory());
  }, [mcqs, quizContext]);

  const handleRestart = useCallback(() => {
    setQuizState('configuring');
    setMcqs([]);
    setUserAnswers([]);
    setError(null);
    setQuizContext('');
  }, []);

  const toggleHistoryView = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const handleViewResultFromHistory = (item: QuizHistoryItem) => {
    setMcqs(item.mcqs);
    setUserAnswers(item.userAnswers);
    setQuizState('finished');
    setIsHistoryVisible(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all quiz history? This action cannot be undone.')) {
        clearHistory();
        setHistory([]);
    }
  };

  const renderContent = () => {
    switch (quizState) {
      case 'configuring':
        return <InputForm onGenerate={handleGenerateQuiz} isLoading={false} />;
      case 'generating':
        return <Loader message="Generating your quiz, please wait..." />;
      case 'active':
        return <QuizView mcqs={mcqs} onFinish={handleFinishQuiz} />;
      case 'finished':
        return <ResultsView mcqs={mcqs} userAnswers={userAnswers} onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <main className="w-full relative">
        {quizState === 'configuring' && history.length > 0 && (
          <div className="absolute z-10 top-4 right-4 sm:static sm:max-w-2xl sm:mx-auto sm:flex sm:justify-end sm:mb-4">
             <button
                onClick={toggleHistoryView}
                className="flex items-center gap-2 py-2 px-4 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors shadow-lg sm:shadow-none"
                aria-label="View quiz history"
              >
                <HistoryIcon className="w-4 h-4" />
                History
              </button>
          </div>
        )}
        {error && quizState === 'configuring' && (
          <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderContent()}
      </main>
      {isHistoryVisible && (
        <HistoryView history={history} onViewResult={handleViewResultFromHistory} onClose={toggleHistoryView} onClearHistory={handleClearHistory} />
      )}
    </div>
  );
};

export default App;
