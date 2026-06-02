/**
 * Model Era (Kỷ nguyên) dùng trong Timeline Puzzle
 * Firestore: games/timelinepuzzle/eras/{eraId}
 *
 * Các sự kiện của trò chơi được NHÚNG trong doc era ở field `events`
 * (theo bản Java Era.java + Event.java).
 */

export interface TimelineEvent {
  name: string; // tên sự kiện (hiển thị trên thẻ)
  year: number; // năm (hiển thị ở slot)
  desc?: string; // mô tả ngắn
  order: number; // thứ tự đúng, 1-based (1 = sự kiện đầu tiên)
  zone?: string; // không dùng trong game
}

export interface Era {
  eraId: string; // = document ID
  title: string;
  coverMediaRef?: string;
  description?: string;
  sortOrder?: number;
  events?: TimelineEvent[];
}
