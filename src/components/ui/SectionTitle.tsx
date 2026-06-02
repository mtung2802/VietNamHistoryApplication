/**
 * SectionTitle — tiêu đề mục với thanh gold dọc bên trái.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface SectionTitleProps {
  title: string;
  /** Màu thanh nhấn (mặc định gold). */
  accent?: string;
}

export function SectionTitle({ title, accent }: SectionTitleProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: accent ?? colors.primary }]} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  bar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.2,
  },
});
