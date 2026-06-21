import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUserSession, clearUserSession, SessionUser } from '@/services/userSession';

interface AuthContextType {
  /** null = chưa đăng nhập, SessionUser = đã đăng nhập */
  user: SessionUser | null;
  /** true khi đang kiểm tra session lần đầu */
  isLoading: boolean;
  /** Gọi khi đăng nhập thành công (session đã được lưu trước đó) */
  onLoginSuccess: () => Promise<void>;
  /** Đăng xuất: xóa session + cập nhật state */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  onLoginSuccess: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra session khi app khởi động
  useEffect(() => {
    getUserSession()
      .then((session) => setUser(session))
      .finally(() => setIsLoading(false));
  }, []);

  const onLoginSuccess = useCallback(async () => {
    const session = await getUserSession();
    setUser(session);
  }, []);

  const logout = useCallback(async () => {
    await clearUserSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, onLoginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
