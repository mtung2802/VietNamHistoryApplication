/**
 * Màn hình Chi Tiết Giai Đoạn
 * Route: /stage-detail/[periodSlug]/[stageSlug]
 * Tương đương: StageDetailActivity.java
 *
 * Hiển thị: ảnh (carousel ViewPager), overview, details[], result[], impactOnPresent
 * + danh sách sự kiện phía dưới
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Image, ListRenderItemInfo,
  ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stage } from '@/models/Stage';
import { Event } from '@/models/Event';
import { getStageById, getEventsByStage } from '@/services/stageService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

const { width: W } = Dimensions.get('window');

// ── Bullet list helper ─────────────────────────────────────────────────────
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

// ── Section card ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Event row ──────────────────────────────────────────────────────────────
function EventRow({ item, onPress }: { item: Event; onPress: () => void }) {
  const sy = yearFromIso(item.startDate);
  const ey = yearFromIso(item.endDate);
  return (
    <TouchableOpacity style={styles.eventRow} onPress={onPress} activeOpacity={0.75}>
      {item.coverMediaRef ? (
        <Image source={{ uri: item.coverMediaRef }} style={styles.eventThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.eventThumb, styles.eventThumbPlaceholder]}>
          <Text style={{ fontSize: 20 }}>⚔️</Text>
        </View>
      )}
      <View style={styles.eventRowBody}>
        <Text style={styles.eventYear}>{`${formatYear(sy)} — ${formatYear(ey)}`}</Text>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
      </View>
      <Text style={styles.eventArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function StageDetailScreen() {
  const { periodSlug, stageSlug } = useLocalSearchParams<{ periodSlug: string; stageSlug: string }>();
  const router = useRouter();

  const [stage, setStage] = useState<Stage | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !stageSlug) return;
    try {
      setLoading(true);
      setError(null);
      const [s, evs] = await Promise.all([
        getStageById(periodSlug, stageSlug),
        getEventsByStage(periodSlug, stageSlug),
      ]);
      setStage(s);
      setEvents(evs);
    } catch {
      setError('Không thể tải giai đoạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, stageSlug]);

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

  if (error || !stage) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>{error ?? 'Không tìm thấy giai đoạn'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sy = yearFromIso(stage.startDate);
  const ey = yearFromIso(stage.endDate);

  // Carousel images — if coverMediaRef exists show it, else show placeholder
  const carouselImages = stage.coverMediaRef
    ? [stage.coverMediaRef]
    : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Header bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle} numberOfLines={1}>{stage.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Image Carousel */}
        {carouselImages.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {carouselImages.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.carouselImage} resizeMode="cover" />
            ))}
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
          <Text style={styles.stageTitle}>{stage.title}</Text>

          {/* Overview */}
          {!!stage.description && (
            <Section title="Tổng quan">
              <Text style={styles.bodyText}>{stage.description}</Text>
            </Section>
          )}

          {/* Details */}
          {!!stage.details?.length && (
            <Section title="Chi tiết diễn biến">
              <BulletList items={stage.details} />
            </Section>
          )}

          {/* Result */}
          {!!stage.result?.length && (
            <Section title="Kết quả">
              <BulletList items={stage.result} color={COLORS.success} />
            </Section>
          )}

          {/* Impact */}
          {!!stage.impactOnPresent && (
            <Section title="Tác động đến hiện tại">
              <Text style={styles.bodyText}>{stage.impactOnPresent}</Text>
            </Section>
          )}

          {/* Events */}
          <Section title={`Sự kiện (${events.length})`}>
            {events.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có sự kiện nào.</Text>
            ) : (
              events.map((ev) => (
                <EventRow
                  key={ev.id}
                  item={ev}
                  onPress={() =>
                    router.push({
                      pathname: '/event/[periodSlug]/[stageSlug]/[eventSlug]',
                      params: { periodSlug, stageSlug, eventSlug: ev.id },
                    })
                  }
                />
              ))
            )}
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.lightBg },
  loadingText: { color: COLORS.gray500, fontSize: FONT_SIZES.base },
  errorText: { color: COLORS.gray600, fontSize: FONT_SIZES.base, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerBarTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },

  // Carousel
  carousel: { height: 220 },
  carouselImage: { width: W, height: 220 },
  carouselPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fce8e8' },

  // Content
  content: { padding: SPACING[4], gap: SPACING[4] },
  yearBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING[3], paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  yearBadgeText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  stageTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 32 },

  // Section
  section: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4], gap: SPACING[3], ...SHADOWS.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  sectionAccent: { width: 4, height: 20, backgroundColor: COLORS.primary, borderRadius: 2 },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray800 },
  bodyText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, lineHeight: 22 },

  // Bullet
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 22 },

  // Event row
  eventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
  },
  eventThumb: { width: 56, height: 56, borderRadius: BORDER_RADIUS.md, backgroundColor: '#f0e8e8' },
  eventThumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  eventRowBody: { flex: 1 },
  eventYear: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold },
  eventTitle: { fontSize: FONT_SIZES.sm, color: COLORS.gray800, fontWeight: FONT_WEIGHTS.medium, lineHeight: 20 },
  eventArrow: { color: COLORS.primary, fontSize: 24, fontWeight: FONT_WEIGHTS.bold },

  emptyText: { color: COLORS.gray400, fontSize: FONT_SIZES.sm, textAlign: 'center', paddingVertical: 8 },
});
