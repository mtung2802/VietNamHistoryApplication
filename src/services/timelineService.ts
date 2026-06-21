/**
 * Service quản lý Dòng thời gian (Timeline)
 * Lấy dữ liệu từ Firestore
 */

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Lấy danh sách tất cả timeline
 * @returns Danh sách Timeline
 */
export const getTimelines = async () => {
  try {
    const q = query(
      collection(db, 'timelines'),
      orderBy('year', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const timelines: any[] = [];

    querySnapshot.forEach((doc) => {
      timelines.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return timelines;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách timeline:', error);
    throw error;
  }
};

/**
 * Lấy timeline theo ID
 * @param timelineId - ID timeline
 * @returns Timeline object hoặc null
 */
export const getTimelineById = async (timelineId: string) => {
  try {
    if (!timelineId) {
      throw new Error('ID timeline không được để trống');
    }

    const docRef = doc(db, 'timelines', timelineId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Lỗi lấy timeline theo ID:', error);
    throw error;
  }
};

/**
 * Lấy timeline theo giai đoạn lịch sử
 * @param periodId - ID thời kỳ
 * @returns Danh sách timeline trong thời kỳ đó
 */
export const getTimelinesByPeriod = async (periodId: string) => {
  try {
    if (!periodId) {
      throw new Error('ID thời kỳ không được để trống');
    }

    const q = query(
      collection(db, 'timelines'),
      where('periodId', '==', periodId),
      orderBy('year', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const timelines: any[] = [];

    querySnapshot.forEach((doc) => {
      timelines.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return timelines;
  } catch (error) {
    console.error('❌ Lỗi lấy timeline theo giai đoạn:', error);
    throw error;
  }
};

/**
 * Lấy timeline theo năm
 * @param year - Năm cần tìm
 * @returns Danh sách timeline trong năm đó
 */
export const getTimelinesByYear = async (year: number) => {
  try {
    if (!year) {
      throw new Error('Năm không được để trống');
    }

    const q = query(
      collection(db, 'timelines'),
      where('year', '==', year),
    );
    const querySnapshot = await getDocs(q);
    const timelines: any[] = [];

    querySnapshot.forEach((doc) => {
      timelines.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return timelines;
  } catch (error) {
    console.error('❌ Lỗi lấy timeline theo năm:', error);
    throw error;
  }
};

/**
 * Tìm kiếm timeline theo từ khóa
 * @param keyword - Từ khóa tìm kiếm
 * @returns Danh sách timeline phù hợp
 */
export const searchTimelines = async (keyword: string) => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const q = query(
      collection(db, 'timelines'),
      orderBy('year', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const timelines: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        data.description?.toLowerCase().includes(keyword.toLowerCase())
      ) {
        timelines.push({
          ...data,
          id: doc.id,
        });
      }
    });

    return timelines;
  } catch (error) {
    console.error('❌ Lỗi tìm kiếm timeline:', error);
    throw error;
  }
};
