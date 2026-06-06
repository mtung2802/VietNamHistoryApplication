import { useCallback, useEffect, useState } from 'react';
import {
  clearUserSession as removeStoredSession,
  getUserSession,
  saveUserSession as persistUserSession,
  SessionUser,
} from '@/services/userSession';

interface UseUserSessionReturn {
  user: SessionUser | null;
  loading: boolean;
  saveUserSession: (user: SessionUser) => Promise<void>;
  clearUserSession: () => Promise<void>;
  reloadUserSession: () => Promise<void>;
}

export const useUserSession = (): UseUserSessionReturn => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUserSession = useCallback(async () => {
    try {
      setLoading(true);
      setUser(await getUserSession());
    } catch (error) {
      console.error('Không thể tải phiên đăng nhập:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadUserSession();
  }, [reloadUserSession]);

  const saveUserSession = async (userData: SessionUser) => {
    setLoading(true);
    try {
      await persistUserSession(userData);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const clearUserSession = async () => {
    setLoading(true);
    try {
      await removeStoredSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    saveUserSession,
    clearUserSession,
    reloadUserSession,
  };
};
