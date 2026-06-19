/**
 * Chi tiết sự kiện của nhân vật.
 * Port từ PersonEventDetailActivity.java.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { PersonEvent } from '@/models/Person';
import { getPersonEventDetail } from '@/services/personService';
import {
  AppHeader,
  Button,
  Card,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
} from '@/components/ui';

interface EventRouteRef {
  periodSlug: string;
  stageSlug: string;
  eventSlug: string;
}

function parseEventRef(eventRef?: string): EventRouteRef | null {
  if (!eventRef) return null;

  const normalizedPath = eventRef.startsWith('/') ? eventRef.slice(1) : eventRef;
  const parts = normalizedPath.split('/').filter(Boolean);

  if (
    parts.length >= 6 &&
    parts[0] === 'periods' &&
    parts[2] === 'stages' &&
    parts[4] === 'events'
  ) {
    return {
      periodSlug: parts[1],
      stageSlug: parts[3],
      eventSlug: parts[5],
    };
  }

  return null;
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  const colors = useThemeColors();

  if (!value?.trim()) return null;

  return (
    <View style={styles.infoBlock}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: colors.primaryDim }]}>
          <Ionicons name={icon} size={17} color={colors.primary} />
        </View>
        <Text style={[styles.infoLabel, { color: colors.primary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

export default function PersonEventDetailScreen() {
  const { periodSlug, personSlug, eventSlug } = useLocalSearchParams<{
    periodSlug?: string;
    personSlug?: string;
    eventSlug?: string;
  }>();
  const periodId = useMemo(() => (typeof periodSlug === 'string' ? periodSlug : ''), [periodSlug]);
  const personId = useMemo(() => (typeof personSlug === 'string' ? personSlug : ''), [personSlug]);
  const eventId = useMemo(() => (typeof eventSlug === 'string' ? eventSlug : ''), [eventSlug]);
  const router = useRouter();
  const colors = useThemeColors();

  const [event, setEvent] = useState<PersonEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodId || !personId || !eventId) {
      setError('Không tìm thấy dữ liệu sự kiện.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setEvent(await getPersonEventDetail(periodId, personId, eventId));
    } catch {
      setError('Không thể tải sự kiện.');
    } finally {
      setLoading(false);
    }
  }, [periodId, personId, eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const routeRef = parseEventRef(event?.eventRef);
  const hasBody = !!(event?.overview || event?.role || event?.description);

  return (
    <Screen>
      <AppHeader title={event?.title || 'Sự kiện'} subtitle="Vai trò của nhân vật" centerTitle />

      {loading ? (
        <LoadingState />
      ) : error || !event ? (
        <ErrorState message={error ?? 'Không tìm thấy sự kiện.'} onRetry={load} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <HistoryImage
            uri={event.coverMediaRef}
            style={styles.banner}
            fallbackIcon="flag-outline"
          />

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{event.title || 'Không có tiêu đề'}</Text>

            <Card highlighted={hasBody}>
              {hasBody ? (
                <View style={styles.infoList}>
                  <InfoBlock icon="newspaper-outline" label="Tổng quan" value={event.overview} />
                  <InfoBlock icon="person-outline" label="Vai trò" value={event.role} />
                  <InfoBlock icon="document-text-outline" label="Mô tả" value={event.description} />
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Không có mô tả chi tiết cho sự kiện này.
                </Text>
              )}
            </Card>

            <Card style={styles.refCard}>
              <View style={styles.refHeader}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primaryDim }]}>
                  <Ionicons name="map-outline" size={17} color={colors.primary} />
                </View>
                <Text style={[styles.refTitle, { color: colors.text }]}>Sự kiện lịch sử liên quan</Text>
              </View>

              {event.eventRef ? (
                routeRef ? (
                  <Button
                    label="Xem sự kiện lịch sử"
                    icon="open-outline"
                    onPress={() =>
                      router.push({
                        pathname: '/event/[periodSlug]/[stageSlug]/[eventSlug]',
                        params: {
                          periodSlug: routeRef.periodSlug,
                          stageSlug: routeRef.stageSlug,
                          eventSlug: routeRef.eventSlug,
                        },
                      })
                    }
                  />
                ) : (
                  <Text style={[styles.emptyText, { color: colors.error }]}>
                    Đường dẫn sự kiện không hợp lệ.
                  </Text>
                )
              ) : (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Chưa có tham chiếu tới sự kiện lịch sử gốc.
                </Text>
              )}
            </Card>
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
  banner: {
    width: '100%',
    height: 230,
  },
  content: {
    padding: SPACING[4],
    gap: SPACING[4],
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 32,
  },
  infoList: {
    gap: SPACING[4],
  },
  infoBlock: {
    gap: SPACING[2],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 23,
  },
  refCard: {
    gap: SPACING[3],
  },
  refHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  refTitle: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
});
