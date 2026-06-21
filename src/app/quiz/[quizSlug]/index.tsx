/**
 * Màn thông tin Quiz (trước khi chơi)
 * Route: /quiz/[quizSlug]
 * Tương đương: QuizzesDetail.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuizItem } from '@/models/QuizzItem';
import { getQuizById } from '@/services/quizService';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  Screen,
  AppHeader,
  Card,
  Badge,
  Button,
  LoadingState,
  ErrorState,
} from '@/components/ui';

const LEVEL_COLOR: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const LEVEL_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

export default function QuizDetailScreen() {
  const { quizSlug } = useLocalSearchParams<{ quizSlug: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!quizSlug) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizById(quizSlug);
      if (!data) {
        setError('Không tìm thấy câu đố.');
        return;
      }
      setQuiz(data);
    } catch {
      setError('Không thể tải câu đố.');
    } finally {
      setLoading(false);
    }
  }, [quizSlug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Câu Đố" showThemeToggle={false} />
        <LoadingState />
      </Screen>
    );
  }

  if (error || !quiz) {
    return (
      <Screen>
        <AppHeader title="Câu Đố" showThemeToggle={false} />
        <ErrorState message={error ?? 'Không tìm thấy câu đố.'} onRetry={load} />
      </Screen>
    );
  }

  const levelColor = LEVEL_COLOR[quiz.level] ?? colors.primary;

  const InfoCell = ({ value, label }: { value: string; label: string }) => (
    <Card style={styles.infoCard}>
      <Text style={[styles.infoValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
    </Card>
  );

  return (
    <Screen>
      <AppHeader title="Câu Đố Lịch Sử" showThemeToggle={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryDim }]}>
            <Ionicons name="help-circle" size={48} color={colors.primary} />
          </View>
          <Badge
            label={LEVEL_LABEL[quiz.level] ?? quiz.level}
            color={levelColor}
            style={{ marginTop: SPACING[3] }}
          />
        </View>

        <Text style={[styles.quizTitle, { color: colors.text }]}>{quiz.description}</Text>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <InfoCell value={String(quiz.questionCount)} label="Câu hỏi" />
          <InfoCell value={LEVEL_LABEL[quiz.level] ?? quiz.level} label="Phân loại" />
          {quiz.settings?.timeLimit ? (
            <InfoCell value={`${quiz.settings.timeLimit}s`} label="Mỗi câu" />
          ) : null}
        </View>

        <Button
          label="Bắt đầu làm bài"
          icon="play-circle"
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/quiz/[quizSlug]/play',
              params: { quizSlug: quizSlug! },
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING[5], gap: SPACING[4], paddingBottom: SPACING[8] },
  hero: { alignItems: 'center', paddingTop: SPACING[3] },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 28,
    textAlign: 'center',
  },
  infoRow: { flexDirection: 'row', gap: SPACING[3] },
  infoCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING[4] },
  infoValue: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  infoLabel: { fontSize: FONT_SIZES.xs, marginTop: 4 },
});
