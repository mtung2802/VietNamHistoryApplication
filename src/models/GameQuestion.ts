/**
 * Model câu hỏi cho gameplay Quiz.
 * Khớp ĐÚNG cấu trúc Firestore (theo bản Java QuestionItem.java):
 *   games/quiz-lich-su-viet-nam/quizzes/{quizId}/questions/{id}
 *
 * Lưu ý: KHÁC với src/models/QuestionItem.ts (model đó dùng cho mục đích
 * khác — correctAnswer dạng string, có points/difficulty). Game dùng type
 * riêng này để tránh đụng chạm.
 */

export interface GameQuestion {
  id: string;
  question: string;
  options: string[]; // luôn 4 lựa chọn
  correctAnswer: number; // index 0-3
  orderQuestion: number; // thứ tự câu hỏi
  explanation?: string;
}
