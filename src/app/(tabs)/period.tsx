/**
 * Màn hình Thời Kỳ Lịch Sử Việt Nam
 * Hiển thị danh sách các thời kỳ từ Firestore collection "periods"
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Period, yearFromIso, formatYear } from '@/models/Period';
import { getPeriods } from '@/services/periodService';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  SPACING,
} from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Placeholder khi không có ảnh ──────────────────────────────────────────
function PeriodPlaceholder({ name }: { name: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderEmoji}>📜</Text>
      <Text style={styles.placeholderInitial} numberOfLines={1}>
        {name?.charAt(0) ?? '?'}
      </Text>
    </View>
  );
}

// ─── Item card ──────────────────────────────────────────────────────────────
function PeriodCard({
  item,
  onPress,
  index,
}: {
  item: Period;
  onPress: () => void;
  index: number;
}) {
  const startYear = yearFromIso(item.startDate);
  const endYear = yearFromIso(item.endDate);
  const yearLabel = `${formatYear(startYear)} — ${formatYear(endYear)}`;
  const hasImage = !!item.coverMediaRef;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.card, index === 0 && styles.cardFirst]}
    >
      {/* Hình ảnh / Placeholder */}
      <View style={styles.imageWrapper}>
        {hasImage ? (
          <Image
            source={{ uri: item.coverMediaRef }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <PeriodPlaceholder name={item.title} />
        )}

        {/* Badge số thứ tự */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>

        {/* Gradient overlay at bottom of image */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Nội dung */}
      <View style={styles.cardBody}>
        {/* Dải năm */}
        <View style={styles.yearRow}>
          <View style={styles.yearDot} />
          <Text style={styles.yearText}>{yearLabel}</Text>
        </View>

        {/* Tên thời kỳ */}
        <Text style={styles.periodName} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Mô tả ngắn (summary) */}
        {!!item.summary && (
          <Text style={styles.description} numberOfLines={3}>
            {item.summary}
          </Text>
        )}

        {/* Arrow */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>Xem giai đoạn</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function PeriodScreen() {
  const router = useRouter();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

  // Navigate đến Stage list, truyền periodSlug (= doc ID)
  const handlePressItem = (period: Period) => {
    router.push({
      pathname: '/stage/[periodSlug]',
      params: { periodSlug: period.slug ?? period.id },
    });
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Period>) => (
    <PeriodCard
      item={item}
      index={index}
      onPress={() => handlePressItem(item)}
    />
  );

  const keyExtractor = (item: Period) => item.id;

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Header />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thời kỳ lịch sử…</Text>
        </View>
      </View>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Header />
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadPeriods()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Normal State ───────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={periods}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Chưa có thời kỳ nào.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPeriods(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopBar}>
        <View style={styles.starRow}>
          {['★', '★', '★', '★', '★'].map((s, i) => (
            <Text key={i} style={styles.starText}>{s}</Text>
          ))}
        </View>
        <Text style={styles.headerTitle}>Thời Kỳ Lịch Sử Việt Nam</Text>
        <Text style={styles.headerSubtitle}>
          Hành trình 4000 năm dựng nước và giữ nước
        </Text>
      </View>
      <View style={styles.headerAccentBar} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    marginBottom: SPACING[4],
  },
  headerTopBar: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: SPACING[5],
    paddingHorizontal: SPACING[5],
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING[2],
  },
  starText: {
    color: COLORS.accent,
    fontSize: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING[1],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerAccentBar: {
    height: 4,
    backgroundColor: COLORS.accent,
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: SPACING[8],
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: SPACING[4],
    marginBottom: SPACING[4],
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardFirst: {
    marginTop: SPACING[2],
  },

  // Image
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8e8e8',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce8e8',
    gap: 4,
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  placeholderInitial: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },

  // Badge
  badge: {
    position: 'absolute',
    top: SPACING[3],
    left: SPACING[3],
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    ...SHADOWS.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Card body
  cardBody: {
    padding: SPACING[4],
    gap: SPACING[2],
  },

  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  yearDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  yearText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  periodName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    lineHeight: 26,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[1],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // ── States ──────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[12],
    gap: SPACING[3],
  },

  // Loading
  loadingText: {
    color: COLORS.gray500,
    fontSize: FONT_SIZES.base,
    marginTop: SPACING[2],
  },

  // Error
  errorEmoji: { fontSize: 48 },
  errorText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryBtn: {
    marginTop: SPACING[2],
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[8],
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  retryBtnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
  },

  // Empty
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    color: COLORS.gray400,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
  },
});