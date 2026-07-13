/**
 * File định nghĩa theme, màu sắc, font size, spacing cho toàn ứng dụng
 */

import '@/global.css';

import { Platform } from 'react-native';

// ===== ĐỊNH NGHĨA MÀU SẮC =====
export const COLORS = {
  // Sử Việt: đỏ son, vàng đồng và giấy cổ
  primary: '#82151b',
  accent: '#b49b6b',
  lightBg: '#f4ebd8',
  tabInactive: '#7d6d5c',

  // Màu hỗ trợ
  white: '#f6e9cf',
  black: '#000000',
  gray100: '#f4ead2',
  gray200: '#e7d8bd',
  gray300: '#d6c5aa',
  gray400: '#a89783',
  gray500: '#7d6d5c',
  gray600: '#625448',
  gray700: '#493c32',
  gray800: '#352a22',
  gray900: '#2a201a',

  // Màu trạng thái
  success: '#3d7a4e',
  warning: '#b49b6b',
  error: '#a83232',
  info: '#7d6d5c',
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
  background: '#1F1714',
  surface: '#2A201A',
  surfaceElevated: '#34261F',

  primary: '#B23A2B',
  primaryBright: '#E9C46A',
  primaryDim: 'rgba(180, 155, 107, 0.18)',
  onPrimary: '#F6E9CF',
  secondary: '#B49B6B',
  onSecondary: '#2A201A',

  text: '#F6E9CF',
  textSecondary: '#D6C5AA',
  textMuted: '#A89783',

  border: 'rgba(180, 155, 107, 0.24)',
  borderStrong: '#B49B6B',

  overlay: 'rgba(0,0,0,0.6)',

  success: '#75B987',
  warning: '#E9C46A',
  error: '#D87878',
  info: '#D6C5AA',

  white: '#F6E9CF',
  black: '#000000',
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#F4EBD8',
  surface: '#FDF8EC',
  surfaceElevated: '#F4EAD2',

  primary: '#82151B',
  primaryBright: '#B23A2B',
  primaryDim: 'rgba(130, 21, 27, 0.10)',
  onPrimary: '#F6E9CF',
  secondary: '#B49B6B',
  onSecondary: '#2A201A',

  text: '#2A201A',
  textSecondary: '#7D6D5C',
  textMuted: '#A89783',

  border: 'rgba(101, 19, 16, 0.12)',
  borderStrong: '#B49B6B',

  overlay: 'rgba(0,0,0,0.4)',

  success: '#3D7A4E',
  warning: '#B49B6B',
  error: '#A83232',
  info: '#7D6D5C',

  white: '#F6E9CF',
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
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// ===== FONTS =====
export const Fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  serifRegular: 'Nunito_400Regular',
  serifSemiBold: 'Nunito_600SemiBold',
  serifBold: 'Nunito_700Bold',
  serifExtraBold: 'Nunito_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

// ===== PALETTE MÀU GỐC HTML (Thiết kế Sử Việt) =====
// Ánh xạ trực tiếp từ CSS variables trong file Sử Việt.dc.html
export const SuVietColors = {
  son: '#82151b',       // --son: Đỏ son
  son2: '#651310',      // --son-2: Đỏ tối (gradient end)
  do: '#b23a2b',        // --do: Đỏ sáng
  dong: '#b49b6b',      // --dong: Vàng đồng
  dong2: '#d8bd79',     // --dong-2: Vàng nhạt
  sao: '#e9c46a',       // --sao: Vàng sao
  giay: '#f4ebd8',      // --giay: Nền giấy cổ
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
    text: COLORS.gray900,
    background: COLORS.lightBg,
    backgroundElement: COLORS.gray100,
    backgroundSelected: COLORS.gray200,
    textSecondary: COLORS.gray600,
  },
  dark: {
    text: '#F6E9CF',
    background: '#1F1714',
    backgroundElement: '#2A201A',
    backgroundSelected: '#34261F',
    textSecondary: '#D6C5AA',
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
