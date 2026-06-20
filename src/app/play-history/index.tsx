import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Screen } from '@/components/ui';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { getUserSession } from '@/services/userSession';
import { getUserPlayHistory } from '@/services';
import { DisplaySession } from '@/models/GamificationModels';

function formatSessionDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (compareDate.getTime() === today.getTime()) {
    return 'Hôm nay';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  }
}

export default function PlayHistoryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const session = await getUserSession();
        if (!session?.id) {
          router.replace('/auth');
          return;
        }

        const historyData = await getUserPlayHistory(session.id);
        if (active) {
          setSessions(historyData);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        Alert.alert('Lỗi', 'Không thể tải lịch sử chơi.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <Screen>
      <AppHeader title="Lịch sử chơi" />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryDim }]}>
            <Ionicons name="game-controller-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>Chưa có lịch sử chơi</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Hãy tham gia làm câu đố hoặc ghép niên đại lịch sử để tích lũy XP nhé!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerInfo}>
            <Text style={[styles.historyCountText, { color: colors.textSecondary }]}>
              Bạn đã hoàn thành tổng cộng <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{sessions.length}</Text> lượt chơi
            </Text>
          </View>

          <View style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {sessions.map((session, idx) => (
              <React.Fragment key={session.id}>
                {idx > 0 && (
                  <View style={[styles.historyDivider, { backgroundColor: colors.border }]} />
                )}
                <TouchableOpacity
                  style={styles.historyRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (session.type === 'quiz') {
                      router.push({
                        pathname: '/quiz/[quizSlug]/result',
                        params: {
                          quizSlug: session.quizId ?? 'unknown',
                          score: String(session.score),
                          total: String(session.totalQuestions),
                          time: String(session.timeTaken),
                          title: session.title ?? 'Không rõ',
                          xpGained: String(session.xpGained),
                          answers: JSON.stringify(session.answers || []),
                          isReviewMode: 'true',
                        },
                      });
                    } else if (session.type === 'game') {
                      router.push({
                        pathname: '/timeline/[eraId]/play',
                        params: {
                          eraId: session.gameId ?? 'unknown',
                          isReviewMode: 'true',
                          xpGained: String(session.xpGained),
                          timelineItems: JSON.stringify(session.timelineItems || []),
                        },
                      });
                    }
                  }}
                >
                  {/* Left: Icon container */}
                  <View
                    style={[
                      styles.historyIconBox,
                      {
                        backgroundColor:
                          session.type === 'quiz' ? `${colors.primary}12` : `${colors.info}12`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={session.type === 'quiz' ? 'help-circle' : 'time'}
                      size={20}
                      color={session.type === 'quiz' ? colors.primary : colors.info}
                    />
                  </View>

                  {/* Middle: Title & Metadata */}
                  <View style={styles.historyMiddle}>
                    <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                      {session.title || 'Không rõ'}
                    </Text>
                    <View style={styles.historyMetaRow}>
                      <View style={styles.historyMetaItem}>
                        <Ionicons name="checkmark-circle-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                          {session.correctAnswers}/{session.totalQuestions} đúng
                        </Text>
                      </View>
                      <Text style={[styles.historyMetaDivider, { color: colors.textMuted }]}>•</Text>
                      <View style={styles.historyMetaItem}>
                        <Ionicons name="timer-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                          {session.timeTaken}s
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right: XP Pill & Date */}
                  <View style={styles.historyRight}>
                    <View style={[styles.xpPill, { backgroundColor: colors.primaryDim }]}>
                      <Text style={[styles.xpPillText, { color: colors.primary }]}>
                        +{session.xpGained} XP
                      </Text>
                    </View>
                    <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                      {formatSessionDate(session.playedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING[5], paddingBottom: SPACING[10] },
  headerInfo: {
    marginBottom: SPACING[4],
  },
  historyCountText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[6],
    gap: SPACING[4],
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[2],
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING[4],
  },

  // History styles
  historyCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: 14,
    gap: SPACING[3],
  },
  historyDivider: {
    height: 1,
    marginHorizontal: SPACING[4],
  },
  historyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyMiddle: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  historyMetaText: {
    fontSize: 11,
  },
  historyMetaDivider: {
    fontSize: 10,
  },
  historyRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  xpPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.black,
  },
  historyDate: {
    fontSize: 10,
  },
});
