/**
 * Model định nghĩa cấu trúc của một Giai đoạn (Stage)
 * Khớp với subcollection Firestore: periods/{periodSlug}/stages/{stageSlug}
 *
 * Firestore fields thực tế:
 *   _document_id / id → id (= slug)
 *   title             → title
 *   description       → description
 *   coverMediaRef     → coverMediaRef
 *   startDate         → startDate (ISO string)
 *   endDate           → endDate   (ISO string)
 *   sortOrder         → sortOrder
 */

export interface Stage {
  id: string;           // = document ID = slug
  periodSlug: string;   // slug của period cha (để navigate)
  title: string;        // Tên giai đoạn
  description: string;  // Mô tả
  coverMediaRef: string; // URL ảnh bìa
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  sortOrder: number;
  // Chi tiết (dùng trong StageDetail)
  details?: string[];
  result?: string[];
  impactOnPresent?: string;
}

/**
 * Model sự kiện (Event) trong subcollection của stage
 * Firestore: periods/{slug}/stages/{slug}/events/{slug}
 */
export interface StageEvent {
  id: string;           // = document ID = slug
  periodSlug: string;
  stageSlug: string;
  title: string;
  description: string;
  coverMediaRef: string;
  startDate: string;
  endDate: string;
  details?: string[];
  sortOrder?: number;
  content?: {
    result?: { vn?: string[]; usAllies?: string[] };
    forces?: { vn?: string[]; usAllies?: string[] };
  };
}
