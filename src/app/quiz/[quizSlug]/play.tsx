/**
 * Màn QUIZ PLAY — Giống thiết kế Sử Việt.dc.html (QUIZ PLAY section)
 * Route: /quiz/[quizSlug]/play
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getQuizById, getQuestionsByQuiz } from '@/services/quizService';
import { GameQuestion } from '@/models/GameQuestion';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
import { Screen, LoadingState, ErrorState } from '@/components/ui';

const DEFAULT_TIME_LIMIT = 20;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayScreen() {
  const { quizSlug } = useLocalSearchParams<{ quizSlug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [title, setTitle] = useState('Câu Đố');
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME_LIMIT);

  const scoreRef = useRef(0);
  const totalTimeRef = useRef(0);

  const load = useCallback(async () => {
    if (!quizSlug) return;
    try {
      setLoading(true);
      const [quiz, qs] = await Promise.all([getQuizById(quizSlug), getQuestionsByQuiz(quizSlug)]);
      if (!qs.length) { setError('Quiz này chưa có câu hỏi.'); return; }
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

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(() => { totalTimeRef.current += 1; }, 1000);
    return () => clearInterval(id);
  }, [loading, error]);

  useEffect(() => {
    if (loading || error || locked) return;
    if (secondsLeft <= 0) { setLocked(true); return; }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, locked, loading, error]);

  const handleSelect = (optionIndex: number) => {
    if (locked) return;
    const q = questions[currentIndex];
    setAnswers((prev) => { const next = [...prev]; next[currentIndex] = optionIndex; return next; });
    if (optionIndex === q.correctAnswer) scoreRef.current += 1;
    setLocked(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      router.replace({
        pathname: '/quiz/[quizSlug]/result',
        params: {
          quizSlug: quizSlug!, score: String(scoreRef.current),
          total: String(questions.length), time: String(totalTimeRef.current),
          title, data: encodeURIComponent(JSON.stringify({ questions, answers })),
        },
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setLocked(false);
    setSecondsLeft(timeLimit);
  };

  if (loading) return <LoadingState message="Đang tải câu hỏi…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const q = questions[currentIndex];
  const answered = answers[currentIndex];
  const isLast = currentIndex + 1 >= questions.length;
  const timeRunningLow = secondsLeft <= 5 && !locked;
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Screen style={styles.screen}>
      {/* Header gradient */}
      <LinearGradient
        colors={[SuVietColors.son, SuVietColors.son2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerDecoration} />
        
        <View style={styles.headerTopBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={26} color="#f6e9cf" />
          </TouchableOpacity>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={styles.headerTitle} numberOfLines={1}>Thử Thách</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        {/* Progress bar gradient */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[SuVietColors.dong, SuVietColors.son]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` as any }]}
          />
        </View>

        <Text style={styles.progressCount}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      {/* Timer tròn — đổi màu đỏ khi ≤5s */}
      <View style={styles.timerRow}>
        <View style={[
          styles.timerCircle,
          timeRunningLow ? styles.timerCircleUrgent : styles.timerCircleNormal
        ]}>
          <View style={[styles.timerInner, timeRunningLow ? styles.timerInnerUrgent : styles.timerInnerNormal]}>
            <Text style={[styles.timerValue, timeRunningLow ? { color: SuVietColors.wrong } : { color: SuVietColors.son }]}>
              {secondsLeft}
            </Text>
            <Text style={[styles.timerSuffix, timeRunningLow ? { color: SuVietColors.wrong } : { color: SuVietColors.son }]}>s</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Câu hỏi card */}
        <View style={[styles.questionCard, HTML_SHADOWS.cardLarge]}>
          <View style={styles.questionInner}>
            <Text style={styles.questionLabel}>Câu hỏi {currentIndex + 1}</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>
        </View>

        {/* 4 đáp án */}
        <View style={styles.options}>
          {q.options.map((opt, idx) => {
            let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (locked) {
              if (idx === q.correctAnswer) state = 'correct';
              else if (idx === answered) state = 'wrong';
              else state = 'muted';
            }
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                disabled={locked}
                onPress={() => handleSelect(idx)}
                style={[styles.optionBtn, optionStyle(state)]}
              >
                {/* Badge chữ cái A/B/C/D */}
                <View style={[styles.optionBadge, badgeStyle(state)]}>
                  <Text style={[styles.optionBadgeText, badgeTextStyle(state)]}>
                    {OPTION_LABELS[idx]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: optionTextColor(state) }]}>{opt}</Text>
                {state !== 'idle' && (
                  <Text style={styles.optionMark}>
                    {state === 'correct' ? '✓' : state === 'wrong' ? '✕' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Giải thích — nền #f4ead2, border-left vàng đồng */}
        {locked && !!q.explanation && (
          <View style={styles.explanation}>
            <Text style={styles.explanationVerdict}>
              {answered === q.correctAnswer ? '✓ Chính xác!' : answered === -1 ? '⏱ Hết giờ!' : '✕ Chưa đúng!'}
            </Text>
            <Text style={styles.explanationText}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Nút câu tiếp theo / xem kết quả */}
      {locked && (
        <LinearGradient
          colors={['transparent', SuVietColors.giay]}
          style={styles.footer}
        >
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[SuVietColors.son, SuVietColors.son2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.nextBtn, HTML_SHADOWS.button]}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? 'Xem kết quả' : 'Câu tiếp theo'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </Screen>
  );
}

// Style helpers
function optionStyle(state: 'idle' | 'correct' | 'wrong' | 'muted') {
  const base = {
    shadowColor: 'rgba(101,19,16,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  };
  if (state === 'correct') return { ...base, backgroundColor: SuVietColors.correctBg, borderColor: SuVietColors.correct, borderWidth: 2 };
  if (state === 'wrong') return { ...base, backgroundColor: SuVietColors.wrongBg, borderColor: SuVietColors.wrong, borderWidth: 2 };
  if (state === 'muted') return { ...base, backgroundColor: SuVietColors.card, borderColor: SuVietColors.line, borderWidth: 1.5, opacity: 0.5 };
  return { ...base, backgroundColor: SuVietColors.card, borderColor: SuVietColors.line, borderWidth: 1.5 };
}
function badgeStyle(state: 'idle' | 'correct' | 'wrong' | 'muted') {
  if (state === 'correct') return { backgroundColor: SuVietColors.correct };
  if (state === 'wrong') return { backgroundColor: SuVietColors.wrong };
  return { backgroundColor: '#efe2c9', borderWidth: 1, borderColor: SuVietColors.dong };
}
function badgeTextStyle(state: 'idle' | 'correct' | 'wrong' | 'muted') {
  return {
    color: (state === 'correct' || state === 'wrong') ? '#fff' : SuVietColors.son,
    fontFamily: Fonts.serifBold,
  };
}
function optionTextColor(state: 'idle' | 'correct' | 'wrong' | 'muted') {
  if (state === 'correct') return '#1f4d2e';
  if (state === 'wrong') return '#7a1f1f';
  if (state === 'muted') return SuVietColors.muc2;
  return SuVietColors.muc;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },

  // Header
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative', overflow: 'hidden',
    shadowColor: SuVietColors.son,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
    marginBottom: 16,
  },
  headerDecoration: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    opacity: 0.15,
    backgroundColor: SuVietColors.sao,
  },
  headerTopBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 10,
  },
  iconBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontFamily: Fonts.serifExtraBold,
    fontSize: 22, color: '#f6e9cf',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Progress Container
  progressContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 22, marginBottom: 12,
  },
  progressTrack: {
    flex: 1, height: 10, backgroundColor: '#e6d6b8',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(101,19,16,0.1)',
  },
  progressFill: { height: '100%', borderRadius: 20 },
  progressCount: {
    fontFamily: Fonts.bold, fontSize: 13, color: SuVietColors.muc2,
  },

  // Timer
  timerRow: { alignItems: 'center', marginBottom: 14 },
  timerCircle: {
    width: 52, height: 52, borderRadius: 26,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  timerCircleNormal: {
    backgroundColor: SuVietColors.card,
    borderWidth: 1.5, borderColor: SuVietColors.dong,
    padding: 2,
  },
  timerCircleUrgent: {
    backgroundColor: SuVietColors.wrongBg,
    borderWidth: 1.5, borderColor: SuVietColors.wrong,
    padding: 2,
  },
  timerInner: {
    flex: 1, width: '100%', height: '100%', borderRadius: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  timerInnerNormal: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(139,28,23,0.3)',
  },
  timerInnerUrgent: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(168,50,50,0.5)',
  },
  timerValue: { fontFamily: Fonts.serifExtraBold, fontSize: 20 },
  timerSuffix: { fontFamily: Fonts.regular, fontSize: 12, marginLeft: 1 },

  // Content
  content: { paddingHorizontal: 22, paddingBottom: 100, gap: 11 },

  // Question
  questionCard: {
    backgroundColor: SuVietColors.card, borderRadius: 18,
    borderWidth: 1.5, borderColor: SuVietColors.line, padding: 6, marginBottom: 7,
  },
  questionInner: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(168,130,58,0.4)',
    borderRadius: 14, padding: 16,
  },
  questionLabel: {
    fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.5,
    textTransform: 'uppercase', color: SuVietColors.dong, marginBottom: 8,
  },
  questionText: {
    fontFamily: Fonts.serifBold, fontSize: 20,
    color: SuVietColors.muc, lineHeight: 28,
  },

  // Options
  options: { gap: 11 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 15, paddingHorizontal: 16, borderRadius: 14,
  },
  optionBadge: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optionBadgeText: { fontFamily: Fonts.bold, fontSize: 13 },
  optionText: { flex: 1, fontFamily: Fonts.semibold, fontSize: 14.5, lineHeight: 21 },
  optionMark: { fontFamily: Fonts.bold, fontSize: 16 },

  // Explanation
  explanation: {
    marginTop: 5, backgroundColor: SuVietColors.rulesBg,
    borderLeftWidth: 4, borderLeftColor: SuVietColors.dong,
    borderRadius: 0, borderTopRightRadius: 14, borderBottomRightRadius: 14,
    padding: 14,
  },
  explanationVerdict: {
    fontFamily: Fonts.bold, fontSize: 13,
    color: SuVietColors.son, marginBottom: 5,
  },
  explanationText: { fontFamily: Fonts.regular, fontSize: 13, color: SuVietColors.muc2, lineHeight: 20 },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 24 },
  nextBtn: { borderRadius: 15, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { fontFamily: Fonts.bold, fontSize: 16, color: '#f6e9cf' },
});
