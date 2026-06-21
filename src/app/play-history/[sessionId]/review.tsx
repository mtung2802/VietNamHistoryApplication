import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { GameSession } from '@/models/GamificationModels';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { RANK_TIERS } from '@/services/rankService';
import { Screen, AppHeader, Card, Button } from '@/components/ui';

export default function ResultReviewScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { profile } = useGamification();

  const [session, setSession] = useState<GameSession | null>(null);
  const [title, setTitle] = useState<string>('');
  const [questionDetails, setQuestionDetails] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviewData() {
      if (!user?.id || !sessionId) return;
      try {
        setLoading(true);
        const sessionRef = doc(db, 'history', user.id, 'sessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data() as GameSession;
          setSession(sessionData);

          let fetchedTitle = sessionData.gameTitle || 'Không rõ';
          if (sessionData.type === 'quiz' && sessionData.gameId && sessionData.quizId) {
            const quizRef = doc(db, 'games', sessionData.gameId, 'quizzes', sessionData.quizId);
            const quizSnap = await getDoc(quizRef);
            if (quizSnap.exists()) {
              const quizData = quizSnap.data();
              const formattedTitle = `${quizData.eventID?.title ?? 'Không rõ'} · ${quizData.level ?? ''}`.trim();
              fetchedTitle = formattedTitle.endsWith('·') ? formattedTitle.slice(0, -1).trim() : formattedTitle;
            }
          } else if (sessionData.type === 'game' && sessionData.gameId) {
            const eraRef = doc(db, 'games', 'timelinepuzzle', 'eras', sessionData.gameId);
            const eraSnap = await getDoc(eraRef);
            if (eraSnap.exists()) {
              const eraData = eraSnap.data();
              fetchedTitle = eraData.title || eraData.name || 'Không rõ';
            }
          }
          setTitle(fetchedTitle);

          if (sessionData.type === 'quiz' && sessionData.gameId && sessionData.quizId && sessionData.answers) {
            const questionsRef = collection(db, 'games', sessionData.gameId, 'quizzes', sessionData.quizId, 'questions');
            const questionPromises = sessionData.answers.map(async (ans) => {
              const qSnap = await getDoc(doc(questionsRef, ans.questionId));
              if (qSnap.exists()) {
                return { id: ans.questionId, data: qSnap.data() };
              }
              return null;
            });
            const qResults = await Promise.all(questionPromises);
            const qMap: Record<string, Record<string, string>> = {};
            qResults.forEach((r) => {
              if (r && r.data?.options) {
                qMap[r.id] = r.data.options;
              }
            });
            setQuestionDetails(qMap);
          }
        }
      } catch (err) {
        console.error('Failed to load session review:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewData();
  }, [user?.id, sessionId]);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Chi tiết lượt chơi" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <AppHeader title="Chi tiết lượt chơi" />
        <View style={styles.centered}>
          <Text style={{ color: colors.text }}>Không tìm thấy dữ liệu lượt chơi.</Text>
        </View>
      </Screen>
    );
  }

  const ratio = session.totalQuestions > 0 ? session.correctAnswers / session.totalQuestions : 0;
  const verdict =
    ratio >= 0.8
      ? { icon: 'trophy', text: 'Xuất sắc!', color: colors.primary }
      : ratio >= 0.5
        ? { icon: 'ribbon', text: 'Khá tốt!', color: colors.success }
        : { icon: 'school', text: 'Cố gắng thêm nhé!', color: colors.info };

  const points = session.score * 10;
  const answers = session.answers || [];
  const rankColor = RANK_TIERS.find((r) => r.name === profile?.currentRank)?.color || '#9CA3AF';

  return (
    <Screen>
      <AppHeader title={title} showThemeToggle={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card highlighted style={styles.scoreCard}>
          <Ionicons name={verdict.icon as any} size={56} color={verdict.color} />
          <Text style={[styles.verdict, { color: verdict.color }]}>{verdict.text}</Text>
          <Text style={[styles.bigScore, { color: colors.primary }]}>
            {points}
            <Text style={[styles.scoreUnit, { color: colors.textSecondary }]}> điểm</Text>
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {session.correctAnswers}/{session.totalQuestions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Câu đúng</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{session.timeTaken}s</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Thời gian</Text>
            </View>
          </View>
        </Card>

        {/* XP Card Redesigned */}
        <View style={styles.xpCardNew}>
          <View style={styles.xpRowTop}>
            <Ionicons name="star" size={24} color="#F59E0B" style={{ alignSelf: 'center' }} />
            <Text style={styles.xpAmount}>+{session.xpGained} XP</Text>
            <Text style={styles.xpSmallText}>đã nhận</Text>
          </View>
          <View style={styles.xpRowBottom}>
            <Text style={styles.xpStatText}>
              Tổng: <Text style={{ fontWeight: '800' }}>{profile?.totalXP ?? 0} XP</Text>
            </Text>
            <View style={styles.xpDivider} />
            <Text style={styles.xpStatText}>
              Hạng: <Text style={{ color: rankColor, fontWeight: '800' }}>{profile?.currentRank ?? 'Newcomer'}</Text>
            </Text>
          </View>
        </View>

        {/* Xem lại đáp án */}
        {answers.length > 0 && (
          <>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Xem lại đáp án</Text>

            {answers.map((ans, idx) => (
              <Card key={ans.questionId} style={styles.reviewCard}>
                <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                  Câu {idx + 1}: {ans.questionText}
                </Text>
                <View style={styles.reviewOptions}>
                  {ans.userAnswer === ans.correctAnswer ? (
                    <View style={styles.reviewOptionRow}>
                      <Text style={[styles.reviewOptionText, { color: colors.success }]}>
                        ✓  {ans.userAnswer}. {questionDetails[ans.questionId]?.[ans.userAnswer]}
                      </Text>
                    </View>
                  ) : (
                    <>
                      {ans.userAnswer ? (
                        <View style={styles.reviewOptionRow}>
                          <Text style={[styles.reviewOptionText, { color: colors.error }]}>
                            ✗  {ans.userAnswer}. {questionDetails[ans.questionId]?.[ans.userAnswer]}
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
                          ✓  {ans.correctAnswer}. {questionDetails[ans.questionId]?.[ans.correctAnswer]}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Nút hành động */}
        <View style={styles.actions}>
          {session.type === 'quiz' && session.quizId && (
            <Button
              label="Chơi lại"
              icon="refresh"
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: '/quiz/[quizSlug]/play',
                  params: { quizSlug: session.quizId! },
                })
              }
            />
          )}
          <Button label="Quay lại" icon="arrow-back" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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

  // Review
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
