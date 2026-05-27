/**
 * Cấu hình và khởi tạo Firebase cho ứng dụng
 * Sử dụng Firebase JS SDK modular (v9+)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
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

// Khởi tạo Firebase app
export const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Auth
export const auth: Auth = getAuth(app);

// Khởi tạo Firestore
export const db: Firestore = getFirestore(app);

// Export config để sử dụng ở nơi khác (nếu cần)
export { firebaseConfig };
