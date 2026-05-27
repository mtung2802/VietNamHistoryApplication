/**
 * Hook quản lý session người dùng bằng AsyncStorage
 * Lưu và lấy thông tin người dùng từ local storage
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserModel } from '@/models/UserModel';

const USER_SESSION_KEY = '@vietnam_history_app_user_session';

interface UseUserSessionReturn {
  user: UserModel | null;
  loading: boolean;
  saveUserSession: (user: UserModel) => Promise<void>;
  clearUserSession: () => Promise<void>;
}

/**
 * Hook để quản lý session người dùng bằng AsyncStorage
 * @returns Object chứa user, loading state, và các hàm để lưu/xóa session
 */
export const useUserSession = (): UseUserSessionReturn => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy user session khi component mount
  useEffect(() => {
    loadUserSession();
  }, []);

  /**
   * Lấy thông tin user session từ AsyncStorage
   */
  const loadUserSession = async (): Promise<void> => {
    try {
      setLoading(true);
      const jsonString = await AsyncStorage.getItem(USER_SESSION_KEY);

      if (jsonString) {
        const userData: UserModel = JSON.parse(jsonString);
        setUser(userData);
      }
    } catch (error) {
      console.error('❌ Lỗi lấy user session:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lưu thông tin user session vào AsyncStorage
   */
  const saveUserSession = async (userData: UserModel): Promise<void> => {
    try {
      setLoading(true);
      const jsonString = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_SESSION_KEY, jsonString);
      setUser(userData);
    } catch (error) {
      console.error('❌ Lỗi lưu user session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa user session khỏi AsyncStorage
   */
  const clearUserSession = async (): Promise<void> => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      setUser(null);
    } catch (error) {
      console.error('❌ Lỗi xóa user session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    saveUserSession,
    clearUserSession,
  };
};
