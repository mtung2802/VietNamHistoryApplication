/**
 * Màn CHƠI Quiz
 * Route: /quiz/[quizSlug]/play
 * Port: QuizzPlay.java + QuestionFragment.java
 *
 * - Đếm ngược mỗi câu (timeLimit giây) — hết giờ tự tính sai (đáp án -1)
 * - Đếm tổng thời gian (hiển thị ở màn kết quả)
 * - Điểm = số câu đúng (màn kết quả nhân ×10)
 * - Không vuốt: chỉ chuyển câu bằng nút "Câu tiếp"
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getQuizById, getQuestionsByQuiz } from '@/services/quizService';
import { GameQuestion } from '@/models/GameQuestion';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, AppHeader, Button, LoadingState, ErrorState } from '@/components/ui';

const DEFAULT_TIME_LIMIT = 30; // giây/câu nếu quiz không cấu hình
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayScreen() {
  const { quizSlug } = useLocalSearchParams<{ quizSlug: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [title, setTitle] = useState('Câu Đố');
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái chơi
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]); // -1 = chưa trả lời / hết giờ
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME_LIMIT);

  const scoreRef = useRef(0);
  const totalTimeRef = useRef(0);

  // ── Load dữ liệu ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!quizSlug) return;
    try {
      setLoading(true);
      setError(null);
      const [quiz, qs] = await Promise.all([
        getQuizById(quizSlug),
        getQuestionsByQuiz(quizSlug),
      ]);
      if (!qs.length) {
        setError('Quiz này chưa có câu hỏi.');
        return;
      }
      const limit = quiz?.settings?.timeLimit ?? DEFAULT_TIME_LIMIT;
      setTitle(quiz?.description ?? 'Câu Đố');
      setTimeLimit(limit);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setSecondsLeft(limit);
    } catch {
      setError('Không thể tải câu hỏi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [quizSlug]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Đồng hồ tổng (đếm lên) — chạy suốt ván ──────────────────────────────
  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(() => {
      totalTimeRef.current += 1;
    }, 1000);
    return () => clearInterval(id);
  }, [loading, error]);

  // ── Đếm ngược mỗi câu ───────────────────────────────────────────────────
  useEffect(() => {
    if (loading || error || locked) return;
    if (secondsLeft <= 0) {
      // Hết giờ → tính sai, lộ đáp án
      setLocked(true);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, locked, loading, error]);

  // ── Xử lý chọn đáp án ───────────────────────────────────────────────────
  const handleSelect = (optionIndex: number) => {
    if (locked) return;
    const q = questions[currentIndex];
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
    if (optionIndex === q.correctAnswer) scoreRef.current += 1;
    setLocked(true);
  };

  // ── Chuyển câu / kết thúc ───────────────────────────────────────────────
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      finishQuiz();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setLocked(false);
    setSecondsLeft(timeLimit);
  };

  const finishQuiz = () => {
    router.replace({
      pathname: '/quiz/[quizSlug]/result',
      params: {
        quizSlug: quizSlug!,
        score: String(scoreRef.current),
        total: String(questions.length),
        time: String(totalTimeRef.current),
        title,
        data: JSON.stringify({ questions, answers }),
      },
    });
  };

  if (loading) return <LoadingState message="Đang tải câu hỏi…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const q = questions[currentIndex];
  const answered = answers[currentIndex];
  const isLast = currentIndex + 1 >= questions.length;
  const timeRunningLow = secondsLeft <= 5 && !locked;

  return (
    <Screen>
      <AppHeader title={title} showThemeToggle={false} />

      {/* Thanh trạng thái: tiến độ + đồng hồ */}
      <View style={styles.statusBar}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Câu {currentIndex + 1}/{questions.length}
        </Text>
        <View
          style={[
            styles.timerChip,
            {
              backgroundColor: timeRunningLow ? colors.error : colors.primaryDim,
            },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={timeRunningLow ? colors.white : colors.primary}
          />
          <Text
            style={[
              styles.timerText,
              { color: timeRunningLow ? colors.white : colors.primary },
            ]}
          >
            {secondsLeft}s
          </Text>
        </View>
      </View>

      {/* Thanh progress */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Câu hỏi */}
        <Text style={[styles.question, { color: colors.text }]}>{q.question}</Text>

        {/* Lựa chọn */}
        <View style={styles.options}>
          {q.options.map((opt, idx) => {
            let bg = colors.surface;
            let borderColor = colors.border;
            let fg = colors.text;

            if (locked) {
              if (idx === q.correctAnswer) {
                bg = colors.success;
                borderColor = colors.success;
                fg = colors.white;
              } else if (idx === answered) {
                bg = colors.error;
                borderColor = colors.error;
                fg = colors.white;
              } else {
                fg = colors.textMuted;
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                disabled={locked}
                onPress={() => handleSelect(idx)}
                style={[styles.option, { backgroundColor: bg, borderColor }]}
              >
                <View
                  style={[
                    styles.optionLabel,
                    {
                      backgroundColor: locked
                        ? 'rgba(255,255,255,0.25)'
                        : colors.primaryDim,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabelText,
                      { color: locked ? fg : colors.primary },
                    ]}
                  >
                    {OPTION_LABELS[idx] ?? idx + 1}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: fg }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Giải thích sau khi trả lời */}
        {locked && !!q.explanation && (
          <View
            style={[
              styles.explanation,
              { backgroundColor: colors.surfaceElevated, borderLeftColor: colors.primary },
            ]}
          >
            <Text style={[styles.explanationLabel, { color: colors.primary }]}>
              💡 Giải thích
            </Text>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
              {q.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Nút chuyển câu */}
      {locked && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Button
            label={isLast ? 'Xem kết quả' : 'Câu tiếp theo'}
            icon={isLast ? 'trophy-outline' : 'arrow-forward'}
            onPress={handleNext}
            size="lg"
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[2],
  },
  progressText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[3],
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timerText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  progressTrack: {
    height: 4,
    marginHorizontal: SPACING[4],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  content: { padding: SPACING[4], paddingBottom: SPACING[8], gap: SPACING[4] },
  question: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 30,
  },
  options: { gap: SPACING[3] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.4,
  },
  optionLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  optionText: { flex: 1, fontSize: FONT_SIZES.base, lineHeight: 22 },

  explanation: {
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    padding: SPACING[4],
    gap: SPACING[2],
  },
  explanationLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  explanationText: { fontSize: FONT_SIZES.sm, lineHeight: 21 },

  footer: {
    padding: SPACING[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
