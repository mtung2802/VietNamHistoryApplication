/**
 * Tab Game — Câu Đố + Ghép Niên Đại
 * Tương đương: GameFragment.java (2 sub-tabs: QuizzFragment + TimeLinePuzzleFragment)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, ListRenderItemInfo, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { QuizItem } from '@/models/QuizzItem';
import { Era } from '@/models/Era';
import { getQuizzes } from '@/services/quizService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

type GameTab = 'quiz' | 'timeline';

const LEVEL_COLOR: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};
const LEVEL_LABEL: Record<string, string> = {
  easy: 'Dễ', medium: 'Trung bình', hard: 'Khó',
};

// ── Quiz card ────────────────────────────────────────────────────────────────
function QuizCard({ item, onPress }: { item: QuizItem; onPress: () => void }) {
  const color = LEVEL_COLOR[item.level] ?? COLORS.primary;
  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.levelBadge, { backgroundColor: color }]}>
        <Text style={styles.levelText}>{LEVEL_LABEL[item.level] ?? item.level}</Text>
      </View>
      <Text style={styles.gameCardTitle} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.gameCardSub}>{item.questionCount} câu hỏi</Text>
      <View style={styles.gameCardFooter}>
        <Text style={styles.gameCardAction}>Bắt đầu ›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Era card ─────────────────────────────────────────────────────────────────
function EraCard({ item, onPress }: { item: Era; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress} activeOpacity={0.85}>
      <Text style={{ fontSize: 36, marginBottom: 8 }}>🗓️</Text>
      <Text style={styles.gameCardTitle}>{item.title}</Text>
      <View style={styles.gameCardFooter}>
        <Text style={styles.gameCardAction}>Ghép ngay ›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function GameScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GameTab>('quiz');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [eras, setEras] = useState<Era[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setQuizzes(await getQuizzes());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEras = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'games', 'timelinepuzzle', 'eras'));
      setEras(snap.docs.map((d) => ({ eraId: d.id, ...d.data() } as Era)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quiz') loadQuizzes();
    else loadEras();
  }, [activeTab, loadQuizzes, loadEras]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.starRow}>
          {['★', '★', '★', '★', '★'].map((s, i) => <Text key={i} style={styles.starText}>{s}</Text>)}
        </View>
        <Text style={styles.headerTitle}>Trò Chơi Lịch Sử</Text>
        <Text style={styles.headerSubtitle}>Vừa học vừa chơi</Text>
      </View>
      <View style={styles.accent} />

      {/* Tab switcher — like Java highlightButton */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quiz' && styles.tabActive]}
          onPress={() => setActiveTab('quiz')}
        >
          <Text style={[styles.tabText, activeTab === 'quiz' && styles.tabTextActive]}>🎯 Câu Đố Lịch Sử</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'timeline' && styles.tabActive]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>🗓️ Ghép Niên Đại</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : activeTab === 'quiz' ? (
        <FlatList
          data={quizzes}
          keyExtractor={(q) => q.id}
          renderItem={({ item }: ListRenderItemInfo<QuizItem>) => (
            <QuizCard item={item} onPress={() => router.push({ pathname: '/quiz/[quizSlug]', params: { quizSlug: item.id } })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Chưa có quiz nào.</Text></View>}
        />
      ) : (
        <FlatList
          data={eras}
          keyExtractor={(e) => e.eraId}
          renderItem={({ item }: ListRenderItemInfo<Era>) => (
            <EraCard item={item} onPress={() => router.push({ pathname: '/timeline/[eraId]', params: { eraId: item.eraId } })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Chưa có kỷ nguyên nào.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: SPACING[4], alignItems: 'center' },
  starRow: { flexDirection: 'row', gap: 6, marginBottom: SPACING[2] },
  starText: { color: COLORS.accent, fontSize: 14 },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, fontStyle: 'italic', marginTop: 2 },
  accent: { height: 4, backgroundColor: COLORS.accent },

  tabRow: {
    flexDirection: 'row', margin: SPACING[4],
    backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.full, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.full },
  tabActive: { backgroundColor: COLORS.white, ...SHADOWS.sm },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, fontWeight: FONT_WEIGHTS.medium },
  tabTextActive: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },

  list: { padding: SPACING[4], gap: SPACING[3], paddingBottom: SPACING[8] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: COLORS.gray400, fontSize: FONT_SIZES.base, textAlign: 'center' },

  gameCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4], ...SHADOWS.md,
  },
  levelBadge: { alignSelf: 'flex-start', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  levelText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  gameCardTitle: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 22, marginBottom: 4 },
  gameCardSub: { fontSize: FONT_SIZES.xs, color: COLORS.gray500 },
  gameCardFooter: { marginTop: SPACING[3], paddingTop: SPACING[2], borderTopWidth: 1, borderTopColor: COLORS.gray100, alignItems: 'flex-end' },
  gameCardAction: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },
});