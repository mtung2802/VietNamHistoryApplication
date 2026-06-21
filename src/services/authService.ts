import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

export const loginWithUsername = async (
  email: string,
  password: string,
): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email và mật khẩu không được để trống');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const register = async (userData: {
  email: string;
  password: string;
  username: string;
}): Promise<User> => {
  if (!userData.email || !userData.password) {
    throw new Error('Email và mật khẩu không được để trống');
  }
  if (!userData.username) {
    throw new Error('Tên đăng nhập không được để trống');
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    userData.email,
    userData.password,
  );

  const userRef = doc(db, 'users', userCredential.user.uid);
  const newUser = {
    uid: userCredential.user.uid,
    email: userData.email,
    username: userData.username,
    displayName: userData.username,
    createdAt: new Date(),
  };

  await setDoc(userRef, newUser);
  return userCredential.user;
};

/**
 * Gửi email đặt lại mật khẩu qua Firebase Auth
 * @param email - Email người dùng đã đăng ký
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (!email) {
    throw new Error('Email không được để trống');
  }

  await sendPasswordResetEmail(auth, email);
};

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};
