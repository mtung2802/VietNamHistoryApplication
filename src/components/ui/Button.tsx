/**
 * Button — nút cao cấp với 4 biến thể:
 * - primary: nền gold, chữ tối (CTA chính)
 * - secondary: nền đỏ VN
 * - outline: viền gold, nền trong suốt
 * - ghost: chỉ chữ gold
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  Fonts,
  HTML_SHADOWS,
  SPACING,
} from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth = true,
  style,
}: ButtonProps) {
  const colors = useThemeColors();

  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  let bg = 'transparent';
  let fg = colors.primary;
  let borderColor = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'primary':
      bg = colors.primary;
      fg = colors.onPrimary;
      break;
    case 'secondary':
      bg = colors.secondary;
      fg = colors.onSecondary;
      break;
    case 'outline':
      bg = 'transparent';
      fg = colors.primary;
      borderColor = colors.primary;
      borderWidth = 1.4;
      break;
    case 'ghost':
      bg = 'transparent';
      fg = colors.primary;
      break;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth,
          paddingVertical: sizeStyle.py,
          paddingHorizontal: sizeStyle.px,
          opacity: isDisabled ? 0.55 : 1,
        },
        variant === 'primary' && !isDisabled && HTML_SHADOWS.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={sizeStyle.icon} color={fg} />}
          <Text style={[styles.label, { color: fg, fontSize: sizeStyle.font }]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const SIZE_STYLES = {
  sm: { py: SPACING[2], px: SPACING[4], font: FONT_SIZES.sm, icon: 16 },
  md: { py: SPACING[3], px: SPACING[5], font: FONT_SIZES.base, icon: 18 },
  lg: { py: SPACING[4], px: SPACING[6], font: FONT_SIZES.lg, icon: 22 },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  label: {
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: Fonts.bold,
    letterSpacing: 0.3,
  },
});
