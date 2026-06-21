/**
 * Màn hình Thời Kỳ Lịch Sử Việt Nam
 * Hiển thị danh sách các thời kỳ từ Firestore collection "periods"
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Period, yearFromIso, formatYear } from '@/models/Period';
import { getPeriods } from '@/services/periodService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  HistoryImage,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { getPrimaryImageRef } from '@/utils/media';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING[4];

// ─── Item card ────────────────────────────────────────────────────────────────
function PeriodCard({
  item,
  onPress,
}: {
  item: Period;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const startYear = yearFromIso(item.startDate);
  const endYear = yearFromIso(item.endDate);
  const yearLabel = `${formatYear(startYear)}–${formatYear(endYear)}`;

  return (
    <View style={styles.page}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.periodCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <HistoryImage
          uri={getPrimaryImageRef(item)}
          style={styles.image}
          fallbackIcon="image-outline"
        />
        <View style={styles.fullOverlay} />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={3}>
            {item.title ?? 'No Title'}
          </Text>

          <View style={styles.cardLowerContent}>
            <Text style={styles.periodRange}>
              {yearLabel || 'No Period'}
            </Text>
            <View style={styles.orangeDivider} />
            <Text style={styles.summary} numberOfLines={9}>
              {item.summary ?? 'No Description'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function PeriodScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
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
      pathname: '/period-detail/[periodSlug]',
      params: { periodSlug: period.slug ?? period.id },
    });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(nextIndex);
  };

  const renderItem = ({ item }: ListRenderItemInfo<Period>) => (
    <PeriodCard item={item} onPress={() => handlePressItem(item)} />
  );

  return (
    <Screen safeArea edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          Thời kỳ
        </Text>
        <View style={[styles.headerDivider, { backgroundColor: colors.borderStrong }]} />
      </View>

      {loading ? (
        <LoadingState message="Đang tải thời kỳ lịch sử…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadPeriods()} />
      ) : (
        <>
          <FlatList
            data={periods}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pagerContent}
            onMomentumScrollEnd={handleMomentumEnd}
            ListEmptyComponent={
              <View style={styles.emptyWrapper}>
                <EmptyState message="Chưa có thời kỳ nào." />
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadPeriods(true)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />

          {periods.length > 1 && (
            <View style={styles.dots}>
              {periods.map((period, index) => (
                <View
                  key={period.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === activeIndex
                        ? colors.secondary
                        : colors.borderStrong,
                    },
                    index === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: SPACING[3],
  },
  sectionHeader: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING[2],
  },
  headerDivider: {
    height: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  pagerContent: {
    flexGrow: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: SPACING[2],
  },
  periodCard: {
    flex: 1,
    minHeight: 560,
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
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(72,56,43,0.65)',
  },
  cardContent: {
    flex: 1,
    padding: SPACING[4],
  },
  cardTitle: {
    color: '#F5F5F5',
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 38,
    marginTop: 56,
  },
  cardLowerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 84,
  },
  periodRange: {
    color: '#F5F5F5',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  orangeDivider: {
    height: 3,
    backgroundColor: '#E8582B',
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING[3],
    marginBottom: SPACING[4],
  },
  summary: {
    color: '#F5F5F5',
    fontSize: FONT_SIZES.lg,
    lineHeight: 27,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING[2],
    paddingTop: SPACING[2],
    paddingBottom: SPACING[3],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  emptyWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
});
