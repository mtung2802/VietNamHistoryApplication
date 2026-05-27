/**
 * Chi tiết Kỷ Nguyên Timeline Puzzle
 * Route: /timeline/[eraId]
 * Tương đương: TimeLinePuzzleDetail.java (màn hình thông tin era)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Era } from '@/models/Era';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

export default function TimelineDetailScreen() {
  const { eraId } = useLocalSearchParams<{ eraId: string }>();
  const router = useRouter();
  const [era, setEra] = useState<Era | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!eraId) return;
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, 'games', 'timelinepuzzle', 'eras', eraId));
      setEra(snap.exists() ? ({ eraId: snap.id, ...snap.data() } as Era) : null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [eraId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!era) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Text style={{ fontSize: 48 }}>❓</Text>
      <Text style={styles.errorText}>Không tìm thấy kỷ nguyên</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
        <Text style={styles.retryText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{era.title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.accent} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🗓️</Text>
          <Text style={styles.heroTitle}>{era.title}</Text>
          {!!era.description && <Text style={styles.heroDesc}>{era.description}</Text>}
        </View>

        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>🧩 Bắt đầu ghép niên đại</Text>
        </TouchableOpacity>

        <Text style={styles.comingSoon}>
          * Tính năng ghép niên đại sẽ được cập nhật trong phiên bản tiếp theo
        </Text>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  accent: { height: 4, backgroundColor: COLORS.accent },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  content: { padding: SPACING[5], gap: SPACING[4], paddingBottom: SPACING[8] },
  heroCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[6], alignItems: 'center', gap: SPACING[3], ...SHADOWS.md,
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, textAlign: 'center' },
  heroDesc: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, textAlign: 'center', lineHeight: 22 },
  startBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 18, alignItems: 'center', ...SHADOWS.md,
  },
  startBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.lg },
  comingSoon: { fontSize: FONT_SIZES.xs, color: COLORS.gray400, textAlign: 'center', fontStyle: 'italic' },
});
