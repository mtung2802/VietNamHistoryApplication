/**
 * Cấu hình và khởi tạo Firebase cho ứng dụng
 * Sử dụng Firebase JS SDK modular (v9+)
 */

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// Đọc config từ biến môi trường
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Kiểm tra xem config đã đầy đủ
const validateConfig = (): void => {
  const requiredKeys: (keyof typeof firebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ Cảnh báo: Thiếu các biến môi trường Firebase: ${missingKeys.join(', ')}`,
    );
  }
};

validateConfig();

// Khởi tạo Firebase app (tránh khởi tạo lại khi hot reload)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Khởi tạo Firebase Auth với AsyncStorage persistence (React Native)
// try-catch để tránh lỗi "already initialized" khi Expo hot reload
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  // Auth đã được khởi tạo rồi (hot reload) — lấy instance hiện tại
  authInstance = getAuth(app);
}
export const auth: Auth = authInstance;

// Khởi tạo Firestore
export const db: Firestore = getFirestore(app);

// Export config để sử dụng ở nơi khác (nếu cần)
export { firebaseConfig };
