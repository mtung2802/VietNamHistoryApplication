/**
 * Service Khám phá
 * Firestore: explore/{slug}
 */

import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface ExploreItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverMediaRef: string;
  sortOrder: number;
}

export const getExploreItems = async (): Promise<ExploreItem[]> => {
  try {
    const q = query(collection(db, 'explore'), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id, slug: d.id } as ExploreItem));
  } catch (e) {
    console.error('❌ Lỗi getExploreItems:', e);
    throw e;
  }
};
