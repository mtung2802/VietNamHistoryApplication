/**
 * Card — panel surface bo góc với viền gold mảnh + shadow sâu.
 * Bấm được nếu truyền onPress.
 */

import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, HTML_SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Bỏ padding mặc định (vd. card có ảnh tràn viền). */
  noPadding?: boolean;
  /** Viền gold nhấn mạnh. */
  highlighted?: boolean;
}

export function Card({
  children,
  onPress,
  style,
  noPadding,
  highlighted,
}: CardProps) {
  const colors = useThemeColors();

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: highlighted ? colors.primary : colors.border,
      borderWidth: highlighted ? 1.2 : StyleSheet.hairlineWidth,
      shadowColor: HTML_SHADOWS.card.shadowColor,
    },
    !noPadding && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...HTML_SHADOWS.card,
  },
  padded: {
    padding: SPACING[4],
  },
});
