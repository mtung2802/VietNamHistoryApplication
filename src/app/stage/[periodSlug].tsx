/**
 * Timeline các giai đoạn thuộc một thời kỳ lịch sử.
 * Dữ liệu và navigation giữ nguyên từ luồng period -> stage -> stage detail.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stage } from '@/models/Stage';
import { Period } from '@/models/Period';
import { getStagesByPeriod } from '@/services/stageService';
import { getPeriodById } from '@/services/periodService';
import { Screen } from '@/components/ui';
import {
  TimelineHeader,
  TimelineItem,
  useTimelineColors,
} from '@/components/period-timeline';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import {
  MuseumBottomNav,
  MUSEUM_BOTTOM_NAV_CONTENT_SPACE,
} from '@/components/navigation';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function PeriodTimelineScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug?: string }>();
  const periodId = useMemo(
    () => (typeof periodSlug === 'string' ? periodSlug : ''),
    [periodSlug],
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeContext();
  const timelineColors = useTimelineColors();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(screenWidth, 720);

  const [stages, setStages] = useState<Stage[]>([]);
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!periodId) {
      setError('Không tìm thấy thời kỳ lịch sử.');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [stagesData, periodData] = await Promise.all([
        getStagesByPeriod(periodId),
        getPeriodById(periodId),
      ]);

      setStages(stagesData);
      setPeriod(periodData);
    } catch (err) {
      console.error('Lỗi tải giai đoạn:', err);
      setError('Không thể tải dòng thời gian.\nVui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePressStage = useCallback((stage: Stage) => {
    router.push({
      pathname: '/stage-detail/[periodSlug]/[stageSlug]',
      params: { periodSlug: periodId, stageSlug: stage.id },
    });
  }, [periodId, router]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Stage>) => (
      <TimelineItem
        item={item}
        index={index}
        width={contentWidth}
        isLast={index === stages.length - 1}
        onPress={() => handlePressStage(item)}
      />
    ),
    [contentWidth, handlePressStage, stages.length],
  );

  const header = (
    <TimelineHeader
      title={period?.title ?? 'Các giai đoạn lịch sử'}
      stageCount={loading ? undefined : stages.length}
      onBack={() => router.back()}
    />
  );

  return (
    <Screen
      safeArea
      edges={['top']}
      style={[styles.screen, { backgroundColor: timelineColors.background }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {header}

      {loading ? (
        <View style={[styles.state, { backgroundColor: timelineColors.background }]}>
          <ActivityIndicator size="large" color={timelineColors.gold} />
          <Text style={[styles.stateText, { color: timelineColors.textMuted }]}>
            Đang mở dòng thời gian…
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.state, { backgroundColor: timelineColors.background }]}>
          <Ionicons name="alert-circle-outline" size={52} color={timelineColors.deepRed} />
          <Text style={[styles.stateText, { color: timelineColors.textMuted }]}>{error}</Text>
          <Pressable
            onPress={() => load()}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: timelineColors.primaryRed },
              pressed && styles.retryPressed,
            ]}
          >
            <Ionicons name="refresh" size={18} color={timelineColors.actionText} />
            <Text style={[styles.retryText, { color: timelineColors.actionText }]}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={stages}
          keyExtractor={(stage) => stage.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: MUSEUM_BOTTOM_NAV_CONTENT_SPACE + insets.bottom },
          ]}
          initialNumToRender={4}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[timelineColors.gold]}
              tintColor={timelineColors.gold}
              progressBackgroundColor={timelineColors.paper}
            />
          }
          ListEmptyComponent={
            <View style={[styles.state, { backgroundColor: timelineColors.background }]}>
              <Ionicons name="time-outline" size={52} color={timelineColors.line} />
              <Text style={[styles.stateText, { color: timelineColors.textMuted }]}>
                Chưa có giai đoạn lịch sử nào.
              </Text>
            </View>
          }
        />
      )}
      <MuseumBottomNav activeKey="periods" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {},
  listContent: {
    flexGrow: 1,
    paddingTop: SPACING[2],
    paddingBottom: SPACING[10],
  },
  state: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
    gap: SPACING[3],
  },
  stateText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 24,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: 6,
  },
  retryPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
