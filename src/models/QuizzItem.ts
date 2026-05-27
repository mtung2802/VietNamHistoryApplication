/**
 * Model QuizzItem
 * Firestore: games/quiz-lich-su-viet-nam/quizzes/{slug}
 */

export interface QuizEventId {
  periodID?: string;
  stageID?: string;
  eventid?: string;
}

export interface QuizSettings {
  timeLimit?: number;
  [key: string]: number | undefined;
}

export interface QuizItem {
  id: string;          // = document ID = slug
  level: string;       // "easy" | "medium" | "hard"
  description: string;
  questionCount: number;
  type: string;        // "quizzes"
  eventID?: QuizEventId;
  settings?: Record<string, number>;
}
