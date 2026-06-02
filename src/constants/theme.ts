/**
 * File định nghĩa theme, màu sắc, font size, spacing cho toàn ứng dụng
 */

import '@/global.css';

import { Platform } from 'react-native';

// ===== ĐỊNH NGHĨA MÀU SẮC =====
export const COLORS = {
  // Màu chính
  primary: '#C8102E', // Đỏ chính
  accent: '#FFD700', // Vàng
  lightBg: '#fff5f5', // Nền sáng
  tabInactive: '#ffaaaa', // Tab không hoạt động

  // Màu hỗ trợ
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Màu trạng thái
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// ===== PALETTE THEME ĐỘNG (Light + Dark) =====
// Hai palette dùng CHUNG bộ key (kiểu ThemeColors) để toggle runtime.
// Tông premium: charcoal + GOLD là điểm nhấn chính, ĐỎ VN là màu phụ
// (dùng cho lá cờ / yếu tố lịch sử).

export interface ThemeColors {
  // Nền
  background: string; // nền màn hình
  surface: string; // nền card / panel
  surfaceElevated: string; // panel nổi cao hơn (modal, header)
  // Điểm nhấn
  primary: string; // GOLD - màu nhấn chính
  primaryBright: string; // gold rực hơn (icon, highlight)
  primaryDim: string; // gold mờ (nền nhạt, viền)
  onPrimary: string; // màu chữ/icon nằm TRÊN nền primary
  secondary: string; // ĐỎ VN - màu phụ
  onSecondary: string;
  // Chữ
  text: string;
  textSecondary: string;
  textMuted: string;
  // Đường viền
  border: string;
  borderStrong: string;
  // Lớp phủ
  overlay: string; // phủ tối trên ảnh
  // Trạng thái
  success: string;
  warning: string;
  error: string;
  info: string;
  // Cố định
  white: string;
  black: string;
}

export const DARK_COLORS: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',

  primary: '#D4AF37', // gold cổ điển
  primaryBright: '#FFD700',
  primaryDim: 'rgba(212,175,55,0.16)',
  onPrimary: '#1A1A1A',
  secondary: '#C8102E', // đỏ VN
  onSecondary: '#FFFFFF',

  text: '#F5F5F5',
  textSecondary: '#B0B0B0',
  textMuted: '#6B6B6B',

  border: '#333333',
  borderStrong: '#4A4A4A',

  overlay: 'rgba(0,0,0,0.6)',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  white: '#FFFFFF',
  black: '#000000',
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#FFFBF5', // trắng ngà ấm
  surface: '#FFFFFF',
  surfaceElevated: '#FFF7EA',

  primary: '#B8860B', // dark goldenrod (đủ tương phản trên nền sáng)
  primaryBright: '#D4AF37',
  primaryDim: 'rgba(184,134,11,0.12)',
  onPrimary: '#FFFFFF',
  secondary: '#C8102E',
  onSecondary: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  overlay: 'rgba(0,0,0,0.4)',

  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
};

export type ThemeMode = 'light' | 'dark';

export const PALETTES: Record<ThemeMode, ThemeColors> = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
};

// ===== CỠ CHỮ =====
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// ===== ĐỘ DÀY CHỮ =====
export const FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ===== KHOẢNG CÁCH =====
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ===== GÓC BO TRÒN =====
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// ===== BÓNG ĐỔ =====
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// ===== FONTS =====
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ===== THEME TỔNG HỢP =====
export const THEME = {
  colors: COLORS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
} as const;

// ===== LEGACY EXPORTS (để tương thích với code cũ) =====
export const Colors = {
  light: {
    text: COLORS.black,
    background: COLORS.white,
    backgroundElement: COLORS.gray100,
    backgroundSelected: COLORS.gray200,
    textSecondary: COLORS.gray600,
  },
  dark: {
    text: COLORS.white,
    background: COLORS.black,
    backgroundElement: COLORS.gray800,
    backgroundSelected: COLORS.gray700,
    textSecondary: COLORS.gray400,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
