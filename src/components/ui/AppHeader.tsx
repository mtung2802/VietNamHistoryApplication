/**
 * AppHeader — header cao cấp tông charcoal với dải gold mảnh ở đáy.
 * Có nút back tuỳ chọn, tiêu đề/subtitle, nút toggle theme và slot phải.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FONT_SIZES, FONT_WEIGHTS, Fonts, SPACING, SuVietColors } from '@/constants/theme';
import { useThemeColors, useThemeContext } from '@/contexts/ThemeContext';
import { useTopInset } from './Screen';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Hiện nút back (mặc định: tự suy theo router.canGoBack). */
  showBack?: boolean;
  /** Hiện nút toggle Light/Dark (mặc định true). */
  showThemeToggle?: boolean;
  /** Phần tử tuỳ biến ở góc phải (đè lên nút toggle nếu có). */
  right?: React.ReactNode;
  onBack?: () => void;
  /** Căn giữa tiêu đề (mặc định false: căn trái sang trọng). */
  centerTitle?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  showThemeToggle = true,
  right,
  onBack,
  centerTitle = false,
}: AppHeaderProps) {
  const colors = useThemeColors();
  const { isDark, toggleTheme } = useThemeContext();
  const router = useRouter();
  const topInset = useTopInset();

  const canBack = showBack && router.canGoBack();

  return (
    <LinearGradient
      colors={[SuVietColors.son, SuVietColors.son2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.wrap,
        { paddingTop: topInset + 8 },
      ]}
    >
      <View style={styles.row}>
        {canBack ? (
          <TouchableOpacity
            onPress={onBack ?? (() => router.back())}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconSpacer} />
        )}

        <View
          style={[
            styles.titleBox,
            centerTitle && styles.titleBoxCenter,
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.onPrimary },
              centerTitle && styles.textCenter,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: SuVietColors.dong2 },
                centerTitle && styles.textCenter,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {right ? (
          <View style={styles.rightSlot}>{right}</View>
        ) : showThemeToggle ? (
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconSpacer} />
        )}
      </View>

      {/* Dải gold mảnh */}
      <View style={[styles.accent, { backgroundColor: SuVietColors.dong }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: SPACING[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    gap: SPACING[3],
    minHeight: 44,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  iconSpacer: { width: 38, height: 38 },
  titleBox: { flex: 1 },
  titleBoxCenter: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: Fonts.serifBold,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: Fonts.semibold,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rightSlot: { minWidth: 38, alignItems: 'flex-end' },
  accent: {
    height: 2,
    marginTop: SPACING[3],
    marginHorizontal: SPACING[4],
    borderRadius: 1,
    opacity: 0.85,
  },
});
