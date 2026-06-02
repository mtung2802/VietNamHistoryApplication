/**
 * Màn KẾT QUẢ Quiz
 * Route: /quiz/[quizSlug]/result
 * Port: ResultQuizz.java + AnswerDetailAdapter.java
 *
 * Hiển thị điểm (score×10), số câu đúng, tổng thời gian, và review từng câu.
 * Lưu điểm Firestore: để Phase 4 (cần session/uid).
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameQuestion } from '@/models/GameQuestion';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
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
  }>();
  const router = useRouter();
  const colors = useThemeColors();

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);
  const time = Number(params.time ?? 0);
  const points = score * 10;

  const review = useMemo<ReviewData>(() => {
    try {
      return JSON.parse(params.data ?? '{}') as ReviewData;
    } catch {
      return { questions: [], answers: [] };
    }
  }, [params.data]);

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
      <AppHeader title="Kết Quả" showThemeToggle={false} />
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

        {/* Review từng câu */}
        <Text style={[styles.reviewTitle, { color: colors.text }]}>
          Xem lại đáp án
        </Text>

        {review.questions.map((q, qi) => {
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
        })}

        {/* Nút hành động */}
        <View style={styles.actions}>
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
          <Button
            label="Về trang trò chơi"
            icon="grid-outline"
            onPress={() => router.replace('/(tabs)/game')}
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
