/**
 * Màn thông tin Kỷ Nguyên (trước khi chơi Timeline Puzzle)
 * Route: /timeline/[eraId]
 * Tương đương: TimeLinePuzzleDetail.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Era } from '@/models/Era';
import { getEraById } from '@/services/timelinePuzzleService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  Button,
  LoadingState,
  ErrorState,
} from '@/components/ui';

export default function TimelineDetailScreen() {
  const { eraId } = useLocalSearchParams<{ eraId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [era, setEra] = useState<Era | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eraId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getEraById(eraId);
      if (!data) {
        setError('Không tìm thấy kỷ nguyên.');
        return;
      }
      setEra(data);
    } catch {
      setError('Không thể tải kỷ nguyên.');
    } finally {
      setLoading(false);
    }
  }, [eraId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Ghép Niên Đại" showThemeToggle={false} />
        <LoadingState />
      </Screen>
    );
  }

  if (error || !era) {
    return (
      <Screen>
        <AppHeader title="Ghép Niên Đại" showThemeToggle={false} />
        <ErrorState message={error ?? 'Không tìm thấy kỷ nguyên.'} onRetry={load} />
      </Screen>
    );
  }

  const eventCount = era.events?.length ?? 0;
  const heroImage = era.coverMediaRef ?? era.thumbnailUrl;

  return (
    <Screen>
      <AppHeader title={era.title} showThemeToggle={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card highlighted style={styles.heroCard}>
          {heroImage ? (
            <ImageBackground
              source={{ uri: heroImage }}
              resizeMode="cover"
              style={styles.heroImage}
              imageStyle={styles.heroImageRadius}
            >
              <View style={styles.heroImageOverlay} />
              <View style={[styles.heroIconSmall, { backgroundColor: colors.primary }]}>
                <Ionicons name="time" size={26} color={colors.onPrimary} />
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.heroIcon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons name="time" size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.heroTitle, { color: colors.text }]}>{era.title}</Text>
          {!!era.description && (
            <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
              {era.description}
            </Text>
          )}
          {eventCount > 0 && (
            <View style={[styles.countChip, { backgroundColor: colors.primaryDim }]}>
              <Ionicons name="albums-outline" size={16} color={colors.primary} />
              <Text style={[styles.countText, { color: colors.primary }]}>
                {eventCount} sự kiện
              </Text>
            </View>
          )}
        </Card>

        {/* Luật chơi ngắn gọn */}
        <Card style={styles.rulesCard}>
          <Text style={[styles.rulesTitle, { color: colors.text }]}>Cách chơi</Text>
          <View style={styles.ruleRow}>
            <Ionicons name="hand-left-outline" size={18} color={colors.primary} />
            <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
              Chọn thẻ sự kiện theo thứ tự thời gian từ sớm đến muộn để ghép lên bàn.
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Ionicons name="heart-outline" size={18} color={colors.primary} />
            <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
              Chọn sai thì kẻ xâm lược tiến gần pháo đài; khi áp sát, mỗi đòn tấn công làm mất 1 máu.
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
            <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
              Ghép đủ toàn bộ sự kiện trước khi pháo đài hết máu để chiến thắng.
            </Text>
          </View>
        </Card>

        <Button
          label="Bắt đầu ghép niên đại"
          icon="extension-puzzle"
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/timeline/[eraId]/play',
              params: { eraId: eraId! },
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING[5], gap: SPACING[4], paddingBottom: SPACING[8] },
  heroCard: { alignItems: 'center', gap: SPACING[3], paddingVertical: SPACING[4] },
  heroImage: {
    width: '100%',
    height: 210,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImageRadius: { borderRadius: BORDER_RADIUS.lg },
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING[3],
  },
  heroTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
  },
  heroDesc: { fontSize: FONT_SIZES.sm, textAlign: 'center', lineHeight: 22 },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[3],
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  countText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },

  rulesCard: { gap: SPACING[3] },
  rulesTitle: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING[2] },
  ruleText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
});
