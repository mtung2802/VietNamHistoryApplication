/**
 * Các view trạng thái dùng chung: Loading / Error / Empty.
 * Tông charcoal + gold, căn giữa màn.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Button } from './Button';

export function LoadingState({ message = 'Đang tải…' }: { message?: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({
  message = 'Đã có lỗi xảy ra.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          label="Thử lại"
          icon="refresh"
          variant="outline"
          fullWidth={false}
          onPress={onRetry}
          style={{ marginTop: SPACING[2] }}
        />
      )}
    </View>
  );
}

export function EmptyState({
  message = 'Chưa có dữ liệu.',
  icon = 'file-tray-outline',
}: {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Ionicons name={icon} size={56} color={colors.textMuted} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[12],
    gap: SPACING[3],
  },
  text: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
});
