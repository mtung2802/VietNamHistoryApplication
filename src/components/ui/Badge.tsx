/**
 * Badge — nhãn nhỏ (năm, độ khó, thể loại...).
 * tone: 'gold' | 'red' | 'neutral' | màu tuỳ ý.
 */

import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface BadgeProps {
  label: string;
  tone?: 'gold' | 'red' | 'neutral';
  /** Màu nền tuỳ chỉnh (đè tone). */
  color?: string;
  /** Kiểu viền thay vì nền đặc. */
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'gold', color, outline, style }: BadgeProps) {
  const colors = useThemeColors();

  const base =
    color ??
    (tone === 'gold'
      ? colors.primary
      : tone === 'red'
        ? colors.secondary
        : colors.textMuted);

  const bg = outline ? 'transparent' : base;
  const fg = outline ? base : tone === 'gold' ? colors.onPrimary : colors.white;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: base,
          borderWidth: outline ? 1 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING[3],
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.4,
  },
});
