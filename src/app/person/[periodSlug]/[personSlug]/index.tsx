/**
 * Chi tiết nhân vật.
 * Port từ PersonDetailActivity.java.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { PersonDetail, PersonEvent } from '@/models/Person';
import { getPersonDetail, getPersonEvents } from '@/services/personService';
import { extractYoutubeId } from '@/utils/youtube';
import {
  AppHeader,
  Badge,
  Card,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
} from '@/components/ui';

function normalizeTextList(items?: string[]) {
  return Array.isArray(items) ? items.filter((item) => !!item?.trim()) : [];
}

function buildOverview(person: PersonDetail) {
  if (person.overview?.trim()) return person.overview.trim();

  const birth = person.birth_year ? `sinh ${person.birth_year}` : '';
  const death = person.death_year ? `mất ${person.death_year}` : '';
  const life = [birth, death].filter(Boolean).join(' - ');

  if (person.hometown && life) return `${person.hometown}, ${life}`;
  if (person.hometown) return person.hometown;
  if (life) return life;
  return 'Không có thông tin';
}

function BulletList({ items, fallback }: { items: string[]; fallback: string }) {
  const colors = useThemeColors();

  if (!items.length) {
    return <Text style={[styles.mutedText, { color: colors.textMuted }]}>{fallback}</Text>;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function AccordionSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card noPadding highlighted={open}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setOpen((value) => !value)}
        style={styles.accordionHeader}
      >
        <View style={styles.accordionTitleRow}>
          <View style={[styles.sectionIcon, { backgroundColor: colors.primaryDim }]}>
            <Ionicons name={icon} size={18} color={colors.primary} />
          </View>
          <Text style={[styles.accordionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>
      {open && <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>{children}</View>}
    </Card>
  );
}

function EventList({
  events,
  onPress,
}: {
  events: PersonEvent[];
  onPress: (event: PersonEvent) => void;
}) {
  const colors = useThemeColors();

  if (!events.length) {
    return <Text style={[styles.mutedText, { color: colors.textMuted }]}>Không có sự kiện nào.</Text>;
  }

  return (
    <View style={styles.eventList}>
      <Text style={[styles.eventHint, { color: colors.textMuted }]}>
        Chọn một sự kiện để xem vai trò của nhân vật.
      </Text>
      {events.map((event) => (
        <TouchableOpacity
          key={event.id}
          activeOpacity={0.78}
          onPress={() => onPress(event)}
          style={[styles.eventRow, { borderColor: colors.border, backgroundColor: colors.primaryDim }]}
        >
          <View style={[styles.eventDot, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {event.title || event.id}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PersonDetailScreen() {
  const { periodSlug, personSlug } = useLocalSearchParams<{
    periodSlug?: string;
    personSlug?: string;
  }>();
  const periodId = useMemo(() => (typeof periodSlug === 'string' ? periodSlug : ''), [periodSlug]);
  const personId = useMemo(() => (typeof personSlug === 'string' ? personSlug : ''), [personSlug]);
  const router = useRouter();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [events, setEvents] = useState<PersonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodId || !personId) {
      setError('Không tìm thấy dữ liệu nhân vật.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [personData, personEvents] = await Promise.all([
        getPersonDetail(periodId, personId),
        getPersonEvents(periodId, personId),
      ]);
      setPerson(personData);
      setEvents(personEvents);
    } catch {
      setError('Không thể tải thông tin nhân vật.');
    } finally {
      setLoading(false);
    }
  }, [periodId, personId]);

  useEffect(() => {
    load();
  }, [load]);

  const achievements = normalizeTextList(person?.achievements);
  const lifetime = normalizeTextList(person?.lifetime);
  const videoId = extractYoutubeId(person?.video?.link);
  const playerWidth = Math.min(width - SPACING[8], 720);
  const playerHeight = Math.round(playerWidth * 0.5625);

  return (
    <Screen>
      <AppHeader title={person?.name || 'Nhân vật'} subtitle={person?.title} centerTitle />

      {loading ? (
        <LoadingState />
      ) : error || !person ? (
        <ErrorState message={error ?? 'Không tìm thấy nhân vật.'} onRetry={load} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <HistoryImage
              uri={person.horizontalImage || person.coverMediaRef}
              style={styles.banner}
              fallbackIcon="person-outline"
            />
            <View style={[styles.heroOverlay, { backgroundColor: colors.overlay }]} />
            <View style={styles.heroTextBox}>
              <Text style={[styles.name, { color: colors.white }]}>{person.name || 'Không có tên'}</Text>
              {!!person.title && (
                <Text style={[styles.personTitle, { color: colors.primaryBright }]}>{person.title}</Text>
              )}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.metaRow}>
              {(person.birth_year || person.death_year) && (
                <Badge
                  label={`${person.birth_year || '?'} - ${person.death_year || '?'}`}
                  tone="gold"
                />
              )}
              {!!person.hometown && <Badge label={person.hometown} tone="neutral" />}
            </View>

            <Card highlighted>
              <Text style={[styles.overviewText, { color: colors.textSecondary }]}>
                {buildOverview(person)}
              </Text>
            </Card>

            <AccordionSection title="Thành tựu" icon="trophy-outline">
              <BulletList items={achievements} fallback="Không có thành tựu" />
            </AccordionSection>

            <AccordionSection title="Tóm tắt cuộc đời" icon="book-outline">
              <BulletList items={lifetime} fallback="Không có thông tin" />
            </AccordionSection>

            {!!person.video?.link && (
              <Card style={styles.videoCard}>
                <View style={styles.videoHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primaryDim }]}>
                    <Ionicons name="logo-youtube" size={18} color={colors.secondary} />
                  </View>
                  <Text style={[styles.videoTitle, { color: colors.text }]}>Tư liệu video</Text>
                </View>
                {videoId ? (
                  <View style={[styles.playerWrap, { borderColor: colors.border }]}>
                    <YoutubePlayer height={playerHeight} videoId={videoId} play={false} />
                  </View>
                ) : (
                  <Text style={[styles.mutedText, { color: colors.textMuted }]}>
                    Không thể phát video từ liên kết này.
                  </Text>
                )}
                {!!person.video.content && (
                  <Text style={[styles.videoContent, { color: colors.textSecondary }]}>
                    {person.video.content}
                  </Text>
                )}
              </Card>
            )}

            <AccordionSection
              title={`Sự kiện tham gia (${events.length})`}
              icon="flag-outline"
            >
              <EventList
                events={events}
                onPress={(event) =>
                  router.push({
                    pathname: '/person-event/[periodSlug]/[personSlug]/[eventSlug]',
                    params: { periodSlug: periodId, personSlug: personId, eventSlug: event.id },
                  })
                }
              />
            </AccordionSection>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING[8],
  },
  hero: {
    height: 260,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextBox: {
    position: 'absolute',
    left: SPACING[4],
    right: SPACING[4],
    bottom: SPACING[4],
    gap: SPACING[1],
  },
  name: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 36,
  },
  personTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
  },
  content: {
    padding: SPACING[4],
    gap: SPACING[4],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  overviewText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 23,
  },
  accordionHeader: {
    minHeight: 58,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[3],
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
    minWidth: 0,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionTitle: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SPACING[4],
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
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 23,
  },
  mutedText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
  videoCard: {
    gap: SPACING[3],
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  videoTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  playerWrap: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  videoContent: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 23,
  },
  eventList: {
    gap: SPACING[2],
  },
  eventHint: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    marginBottom: SPACING[1],
  },
  eventRow: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventTitle: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 20,
  },
});
