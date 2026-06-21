/**
 * Model định nghĩa cấu trúc của một Thời kỳ (Period)
 * Khớp với Firestore collection "periods"
 *
 * Firestore fields thực tế:
 *   _document_id / slug  → id (dùng doc ID = slug)
 *   title                → title
 *   summary              → summary  (mô tả ngắn)
 *   description          → description (mô tả dài)
 *   coverMediaRef        → coverMediaRef
 *   startDate            → startDate (ISO string)
 *   endDate              → endDate   (ISO string)
 *   sortOrder            → sortOrder
 *   status               → status
 */

export type FirestoreDateValue =
  | string
  | number
  | Date
  | { seconds: number; nanoseconds?: number }
  | { toDate: () => Date };

export interface MediaItem {
  content?: string;
  link?: string;
  url?: string;
}

export interface Period {
  id: string;           // = document ID = slug
  slug: string;         // URL-friendly identifier (= doc ID)
  title: string;        // Tên thời kỳ
  summary: string;      // Mô tả ngắn (hiển thị trên card)
  description: string;  // Mô tả chi tiết (hiển thị trong màn detail)
  coverMediaRef: string; // URL ảnh bìa
  images?: MediaItem[];
  startDate: FirestoreDateValue; // ISO string hoặc Firestore Timestamp
  endDate: FirestoreDateValue;   // ISO string hoặc Firestore Timestamp
  sortOrder: number;
  status?: string;      // "published" | ...
}

/** Trích năm từ ISO date string / Date / Firestore Timestamp. */
export function yearFromIso(value: unknown): number {
  if (!value) return 0;

  if (typeof value === 'string') {
    // Format: "0700-01-01T..." hoặc "-0700-01-01T..." (TCN - năm âm)
    const negative = value.startsWith('-');
    const raw = negative ? value.slice(1) : value;
    const year = parseInt(raw.split('-')[0], 10);
    return isNaN(year) ? 0 : negative ? -year : year;
  }

  if (value instanceof Date) {
    return value.getFullYear();
  }

  if (typeof value === 'number') {
    const ms = value < 10000000000 ? value * 1000 : value;
    const year = new Date(ms).getFullYear();
    return isNaN(year) ? 0 : year;
  }

  if (typeof value === 'object') {
    const maybeTimestamp = value as {
      seconds?: number;
      toDate?: () => Date;
    };

    if (typeof maybeTimestamp.toDate === 'function') {
      const year = maybeTimestamp.toDate().getFullYear();
      return isNaN(year) ? 0 : year;
    }

    if (typeof maybeTimestamp.seconds === 'number') {
      const year = new Date(maybeTimestamp.seconds * 1000).getFullYear();
      return isNaN(year) ? 0 : year;
    }
  }

  return 0;
}

/** Format năm hiển thị: âm → TCN, 0 → N/A */
export function formatYear(year: number): string {
  if (year === 0) return 'N/A';
  if (year < 0) return `${Math.abs(year)} TCN`;
  return `${year}`;
}
