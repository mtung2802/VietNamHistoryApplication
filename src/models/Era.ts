/**
 * Model Era (Kỷ nguyên) dùng trong Timeline Puzzle
 * Firestore: games/timelinepuzzle/eras/{eraId}
 */

export interface Era {
  eraId: string;       // = document ID
  title: string;
  coverMediaRef?: string;
  description?: string;
  sortOrder?: number;
}
