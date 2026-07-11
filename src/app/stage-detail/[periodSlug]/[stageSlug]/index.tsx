/**
 * Chi tiết giai đoạn + danh sách sự kiện.
 * Tập trung đúng phần period, dùng theme động theo CLAUDE.md.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stage } from '@/models/Stage';
import { Event } from '@/models/Event';
import { getStageById, getEventsByStage } from '@/services/stageService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  AppHeader,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
  SectionTitle,
} from '@/components/ui';
import { getPrimaryImageRef } from '@/utils/media';
import {
  MuseumBottomNav,
  MUSEUM_BOTTOM_NAV_CONTENT_SPACE,
} from '@/components/navigation';

function BulletList({ items }: { items?: string[] | string }) {
  const colors = useThemeColors();
  const normalized = Array.isArray(items) ? items : items ? [items] : [];
  if (!normalized.length) return null;

  return (
    <View style={styles.bulletList}>
      {normalized.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.sectionCard}>
      <SectionTitle title={title} />
      <View style={styles.sectionContent}>{children}</View>
    </Card>
  );
}

function EventRow({
  item,
  onPress,
}: {
  item: Event;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const sy = yearFromIso(item.startDate);
  const ey = yearFromIso(item.endDate);

  return (
    <TouchableOpacity
      style={[styles.eventRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <HistoryImage
        uri={getPrimaryImageRef(item)}
        style={styles.eventThumb}
        radius={BORDER_RADIUS.md}
        fallbackIcon="image-outline"
      />

      <View style={styles.eventBody}>
        <Text style={[styles.eventYear, { color: colors.secondary }]}>
          {`${formatYear(sy)} – ${formatYear(ey)}`}
        </Text>
        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {!!(item.summary ?? item.smallTitle) && (
          <Text style={[styles.eventSummary, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.summary ?? item.smallTitle}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
    </TouchableOpacity>
  );
}

export default function StageDetailScreen() {
  const { periodSlug, stageSlug } = useLocalSearchParams<{
    periodSlug: string;
    stageSlug: string;
  }>();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !stageSlug) return;

    try {
      setLoading(true);
      setError(null);
      const [stageData, eventData] = await Promise.all([
        getStageById(periodSlug, stageSlug),
        getEventsByStage(periodSlug, stageSlug),
      ]);
      setStage(stageData);
      setEvents(eventData);
    } catch (err) {
      console.error('Lỗi tải chi tiết giai đoạn:', err);
      setError('Không thể tải giai đoạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, stageSlug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="" />
        <LoadingState message="Đang tải giai đoạn…" />
        <MuseumBottomNav activeKey="periods" />
      </Screen>
    );
  }

  if (error || !stage) {
    return (
      <Screen>
        <AppHeader title="" />
        <ErrorState message={error ?? 'Không tìm thấy giai đoạn.'} onRetry={load} />
        <MuseumBottomNav activeKey="periods" />
      </Screen>
    );
  }

  const sy = yearFromIso(stage.startDate);
  const ey = yearFromIso(stage.endDate);
  const overview = stage.overview ?? stage.description;

  const renderEvent = ({ item }: ListRenderItemInfo<Event>) => (
    <EventRow
      item={item}
      onPress={() => {
        const href = `/event/${encodeURIComponent(periodSlug)}/${encodeURIComponent(stageSlug)}/${encodeURIComponent(item.id)}`;
        router.push(href as any);
      }}
    />
  );

  return (
    <Screen>
      <AppHeader title="" />

      <FlatList
        data={events}
        keyExtractor={(event) => event.id}
        renderItem={renderEvent}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: MUSEUM_BOTTOM_NAV_CONTENT_SPACE + insets.bottom },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <HistoryImage
                uri={getPrimaryImageRef(stage)}
                style={styles.heroImage}
                fallbackIcon="image-outline"
              />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Badge label={`${formatYear(sy)} – ${formatYear(ey)}`} tone="red" />
                <Text style={styles.heroTitle}>{stage.title}</Text>
              </View>
            </View>

            {!!overview && (
              <InfoSection title="Tổng quan">
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {overview}
                </Text>
              </InfoSection>
            )}

            {!!stage.details?.length && (
              <InfoSection title="Chi tiết">
                <BulletList items={stage.details} />
              </InfoSection>
            )}

            {!!stage.result && (
              <InfoSection title="Kết quả">
                <BulletList items={stage.result} />
              </InfoSection>
            )}

            {!!stage.impactOnPresent && (
              <InfoSection title="Tác động đến hiện tại">
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {stage.impactOnPresent}
                </Text>
              </InfoSection>
            )}

            <View style={styles.eventsHeader}>
              <SectionTitle title={`Sự kiện (${events.length})`} />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState message="Chưa có sự kiện nào." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separatorSpace} />}
        ListFooterComponent={<View style={styles.footerSpace} />}
        showsVerticalScrollIndicator={false}
      />
      <MuseumBottomNav activeKey="periods" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING[4],
  },
  hero: {
    height: 280,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING[4],
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING[4],
    gap: SPACING[3],
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 32,
  },
  sectionCard: {
    marginBottom: SPACING[4],
  },
  sectionContent: {
    marginTop: SPACING[3],
  },
  bodyText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
  bulletList: {
    gap: SPACING[2],
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[2],
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
  eventsHeader: {
    marginTop: SPACING[1],
    marginBottom: SPACING[2],
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    paddingVertical: SPACING[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eventThumb: {
    width: 68,
    height: 68,
  },
  eventBody: {
    flex: 1,
    gap: 3,
  },
  eventYear: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  eventTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
  },
  eventSummary: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
  },
  separatorSpace: {
    height: 0,
  },
  emptyWrap: {
    minHeight: 240,
  },
  footerSpace: {
    height: SPACING[8],
  },
});
