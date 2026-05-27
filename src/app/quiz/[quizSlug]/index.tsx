/**
 * Danh sách Quiz
 * Route: /quiz/[quizSlug]
 * Tương đương: QuizzesDetail.java (màn hình xem thông tin + bắt đầu)
 * NOTE: Full game play để sau — đây là màn hình thông tin quiz
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuizItem } from '@/models/QuizzItem';
import { getQuizById } from '@/services/quizService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

const LEVEL_COLOR: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const LEVEL_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

export default function QuizDetailScreen() {
  const { quizSlug } = useLocalSearchParams<{ quizSlug: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!quizSlug) return;
    try {
      setLoading(true);
      setQuiz(await getQuizById(quizSlug));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [quizSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!quiz) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Text style={{ fontSize: 48 }}>❓</Text>
      <Text style={styles.errorText}>Không tìm thấy quiz</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
        <Text style={styles.retryText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  const color = LEVEL_COLOR[quiz.level] ?? COLORS.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Câu Đố</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.accent} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level badge */}
        <View style={[styles.levelBadge, { backgroundColor: color }]}>
          <Text style={styles.levelText}>{LEVEL_LABEL[quiz.level] ?? quiz.level}</Text>
        </View>

        {/* Description */}
        <Text style={styles.quizTitle}>{quiz.description}</Text>

        {/* Info cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{quiz.questionCount}</Text>
            <Text style={styles.infoLabel}>Câu hỏi</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{LEVEL_LABEL[quiz.level] ?? quiz.level}</Text>
            <Text style={styles.infoLabel}>Độ khó</Text>
          </View>
          {quiz.settings?.timeLimit ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{quiz.settings.timeLimit}s</Text>
              <Text style={styles.infoLabel}>Mỗi câu</Text>
            </View>
          ) : null}
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>🎯 Bắt đầu làm bài</Text>
        </TouchableOpacity>

        <Text style={styles.comingSoon}>
          * Tính năng chơi quiz sẽ được cập nhật trong phiên bản tiếp theo
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.lightBg },
  errorText: { color: COLORS.gray600, textAlign: 'center', fontSize: FONT_SIZES.base },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  accent: { height: 4, backgroundColor: COLORS.accent },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  content: { padding: SPACING[5], gap: SPACING[4], paddingBottom: SPACING[8] },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  levelText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },
  quizTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, lineHeight: 28 },
  infoRow: { flexDirection: 'row', gap: SPACING[3] },
  infoCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4], alignItems: 'center', ...SHADOWS.sm,
  },
  infoValue: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  infoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.gray500, marginTop: 4 },
  startBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 18, alignItems: 'center', ...SHADOWS.md,
  },
  startBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.lg },
  comingSoon: { fontSize: FONT_SIZES.xs, color: COLORS.gray400, textAlign: 'center', fontStyle: 'italic' },
});
