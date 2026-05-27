/**
 * Service xác thực người dùng (Authentication)
 * Bao gồm đăng nhập, đăng ký, và đăng xuất
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserModel } from '@/models/UserModel';

/**
 * Đăng nhập bằng username/email và password
 * @param email - Email đăng nhập
 * @param password - Mật khẩu
 * @returns User object từ Firebase
 */
export const loginWithUsername = async (
  email: string,
  password: string,
): Promise<User> => {
  try {
    if (!email || !password) {
      throw new Error('Email và mật khẩu không được để trống');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    throw error;
  }
};

/**
 * Đăng nhập bằng Google
 * @param idToken - Google ID Token
 * @returns User object từ Firebase
 */
export const loginWithGoogle = async (idToken: string): Promise<User> => {
  try {
    if (!idToken) {
      throw new Error('Google ID Token không được để trống');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    // Tạo hoặc cập nhật user document trong Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: UserModel = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || '',
        avatar: userCredential.user.photoURL || '',
        isVerified: true,
        totalScore: 0,
        level: 1,
        createdAt: new Date(),
      };

      await setDoc(userRef, newUser);
    }

    return userCredential.user;
  } catch (error) {
    console.error('❌ Lỗi đăng nhập Google:', error);
    throw error;
  }
};

/**
 * Đăng ký tài khoản mới
 * @param userData - Thông tin đăng ký
 * @returns User object từ Firebase
 */
export const register = async (userData: {
  email: string;
  password: string;
  displayName?: string;
  username?: string;
}): Promise<User> => {
  try {
    if (!userData.email || !userData.password) {
      throw new Error('Email và mật khẩu không được để trống');
    }

    // Tạo tài khoản Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password,
    );

    // Tạo user document trong Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    const newUser: UserModel = {
      uid: userCredential.user.uid,
      email: userData.email,
      displayName: userData.displayName || '',
      username: userData.username || '',
      isVerified: false,
      totalScore: 0,
      level: 1,
      badges: [],
      finishedQuizzes: [],
      createdAt: new Date(),
    };

    await setDoc(userRef, newUser);

    return userCredential.user;
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('❌ Lỗi đăng xuất:', error);
    throw error;
  }
};
