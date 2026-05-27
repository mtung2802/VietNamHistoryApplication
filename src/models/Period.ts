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

export interface Period {
  id: string;           // = document ID = slug
  slug: string;         // URL-friendly identifier (= doc ID)
  title: string;        // Tên thời kỳ
  summary: string;      // Mô tả ngắn (hiển thị trên card)
  description: string;  // Mô tả chi tiết (hiển thị trong màn detail)
  coverMediaRef: string; // URL ảnh bìa
  startDate: string;    // ISO date string  "0700-01-01T00:00:00+00:00"
  endDate: string;      // ISO date string
  sortOrder: number;
  status?: string;      // "published" | ...
}

/** Trích năm từ ISO date string, trả về số nguyên. An toàn với undefined/null. */
export function yearFromIso(iso: unknown): number {
  if (!iso || typeof iso !== 'string') return 0;
  // Format: "0700-01-01T..." hoặc "-0700-01-01T..." (TCN — năm âm)
  const negative = iso.startsWith('-');
  const raw = negative ? iso.slice(1) : iso;
  const year = parseInt(raw.split('-')[0], 10);
  return isNaN(year) ? 0 : negative ? -year : year;
}

/** Format năm hiển thị: âm → TCN, 0 → N/A */
export function formatYear(year: number): string {
  if (year === 0) return 'N/A';
  if (year < 0) return `${Math.abs(year)} TCN`;
  return `${year}`;
}
