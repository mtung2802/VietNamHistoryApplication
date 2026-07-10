/**
 * Màn KẾT QUẢ Quiz
 * Route: /quiz/[quizSlug]/result
 *
 * Hiển thị điểm, số câu đúng, tổng thời gian, review từng câu.
 * Tự động submit session lên hệ thống gamification khi mount.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GameQuestion } from '@/models/GameQuestion';
import { SessionResult, BadgeDefinition, SessionAnswer } from '@/models/GamificationModels';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { getRankTier, RANK_TIERS } from '@/services/rankService';
import { Screen } from '@/components/ui';
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface ReviewData {
  questions: GameQuestion[];
  answers: number[];
}

export default function QuizResultScreen() {
  const params = useLocalSearchParams<{
    quizSlug: string;
    score: string;
    total: string;
    time: string;
    title: string;
    data: string;
    answers: string;
    isReviewMode: string;
    xpGained: string;
  }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { submitSession, profile } = useGamification();
  const isReviewMode = params.isReviewMode === 'true';

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);
  const time = Number(params.time ?? 0);
  const points = score * 10;

  // Gamification state
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  // Animations
  const xpAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  const review = useMemo<ReviewData>(() => {
    try {
      return JSON.parse(params.data ?? '{}') as ReviewData;
    } catch {
      return { questions: [], answers: [] };
    }
  }, [params.data]);

  const parsedAnswers: SessionAnswer[] = useMemo(() => {
    try {
      if (isReviewMode && params.answers) {
        return JSON.parse(params.answers) as SessionAnswer[];
      }
    } catch {
      // ignore
    }
    return [];
  }, [isReviewMode, params.answers]);

  // Submit session khi mount
  useEffect(() => {
    if (isReviewMode) {
      setSessionResult({
        xpGained: Number(params.xpGained ?? 0),
        totalXP: profile?.totalXP ?? 0,
        currentRank: profile?.currentRank ?? 'Newcomer',
        previousRank: profile?.currentRank ?? 'Newcomer',
        rankChanged: false,
        newBadges: [],
      });
      Animated.spring(xpAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      return;
    }

    if (submittedRef.current || !user?.id) return;
    submittedRef.current = true;

    const submit = async () => {
      try {
        const sessionAnswers: SessionAnswer[] = review.questions.map((q, qi) => {
          const userChoice = review.answers[qi] ?? -1;
          const isCorrect = userChoice === q.correctAnswer;
          const optionsMap: Record<string, string> = {};
          q.options.forEach((opt, oi) => {
            optionsMap[OPTION_LABELS[oi]] = opt;
          });
          return {
            questionId: q.id,
            questionText: q.question,
            userAnswer: userChoice >= 0 ? OPTION_LABELS[userChoice] : '',
            correctAnswer: OPTION_LABELS[q.correctAnswer] ?? '',
            isCorrect,
            timeTaken: 0,
            options: optionsMap,
          };
        });

        const result = await submitSession({
          userId: user.id,
          type: 'quiz',
          gameId: params.quizSlug ?? null,
          gameTitle: params.title ?? 'Trắc nghiệm Lịch sử',
          score,
          totalQuestions: total,
          correctAnswers: score,
          timeTaken: time,
          answers: sessionAnswers,
        });
        setSessionResult(result);

        // Animate XP card
        Animated.spring(xpAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();

        // Animate badges (nếu có)
        if (result.newBadges.length > 0) {
          Animated.spring(badgeAnim, {
            toValue: 1,
            delay: 400,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      } catch (err) {
        console.error('❌ Lỗi submit session:', err);
      } finally {
        setSubmitting(false);
      }
    };

    submit();
  }, [user?.id]);

  const ratio = total > 0 ? score / total : 0;
  const resultGrade = ratio >= 0.9 ? 'Xuất Sắc!' : ratio >= 0.6 ? 'Đạt Rồi!' : 'Cần Cố Gắng';
  const resultSub = ratio >= 0.9 ? 'Bậc thầy sử Việt, thật đáng nể!' : ratio >= 0.6 ? 'Kiến thức vững vàng, tiếp tục nhé.' : 'Ôn thêm rồi thử lại nào!';
  const xpGained = sessionResult?.xpGained ?? 0;

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header gradient đỏ — giống HTML */}
        <LinearGradient
          colors={[SuVietColors.son, SuVietColors.son2]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Star decorative circle (top, semi-transparent) */}
          <View style={styles.headerDecoration} />
          <View style={styles.headerContent}>
            {/* Trophy star icon */}
            <View style={styles.resultIcon}>
              <Ionicons name="star" size={34} color={SuVietColors.sao} />
            </View>
            <Text style={styles.resultGrade}>{resultGrade}</Text>
            <Text style={styles.resultSub}>{resultSub}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* 3 stat cards — giống HTML */}
          <View style={styles.statRow}>
            <View style={[styles.statCard, HTML_SHADOWS.card]}>
              <Text style={styles.statValue}>{score}/{total}</Text>
              <Text style={styles.statLabel}>câu đúng</Text>
            </View>
            <View style={[styles.statCard, HTML_SHADOWS.card]}>
              <Text style={styles.statValue}>{score * 10}</Text>
              <Text style={styles.statLabel}>điểm</Text>
            </View>
            {/* XP card — gradient vàng */}
            <Animated.View style={[styles.xpCard, HTML_SHADOWS.card, {
              opacity: xpAnim,
              transform: [{ translateY: xpAnim.interpolate({ inputRange: [0,1], outputRange:[20,0] }) }]
            }]}>
              <LinearGradient
                colors={[SuVietColors.dong, '#8f6e2c']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.xpGradient}
              >
                <Text style={styles.xpValue}>+{xpGained}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Badge mới nếu có — nền #fff6e0, viền vàng */}
          {!isReviewMode && sessionResult && sessionResult.newBadges.length > 0 && (
            <Animated.View style={[styles.newBadgeCard, {
              opacity: badgeAnim,
              transform: [{ translateY: badgeAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }]
            }]}>
              {sessionResult.newBadges.map((badge: BadgeDefinition) => (
                <View key={badge.id} style={styles.newBadgeRow}>
                  <View style={styles.newBadgeIconCircle}>
                    <Ionicons name={badge.icon as keyof typeof Ionicons.glyphMap} size={18} color={SuVietColors.sao} />
                  </View>
                  <View>
                    <Text style={styles.newBadgeLabel}>HUY HIỆU MỚI</Text>
                    <Text style={styles.newBadgeName}>{badge.name}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Review từng câu — border-left xành/đỏ */}
          <Text style={styles.reviewTitle}>Xem lại bài làm</Text>
          {review.questions.map((q, qi) => {
            const userChoice = review.answers[qi] ?? -1;
            const isCorrect = userChoice === q.correctAnswer;
            const isTimeout = userChoice === -1;
            const borderColor = isCorrect ? SuVietColors.correct : SuVietColors.wrong;
            const status = isCorrect ? 'Đúng' : isTimeout ? 'Hết giờ' : 'Sai';
            return (
              <View key={q.id} style={[styles.reviewCard, { borderLeftColor: borderColor }]}>
                <Text style={styles.reviewQuestion}>{q.question}</Text>
                <Text style={styles.reviewStatus}>
                  <Text style={{ color: borderColor }}>{status}</Text>
                  {' — Đáp án đúng: '}
                  <Text style={{ color: SuVietColors.son }}>{q.options[q.correctAnswer]}</Text>
                </Text>
              </View>
            );
          })}

          {/* Nút hành động — 2 nút giống HTML */}
          <View style={styles.actionRow}>
            {!isReviewMode && (
              <TouchableOpacity
                style={styles.replayBtn}
                onPress={() => router.replace({ pathname: '/quiz/[quizSlug]/play', params: { quizSlug: params.quizSlug! } })}
                activeOpacity={0.8}
              >
                <Text style={styles.replayBtnText}>Chơi lại</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => isReviewMode ? router.back() : router.replace('/(tabs)/game')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[SuVietColors.son, SuVietColors.son2]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.homeBtn, HTML_SHADOWS.button]}
              >
                <Text style={styles.homeBtnText}>{isReviewMode ? 'Quảy lại' : 'Trở về'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },

  // Header gradient
  header: {
    paddingTop: 34, paddingHorizontal: 22, paddingBottom: 30,
    position: 'relative', overflow: 'hidden',
    alignItems: 'center',
  },
  headerDecoration: {
    position: 'absolute', left: '50%', top: -40,
    width: 220, height: 220, borderRadius: 110,
    opacity: 0.18,
    backgroundColor: SuVietColors.sao,
    transform: [{ translateX: -110 }],
  },
  headerContent: { alignItems: 'center', position: 'relative' },
  resultIcon: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: SuVietColors.dong2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3, borderColor: SuVietColors.sao,
  },
  resultGrade: {
    fontFamily: Fonts.serifExtraBold,
    fontSize: 28, color: '#f6e9cf',
  },
  resultSub: {
    fontFamily: Fonts.regular,
    fontSize: 14, color: '#e8d3ae', marginTop: 6,
  },

  content: { padding: 22, paddingBottom: 30, gap: 16 },

  // 3 stat cards
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: SuVietColors.card,
    borderRadius: 16, borderWidth: 1, borderColor: SuVietColors.line,
    paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center',
  },
  statValue: { fontFamily: Fonts.serifExtraBold, fontSize: 24, color: SuVietColors.son },
  statLabel: { fontFamily: Fonts.semibold, fontSize: 11.5, color: SuVietColors.muc2, marginTop: 2 },
  xpCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  xpGradient: { paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center' },
  xpValue: { fontFamily: Fonts.serifExtraBold, fontSize: 24, color: '#fff' },
  xpLabel: { fontFamily: Fonts.semibold, fontSize: 11.5, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  // XP Card legacy (kept for animation)
  xpCardNew: {
    backgroundColor: '#FFFFFF', borderLeftWidth: 3, borderLeftColor: '#F59E0B',
    borderRadius: 12, padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  xpRowTop: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  xpAmount: { fontSize: 24, fontWeight: '900', color: '#F59E0B' },
  xpSmallText: { fontSize: 12, color: '#6B7280' },
  xpRowBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  xpStatText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  xpDivider: { width: 1, height: 14, backgroundColor: '#D1D5DB' },
  rankUpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rankUpText: { fontSize: 14, fontWeight: '700' },

  // New badge card
  newBadgeCard: {
    backgroundColor: '#fff6e0', borderWidth: 1, borderColor: SuVietColors.dong,
    borderRadius: 16, padding: 14,
  },
  newBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  newBadgeIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: SuVietColors.dong2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: SuVietColors.sao,
  },
  newBadgeLabel: { fontFamily: Fonts.bold, fontSize: 11, color: SuVietColors.dong, letterSpacing: 1 },
  newBadgeName: { fontFamily: Fonts.serifBold, fontSize: 16, color: SuVietColors.muc },

  // Badge Card (legacy)
  badgeCard: { gap: SPACING[3] },
  badgeTitle: { fontSize: 18, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeInfo: { flex: 1, gap: 2 },
  badgeName: { fontSize: 16, fontWeight: '700' },
  badgeDesc: { fontSize: 12 },

  // Review
  reviewTitle: { fontFamily: Fonts.serifBold, fontSize: 17, color: SuVietColors.muc, marginTop: 4 },
  reviewCard: {
    backgroundColor: SuVietColors.card, borderWidth: 1, borderColor: SuVietColors.line,
    borderRadius: 14, padding: 14, borderLeftWidth: 4,
  },
  reviewQuestion: { fontFamily: Fonts.semibold, fontSize: 14, color: SuVietColors.muc, lineHeight: 20 },
  reviewStatus: { fontFamily: Fonts.regular, fontSize: 12.5, color: SuVietColors.muc2, marginTop: 8 },
  reviewOptions: { gap: 8, marginTop: 8 },
  reviewOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reviewOptionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  timeoutNote: { fontSize: 12, fontStyle: 'italic', marginTop: 8 },

  // Score card (legacy)
  scoreCard: { alignItems: 'center', gap: SPACING[2], paddingVertical: SPACING[6] },
  verdict: { fontSize: 18, fontWeight: '700' },
  bigScore: { fontSize: 48, fontWeight: '900' },
  scoreUnit: { fontSize: 16, fontWeight: '400' },
  statItem: { alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32 },

  actionRow: { flexDirection: 'row', gap: 11, marginTop: 6 },
  replayBtn: {
    flex: 1, paddingVertical: 14,
    borderWidth: 1, borderColor: SuVietColors.son, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  replayBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: SuVietColors.son },
  homeBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  homeBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: '#f6e9cf' },

  actions: { gap: SPACING[3], marginTop: SPACING[2] },
});
