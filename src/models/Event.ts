/**
 * Model Sự kiện lịch sử
 * Firestore: periods/{periodSlug}/stages/{stageSlug}/events/{eventSlug}
 */

export interface StageEventContent {
  result?: {
    vn?: string[];
    usAllies?: string[];
  };
  forces?: {
    vn?: string[];
    usAllies?: string[];
  };
}

export interface Event {
  id: string;            // = document ID = slug
  periodSlug: string;
  stageSlug: string;
  title: string;
  description: string;
  coverMediaRef: string;
  startDate: string;     // ISO string
  endDate: string;       // ISO string
  details?: string[];    // gạch đầu dòng chi tiết
  content?: StageEventContent;
  sortOrder?: number;
}
