/**
 * Service quản lý dữ liệu người dùng (User)
 * Lấy và cập nhật thông tin user từ Firestore
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { db } from '@/services/firebase';
import { UserModel } from '@/models/UserModel';

export const uploadUserAvatar = async (
  userId: string,
  imageUri: string,
): Promise<string> => {
  if (!userId || !imageUri) {
    throw new Error('Thiếu người dùng hoặc ảnh đại diện');
  }

  let result = await manipulateAsync(
    imageUri,
    [{ resize: { width: 512 } }],
    {
      base64: true,
      compress: 0.65,
      format: SaveFormat.JPEG,
    },
  );

  if (result.base64 && result.base64.length > 600_000) {
    result = await manipulateAsync(
      imageUri,
      [{ resize: { width: 384 } }],
      {
        base64: true,
        compress: 0.5,
        format: SaveFormat.JPEG,
      },
    );
  }

  if (!result.base64) {
    throw new Error('Không thể xử lý ảnh đã chọn');
  }

  const dataUri = `data:image/jpeg;base64,${result.base64}`;
  if (dataUri.length > 700_000) {
    throw new Error('Ảnh đại diện sau khi nén vẫn quá lớn');
  }

  return dataUri;
};

/**
 * Lấy thông tin người dùng theo UID
 * @param uid - Firebase UID
 * @returns UserModel object hoặc null nếu không tìm thấy
 */
export const getUserById = async (uid: string): Promise<UserModel | null> => {
  try {
    if (!uid) {
      throw new Error('UID không được để trống');
    }

    const docRef = doc(db, 'users', uid);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      console.warn(`⚠️ Không tìm thấy người dùng với UID: ${uid}`);
      return null;
    }

    return {
      ...docSnapshot.data(),
      uid: docSnapshot.id,
    } as UserModel;
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin người dùng:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param uid - Firebase UID
 * @param data - Dữ liệu cần cập nhật
 */
export const updateUser = async (
  uid: string,
  data: Partial<UserModel>,
): Promise<void> => {
  try {
    if (!uid) {
      throw new Error('UID không được để trống');
    }

    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật thông tin người dùng:', error);
    throw error;
  }
};

/**
 * Cập nhật điểm của người dùng
 * @param uid - Firebase UID
 * @param points - Số điểm cần thêm
 */
export const addUserPoints = async (uid: string, points: number): Promise<void> => {
  try {
    if (!uid) {
      throw new Error('UID không được để trống');
    }

    if (typeof points !== 'number' || points < 0) {
      throw new Error('Points phải là số dương');
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Người dùng không tồn tại');
    }

    const currentScore = userDoc.data().totalScore || 0;
    await updateDoc(userRef, {
      totalScore: currentScore + points,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật điểm người dùng:', error);
    throw error;
  }
};

/**
 * Thêm quiz vào danh sách quiz đã hoàn thành của người dùng
 * @param uid - Firebase UID
 * @param quizId - ID của quiz
 */
export const addFinishedQuiz = async (uid: string, quizId: string): Promise<void> => {
  try {
    if (!uid || !quizId) {
      throw new Error('UID và quizId không được để trống');
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Người dùng không tồn tại');
    }

    const finishedQuizzes = userDoc.data().finishedQuizzes || [];

    if (!finishedQuizzes.includes(quizId)) {
      await updateDoc(userRef, {
        finishedQuizzes: [...finishedQuizzes, quizId],
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('❌ Lỗi thêm quiz vào danh sách hoàn thành:', error);
    throw error;
  }
};

/**
 * Thêm badge cho người dùng
 * @param uid - Firebase UID
 * @param badge - Tên badge
 */
export const addUserBadge = async (uid: string, badge: string): Promise<void> => {
  try {
    if (!uid || !badge) {
      throw new Error('UID và badge không được để trống');
    }

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Người dùng không tồn tại');
    }

    const badges = userDoc.data().badges || [];

    if (!badges.includes(badge)) {
      await updateDoc(userRef, {
        badges: [...badges, badge],
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('❌ Lỗi thêm badge cho người dùng:', error);
    throw error;
  }
};

/**
 * Cập nhật lần đăng nhập cuối cùng của người dùng
 * @param uid - Firebase UID
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    if (!uid) {
      throw new Error('UID không được để trống');
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật lần đăng nhập cuối cùng:', error);
    throw error;
  }
};
