/**
 * Service quản lý Bài viết (Article)
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
 * Lấy danh sách tất cả bài viết
 * @returns Danh sách Article
 */
export const getArticles = async () => {
  try {
    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    const articles: any[] = [];

    querySnapshot.forEach((doc) => {
      articles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return articles;
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bài viết:', error);
    throw error;
  }
};

/**
 * Lấy bài viết theo ID
 * @param articleId - ID bài viết
 * @returns Article object hoặc null
 */
export const getArticleById = async (articleId: string) => {
  try {
    if (!articleId) {
      throw new Error('ID bài viết không được để trống');
    }

    const docRef = doc(db, 'articles', articleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Lỗi lấy bài viết theo ID:', error);
    throw error;
  }
};

/**
 * Tìm kiếm bài viết theo từ khóa
 * @param keyword - Từ khóa tìm kiếm
 * @returns Danh sách bài viết phù hợp
 */
export const searchArticles = async (keyword: string) => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    const articles: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        data.description?.toLowerCase().includes(keyword.toLowerCase())
      ) {
        articles.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('❌ Lỗi tìm kiếm bài viết:', error);
    throw error;
  }
};
