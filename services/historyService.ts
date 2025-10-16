
import { MCQ, QuizHistoryItem } from '../types';

const HISTORY_KEY = 'mcqQuizHistory';

export const getHistory = (): QuizHistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to retrieve quiz history:", error);
    return [];
  }
};

export const saveQuizToHistory = (quizData: {
    mcqs: MCQ[],
    userAnswers: (string | null)[],
    contextTopic: string,
    score: number
}): void => {
  try {
    const history = getHistory();
    const newEntry: QuizHistoryItem = {
      ...quizData,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toLocaleString(),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep latest 50 quizzes
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save quiz to history:", error);
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear quiz history:", error);
  }
};
