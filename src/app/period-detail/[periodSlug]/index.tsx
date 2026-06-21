/**
 * Màn hình chi tiết Thời kỳ.
 * Port từ Java PeriodDetailFragment: ảnh nền, overlay, phần Tổng quan,
 * nút Xem thêm để mở danh sách giai đoạn.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Period } from '@/models/Period';
import { getPeriodBySlug } from '@/services/periodService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, HistoryImage, Button, ErrorState } from '@/components/ui';
import { useTopInset } from '@/components/ui/Screen';
import { getPrimaryImageRef } from '@/utils/media';

export default function PeriodDetailScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const topInset = useTopInset();

  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeriod = useCallback(async () => {
    if (!periodSlug) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPeriodBySlug(periodSlug);
      setPeriod(data);
    } catch (err) {
      console.error('Lỗi tải chi tiết thời kỳ:', err);
      setError('Không thể tải chi tiết thời kỳ.\nVui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug]);

  useEffect(() => {
    loadPeriod();
  }, [loadPeriod]);

  const handleReadMore = () => {
    if (!periodSlug) return;
    router.push({
      pathname: '/stage/[periodSlug]',
      params: { periodSlug },
    });
  };

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải tổng quan…
        </Text>
      </Screen>
    );
  }

  if (error || !period) {
    return (
      <Screen style={styles.errorScreen}>
        <ErrorState
          message={error ?? 'Không tìm thấy thời kỳ.'}
          onRetry={loadPeriod}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: topInset + SPACING[3] }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: '#B2B2B2' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.82}
        >
          <Ionicons name="chevron-back" size={22} color="#3A3A3A" />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: colors.secondary }]}
          numberOfLines={1}
        >
          {period.title}
        </Text>
      </View>

      <View style={[styles.headerDivider, { backgroundColor: colors.borderStrong }]} />

      <View
        style={[
          styles.detailCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <HistoryImage
          uri={getPrimaryImageRef(period)}
          style={styles.image}
          fallbackIcon="image-outline"
        />
        <View style={styles.overlay} />

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.overviewTitle}>Tổng quan</Text>
            <Text style={styles.description}>
              {period.description || period.summary || 'Chưa có mô tả.'}
            </Text>
          </ScrollView>

          <Button
            label="Xem thêm"
            onPress={handleReadMore}
            variant="secondary"
            size="md"
            icon="arrow-forward"
            style={styles.readMoreButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[4],
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[3],
  },
  errorScreen: {
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerDivider: {
    height: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING[4],
  },
  detailCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(72,56,43,0.65)',
  },
  content: {
    flex: 1,
    padding: SPACING[4],
  },
  scrollContent: {
    paddingBottom: SPACING[6],
  },
  overviewTitle: {
    color: '#F5F5F5',
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
  },
  description: {
    color: '#F5F5F5',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 30,
  },
  readMoreButton: {
    width: 300,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: BORDER_RADIUS.base,
    marginBottom: SPACING[2],
  },
});
