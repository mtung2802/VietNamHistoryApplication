/**
 * Tab Khám Phá
 * Tương đương: ExploreFragment.java
 * Query: explore collection orderBy sortOrder
 * slug == "bai-bao" → /explore/article
 * slug == "bao-tang" → /explore/museum
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExploreItem, getExploreItems } from '@/services/exploreService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  HistoryImage,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';

const ROUTE_MAP: Record<string, string> = {
  'bai-bao': '/explore/article',
  'bao-tang': '/explore/museum',
};

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'bai-bao': 'newspaper-outline',
  'bao-tang': 'business-outline',
};

function ExploreCard({ item, onPress }: { item: ExploreItem; onPress: () => void }) {
  const colors = useThemeColors();
  const icon = ICON_MAP[item.slug] ?? 'compass-outline';
  return (
    <Card onPress={onPress} noPadding>
      <View style={styles.imageWrapper}>
        <HistoryImage uri={item.coverMediaRef} style={styles.image} fallbackIcon={icon} />
        <View style={[styles.imageOverlay, { backgroundColor: colors.overlay }]} />
        <View style={[styles.iconChip, { backgroundColor: colors.primary }]}>
          <Ionicons name={icon} size={22} color={colors.onPrimary} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        {!!item.description && (
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerLabel, { color: colors.primary }]}>Khám phá</Text>
          <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
        </View>
      </View>
    </Card>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setItems(await getExploreItems());
    } catch {
      setError('Không thể tải mục khám phá.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = (item: ExploreItem) => {
    const route = ROUTE_MAP[item.slug];
    if (route) router.push(route as any);
  };

  return (
    <Screen>
      <AppHeader title="Khám Phá" subtitle="Bài báo & Bảo tàng" showBack={false} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }: ListRenderItemInfo<ExploreItem>) => (
            <ExploreCard item={item} onPress={() => handlePress(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={<EmptyState message="Chưa có mục khám phá." icon="compass-outline" />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING[4], gap: SPACING[4], paddingBottom: SPACING[8] },
  imageWrapper: { width: '100%', height: 200, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 },
  iconChip: {
    position: 'absolute',
    top: SPACING[3],
    right: SPACING[3],
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: SPACING[4], gap: SPACING[2] },
  cardTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  cardDesc: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[1],
    paddingTop: SPACING[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold },
});
