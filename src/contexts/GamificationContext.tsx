/**
 * GamificationContext — Quản lý state gamification toàn app
 *
 * Cung cấp:
 * - profile: GamificationProfile (XP, rank, badges, history)
 * - submitSession: gọi logGameSession + auto-refetch profile
 * - fetchProfile: tải lại profile
 * - lastSessionResult: kết quả session gần nhất (XP gained, new badges)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  GamificationProfile,
  SessionInput,
  SessionResult,
} from '@/models/GamificationModels';
import {
  logGameSession,
  getUserGamificationProfile,
} from '@/services/gamificationService';

interface GamificationContextType {
  /** Profile gamification đầy đủ, null nếu chưa load */
  profile: GamificationProfile | null;
  /** Đang loading profile */
  loading: boolean;
  /** Lỗi khi load profile */
  error: string | null;
  /** Kết quả session gần nhất (dùng hiển thị XP notification) */
  lastSessionResult: SessionResult | null;
  /** Tải / reload profile */
  fetchProfile: (userId: string) => Promise<void>;
  /** Submit session chơi + tự động refresh profile */
  submitSession: (input: SessionInput) => Promise<SessionResult>;
  /** Xóa lastSessionResult sau khi đã hiển thị */
  clearLastResult: () => void;
}

const GamificationContext = createContext<GamificationContextType>({
  profile: null,
  loading: false,
  error: null,
  lastSessionResult: null,
  fetchProfile: async () => {},
  submitSession: async () => {
    throw new Error('GamificationProvider chưa được mount');
  },
  clearLastResult: () => {},
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSessionResult, setLastSessionResult] = useState<SessionResult | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserGamificationProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('❌ Lỗi tải gamification profile:', err);
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitSession = useCallback(
    async (input: SessionInput): Promise<SessionResult> => {
      const result = await logGameSession(input);
      setLastSessionResult(result);

      // Auto-refetch profile sau khi submit
      try {
        const updatedProfile = await getUserGamificationProfile(input.userId);
        setProfile(updatedProfile);
      } catch (err) {
        console.error('⚠️ Không thể refresh profile sau khi submit session:', err);
      }

      return result;
    },
    [],
  );

  const clearLastResult = useCallback(() => {
    setLastSessionResult(null);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        profile,
        loading,
        error,
        lastSessionResult,
        fetchProfile,
        submitSession,
        clearLastResult,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

/** Hook dùng gamification context */
export const useGamification = () => useContext(GamificationContext);
