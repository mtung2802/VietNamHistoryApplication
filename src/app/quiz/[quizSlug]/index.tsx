/**
 * Màn QUIZ INTRO — Giống thiết kế Sử Việt.dc.html (QUIZ INTRO section)
 * Route: /quiz/[quizSlug]
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QuizItem } from '@/models/QuizzItem';
import { getQuizById } from '@/services/quizService';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
import { Screen, LoadingState, ErrorState, useTopInset } from '@/components/ui';

const LEVEL_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

export default function QuizDetailScreen() {
  const { quizSlug } = useLocalSearchParams<{ quizSlug: string }>();
  const router = useRouter();
  const topInset = useTopInset();
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!quizSlug) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getQuizById(quizSlug);
      if (!data) { setError('Không tìm thấy câu đố.'); return; }
      setQuiz(data);
    } catch {
      setError('Không thể tải câu đố.');
    } finally {
      setLoading(false);
    }
  }, [quizSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Screen><LoadingState /></Screen>;
  if (error || !quiz) return <Screen><ErrorState message={error ?? 'Không tìm thấy câu đố.'} onRetry={load} /></Screen>;

  const timeLimit = quiz.settings?.timeLimit ?? 20;

  return (
    <Screen style={styles.screen}>
      {/* Header gradient đỏ với nút back — giống HTML */}
      <LinearGradient
        colors={[SuVietColors.son, SuVietColors.son2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#f6e9cf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trắc nghiệm</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card nổi — giống HTML */}
        <View style={[styles.card, HTML_SHADOWS.cardLarge]}>
          {/* Icon ngôi sao vàng — giống HTML clip-path star */}
          <View style={styles.starIconWrap}>
            <LinearGradient
              colors={[SuVietColors.son, SuVietColors.son2]}
              style={styles.starIconBg}
            >
              <Ionicons name="star" size={28} color={SuVietColors.sao} />
            </LinearGradient>
          </View>

          <Text style={styles.quizTitle}>{quiz.description || quiz.id}</Text>
          <Text style={styles.quizSub}>{LEVEL_LABEL[quiz.level] ?? quiz.level}</Text>

          {/* 3 Stat boxes — giống HTML */}
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{quiz.questionCount}</Text>
              <Text style={styles.statLabel}>câu hỏi</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{LEVEL_LABEL[quiz.level] ?? quiz.level}</Text>
              <Text style={styles.statLabel}>
                {quiz.level === 'easy' || quiz.level === 'medium' || quiz.level === 'hard' ? 'độ khó' : 'phân loại'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{timeLimit}s</Text>
              <Text style={styles.statLabel}>mỗi câu</Text>
            </View>
          </View>

          {/* Luật chơi box — viền dashed vàng đồng */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesText}>
              <Text style={styles.rulesBold}>Luật chơi. </Text>
              Mỗi câu có 4 đáp án và giới hạn thời gian. Trả lời xong sẽ có lời giải lịch sử. Hết giờ tính là sai.
            </Text>
          </View>

          {/* Nút Bắt đầu chơi — gradient đỏ */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/quiz/[quizSlug]/play', params: { quizSlug: quizSlug! } })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[SuVietColors.son, SuVietColors.son2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.startBtn, HTML_SHADOWS.button]}
            >
              <Text style={styles.startBtnText}>Bắt đầu chơi</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[12] + SPACING[3],
  },
  headerTitle: {
    fontFamily: Fonts.serifExtraBold,
    fontSize: 20,
    color: '#f6e9cf',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, borderColor: 'rgba(240,192,76,0.35)',
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Centered card layout
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[8],
  },
  card: {
    backgroundColor: SuVietColors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: SuVietColors.line,
    padding: 22,
  },

  // Star icon
  starIconWrap: { alignItems: 'center', marginBottom: SPACING[4] },
  starIconBg: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  // Title
  quizTitle: {
    fontFamily: Fonts.serifExtraBold,
    fontSize: 24, color: SuVietColors.muc,
    textAlign: 'center', lineHeight: 30, marginBottom: 4,
  },
  quizSub: {
    fontFamily: Fonts.regular,
    fontSize: 13.5, color: SuVietColors.muc2,
    textAlign: 'center', marginBottom: 20,
  },

  // Stat row
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statBox: {
    flex: 1, backgroundColor: SuVietColors.rulesBg,
    borderRadius: 14, borderWidth: 1, borderColor: SuVietColors.line,
    paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.serifExtraBold,
    fontSize: 22, color: SuVietColors.son,
  },
  statLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 11, color: SuVietColors.muc2, marginTop: 2,
  },

  // Rules box
  rulesBox: {
    backgroundColor: SuVietColors.rulesBg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: SuVietColors.dong,
    borderRadius: 14, padding: 13, marginBottom: 22,
  },
  rulesText: { fontFamily: Fonts.regular, fontSize: 13, color: SuVietColors.muc2, lineHeight: 20 },
  rulesBold: { fontFamily: Fonts.bold, color: SuVietColors.muc },

  // Start button
  startBtn: {
    borderRadius: 15, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  startBtnText: {
    fontFamily: Fonts.bold, fontSize: 16, color: '#f6e9cf',
  },
});
