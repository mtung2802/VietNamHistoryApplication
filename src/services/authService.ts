import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserModel } from '@/models/UserModel';
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
  displayName?: string;
  username?: string;
}): Promise<User> => {
  if (!userData.email || !userData.password) {
    throw new Error('Email và mật khẩu không được để trống');
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    userData.email,
    userData.password,
  );

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
};

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};
