
export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

export type QuizState = 'configuring' | 'generating' | 'active' | 'finished';

export type InputMode = 'topic' | 'file';

export interface QuizHistoryItem {
  id: string;
  date: string;
  mcqs: MCQ[];
  userAnswers: (string | null)[];
  contextTopic: string;
  score: number;
}
