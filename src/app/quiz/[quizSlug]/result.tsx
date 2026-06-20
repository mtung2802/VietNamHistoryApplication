/**
 * Màn KẾT QUẢ Quiz
 * Route: /quiz/[quizSlug]/result
 *
 * Hiển thị điểm, số câu đúng, tổng thời gian, review từng câu.
 * Tự động submit session lên hệ thống gamification khi mount.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameQuestion } from '@/models/GameQuestion';
import { SessionResult, BadgeDefinition, SessionAnswer } from '@/models/GamificationModels';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { getRankTier, RANK_TIERS } from '@/services/rankService';
import { Screen, AppHeader, Card, Button } from '@/components/ui';

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

  // Đánh giá nhanh theo tỉ lệ đúng
  const ratio = total > 0 ? score / total : 0;
  const verdict =
    ratio >= 0.8
      ? { icon: 'trophy', text: 'Xuất sắc!', color: colors.primary }
      : ratio >= 0.5
        ? { icon: 'ribbon', text: 'Khá tốt!', color: colors.success }
        : { icon: 'school', text: 'Cố gắng thêm nhé!', color: colors.info };

  return (
    <Screen>
      <AppHeader title={isReviewMode ? "Xem lại kết quả" : "Kết Quả"} showThemeToggle={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Thẻ điểm */}
        <Card highlighted style={styles.scoreCard}>
          <Ionicons
            name={verdict.icon as keyof typeof Ionicons.glyphMap}
            size={56}
            color={verdict.color}
          />
          <Text style={[styles.verdict, { color: verdict.color }]}>
            {verdict.text}
          </Text>
          <Text style={[styles.bigScore, { color: colors.primary }]}>
            {points}
            <Text style={[styles.scoreUnit, { color: colors.textSecondary }]}> điểm</Text>
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {score}/{total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Câu đúng
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{time}s</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Thời gian
              </Text>
            </View>
          </View>
        </Card>

        {/* XP Notification */}
        {sessionResult && (
          <Animated.View
            style={[
              styles.xpCardNew,
              {
                opacity: xpAnim,
                transform: [
                  {
                    translateY: xpAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.xpRowTop}>
              <Ionicons name="star" size={24} color="#F59E0B" style={{ alignSelf: 'center' }} />
              <Text style={styles.xpAmount}>+{sessionResult.xpGained} XP</Text>
              <Text style={styles.xpSmallText}>đã nhận</Text>
            </View>
            <View style={styles.xpRowBottom}>
              <Text style={styles.xpStatText}>
                Tổng: <Text style={{ fontWeight: '800' }}>{sessionResult.totalXP} XP</Text>
              </Text>
              <View style={styles.xpDivider} />
              <Text style={styles.xpStatText}>
                Hạng: <Text style={{ color: RANK_TIERS.find(r => r.name === sessionResult.currentRank)?.color || '#9CA3AF', fontWeight: '800' }}>{sessionResult.currentRank}</Text>
              </Text>
            </View>
            {sessionResult.rankChanged && (
              <View style={styles.rankUpRow}>
                <Ionicons
                  name={getRankTier(sessionResult.currentRank).icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={getRankTier(sessionResult.currentRank).color}
                />
                <Text style={[styles.rankUpText, { color: colors.success }]}>
                  🎉 Thăng hạng: {sessionResult.previousRank} → {sessionResult.currentRank}!
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* New Badges */}
        {!isReviewMode && sessionResult && sessionResult.newBadges.length > 0 && (
          <Animated.View
            style={{
              opacity: badgeAnim,
              transform: [
                {
                  translateY: badgeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Card style={styles.badgeCard}>
              <Text style={[styles.badgeTitle, { color: colors.primary }]}>
                🏅 Huy hiệu mới!
              </Text>
              {sessionResult.newBadges.map((badge: BadgeDefinition) => (
                <View key={badge.id} style={styles.badgeRow}>
                  <View
                    style={[styles.badgeIcon, { backgroundColor: colors.primaryDim }]}
                  >
                    <Ionicons
                      name={badge.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={[styles.badgeName, { color: colors.text }]}>
                      {badge.name}
                    </Text>
                    <Text style={[styles.badgeDesc, { color: colors.textSecondary }]}>
                      {badge.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Review từng câu */}
        <Text style={[styles.reviewTitle, { color: colors.text }]}>
          Xem lại đáp án
        </Text>

        {isReviewMode ? (
          parsedAnswers.map((ans, qi) => (
            <Card key={ans.questionId} style={styles.reviewCard}>
              <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                Câu {qi + 1}: {ans.questionText}
              </Text>
              <View style={styles.reviewOptions}>
                {ans.userAnswer === ans.correctAnswer ? (
                  <View style={styles.reviewOptionRow}>
                    <Text style={[styles.reviewOptionText, { color: colors.success }]}>
                      ✓ {ans.userAnswer}. {ans.options?.[ans.userAnswer]}
                    </Text>
                  </View>
                ) : (
                  <>
                    {ans.userAnswer ? (
                      <View style={styles.reviewOptionRow}>
                        <Text style={[styles.reviewOptionText, { color: colors.error }]}>
                          ✗ {ans.userAnswer}. {ans.options?.[ans.userAnswer]}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.reviewOptionRow}>
                        <Text style={[styles.reviewOptionText, { color: colors.warning }]}>
                          ⏱ Chưa trả lời
                        </Text>
                      </View>
                    )}
                    <View style={styles.reviewOptionRow}>
                      <Text style={[styles.reviewOptionText, { color: colors.success }]}>
                        ✓ {ans.correctAnswer}. {ans.options?.[ans.correctAnswer]}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Card>
          ))
        ) : (
          review.questions.map((q, qi) => {
            const userChoice = review.answers[qi] ?? -1;
            return (
              <Card key={q.id} style={styles.reviewCard}>
                <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                  Câu {qi + 1}: {q.question}
                </Text>
                <View style={styles.reviewOptions}>
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correctAnswer;
                    const isUserWrong = oi === userChoice && userChoice !== q.correctAnswer;
                    let fg = colors.textSecondary;
                    let icon: keyof typeof Ionicons.glyphMap | null = null;
                    if (isCorrect) {
                      fg = colors.success;
                      icon = 'checkmark-circle';
                    } else if (isUserWrong) {
                      fg = colors.error;
                      icon = 'close-circle';
                    }
                    return (
                      <View key={oi} style={styles.reviewOptionRow}>
                        <Text style={[styles.reviewOptionText, { color: fg }]}>
                          {OPTION_LABELS[oi] ?? oi + 1}. {opt}
                        </Text>
                        {icon && <Ionicons name={icon} size={18} color={fg} />}
                      </View>
                    );
                  })}
                </View>
                {userChoice === -1 && (
                  <Text style={[styles.timeoutNote, { color: colors.warning }]}>
                    ⏱ Hết giờ — chưa trả lời
                  </Text>
                )}
              </Card>
            );
          })
        )}

        {/* Nút hành động */}
        <View style={styles.actions}>
          {!isReviewMode ? (
            <Button
              label="Chơi lại"
              icon="refresh"
              variant="outline"
              onPress={() =>
                router.replace({
                  pathname: '/quiz/[quizSlug]/play',
                  params: { quizSlug: params.quizSlug! },
                })
              }
            />
          ) : null}
          <Button
            label={isReviewMode ? "Quay lại lịch sử" : "Về trang trò chơi"}
            icon={isReviewMode ? "arrow-back" : "grid-outline"}
            onPress={() => isReviewMode ? router.back() : router.replace('/(tabs)/game')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING[4], paddingBottom: SPACING[8], gap: SPACING[4] },
  scoreCard: { alignItems: 'center', gap: SPACING[2], paddingVertical: SPACING[6] },
  verdict: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
  bigScore: { fontSize: 48, fontWeight: FONT_WEIGHTS.black },
  scoreUnit: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.normal },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[3],
    gap: SPACING[5],
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  statLabel: { fontSize: FONT_SIZES.xs },
  statDivider: { width: 1, height: 32 },

  // XP Card Redesign
  xpCardNew: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  xpRowTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  xpAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F59E0B',
  },
  xpSmallText: {
    fontSize: 12,
    color: '#6B7280',
  },
  xpRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  xpStatText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  xpDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#D1D5DB',
  },
  rankUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[1],
  },
  rankUpText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Badge Card
  badgeCard: { gap: SPACING[3] },
  badgeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: { flex: 1, gap: 2 },
  badgeName: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold },
  badgeDesc: { fontSize: FONT_SIZES.xs },

  reviewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[2],
  },
  reviewCard: { gap: SPACING[3] },
  reviewQuestion: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
  },
  reviewOptions: { gap: SPACING[2] },
  reviewOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[2],
  },
  reviewOptionText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  timeoutNote: { fontSize: FONT_SIZES.xs, fontStyle: 'italic' },

  actions: { gap: SPACING[3], marginTop: SPACING[2] },
});
