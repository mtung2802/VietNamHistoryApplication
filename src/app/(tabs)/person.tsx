/**
 * Tab Nhân Vật Lịch Sử
 * Tương đương: PersonPeriodFragment.java
 * Query: periods_person (orderBy sortOrder)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ListRenderItemInfo,
  RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PersonPeriodItem } from '@/models/Person';
import { getPersonPeriods } from '@/services/personService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

function PeriodCard({ item, index, onPress }: { item: PersonPeriodItem; index: number; onPress: () => void }) {
  const sy = yearFromIso(item.startDate);
  const ey = yearFromIso(item.endDate);
  return (
    <TouchableOpacity style={[styles.card, index === 0 && { marginTop: SPACING[2] }]} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.imageWrapper}>
        {item.coverMediaRef ? (
          <Image source={{ uri: item.coverMediaRef }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={{ fontSize: 40 }}>👑</Text>
          </View>
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={styles.imageOverlay} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.yearRow}>
          <View style={styles.yearDot} />
          <Text style={styles.yearText}>{`${formatYear(sy)} — ${formatYear(ey)}`}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>Xem nhân vật</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopBar}>
        <View style={styles.starRow}>
          {['★', '★', '★', '★', '★'].map((s, i) => <Text key={i} style={styles.starText}>{s}</Text>)}
        </View>
        <Text style={styles.headerTitle}>Nhân Vật Lịch Sử Việt Nam</Text>
        <Text style={styles.headerSubtitle}>Những người làm nên lịch sử</Text>
      </View>
      <View style={styles.headerAccentBar} />
    </View>
  );
}

export default function PersonScreen() {
  const router = useRouter();
  const [items, setItems] = useState<PersonPeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      setItems(await getPersonPeriods());
    } catch {
      setError('Không thể tải danh sách nhân vật.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Header />
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải…</Text>
      </View>
    </View>
  );

  if (error) return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Header />
      <View style={styles.centered}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }: ListRenderItemInfo<PersonPeriodItem>) => (
          <PeriodCard
            item={item}
            index={index}
            onPress={() => router.push({ pathname: '/person-list/[periodSlug]', params: { periodSlug: item.id } })}
          />
        )}
        ListHeaderComponent={<Header />}
        contentContainerStyle={{ paddingBottom: SPACING[8] }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={styles.errorText}>Chưa có dữ liệu nhân vật.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: SPACING[12] },
  loadingText: { color: COLORS.gray500, fontSize: FONT_SIZES.base },
  errorText: { color: COLORS.gray600, fontSize: FONT_SIZES.base, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  header: { marginBottom: SPACING[4] },
  headerTopBar: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: SPACING[5], paddingHorizontal: SPACING[5], alignItems: 'center' },
  starRow: { flexDirection: 'row', gap: 6, marginBottom: SPACING[2] },
  starText: { color: COLORS.accent, fontSize: 16 },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  headerSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: FONT_SIZES.sm, marginTop: SPACING[1], fontStyle: 'italic' },
  headerAccentBar: { height: 4, backgroundColor: COLORS.accent },

  card: {
    marginHorizontal: SPACING[4], marginBottom: SPACING[4],
    borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.white,
    overflow: 'hidden', ...SHADOWS.md,
  },
  imageWrapper: { width: '100%', height: 180, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.18)' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fce8e8' },
  badge: {
    position: 'absolute', top: SPACING[3], left: SPACING[3],
    backgroundColor: COLORS.primary, width: 32, height: 32,
    borderRadius: BORDER_RADIUS.full, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent, ...SHADOWS.sm,
  },
  badgeText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  cardBody: { padding: SPACING[4], gap: SPACING[2] },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  yearDot: { width: 8, height: 8, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.accent, borderWidth: 1.5, borderColor: COLORS.primary },
  yearText: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold, textTransform: 'uppercase' },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 26 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING[1], paddingTop: SPACING[2], borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  footerLabel: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semibold },
  arrowCircle: { width: 28, height: 28, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: COLORS.white, fontSize: 20, lineHeight: 22, fontWeight: FONT_WEIGHTS.bold },
});