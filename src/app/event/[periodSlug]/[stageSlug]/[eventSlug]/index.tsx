/**
 * Chi tiết sự kiện lịch sử.
 * Port logic từ Java EventDetailActivity, mở rộng đủ các mục dữ liệu Firestore.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Event, MediaItem, WarSummaryItem } from '@/models/Event';
import { getEventsByStage } from '@/services/stageService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  AppHeader,
  Badge,
  Card,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
  SectionTitle,
} from '@/components/ui';
import { getPrimaryImageRef } from '@/utils/media';
import { extractYoutubeId } from '@/utils/youtube';
import {
  MuseumBottomNav,
  MUSEUM_BOTTOM_NAV_CONTENT_SPACE,
} from '@/components/navigation';

type SideContent = {
  vn?: string[];
  opponent?: string[];
};

function normalizeList(items?: string[] | string | null): string[] {
  if (!items) return [];
  return Array.isArray(items) ? items.filter(Boolean) : [items];
}

function getOpponent(items?: {
  usAllies?: string[];
  opponent?: string[];
}): string[] {
  return normalizeList(items?.opponent?.length ? items.opponent : items?.usAllies);
}

function hasSideContent(content: SideContent): boolean {
  return normalizeList(content.vn).length > 0 || normalizeList(content.opponent).length > 0;
}

function BulletList({ items }: { items?: string[] | string | null }) {
  const colors = useThemeColors();
  const data = normalizeList(items);
  if (!data.length) return null;

  return (
    <View style={styles.bulletList}>
      {data.map((item, index) => (
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

function TwoSideSection({ content }: { content: SideContent }) {
  const colors = useThemeColors();
  const vn = normalizeList(content.vn);
  const opponent = normalizeList(content.opponent);
  if (!vn.length && !opponent.length) return null;

  return (
    <View style={styles.twoSide}>
      <View style={[styles.sideBox, { backgroundColor: colors.primaryDim }]}>
        <Text style={[styles.sideLabel, { color: colors.primary }]}>
          Phía Việt Nam
        </Text>
        <BulletList items={vn} />
      </View>

      <View style={[styles.sideBox, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.sideLabel, { color: colors.secondary }]}>
          Phía đối phương
        </Text>
        <BulletList items={opponent} />
      </View>
    </View>
  );
}

function WarSummaryList({ items }: { items?: WarSummaryItem[] }) {
  const colors = useThemeColors();
  if (!items?.length) return null;

  return (
    <View style={styles.timeline}>
      {items.map((item, index) => (
        <View key={`${index}-${item.detail}`} style={styles.timelineRow}>
          <View style={styles.timelineMarkerWrap}>
            <View style={[styles.timelineMarker, { backgroundColor: colors.secondary }]} />
            {index < items.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            )}
          </View>

          <View style={styles.timelineContent}>
            {!!item.diadiem?.content && (
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {item.diadiem.content}
              </Text>
            )}
            {!!item.detail && (
              <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                {item.detail}
              </Text>
            )}
            <SummaryImage images={item.images} />
          </View>
        </View>
      ))}
    </View>
  );
}

function SummaryImage({ images }: { images?: MediaItem[] }) {
  const image = getPrimaryImageRef({ images });
  if (!image) return null;

  return (
    <HistoryImage
      uri={image}
      style={styles.summaryImage}
      radius={BORDER_RADIUS.md}
      fallbackIcon="image-outline"
    />
  );
}

function extractEventYoutubeId(event: Event): string | undefined {
  const direct = extractYoutubeId(event.youtubeId);
  if (direct) return direct;

  for (const video of event.videos ?? []) {
    if (typeof video === 'string') {
      const id = extractYoutubeId(video);
      if (id) return id;
    } else {
      const id = extractYoutubeId(video.link) ?? extractYoutubeId(video.url);
      if (id) return id;
    }
  }

  return undefined;
}

function VideoSection({ event }: { event: Event }) {
  const colors = useThemeColors();
  const videoId = extractEventYoutubeId(event);
  const firstLink = event.videos?.find((video) =>
    typeof video === 'string' ? video.trim() : video.link?.trim() || video.url?.trim(),
  );
  const link = typeof firstLink === 'string' ? firstLink : firstLink?.link ?? firstLink?.url;

  if (!videoId && !link) return null;

  return (
    <InfoSection title="Video">
      {videoId ? (
        <>
          <View style={styles.videoBox}>
            <YoutubePlayer height={210} play={false} videoId={videoId} />
          </View>
          <TouchableOpacity
            style={styles.videoOpenRow}
            onPress={() => Linking.openURL(link ?? `https://www.youtube.com/watch?v=${videoId}`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.videoHint, { color: colors.primary }]}>
              Mở trên YouTube
            </Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.videoLink, { borderColor: colors.primary }]}
          onPress={() => link && Linking.openURL(link)}
          activeOpacity={0.8}
        >
          <View style={[styles.videoIcon, { backgroundColor: colors.primaryDim }]}>
            <Ionicons name="play-circle-outline" size={34} color={colors.primary} />
          </View>
          <View style={styles.videoTextBox}>
            <Text style={[styles.videoLinkText, { color: colors.text }]}>
              Tóm tắt diễn biến
            </Text>
            <Text style={[styles.videoHint, { color: colors.textSecondary }]}>
              Chạm để mở video
            </Text>
          </View>
          <Ionicons name="open-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </InfoSection>
  );
}

export default function EventDetailScreen() {
  const { periodSlug, stageSlug, eventSlug } = useLocalSearchParams<{
    periodSlug: string;
    stageSlug: string;
    eventSlug: string;
  }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !stageSlug || !eventSlug) return;

    try {
      setLoading(true);
      setError(null);
      const events = await getEventsByStage(periodSlug, stageSlug);
      setEvent(events.find((item) => item.id === eventSlug) ?? null);
    } catch (err) {
      console.error('Lỗi tải sự kiện:', err);
      setError('Không thể tải sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, stageSlug, eventSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const eventSections = useMemo(() => {
    if (!event) return null;

    return {
      objective: {
        vn: event.object?.vn,
        opponent: getOpponent(event.object),
      },
      forces: {
        vn: event.content?.forces?.vn,
        opponent: getOpponent(event.content?.forces),
      },
      result: {
        vn: event.content?.result?.vn,
        opponent: getOpponent(event.content?.result),
      },
      meaning: event.meaning?.length
        ? event.meaning
        : event.impactOnPresent
          ? [event.impactOnPresent]
          : [],
    };
  }, [event]);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="" />
        <LoadingState message="Đang tải sự kiện…" />
        <MuseumBottomNav activeKey="periods" />
      </Screen>
    );
  }

  if (error || !event || !eventSections) {
    return (
      <Screen>
        <AppHeader title="" />
        <ErrorState message={error ?? 'Không tìm thấy sự kiện.'} onRetry={load} />
        <MuseumBottomNav activeKey="periods" />
      </Screen>
    );
  }

  const sy = yearFromIso(event.startDate);
  const ey = yearFromIso(event.endDate);
  const summary = event.summary ?? event.description ?? event.smallTitle;

  return (
    <Screen>
      <AppHeader title="" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: MUSEUM_BOTTOM_NAV_CONTENT_SPACE + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <HistoryImage
            uri={getPrimaryImageRef(event)}
            style={styles.heroImage}
            fallbackIcon="image-outline"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Badge label={`${formatYear(sy)} – ${formatYear(ey)}`} tone="red" />
            <Text style={styles.heroTitle}>{event.title}</Text>
          </View>
        </View>

        {!!summary && (
          <Card style={styles.introCard}>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              {summary}
            </Text>
          </Card>
        )}

        {!!event.warCause?.length && (
          <InfoSection title="Lí do">
            <BulletList items={event.warCause} />
          </InfoSection>
        )}

        {hasSideContent(eventSections.objective) && (
          <InfoSection title="Mục tiêu">
            <TwoSideSection content={eventSections.objective} />
          </InfoSection>
        )}

        {hasSideContent(eventSections.forces) && (
          <InfoSection title="Lực lượng">
            <TwoSideSection content={eventSections.forces} />
          </InfoSection>
        )}

        {(event.content?.warSummary?.length || event.details?.length) ? (
          <InfoSection title="Diễn biến">
            {event.content?.warSummary?.length ? (
              <WarSummaryList items={event.content.warSummary} />
            ) : (
              <BulletList items={event.details} />
            )}
          </InfoSection>
        ) : null}

        {hasSideContent(eventSections.result) && (
          <InfoSection title="Kết quả">
            <TwoSideSection content={eventSections.result} />
          </InfoSection>
        )}

        {!!eventSections.meaning.length && (
          <InfoSection title="Ý nghĩa">
            <BulletList items={eventSections.meaning} />
          </InfoSection>
        )}

        <VideoSection event={event} />
      </ScrollView>
      <MuseumBottomNav activeKey="periods" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING[4],
    paddingBottom: SPACING[10],
    gap: SPACING[4],
  },
  hero: {
    height: 320,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
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
  introCard: {
    borderRadius: BORDER_RADIUS.md,
  },
  sectionCard: {
    borderRadius: BORDER_RADIUS.md,
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
  twoSide: {
    gap: SPACING[3],
  },
  sideBox: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    gap: SPACING[2],
  },
  sideLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  timeline: {
    gap: SPACING[2],
  },
  timelineRow: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  timelineMarkerWrap: {
    alignItems: 'center',
    width: 16,
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING[3],
    gap: SPACING[2],
  },
  locationText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  summaryImage: {
    width: '100%',
    height: 150,
  },
  videoBox: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  videoOpenRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[2],
  },
  videoLink: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING[3],
    padding: SPACING[3],
  },
  videoIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTextBox: {
    flex: 1,
    gap: 3,
  },
  videoLinkText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  videoHint: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
});
