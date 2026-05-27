/**
 * Model định nghĩa cấu trúc của một Câu hỏi trong Quiz
 */

export interface QuestionItem {
  id: string;
  quizId: string; // ID của quiz chứa câu hỏi này
  question: string; // Nội dung câu hỏi
  type: 'multiple_choice' | 'true_false' | 'short_answer'; // Loại câu hỏi
  options: string[]; // Các tùy chọn (cho multiple choice)
  correctAnswer: string | string[]; // Đáp án đúng
  explanation?: string; // Giải thích đáp án
  imageUrl?: string; // URL hình ảnh liên quan đến câu hỏi
  points: number; // Điểm thưởng nếu trả lời đúng
  sortOrder: number; // Thứ tự câu hỏi
  difficulty: 'easy' | 'medium' | 'hard'; // Mức độ khó
  createdAt?: Date;
  updatedAt?: Date;
}
