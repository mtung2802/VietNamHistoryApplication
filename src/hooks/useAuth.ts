/**
 * Hook quản lý trạng thái đăng nhập của người dùng
 * Sử dụng Firebase Auth
 */

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/services/firebase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook để lấy thông tin người dùng hiện tại và quản lý xác thực
 * @returns Object chứa user, loading state, và hàm signOut
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe thay đổi trạng thái xác thực
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup: Hủy lắng nghe khi component unmount
    return () => unsubscribe();
  }, []);

  /**
   * Đăng xuất người dùng
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
};
