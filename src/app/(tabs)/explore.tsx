/**
 * Tab Khám Phá
 * Tương đương: ExploreFragment.java
 * Query: explore collection orderBy sortOrder
 * slug == "bai-bao" → /explore/article
 * slug == "bao-tang" → /explore/museum
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ListRenderItemInfo,
  RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ExploreItem, getExploreItems } from '@/services/exploreService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

const ROUTE_MAP: Record<string, string> = {
  'bai-bao': '/explore/article',
  'bao-tang': '/explore/museum',
};

const EMOJI_MAP: Record<string, string> = {
  'bai-bao': '📰',
  'bao-tang': '🏛️',
};

function ExploreCard({ item, onPress }: { item: ExploreItem; onPress: () => void }) {
  const emoji = EMOJI_MAP[item.slug] ?? '🔍';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrapper}>
        {item.coverMediaRef ? (
          <Image source={{ uri: item.coverMediaRef }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={{ fontSize: 56 }}>{emoji}</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
        <Text style={styles.overlayEmoji}>{emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {!!item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>Khám phá</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      setItems(await getExploreItems());
    } catch {
      setError('Không thể tải mục khám phá.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePress = (item: ExploreItem) => {
    const route = ROUTE_MAP[item.slug];
    if (route) router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {loading ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Khám Phá</Text>
          </View>
          <View style={styles.accent} />
          <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }: ListRenderItemInfo<ExploreItem>) => (
            <ExploreCard item={item} onPress={() => handlePress(item)} />
          )}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <View style={styles.header}>
                <View style={styles.starRow}>
                  {['★', '★', '★', '★', '★'].map((s, i) => <Text key={i} style={styles.starText}>{s}</Text>)}
                </View>
                <Text style={styles.headerTitle}>Khám Phá</Text>
                <Text style={styles.headerSubtitle}>Bài báo & Bảo tàng lịch sử</Text>
              </View>
              <View style={styles.accent} />
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[COLORS.primary]} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  headerWrapper: { marginBottom: SPACING[4] },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: SPACING[4], alignItems: 'center' },
  starRow: { flexDirection: 'row', gap: 6, marginBottom: SPACING[2] },
  starText: { color: COLORS.accent, fontSize: 14 },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, fontStyle: 'italic', marginTop: 2 },
  accent: { height: 4, backgroundColor: COLORS.accent },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: SPACING[4], gap: SPACING[4], paddingBottom: SPACING[8] },

  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.md },
  imageWrapper: { width: '100%', height: 200, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: '#fce8e8', alignItems: 'center', justifyContent: 'center' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.3)' },
  overlayEmoji: { position: 'absolute', top: 12, right: 12, fontSize: 36 },
  cardBody: { padding: SPACING[4], gap: SPACING[2] },
  cardTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900 },
  cardDesc: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING[1], paddingTop: SPACING[2], borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  footerLabel: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semibold },
  arrowCircle: { width: 28, height: 28, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: COLORS.white, fontSize: 20, lineHeight: 22, fontWeight: FONT_WEIGHTS.bold },
});