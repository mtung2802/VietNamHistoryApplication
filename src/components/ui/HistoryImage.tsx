/**
 * HistoryImage — bọc expo-image với:
 * - Tự chuẩn hoá link Google Drive (resolveImageUrl).
 * - Placeholder gradient charcoal + icon khi không có ảnh / lỗi.
 * - Hiệu ứng fade khi load.
 */

import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageContentFit, ImageStyle } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/contexts/ThemeContext';
import { resolveImageUrl } from '@/utils/media';

interface HistoryImageProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  /** icon hiển thị khi không có ảnh */
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  /** bo góc nhanh */
  radius?: number;
}

export function HistoryImage({
  uri,
  style,
  contentFit = 'cover',
  fallbackIcon = 'image-outline',
  radius,
}: HistoryImageProps) {
  const colors = useThemeColors();
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(uri);
  const showFallback = !resolved || failed;

  const radiusStyle = radius != null ? { borderRadius: radius } : undefined;

  if (showFallback) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: colors.surfaceElevated },
          radiusStyle,
          style as StyleProp<ViewStyle>,
        ]}
      >
        <Ionicons name={fallbackIcon} size={40} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolved }}
      style={[radiusStyle, style]}
      contentFit={contentFit}
      transition={250}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
