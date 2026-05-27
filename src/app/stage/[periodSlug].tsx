/**
 * Màn hình Danh Sách Giai Đoạn của một Thời Kỳ
 * Route: /stage/[periodSlug]
 *
 * Tương đương StageActivity.java
 * Đọc subcollection: periods/{periodSlug}/stages (orderBy sortOrder)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stage } from '@/models/Stage';
import { Period, yearFromIso, formatYear } from '@/models/Period';
import { getStagesByPeriod } from '@/services/stageService';
import { getPeriodById } from '@/services/periodService';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SHADOWS,
  SPACING,
} from '@/constants/theme';

// ─── Placeholder khi không có ảnh ──────────────────────────────────────────
function StagePlaceholder({ name }: { name: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderEmoji}>⚔️</Text>
      <Text style={styles.placeholderInitial} numberOfLines={1}>
        {name?.charAt(0) ?? '?'}
      </Text>
    </View>
  );
}

// ─── Stage Card ─────────────────────────────────────────────────────────────
function StageCard({
  item,
  index,
  onPress,
}: {
  item: Stage;
  index: number;
  onPress: () => void;
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
      {/* Ảnh */}
      <View style={styles.imageWrapper}>
        {hasImage ? (
          <Image
            source={{ uri: item.coverMediaRef }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <StagePlaceholder name={item.title} />
        )}
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={styles.imageOverlay} />
      </View>

      {/* Nội dung */}
      <View style={styles.cardBody}>
        <View style={styles.yearRow}>
          <View style={styles.yearDot} />
          <Text style={styles.yearText}>{yearLabel}</Text>
        </View>

        <Text style={styles.stageTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {!!item.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>Xem chi tiết</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function StageScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug: string }>();
  const router = useRouter();

  const [stages, setStages] = useState<Stage[]>([]);
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!periodSlug) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const [stagesData, periodData] = await Promise.all([
          getStagesByPeriod(periodSlug),
          getPeriodById(periodSlug),
        ]);
        setStages(stagesData);
        setPeriod(periodData);
      } catch (err) {
        console.error('❌ Lỗi tải giai đoạn:', err);
        setError('Không thể tải giai đoạn.\nVui lòng thử lại.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [periodSlug],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleBack = () => router.back();

  const handlePressStage = (stage: Stage) => {
    router.push({
      pathname: '/stage-detail/[periodSlug]/[stageSlug]',
      params: { periodSlug, stageSlug: stage.id },
    });
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Stage>) => (
    <StageCard
      item={item}
      index={index}
      onPress={() => handlePressStage(item)}
    />
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Header
          title={period?.title ?? 'Giai Đoạn'}
          onBack={handleBack}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải giai đoạn…</Text>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Header title={period?.title ?? 'Giai Đoạn'} onBack={handleBack} />
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => load()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Normal ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={stages}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Header title={period?.title ?? 'Giai Đoạn'} onBack={handleBack} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Chưa có giai đoạn nào.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopBar}>
        {/* Back button */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        {/* Stars */}
        <View style={styles.starRow}>
          {['★', '★', '★', '★', '★'].map((s, i) => (
            <Text key={i} style={styles.starText}>{s}</Text>
          ))}
        </View>

        <Text style={styles.headerTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.headerSubtitle}>Các giai đoạn lịch sử</Text>
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
    paddingTop: 52,
    paddingBottom: SPACING[5],
    paddingHorizontal: SPACING[5],
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: SPACING[4],
    top: 52,
    padding: SPACING[2],
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: FONT_WEIGHTS.bold,
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING[2],
  },
  starText: {
    color: COLORS.accent,
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginHorizontal: SPACING[10],
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING[1],
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

  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0e8e8',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce8e8',
    gap: 4,
  },
  placeholderEmoji: { fontSize: 36 },
  placeholderInitial: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },

  badge: {
    position: 'absolute',
    top: SPACING[3],
    left: SPACING[3],
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
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
  stageTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    lineHeight: 24,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },

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

  // ── States ───────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[12],
    gap: SPACING[3],
  },
  loadingText: {
    color: COLORS.gray500,
    fontSize: FONT_SIZES.base,
    marginTop: SPACING[2],
  },
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
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    color: COLORS.gray400,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
  },
});
