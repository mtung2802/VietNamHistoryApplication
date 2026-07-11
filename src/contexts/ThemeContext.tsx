/**
 * ThemeContext — quản lý chế độ Light/Dark cho toàn ứng dụng.
 *
 * - Mặc định: dark (tông charcoal + gold premium).
 * - Lưu lựa chọn vào AsyncStorage để giữ nguyên sau khi reload.
 * - Cung cấp hook `useThemeColors()` trả về palette đang active +
 *   `mode`, `toggleTheme()`, `setMode()`.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PALETTES,
  ThemeColors,
  ThemeMode,
  LIGHT_COLORS,
} from '@/constants/theme';

const THEME_MODE_KEY = '@vietnam_history_app_theme_mode';
const DEFAULT_MODE: ThemeMode = 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  /** true cho tới khi đọc xong lựa chọn đã lưu */
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: DEFAULT_MODE,
  colors: LIGHT_COLORS,
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {},
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [loading, setLoading] = useState(true);

  // Đọc lựa chọn đã lưu khi khởi động
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setModeState(saved);
        }
      } catch (err) {
        console.error('❌ Lỗi đọc theme mode:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = (next: ThemeMode) => {
    AsyncStorage.setItem(THEME_MODE_KEY, next).catch((err) =>
      console.error('❌ Lỗi lưu theme mode:', err),
    );
  };

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    persist(next);
  };

  const toggleTheme = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persist(next);
      return next;
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: PALETTES[mode],
      isDark: mode === 'dark',
      toggleTheme,
      setMode,
      loading,
    }),
    [mode, loading],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Hook chính: lấy palette + điều khiển theme. */
export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Hook tiện lợi: chỉ lấy bộ màu đang active. */
export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}
