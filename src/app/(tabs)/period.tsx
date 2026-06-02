/**
 * Màn hình Thời Kỳ Lịch Sử Việt Nam
 * Hiển thị danh sách các thời kỳ từ Firestore collection "periods"
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Period, yearFromIso, formatYear } from '@/models/Period';
import { getPeriods } from '@/services/periodService';
import { FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  Badge,
  HistoryImage,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

// ─── Item card ────────────────────────────────────────────────────────────────
function PeriodCard({
  item,
  onPress,
  index,
}: {
  item: Period;
  onPress: () => void;
  index: number;
}) {
  const colors = useThemeColors();
  const startYear = yearFromIso(item.startDate);
  const endYear = yearFromIso(item.endDate);
  const yearLabel = `${formatYear(startYear)} — ${formatYear(endYear)}`;

  return (
    <Card onPress={onPress} noPadding style={styles.card}>
      <View style={styles.imageWrapper}>
        <HistoryImage
          uri={item.coverMediaRef}
          style={styles.image}
          fallbackIcon="image-outline"
        />
        {/* Overlay tối để chữ nổi */}
        <View style={[styles.imageOverlay, { backgroundColor: colors.overlay }]} />
        {/* Badge số thứ tự */}
        <View style={[styles.indexBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.indexText, { color: colors.onPrimary }]}>
            {index + 1}
          </Text>
        </View>
        {/* Năm nổi trên ảnh */}
        <View style={styles.yearOnImage}>
          <Badge label={yearLabel} tone="gold" />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.periodName, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.summary && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {item.summary}
          </Text>
        )}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerLabel, { color: colors.primary }]}>
            Xem giai đoạn
          </Text>
          <Ionicons name="arrow-forward-circle" size={26} color={colors.primary} />
        </View>
      </View>
    </Card>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function PeriodScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPeriods = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await getPeriods();
      setPeriods(data);
    } catch (err) {
      console.error('❌ Lỗi tải thời kỳ:', err);
      setError('Không thể tải danh sách thời kỳ.\nVui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  const handlePressItem = (period: Period) => {
    router.push({
      pathname: '/stage/[periodSlug]',
      params: { periodSlug: period.slug ?? period.id },
    });
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Period>) => (
    <PeriodCard item={item} index={index} onPress={() => handlePressItem(item)} />
  );

  return (
    <Screen>
      <AppHeader
        title="Thời Kỳ Lịch Sử"
        subtitle="4000 năm dựng nước & giữ nước"
        showBack={false}
      />
      {loading ? (
        <LoadingState message="Đang tải thời kỳ lịch sử…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadPeriods()} />
      ) : (
        <FlatList
          data={periods}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState message="Chưa có thời kỳ nào." />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPeriods(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[8],
    gap: SPACING[4],
  },
  card: {},
  imageWrapper: {
    width: '100%',
    height: 190,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  indexBadge: {
    position: 'absolute',
    top: SPACING[3],
    left: SPACING[3],
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  yearOnImage: {
    position: 'absolute',
    bottom: SPACING[3],
    left: SPACING[3],
  },
  cardBody: {
    padding: SPACING[4],
    gap: SPACING[2],
  },
  periodName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 26,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[1],
    paddingTop: SPACING[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
