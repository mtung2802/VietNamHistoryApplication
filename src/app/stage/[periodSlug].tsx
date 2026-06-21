/**
 * Danh sách giai đoạn của một thời kỳ.
 * Port từ Java StageActivity + stages_items.xml:
 * header đơn giản, list dọc, card ảnh phía trên và nền chữ tối.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stage } from '@/models/Stage';
import { Period, yearFromIso, formatYear } from '@/models/Period';
import { getStagesByPeriod } from '@/services/stageService';
import { getPeriodById } from '@/services/periodService';
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

function StageCard({
  item,
  onPress,
}: {
  item: Stage;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const startYear = yearFromIso(item.startDate);
  const endYear = yearFromIso(item.endDate);
  const yearLabel = `${formatYear(startYear)}–${formatYear(endYear)}`;
  const overview = item.overview ?? item.description;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.stageCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <HistoryImage
        uri={getPrimaryImageRef(item)}
        style={styles.stageImage}
        fallbackIcon="image-outline"
      />

      <View style={styles.stageBody}>
        <Text style={styles.stageTitle} numberOfLines={2}>
          {item.title ?? 'No Title'}
        </Text>
        <Text style={styles.stagePeriod} numberOfLines={1}>
          {yearLabel}
        </Text>
        <Text style={styles.stageDescription} numberOfLines={4}>
          {overview ?? 'No Overview'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StageHeader({
  title,
  onBack,
}: {
  title?: string;
  onBack: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={22} color="#3A3A3A" />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, { color: colors.secondary }]} numberOfLines={1}>
        {title ?? 'Giai đoạn'}
      </Text>

      <View style={styles.headerSpacer} />
    </View>
  );
}

export default function StageScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug: string }>();
  const router = useRouter();
  const colors = useThemeColors();

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
        console.error('Lỗi tải giai đoạn:', err);
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

  const handlePressStage = (stage: Stage) => {
    router.push({
      pathname: '/stage-detail/[periodSlug]/[stageSlug]',
      params: { periodSlug, stageSlug: stage.id },
    });
  };

  const renderItem = ({ item }: ListRenderItemInfo<Stage>) => (
    <StageCard item={item} onPress={() => handlePressStage(item)} />
  );

  if (loading) {
    return (
      <Screen safeArea edges={['top', 'bottom']} style={styles.screen}>
        <StageHeader title="Giai đoạn" onBack={() => router.back()} />
        <LoadingState message="Đang tải giai đoạn…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen safeArea edges={['top', 'bottom']} style={styles.screen}>
        <StageHeader title={period?.title ?? 'Giai đoạn'} onBack={() => router.back()} />
        <ErrorState message={error} onRetry={() => load()} />
      </Screen>
    );
  }

  return (
    <Screen safeArea edges={['top', 'bottom']} style={styles.screen}>
      <FlatList
        data={stages}
        keyExtractor={(stage) => stage.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <StageHeader title={period?.title ?? 'Giai đoạn'} onBack={() => router.back()} />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <EmptyState message="Không có stages để hiển thị" />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: SPACING[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[4],
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#B2B2B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  listContent: {
    paddingBottom: SPACING[8],
  },
  stageCard: {
    marginBottom: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  stageImage: {
    width: '100%',
    height: 200,
  },
  stageBody: {
    backgroundColor: '#333333',
    padding: SPACING[2],
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 24,
    marginTop: SPACING[2],
  },
  stagePeriod: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginTop: SPACING[1],
  },
  stageDescription: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginTop: SPACING[2],
  },
  emptyWrapper: {
    minHeight: 360,
  },
});
