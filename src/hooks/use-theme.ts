/**
 * useTheme — cầu nối tương thích ngược.
 *
 * Trả về bộ màu legacy (`Colors.light`/`Colors.dark`) nhưng map theo
 * theme mode đang active trong ThemeContext, để code cũ vẫn chạy đúng
 * theo toggle Light/Dark.
 *
 * Code MỚI nên dùng trực tiếp `useThemeColors()` từ '@/contexts/ThemeContext'.
 */

import { Colors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const { mode } = useThemeContext();
  return Colors[mode];
}
