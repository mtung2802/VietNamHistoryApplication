/**
 * Màn hình Chi Tiết Sự Kiện Lịch Sử
 * Route: /event/[periodSlug]/[stageSlug]/[eventSlug]
 * Tương đương: EventDetailActivity.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, Image, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Event } from '@/models/Event';
import { getEventsByStage } from '@/services/stageService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

const { width: W } = Dimensions.get('window');

function BulletList({ items, color = COLORS.gray700 }: { items: string[]; color?: string }) {
  if (!items?.length) return null;
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: COLORS.primary }]} />
          <Text style={[styles.bulletText, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Section({ title, accent = COLORS.primary, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function TwoColumnForces({
  vnItems,
  enemyItems,
  vnLabel = '🇻🇳 Phía Việt Nam',
  enemyLabel = '⚔️ Phía đối địch',
}: {
  vnItems?: string[];
  enemyItems?: string[];
  vnLabel?: string;
  enemyLabel?: string;
}) {
  return (
    <View style={styles.twoCol}>
      <View style={styles.colBox}>
        <Text style={styles.colLabel}>{vnLabel}</Text>
        <BulletList items={vnItems ?? []} color={COLORS.success} />
      </View>
      <View style={styles.colDivider} />
      <View style={styles.colBox}>
        <Text style={styles.colLabel}>{enemyLabel}</Text>
        <BulletList items={enemyItems ?? []} color={COLORS.error} />
      </View>
    </View>
  );
}

export default function EventDetailScreen() {
  const { periodSlug, stageSlug, eventSlug } = useLocalSearchParams<{
    periodSlug: string; stageSlug: string; eventSlug: string;
  }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !stageSlug || !eventSlug) return;
    try {
      setLoading(true);
      setError(null);
      const evs = await getEventsByStage(periodSlug, stageSlug);
      const found = evs.find((e) => e.id === eventSlug) ?? null;
      setEvent(found);
    } catch {
      setError('Không thể tải sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, stageSlug, eventSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải…</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>{error ?? 'Không tìm thấy sự kiện'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sy = yearFromIso(event.startDate);
  const ey = yearFromIso(event.endDate);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle} numberOfLines={1}>{event.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Carousel */}
        {event.coverMediaRef ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
            <Image source={{ uri: event.coverMediaRef }} style={styles.carouselImage} resizeMode="cover" />
          </ScrollView>
        ) : (
          <View style={[styles.carouselImage, styles.carouselPlaceholder]}>
            <Text style={{ fontSize: 64 }}>⚔️</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Year badge */}
          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeText}>{`${formatYear(sy)} — ${formatYear(ey)}`}</Text>
          </View>

          {/* Title */}
          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Description */}
          {!!event.description && (
            <Section title="Tổng quan">
              <Text style={styles.bodyText}>{event.description}</Text>
            </Section>
          )}

          {/* Details */}
          {!!event.details?.length && (
            <Section title="Diễn biến chi tiết">
              <BulletList items={event.details} />
            </Section>
          )}

          {/* Result */}
          {(event.content?.result?.vn?.length || event.content?.result?.usAllies?.length) ? (
            <Section title="Kết quả" accent={COLORS.success}>
              <TwoColumnForces
                vnItems={event.content?.result?.vn}
                enemyItems={event.content?.result?.usAllies}
                vnLabel="🇻🇳 Phía Việt Nam"
                enemyLabel="⚔️ Phía đối địch"
              />
            </Section>
          ) : null}

          {/* Forces */}
          {(event.content?.forces?.vn?.length || event.content?.forces?.usAllies?.length) ? (
            <Section title="Lực lượng" accent={COLORS.accent}>
              <TwoColumnForces
                vnItems={event.content?.forces?.vn}
                enemyItems={event.content?.forces?.usAllies}
                vnLabel="🇻🇳 Quân Việt Nam"
                enemyLabel="⚔️ Quân đối địch"
              />
            </Section>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.lightBg },
  loadingText: { color: COLORS.gray500, fontSize: FONT_SIZES.base },
  errorText: { color: COLORS.gray600, textAlign: 'center', fontSize: FONT_SIZES.base },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerBarTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },

  carousel: { height: 220 },
  carouselImage: { width: W, height: 220 },
  carouselPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fce8e8' },

  content: { padding: SPACING[4], gap: SPACING[4] },
  yearBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING[3], paddingVertical: 4, borderRadius: BORDER_RADIUS.full,
  },
  yearBadgeText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  eventTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 32 },

  section: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING[4], gap: SPACING[3], ...SHADOWS.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  sectionAccent: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray800 },
  bodyText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, lineHeight: 22 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 22 },

  twoCol: { flexDirection: 'row', gap: 8 },
  colBox: { flex: 1, gap: 8 },
  colDivider: { width: 1, backgroundColor: COLORS.gray200 },
  colLabel: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray600 },
});
