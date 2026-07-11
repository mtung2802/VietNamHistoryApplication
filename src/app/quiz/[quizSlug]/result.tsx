/**
 * Màn KẾT QUẢ Quiz
 * Route: /quiz/[quizSlug]/result
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GameQuestion } from '@/models/GameQuestion';
import { SessionResult, BadgeDefinition, SessionAnswer } from '@/models/GamificationModels';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { SuVietColors, Fonts, HTML_SHADOWS } from '@/constants/theme';
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
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { submitSession, profile } = useGamification();

  const isReviewMode = params.mode === 'review' || params.isReviewMode === 'true';

  const review = useMemo<ReviewData>(() => {
    try {
      const decodedData = params.data ? decodeURIComponent(params.data as string) : '{}';
      const parsed = JSON.parse(decodedData);
      return {
        questions: parsed.questions || [],
        answers: parsed.answers || [],
      };
    } catch {
      return { questions: [], answers: [] };
    }
  }, [params.data]);

  const parsedAnswers: SessionAnswer[] = useMemo(() => {
    try {
      if (isReviewMode && params.answers) {
        const decoded = decodeURIComponent(params.answers as string);
        return JSON.parse(decoded) as SessionAnswer[];
      }
    } catch {
      // ignore
    }
    return [];
  }, [isReviewMode, params.answers]);

  const total = isReviewMode ? parsedAnswers.length : review.questions.length;
  let score = 0;
  if (isReviewMode) {
    score = parsedAnswers.filter((a) => a.isCorrect).length;
  } else {
    score = review.answers.reduce((acc, ans, i) => {
      const q = review.questions[i];
      if (q && ans === q.correctAnswer) return acc + 1;
      return acc;
    }, 0);
  }
  const time = Number(params.time ?? 0);
  const points = score * 10;

  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const xpAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

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
        toValue: 1, friction: 5, tension: 40, useNativeDriver: true,
      }).start();
      return;
    }

    if (!profile || submittedRef.current || submitting) return;

    const processGamification = async () => {
      setSubmitting(true);
      try {
        const result = await submitSession({
          userId: user?.uid || user?.id || '',
          type: 'quiz',
          quizId: params.quizSlug as string,
          score: score * 10,
          totalQuestions: total,
          correctAnswers: score,
          timeTaken: time,
          answers: review.answers.map((userAns, index) => {
            const q = review.questions[index];
            const isCorrect = userAns === q.correctAnswer;
            return {
              questionId: q.id,
              questionText: q.question,
              userAnswer: q.options[userAns] || '',
              correctAnswer: q.options[q.correctAnswer] || '',
              isCorrect,
              timeTaken: 0,
              options: q.options,
            } as unknown as SessionAnswer;
          }),
        });
        setSessionResult(result);

        Animated.sequence([
          Animated.delay(300),
          Animated.spring(xpAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        ]).start();

        if (result.newBadges.length > 0) {
          Animated.sequence([
            Animated.delay(1000),
            Animated.spring(badgeAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
          ]).start();
        }
      } catch (err) {
        console.error('Failed to submit session:', err);
      } finally {
        submittedRef.current = true;
        setSubmitting(false);
      }
    };

    processGamification();
  }, [profile, isReviewMode]);

  const ratio = total > 0 ? score / total : 0;
  const resultGrade = ratio >= 0.9 ? 'Xuất Sắc!' : ratio >= 0.6 ? 'Đạt Rồi!' : 'Cần Cố Gắng';
  const resultSub = ratio >= 0.9 ? 'Bậc thầy sử Việt, thật đáng nể!' : ratio >= 0.6 ? 'Kiến thức vững vàng, tiếp tục nhé.' : 'Ôn thêm rồi thử lại nào!';
  const xpGained = sessionResult?.xpGained ?? 0;

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <LinearGradient
          colors={[SuVietColors.son, SuVietColors.son2]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Back button (Top left) */}
          <TouchableOpacity 
            style={styles.headerBackBtn}
            onPress={() => isReviewMode ? router.back() : router.replace('/(tabs)/game')}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerDecoration} />
          <View style={styles.headerContent}>
            <View style={styles.resultIcon}>
              <Ionicons name="star" size={34} color={SuVietColors.sao} />
            </View>
            <Text style={styles.resultGrade}>{resultGrade}</Text>
            <Text style={styles.resultSub}>{resultSub}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* 3 stat cards */}
          <View style={styles.statRow}>
            <View style={[styles.statCard, HTML_SHADOWS.card]}>
              <Text style={styles.statValue}>{score}/{total}</Text>
              <Text style={styles.statLabel}>câu đúng</Text>
            </View>
            <View style={[styles.statCard, HTML_SHADOWS.card]}>
              <Text style={styles.statValue}>{score * 10}</Text>
              <Text style={styles.statLabel}>điểm</Text>
            </View>
            {/* XP card */}
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

          {/* New Badges */}
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

          {/* Review từng câu */}
          <Text style={styles.reviewTitle}>Xem lại bài làm</Text>
          {isReviewMode ? (
            parsedAnswers.map((ans, qi) => {
              const isCorrect = ans.isCorrect;
              const isTimeout = !ans.userAnswer;
              const borderColor = isCorrect ? SuVietColors.correct : SuVietColors.wrong;
              const status = isCorrect ? 'Đúng' : isTimeout ? 'Hết giờ' : 'Sai';
              
              let correctLetter = '';
              if (ans.options) {
                const opts = Array.isArray(ans.options) ? ans.options : Object.values(ans.options);
                const idx = opts.indexOf(ans.correctAnswer);
                if (idx >= 0 && idx < OPTION_LABELS.length) {
                  correctLetter = `${OPTION_LABELS[idx]}. `;
                }
              }
              // Prevent double prefix if the data already contains it
              const displayAnswer = ans.correctAnswer?.startsWith(correctLetter) 
                ? ans.correctAnswer 
                : `${correctLetter}${ans.correctAnswer}`;

              return (
                <View key={ans.questionId || qi} style={[styles.reviewCard, { borderLeftColor: borderColor }]}>
                  <Text style={styles.reviewQuestion}>{ans.questionText}</Text>
                  <Text style={styles.reviewStatus}>
                    <Text style={{ color: borderColor }}>{status}</Text>
                    {' — Đáp án đúng: '}
                    <Text style={{ color: SuVietColors.son }}>{displayAnswer}</Text>
                  </Text>
                </View>
              );
            })
          ) : (
            review.questions.map((q, qi) => {
              const userChoice = review.answers[qi] ?? -1;
              const isCorrect = userChoice === q.correctAnswer;
              const isTimeout = userChoice === -1;
              const borderColor = isCorrect ? SuVietColors.correct : SuVietColors.wrong;
              const status = isCorrect ? 'Đúng' : isTimeout ? 'Hết giờ' : 'Sai';
              
              let correctLetter = '';
              if (q.correctAnswer >= 0 && q.correctAnswer < OPTION_LABELS.length) {
                correctLetter = `${OPTION_LABELS[q.correctAnswer]}. `;
              }
              const ansText = q.options[q.correctAnswer] || '';
              const displayAnswer = ansText.startsWith(correctLetter) 
                ? ansText 
                : `${correctLetter}${ansText}`;

              return (
                <View key={q.id || qi} style={[styles.reviewCard, { borderLeftColor: borderColor }]}>
                  <Text style={styles.reviewQuestion}>{q.question}</Text>
                  <Text style={styles.reviewStatus}>
                    <Text style={{ color: borderColor }}>{status}</Text>
                    {' — Đáp án đúng: '}
                    <Text style={{ color: SuVietColors.son }}>{displayAnswer}</Text>
                  </Text>
                </View>
              );
            })
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {!isReviewMode && (
              <TouchableOpacity
                style={styles.replayBtn}
                onPress={() => router.replace({ pathname: '/quiz/[quizSlug]/play', params: { quizSlug: params.quizSlug as string } })}
                activeOpacity={0.8}
              >
                <Text style={styles.replayBtnText}>Chơi lại</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => isReviewMode ? router.back() : router.replace('/(tabs)/game')}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[SuVietColors.son, SuVietColors.son2]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.homeBtn, HTML_SHADOWS.button]}
              >
                <Text style={styles.homeBtnText}>{isReviewMode ? 'Quay lại' : 'Trở về'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay, flex: 1 },

  // Header gradient
  header: {
    paddingTop: 50, paddingHorizontal: 22, paddingBottom: 30,
    position: 'relative', overflow: 'hidden',
    alignItems: 'center',
  },
  headerBackBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
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

  // Review
  reviewTitle: { fontFamily: Fonts.serifBold, fontSize: 17, color: SuVietColors.muc, marginTop: 4 },
  reviewCard: {
    backgroundColor: SuVietColors.card, borderWidth: 1, borderColor: SuVietColors.line,
    borderRadius: 14, padding: 14, borderLeftWidth: 4,
  },
  reviewQuestion: { fontFamily: Fonts.semibold, fontSize: 14, color: SuVietColors.muc, lineHeight: 20 },
  reviewStatus: { fontFamily: Fonts.regular, fontSize: 12.5, color: SuVietColors.muc2, marginTop: 8 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 11, marginTop: 6 },
  replayBtn: {
    flex: 1, paddingVertical: 14,
    borderWidth: 1, borderColor: SuVietColors.son, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  replayBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: SuVietColors.son },
  homeBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  homeBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: '#f6e9cf' },
});
