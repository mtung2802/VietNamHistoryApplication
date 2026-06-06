/**
 * Service quản lý Thời kỳ (Period)
 * Collection Firestore: "periods"
 * Document ID = slug (e.g. "buoi-dau-dung-nuoc-va-giu-nuoc")
 *
 * Firestore fields thực tế:
 *   title, summary, description, coverMediaRef,
 *   startDate (ISO string), endDate (ISO string),
 *   sortOrder, status, slug
 */

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Period } from '@/models/Period';

/**
 * Lấy danh sách tất cả thời kỳ, sắp xếp theo sortOrder
 */
export const getPeriods = async (): Promise<Period[]> => {
  try {
    const q = query(
      collection(db, 'periods'),
      orderBy('sortOrder', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const periods: Period[] = [];

    querySnapshot.forEach((d) => {
      periods.push({
        ...d.data(),
        id: d.id,
        slug: d.id,   // document ID = slug
      } as Period);
    });

    return periods;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách thời kỳ:', error);
    throw error;
  }
};

/**
 * Lấy thời kỳ theo slug (slug = document ID)
 */
export const getPeriodBySlug = async (slug: string): Promise<Period | null> => {
  return getPeriodById(slug);
};

/**
 * Lấy thời kỳ theo ID (= slug, dùng getDoc trực tiếp)
 */
export const getPeriodById = async (id: string): Promise<Period | null> => {
  try {
    if (!id) throw new Error('ID không được để trống');

    const docRef = doc(db, 'periods', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn(`⚠️ Không tìm thấy thời kỳ với ID: ${id}`);
      return null;
    }

    return {
      ...snap.data(),
      id: snap.id,
      slug: snap.id,
    } as Period;
  } catch (error) {
    console.error('❌ Lỗi lấy thời kỳ theo ID:', error);
    throw error;
  }
};
