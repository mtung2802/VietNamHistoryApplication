/**
 * Service quản lý Sự kiện (Event)
 * Lấy dữ liệu từ Firestore
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Event } from '@/models/Event';

/**
 * Lấy danh sách sự kiện theo giai đoạn
 * @param stageId - ID giai đoạn
 * @returns Danh sách Event
 */
export const getEventsByStage = async (stageId: string): Promise<Event[]> => {
  try {
    if (!stageId) {
      throw new Error('ID giai đoạn không được để trống');
    }

    const q = query(
      collection(db, 'events'),
      where('stageId', '==', stageId),
    );
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });

    return events;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sự kiện theo giai đoạn:', error);
    throw error;
  }
};

/**
 * Lấy sự kiện theo ID
 * @param id - Document ID
 * @returns Event object hoặc null nếu không tìm thấy
 */
export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    if (!id) {
      throw new Error('ID không được để trống');
    }

    const docRef = doc(db, 'events', id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      console.warn(`⚠️ Không tìm thấy sự kiện với ID: ${id}`);
      return null;
    }

    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as Event;
  } catch (error) {
    console.error('❌ Lỗi lấy sự kiện theo ID:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sự kiện theo thời kỳ
 * @param periodId - ID thời kỳ
 * @returns Danh sách Event
 */
export const getEventsByPeriod = async (periodId: string): Promise<Event[]> => {
  try {
    if (!periodId) {
      throw new Error('ID thời kỳ không được để trống');
    }

    const q = query(
      collection(db, 'events'),
      where('periodId', '==', periodId),
    );
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      } as Event);
    });

    return events;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sự kiện theo thời kỳ:', error);
    throw error;
  }
};
