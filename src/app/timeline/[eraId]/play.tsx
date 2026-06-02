/**
 * Màn CHƠI Timeline Puzzle
 * Route: /timeline/[eraId]/play
 * Port (đơn giản hoá cho mobile): TimeLineActivity.java
 *
 * - Chạm-để-đặt: chạm thẻ sự kiện đúng thứ tự thời gian tiếp theo (order)
 * - Đúng → đặt vào slot, xoá khỏi bài; Sai → rung thẻ + mất 1 mạng
 * - 3 mạng (HP bar gold). Hết mạng = thua. Xếp đúng hết = thắng.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEraById } from '@/services/timelinePuzzleService';
import { Era, TimelineEvent } from '@/models/Era';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, AppHeader, Button, Card, LoadingState, ErrorState } from '@/components/ui';

const MAX_LIVES = 3;

type Status = 'playing' | 'won' | 'lost';

// Trộn mảng (Fisher–Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TimelinePlayScreen() {
  const { eraId } = useLocalSearchParams<{ eraId: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const [era, setEra] = useState<Era | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái ván
  const [sortedEvents, setSortedEvents] = useState<TimelineEvent[]>([]);
  const [hand, setHand] = useState<TimelineEvent[]>([]);
  const [placed, setPlaced] = useState<(TimelineEvent | null)[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [status, setStatus] = useState<Status>('playing');

  // Animation rung thẻ sai
  const shakeX = useRef(new Animated.Value(0)).current;
  const [shakeName, setShakeName] = useState<string | null>(null);

  const setupGame = useCallback((events: TimelineEvent[]) => {
    const sorted = [...events].sort((a, b) => a.order - b.order);
    setSortedEvents(sorted);
    setHand(shuffle(events));
    setPlaced(new Array(sorted.length).fill(null));
    setCurrentStep(0);
    setLives(MAX_LIVES);
    setStatus('playing');
  }, []);

  const load = useCallback(async () => {
    if (!eraId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getEraById(eraId);
      if (!data || !data.events?.length) {
        setError('Kỷ nguyên này chưa có sự kiện để chơi.');
        return;
      }
      setEra(data);
      setupGame(data.events);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [eraId, setupGame]);

  useEffect(() => {
    load();
  }, [load]);

  const triggerShake = (name: string) => {
    setShakeName(name);
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setShakeName(null));
  };

  const handleTapCard = (event: TimelineEvent) => {
    if (status !== 'playing') return;

    if (event.order === currentStep + 1) {
      // ĐÚNG → đặt vào slot hiện tại
      setPlaced((prev) => {
        const next = [...prev];
        next[currentStep] = event;
        return next;
      });
      setHand((prev) => prev.filter((e) => e !== event));
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep >= sortedEvents.length) {
        setStatus('won');
      }
    } else {
      // SAI → rung + mất mạng
      triggerShake(event.name);
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setStatus('lost');
      }
    }
  };

  if (loading) return <LoadingState message="Đang tải trò chơi…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Screen>
      <AppHeader title={era?.title ?? 'Ghép Niên Đại'} showThemeToggle={false} />

      {/* Thanh trạng thái: HP + tiến độ */}
      <View style={styles.statusBar}>
        <View style={styles.hpRow}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < lives ? 'heart' : 'heart-outline'}
              size={22}
              color={i < lives ? colors.primary : colors.textMuted}
              style={{ marginRight: 4 }}
            />
          ))}
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Đã xếp {currentStep}/{sortedEvents.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Chạm thẻ sự kiện theo đúng thứ tự thời gian (từ sớm đến muộn).
        </Text>

        {/* Dòng thời gian (slots) */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>
          DÒNG THỜI GIAN
        </Text>
        <View style={styles.slots}>
          {sortedEvents.map((_, idx) => {
            const ev = placed[idx];
            const isNext = idx === currentStep && status === 'playing';
            return (
              <View
                key={idx}
                style={[
                  styles.slot,
                  {
                    backgroundColor: ev ? colors.surface : 'transparent',
                    borderColor: isNext ? colors.primary : colors.border,
                    borderStyle: ev ? 'solid' : 'dashed',
                    borderWidth: isNext ? 2 : 1.4,
                  },
                ]}
              >
                <View
                  style={[
                    styles.slotIndex,
                    { backgroundColor: ev ? colors.primary : colors.surfaceElevated },
                  ]}
                >
                  <Text
                    style={[
                      styles.slotIndexText,
                      { color: ev ? colors.onPrimary : colors.textMuted },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                {ev ? (
                  <View style={styles.slotBody}>
                    <Text style={[styles.slotYear, { color: colors.primary }]}>
                      {ev.year}
                    </Text>
                    <Text style={[styles.slotName, { color: colors.text }]} numberOfLines={2}>
                      {ev.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.slotEmpty, { color: colors.textMuted }]}>
                    {isNext ? 'Sự kiện tiếp theo…' : 'Chưa xếp'}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Bài (thẻ chưa xếp) */}
        <Text style={[styles.sectionLabel, { color: colors.primary, marginTop: SPACING[4] }]}>
          THẺ SỰ KIỆN ({hand.length})
        </Text>
        <View style={styles.hand}>
          {hand.map((ev) => {
            const isShaking = shakeName === ev.name;
            return (
              <Animated.View
                key={ev.name}
                style={isShaking ? { transform: [{ translateX: shakeX }] } : undefined}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleTapCard(ev)}
                  style={[
                    styles.handCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
                  <Text style={[styles.handName, { color: colors.text }]} numberOfLines={3}>
                    {ev.name}
                  </Text>
                  {!!ev.desc && (
                    <Text style={[styles.handDesc, { color: colors.textMuted }]} numberOfLines={2}>
                      {ev.desc}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal kết thúc */}
      {status !== 'playing' && (
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Card highlighted style={styles.modal}>
            <Ionicons
              name={status === 'won' ? 'trophy' : 'skull-outline'}
              size={56}
              color={status === 'won' ? colors.primary : colors.error}
            />
            <Text
              style={[
                styles.modalTitle,
                { color: status === 'won' ? colors.primary : colors.error },
              ]}
            >
              {status === 'won' ? 'Hoàn thành!' : 'Thua mất rồi!'}
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {status === 'won'
                ? 'Bạn đã xếp đúng toàn bộ dòng thời gian.'
                : 'Dưới đây là thứ tự đúng:'}
            </Text>

            <ScrollView style={styles.modalTimeline} showsVerticalScrollIndicator={false}>
              {sortedEvents.map((ev, i) => (
                <View key={i} style={styles.modalRow}>
                  <Text style={[styles.modalYear, { color: colors.primary }]}>{ev.year}</Text>
                  <Text style={[styles.modalName, { color: colors.text }]}>{ev.name}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                label="Chơi lại"
                icon="refresh"
                variant="outline"
                onPress={() => era?.events && setupGame(era.events)}
              />
              <Button
                label="Về trang trò chơi"
                icon="grid-outline"
                onPress={() => router.replace('/(tabs)/game')}
              />
            </View>
          </Card>
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
    paddingVertical: SPACING[3],
  },
  hpRow: { flexDirection: 'row', alignItems: 'center' },
  progressText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold },

  content: { padding: SPACING[4], paddingBottom: SPACING[8], gap: SPACING[2] },
  hint: { fontSize: FONT_SIZES.sm, fontStyle: 'italic', marginBottom: SPACING[2] },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.6,
    marginBottom: SPACING[2],
  },

  slots: { gap: SPACING[2] },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    minHeight: 56,
  },
  slotIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIndexText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  slotBody: { flex: 1 },
  slotYear: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  slotName: { fontSize: FONT_SIZES.sm, lineHeight: 18 },
  slotEmpty: { fontSize: FONT_SIZES.sm, fontStyle: 'italic' },

  hand: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3] },
  handCard: {
    width: 150,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.4,
    padding: SPACING[3],
    gap: 6,
  },
  handName: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 18 },
  handDesc: { fontSize: FONT_SIZES.xs, lineHeight: 16 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[5],
  },
  modal: { width: '100%', maxWidth: 420, alignItems: 'center', gap: SPACING[2], paddingVertical: SPACING[6] },
  modalTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold },
  modalSub: { fontSize: FONT_SIZES.sm, textAlign: 'center' },
  modalTimeline: { maxHeight: 220, alignSelf: 'stretch', marginVertical: SPACING[3] },
  modalRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  modalYear: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, width: 52 },
  modalName: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  modalActions: { alignSelf: 'stretch', gap: SPACING[3] },
});
