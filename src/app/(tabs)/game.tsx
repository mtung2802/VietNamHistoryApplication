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
import { BORDER_RADIUS, Fonts, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
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

function QuizCard({ item, index, onPress }: { item: QuizItem; index: number; onPress: () => void }) {
  const colors = useThemeColors();
  const formattedIndex = String(index + 1).padStart(2, '0');
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.newQuizCard,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryBright || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quizIndexBox}
      >
        <Text style={styles.quizIndexText}>{formattedIndex}</Text>
      </LinearGradient>
      <View style={styles.quizContent}>
        <Text style={[styles.quizTitleText, { color: colors.text }]} numberOfLines={2}>
          {item.description || item.id}
        </Text>
        <View style={styles.quizMetaRow}>
          <Badge
            label={LEVEL_LABEL[item.level] ?? item.level}
            color={LEVEL_TONE[item.level] ?? colors.primary}
            style={{ paddingHorizontal: 8, paddingVertical: 2 }}
          />
          <View style={[styles.questionCountBadge, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.questionCountText, { color: colors.textSecondary }]}>
              {item.questionCount} câu
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
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
    <Screen style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primary, '#8b1c17']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.customHeader}
      >
        <View style={styles.headerTopRow}>
          <Ionicons name="star" size={16} color="#FFFFFF" />
          <Text style={styles.headerSubtitle}>SỬ VIỆT • HỌC MÀ CHƠI</Text>
        </View>
        <Text style={styles.headerTitle}>Ôn sử nước Nam</Text>
        <Text style={styles.headerDesc}>
          Chọn một thử thách để bắt đầu hành trình xuyên nghìn năm dựng nước.
        </Text>
      </LinearGradient>

      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TabButton tab="quiz" icon="help-circle-outline" label="Trắc nghiệm" />
        <TabButton tab="timeline" icon="time-outline" label="Ghép niên đại" />
      </View>

      {loading ? (
        <LoadingState />
      ) : activeTab === 'quiz' ? (
        <FlatList
          data={quizzes}
          keyExtractor={(q) => q.id}
          renderItem={({ item, index }: ListRenderItemInfo<QuizItem>) => (
            <QuizCard
              item={item}
              index={index}
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
    marginHorizontal: SPACING[5],
    marginTop: -SPACING[5], // Kéo tab lên đè lên header một chút
    marginBottom: SPACING[2],
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },

  list: { padding: SPACING[5], gap: SPACING[4], paddingBottom: SPACING[10] },

  // Custom Header
  customHeader: {
    paddingTop: SPACING[12],
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[10], // padding dưới nhiều hơn để chứa tab
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.serifExtraBold,
    fontSize: FONT_SIZES['3xl'],
    marginBottom: SPACING[1],
  },
  headerDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },

  // New Quiz Card
  newQuizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  quizIndexBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  quizIndexText: {
    color: '#FFFFFF',
    fontFamily: Fonts.serifExtraBold,
    fontSize: FONT_SIZES.xl,
  },
  quizContent: {
    flex: 1,
    justifyContent: 'center',
  },
  quizTitleText: {
    fontFamily: Fonts.serifBold,
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING[1],
  },
  quizMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  questionCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  questionCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },

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
