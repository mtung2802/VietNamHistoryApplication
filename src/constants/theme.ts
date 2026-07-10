/**
 * File định nghĩa theme, màu sắc, font size, spacing cho toàn ứng dụng
 */

import '@/global.css';

import { Platform } from 'react-native';

// ===== ĐỊNH NGHĨA MÀU SẮC =====
export const COLORS = {
  // Màu chính
  primary: '#C8102E', // Đỏ PTIT
  accent: '#FFFFFF', // Trắng thay vì Vàng
  lightBg: '#FFFFFF', // Nền sáng
  tabInactive: '#E5E7EB', // Tab không hoạt động

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
  primary: string; // ĐỎ PTIT - màu nhấn chính
  primaryBright: string; // Đỏ sáng hơn (icon, highlight)
  primaryDim: string; // Đỏ mờ (nền nhạt, viền)
  onPrimary: string; // màu chữ/icon nằm TRÊN nền primary
  secondary: string; // Trắng hoặc Xám - màu phụ
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

  primary: '#C8102E', // Đỏ PTIT
  primaryBright: '#E53935',
  primaryDim: 'rgba(200, 16, 46, 0.16)',
  onPrimary: '#FFFFFF',
  secondary: '#E5E7EB', // Xám sáng
  onSecondary: '#111827',

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
  background: '#FFFFFF', // Trắng PTIT
  surface: '#FFFFFF',
  surfaceElevated: '#F9FAFB', // Trắng xám nhạt

  primary: '#C8102E', // Đỏ PTIT
  primaryBright: '#E53935',
  primaryDim: 'rgba(200, 16, 46, 0.08)',
  onPrimary: '#FFFFFF',
  secondary: '#1F2937', // Chữ/Icon phụ màu tối
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
export const Fonts = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifExtraBold: 'PlayfairDisplay_800ExtraBold',
};

// ===== PALETTE MÀU GỐC HTML (Thiết kế Sử Việt) =====
// Ánh xạ trực tiếp từ CSS variables trong file Sử Việt.dc.html
export const SuVietColors = {
  son: '#8b1c17',       // --son: Đỏ sẫm chính (gradient start)
  son2: '#651310',      // --son-2: Đỏ tối (gradient end)
  do: '#b23a2b',        // --do: Đỏ sáng
  dong: '#a8823a',      // --dong: Vàng đồng
  dong2: '#d8bd79',     // --dong-2: Vàng nhạt
  sao: '#f0c04c',       // --sao: Vàng sao
  giay: '#f3ead6',      // --giay: Nền giấy cổ
  card: '#fdf8ec',      // --card: Nền thẻ bài
  muc: '#2a201a',       // --muc: Mực đen (text chính)
  muc2: '#7d6d5c',      // --muc-2: Mực nhạt (text phụ)
  line: 'rgba(101,19,16,0.12)', // --line: Màu viền
  // Màu trạng thái quiz
  correct: '#3d7a4e',   // Đúng: Xanh lá
  wrong: '#a83232',     // Sai: Đỏ
  medium: '#b07f2c',    // Trung bình: Vàng
  // Nền trạng thái
  correctBg: '#e8f3ea',
  wrongBg: '#f7e6e4',
  rulesBg: '#f4ead2',   // Nền luật chơi
  // Shadow
  shadowSon: 'rgba(101,19,16,1)',
} as const;

// ===== BÓNG ĐỔ THEO THIẾT KẾ HTML =====
export const HTML_SHADOWS = {
  // 0 10px 24px -18px rgba(101,19,16,.5)
  card: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  // 0 20px 40px -26px rgba(101,19,16,.6)
  cardLarge: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  // 0 16px 34px -24px rgba(101,19,16,.6)
  rankCard: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 17,
    elevation: 5,
  },
  // 0 12px 24px -12px rgba(101,19,16,.8) – nút bấm
  button: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  // 0 14px 28px -10px rgba(101,19,16,.8) – FAB
  fab: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 10,
  },
} as const;

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
