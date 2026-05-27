/**
 * Danh sách nhân vật trong một thời kỳ
 * Route: /person-list/[periodSlug]
 * Tương đương: PersonListActivity.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, ListRenderItemInfo,
  RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PersonListItem } from '@/models/Person';
import { getPersonsByPeriod } from '@/services/personService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

function PersonCard({ item, onPress }: { item: PersonListItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      {item.coverMediaRef ? (
        <Image source={{ uri: item.coverMediaRef }} style={styles.avatar} resizeMode="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function PersonListScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug: string }>();
  const router = useRouter();
  const [persons, setPersons] = useState<PersonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!periodSlug) return;
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      setPersons(await getPersonsByPeriod(periodSlug));
    } catch {
      setError('Không thể tải danh sách nhân vật.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [periodSlug]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhân Vật</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.accent} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={persons}
          keyExtractor={(p) => p.id}
          renderItem={({ item }: ListRenderItemInfo<PersonListItem>) => (
            <PersonCard
              item={item}
              onPress={() => router.push({ pathname: '/person/[periodSlug]/[personSlug]', params: { periodSlug, personSlug: item.id } })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 48 }}>📭</Text>
              <Text style={styles.errorText}>Chưa có nhân vật nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  accent: { height: 4, backgroundColor: COLORS.accent },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  list: { padding: SPACING[4], gap: SPACING[3], paddingBottom: SPACING[8] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { color: COLORS.gray600, textAlign: 'center', fontSize: FONT_SIZES.base },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING[3],
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[3], ...SHADOWS.sm,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fce8e8' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  name: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900 },
  title: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: 2 },
  arrow: { color: COLORS.primary, fontSize: 24, fontWeight: FONT_WEIGHTS.bold },
});
