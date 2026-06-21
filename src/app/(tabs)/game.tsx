/**
 * Tab Game — Câu Đố + Ghép Niên Đại
 * Tương đương: GameFragment.java (2 sub-tabs: QuizzFragment + TimeLinePuzzleFragment)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuizItem } from '@/models/QuizzItem';
import { Era } from '@/models/Era';
import { getQuizzes } from '@/services/quizService';
import { getTimelineEras } from '@/services/timelinePuzzleService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  Badge,
  LoadingState,
  EmptyState,
} from '@/components/ui';

type GameTab = 'quiz' | 'timeline';

const LEVEL_TONE: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};
const LEVEL_LABEL: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

function QuizCard({ item, onPress }: { item: QuizItem; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Card onPress={onPress}>
      <Badge
        label={LEVEL_LABEL[item.level] ?? item.level}
        color={LEVEL_TONE[item.level] ?? colors.primary}
      />
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
        <Text style={[styles.cardSub, { color: colors.textMuted }]}>
          {item.questionCount} câu hỏi
        </Text>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardAction, { color: colors.primary }]}>Bắt đầu</Text>
        <Ionicons name="play-circle" size={22} color={colors.primary} />
      </View>
    </Card>
  );
}

function EraCard({ item, onPress }: { item: Era; onPress: () => void }) {
  const colors = useThemeColors();
  const imageUri = item.coverMediaRef ?? item.thumbnailUrl;
  return (
    <Card onPress={onPress}>
      {imageUri ? (
        <ImageBackground
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={styles.eraImage}
          imageStyle={styles.eraImageRadius}
        >
          <View style={styles.eraImageOverlay} />
          <View style={[styles.eraIcon, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
            <Ionicons name="time-outline" size={24} color="#FFD45A" />
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.eraIcon, { backgroundColor: colors.primaryDim }]}>
          <Ionicons name="time-outline" size={26} color={colors.primary} />
        </View>
      )}
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
      {!!item.description && (
        <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardAction, { color: colors.primary }]}>Ghép ngay</Text>
        <Ionicons name="extension-puzzle-outline" size={20} color={colors.primary} />
      </View>
    </Card>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
      setEras(await getTimelineEras());
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

  const TabButton = ({ tab, icon, label }: { tab: GameTab; icon: keyof typeof Ionicons.glyphMap; label: string }) => {
    const active = activeTab === tab;
    return (
      <TouchableOpacity
        style={[
          styles.tab,
          { backgroundColor: active ? colors.primary : 'transparent' },
        ]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={icon}
          size={18}
          color={active ? colors.onPrimary : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            { color: active ? colors.onPrimary : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <AppHeader title="Trò Chơi Lịch Sử" subtitle="Vừa học vừa chơi" showBack={false} />

      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TabButton tab="quiz" icon="help-circle-outline" label="Câu Đố" />
        <TabButton tab="timeline" icon="time-outline" label="Ghép Niên Đại" />
      </View>

      {loading ? (
        <LoadingState />
      ) : activeTab === 'quiz' ? (
        <FlatList
          data={quizzes}
          keyExtractor={(q) => q.id}
          renderItem={({ item }: ListRenderItemInfo<QuizItem>) => (
            <QuizCard
              item={item}
              onPress={() =>
                router.push({ pathname: '/quiz/[quizSlug]', params: { quizSlug: item.id } })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState message="Chưa có câu đố nào." icon="help-circle-outline" />}
        />
      ) : (
        <FlatList
          data={eras}
          keyExtractor={(e) => e.eraId}
          renderItem={({ item }: ListRenderItemInfo<Era>) => (
            <EraCard
              item={item}
              onPress={() =>
                router.push({ pathname: '/timeline/[eraId]', params: { eraId: item.eraId } })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState message="Chưa có kỷ nguyên nào." icon="time-outline" />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    margin: SPACING[4],
    marginBottom: 0,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },

  list: { padding: SPACING[4], gap: SPACING[3], paddingBottom: SPACING[8] },

  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 22,
    marginTop: SPACING[2],
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardSub: { fontSize: FONT_SIZES.xs },
  eraIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraImage: {
    height: 132,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: SPACING[3],
    marginBottom: SPACING[1],
  },
  eraImageRadius: { borderRadius: BORDER_RADIUS.lg },
  eraImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[3],
    paddingTop: SPACING[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardAction: { fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },
});
