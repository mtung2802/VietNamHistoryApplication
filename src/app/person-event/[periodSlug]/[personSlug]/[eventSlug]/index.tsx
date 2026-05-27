/**
 * Chi tiết sự kiện của nhân vật
 * Route: /person-event/[periodSlug]/[personSlug]/[eventSlug]
 * Tương đương: PersonEventDetailActivity.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PersonEvent } from '@/models/Person';
import { getPersonEventDetail } from '@/services/personService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function PersonEventDetailScreen() {
  const { periodSlug, personSlug, eventSlug } = useLocalSearchParams<{
    periodSlug: string; personSlug: string; eventSlug: string;
  }>();
  const router = useRouter();

  const [event, setEvent] = useState<PersonEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !personSlug || !eventSlug) return;
    try {
      setLoading(true);
      setError(null);
      setEvent(await getPersonEventDetail(periodSlug, personSlug, eventSlug));
    } catch {
      setError('Không thể tải sự kiện.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, personSlug, eventSlug]);

  useEffect(() => { load(); }, [load]);

  /** Parse eventRef → navigate to main event screen */
  const handleViewMainEvent = () => {
    if (!event?.eventRef) return;
    const path = event.eventRef.startsWith('/') ? event.eventRef.slice(1) : event.eventRef;
    const parts = path.split('/');
    // expected: periods/{p}/stages/{s}/events/{e}
    if (parts.length >= 6 && parts[0] === 'periods' && parts[2] === 'stages' && parts[4] === 'events') {
      router.push({
        pathname: '/event/[periodSlug]/[stageSlug]/[eventSlug]',
        params: { periodSlug: parts[1], stageSlug: parts[3], eventSlug: parts[5] },
      });
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (error || !event) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Text style={{ fontSize: 48 }}>⚠️</Text>
      <Text style={styles.errorText}>{error ?? 'Không tìm thấy sự kiện'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={load}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle} numberOfLines={1}>{event.title ?? 'Sự kiện'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {event.coverMediaRef ? (
          <Image source={{ uri: event.coverMediaRef }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder]}>
            <Text style={{ fontSize: 64 }}>⚔️</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.card}>
            <InfoRow label="Tổng quan" value={event.overview} />
            <InfoRow label="Vai trò" value={event.role} />
            <InfoRow label="Mô tả" value={event.description} />
          </View>

          {!!event.eventRef && (
            <TouchableOpacity style={styles.mainEventBtn} onPress={handleViewMainEvent} activeOpacity={0.85}>
              <Text style={styles.mainEventBtnText}>Xem sự kiện lịch sử ›</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.lightBg },
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

  banner: { width: '100%', height: 220 },
  bannerPlaceholder: { backgroundColor: '#fce8e8', alignItems: 'center', justifyContent: 'center' },

  content: { padding: SPACING[4], gap: SPACING[4] },
  title: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 28 },

  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING[4], gap: SPACING[3], ...SHADOWS.sm },
  infoRow: { gap: 4 },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 22 },

  mainEventBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4], alignItems: 'center', ...SHADOWS.md,
  },
  mainEventBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base },
});
