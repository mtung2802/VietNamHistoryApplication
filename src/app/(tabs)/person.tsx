/**
 * Tab Nhân Vật Lịch Sử
 * Tương đương: PersonPeriodFragment.java
 * Query: periods_person (orderBy sortOrder)
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
import { PersonPeriodItem } from '@/models/Person';
import { getPersonPeriods } from '@/services/personService';
import { yearFromIso, formatYear } from '@/models/Period';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  Badge,
  HistoryImage,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';

function PeriodCard({
  item,
  index,
  onPress,
}: {
  item: PersonPeriodItem;
  index: number;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const sy = yearFromIso(item.startDate);
  const ey = yearFromIso(item.endDate);

  return (
    <Card onPress={onPress} noPadding>
      <View style={styles.imageWrapper}>
        <HistoryImage
          uri={item.coverMediaRef}
          style={styles.image}
          fallbackIcon="person-outline"
        />
        <View style={[styles.imageOverlay, { backgroundColor: colors.overlay }]} />
        <View style={[styles.indexBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.indexText, { color: colors.onPrimary }]}>
            {index + 1}
          </Text>
        </View>
        <View style={styles.yearOnImage}>
          <Badge label={`${formatYear(sy)} — ${formatYear(ey)}`} tone="gold" />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerLabel, { color: colors.primary }]}>
            Xem nhân vật
          </Text>
          <Ionicons name="arrow-forward-circle" size={26} color={colors.primary} />
        </View>
      </View>
    </Card>
  );
}

export default function PersonScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [items, setItems] = useState<PersonPeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setItems(await getPersonPeriods());
    } catch {
      setError('Không thể tải danh sách nhân vật.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <AppHeader
        title="Nhân Vật Lịch Sử"
        subtitle="Những người làm nên lịch sử"
        showBack={false}
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item, index }: ListRenderItemInfo<PersonPeriodItem>) => (
            <PeriodCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/person-list/[periodSlug]',
                  params: { periodSlug: item.id },
                })
              }
            />
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
          ListEmptyComponent={<EmptyState message="Chưa có dữ liệu nhân vật." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: SPACING[4], paddingBottom: SPACING[8], gap: SPACING[4] },
  imageWrapper: { width: '100%', height: 190, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  indexBadge: {
    position: 'absolute',
    top: SPACING[3],
    left: SPACING[3],
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  yearOnImage: { position: 'absolute', bottom: SPACING[3], left: SPACING[3] },
  cardBody: { padding: SPACING[4], gap: SPACING[2] },
  cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, lineHeight: 26 },
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
