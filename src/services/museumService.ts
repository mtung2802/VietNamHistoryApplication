/**
 * Service quản lý Bảo tàng (Museum)
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
 * Lấy danh sách tất cả bảo tàng
 * @returns Danh sách Museum
 */
export const getMuseums = async () => {
  try {
    const q = query(
      collection(db, 'museums'),
      orderBy('name', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const museums: any[] = [];

    querySnapshot.forEach((doc) => {
      museums.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return museums;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bảo tàng:', error);
    throw error;
  }
};

/**
 * Lấy bảo tàng theo ID
 * @param museumId - ID bảo tàng
 * @returns Museum object hoặc null
 */
export const getMuseumById = async (museumId: string) => {
  try {
    if (!museumId) {
      throw new Error('ID bảo tàng không được để trống');
    }

    const docRef = doc(db, 'museums', museumId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Lỗi lấy bảo tàng theo ID:', error);
    throw error;
  }
};

/**
 * Lấy danh sách bảo tàng theo khu vực
 * @param region - Khu vực
 * @returns Danh sách bảo tàng ở khu vực đó
 */
export const getMuseumsByRegion = async (region: string) => {
  try {
    if (!region) {
      throw new Error('Khu vực không được để trống');
    }

    const q = query(
      collection(db, 'museums'),
      where('region', '==', region),
      orderBy('name', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const museums: any[] = [];

    querySnapshot.forEach((doc) => {
      museums.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return museums;
  } catch (error) {
    console.error('❌ Lỗi lấy bảo tàng theo khu vực:', error);
    throw error;
  }
};

/**
 * Tìm kiếm bảo tàng theo từ khóa
 * @param keyword - Từ khóa tìm kiếm
 * @returns Danh sách bảo tàng phù hợp
 */
export const searchMuseums = async (keyword: string) => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const q = query(
      collection(db, 'museums'),
      orderBy('name', 'asc'),
    );
    const querySnapshot = await getDocs(q);
    const museums: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        data.description?.toLowerCase().includes(keyword.toLowerCase())
      ) {
        museums.push({
          ...data,
          id: doc.id,
        });
      }
    });

    return museums;
  } catch (error) {
    console.error('❌ Lỗi tìm kiếm bảo tàng:', error);
    throw error;
  }
};
