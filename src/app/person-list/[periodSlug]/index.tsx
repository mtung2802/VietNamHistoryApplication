/**
 * Danh sách nhân vật trong một thời kỳ.
 * Port từ PersonListActivity.java.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { PersonListItem } from '@/models/Person';
import { getPersonsByPeriod } from '@/services/personService';
import {
  AppHeader,
  Card,
  EmptyState,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
} from '@/components/ui';

function formatLifeRange(person: PersonListItem) {
  const birth = person.birthDate || person.birth_year;
  const death = person.deathDate || person.death_year;

  if (birth && death) return `${birth} - ${death}`;
  if (birth) return `Sinh ${birth}`;
  if (death) return `Mất ${death}`;
  return 'Chưa rõ niên đại';
}

function PersonCard({ item, onPress }: { item: PersonListItem; onPress: () => void }) {
  const colors = useThemeColors();
  const imageUri = item.coverMediaRef || item.horizontalImage;

  return (
    <Card onPress={onPress} style={styles.card}>
      <HistoryImage
        uri={imageUri}
        style={styles.avatar}
        radius={BORDER_RADIUS.full}
        fallbackIcon="person-outline"
      />
      <View style={styles.cardBody}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.name || 'Không có tên'}
        </Text>
        <Text style={[styles.title, { color: colors.primary }]} numberOfLines={2}>
          {item.title || 'Không có tiêu đề'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]} numberOfLines={1}>
          {formatLifeRange(item)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.primary} />
    </Card>
  );
}

export default function PersonListScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug?: string }>();
  const periodId = useMemo(() => (typeof periodSlug === 'string' ? periodSlug : ''), [periodSlug]);
  const router = useRouter();
  const colors = useThemeColors();

  const [persons, setPersons] = useState<PersonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!periodId) {
      setError('Không tìm thấy thời kỳ nhân vật.');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setPersons(await getPersonsByPeriod(periodId));
    } catch {
      setError('Không thể tải danh sách nhân vật.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <AppHeader title="Nhân Vật" subtitle="Danh sách theo thời kỳ" centerTitle />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(person) => person.id}
          renderItem={({ item }: ListRenderItemInfo<PersonListItem>) => (
            <PersonCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/person/[periodSlug]/[personSlug]',
                  params: { periodSlug: periodId, personSlug: item.id },
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
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              message="Chưa có nhân vật nào trong thời kỳ này."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: SPACING[4],
    paddingBottom: SPACING[8],
    gap: SPACING[3],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.full,
  },
  cardBody: {
    flex: 1,
    gap: SPACING[1],
    minWidth: 0,
  },
  name: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 20,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
  },
});
