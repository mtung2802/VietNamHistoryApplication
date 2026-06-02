/**
 * Screen — wrapper nền theo theme + SafeArea.
 * Dùng làm gốc cho mọi màn hình để nền đổi theo Light/Dark.
 */

import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useThemeColors } from '@/contexts/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  /** Bật padding SafeArea phía trên (mặc định false vì AppHeader tự xử lý). */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
  /** dùng SafeAreaView (true) hay View thường (false). */
  safeArea?: boolean;
}

export function Screen({
  children,
  edges = ['bottom'],
  style,
  safeArea = false,
}: ScreenProps) {
  const colors = useThemeColors();

  if (safeArea) {
    return (
      <SafeAreaView
        edges={edges}
        style={[styles.root, { backgroundColor: colors.background }, style]}
      >
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}

/** Lấy chiều cao status bar để tự chừa khoảng cho header tuỳ biến. */
export function useTopInset() {
  return useSafeAreaInsets().top;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
