/**
 * Service cho Timeline Puzzle game.
 * Firestore: games/timelinepuzzle/eras/{eraId}  (events nhúng trong doc)
 *
 * LƯU Ý: KHÁC với timelineService.ts (collection 'timelines' — mục đích khác).
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Era, TimelineEvent } from '@/models/Era';

/** Lấy 1 era kèm danh sách sự kiện (đã chuẩn hoá) cho gameplay. */
export const getEraById = async (eraId: string): Promise<Era | null> => {
  try {
    const snap = await getDoc(doc(db, 'games', 'timelinepuzzle', 'eras', eraId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;

    const rawEvents = Array.isArray(data.events) ? data.events : [];
    const events: TimelineEvent[] = rawEvents.map((e: Record<string, unknown>) => ({
      name: String(e.name ?? ''),
      year: Number(e.year ?? 0),
      desc: e.desc ? String(e.desc) : undefined,
      order: Number(e.order ?? 0),
      zone: e.zone ? String(e.zone) : undefined,
    }));

    return {
      eraId: snap.id,
      title: String(data.title ?? ''),
      coverMediaRef: data.coverMediaRef ? String(data.coverMediaRef) : undefined,
      description: data.description ? String(data.description) : undefined,
      sortOrder: data.sortOrder != null ? Number(data.sortOrder) : undefined,
      events,
    };
  } catch (e) {
    console.error('❌ Lỗi getEraById:', e);
    throw e;
  }
};
