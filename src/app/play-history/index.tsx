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
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/ui';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
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
    <Screen style={styles.screen}>
      <LinearGradient
        colors={[SuVietColors.son, SuVietColors.son2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f6e9cf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chơi</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={SuVietColors.son} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="game-controller-outline" size={48} color={SuVietColors.son} />
          </View>
          <Text style={styles.emptyText}>Chưa có lịch sử chơi</Text>
          <Text style={styles.emptySubtext}>
            Hãy tham gia làm câu đố hoặc ghép niên đại lịch sử để tích lũy XP nhé!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerInfo}>
            <Text style={styles.historyCountText}>
              Bạn đã hoàn thành tổng cộng <Text style={styles.historyCountHighlight}>{sessions.length}</Text> lượt chơi
            </Text>
          </View>

          <View style={[styles.historyCard, HTML_SHADOWS.card]}>
            {sessions.map((session, idx) => (
              <React.Fragment key={session.id}>
                {idx > 0 && (
                  <View style={styles.historyDivider} />
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
                  <View style={[styles.historyIconBox, session.type === 'quiz' ? styles.iconQuiz : styles.iconGame]}>
                    <Ionicons
                      name={session.type === 'quiz' ? 'help-circle' : 'time'}
                      size={20}
                      color={session.type === 'quiz' ? SuVietColors.do : SuVietColors.dong}
                    />
                  </View>

                  <View style={styles.historyMiddle}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {session.title || 'Không rõ'}
                    </Text>
                    <View style={styles.historyMetaRow}>
                      <View style={styles.historyMetaItem}>
                        <Ionicons name="checkmark-circle" size={12} color={SuVietColors.muc2} />
                        <Text style={styles.historyMetaText}>
                          {session.correctAnswers}/{session.totalQuestions} đúng
                        </Text>
                      </View>
                      <Text style={styles.historyMetaDivider}>•</Text>
                      <View style={styles.historyMetaItem}>
                        <Ionicons name="timer" size={12} color={SuVietColors.muc2} />
                        <Text style={styles.historyMetaText}>{session.timeTaken}s</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.historyRight}>
                    <View style={styles.xpPill}>
                      <Text style={styles.xpPillText}>+{session.xpGained} XP</Text>
                    </View>
                    <Text style={styles.historyDate}>{formatSessionDate(session.playedAt)}</Text>
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
  screen: { backgroundColor: SuVietColors.giay },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, zIndex: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.serifBold, fontSize: 18, color: '#f6e9cf' },

  content: { padding: 22, paddingBottom: 60, paddingTop: 30 },
  headerInfo: { marginBottom: 16 },
  historyCountText: { fontFamily: Fonts.regular, fontSize: 14, color: SuVietColors.muc2, lineHeight: 20 },
  historyCountHighlight: { fontFamily: Fonts.bold, color: SuVietColors.son },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(101,19,16,0.05)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyText: { fontFamily: Fonts.bold, fontSize: 18, color: SuVietColors.muc, marginBottom: 8 },
  emptySubtext: { fontFamily: Fonts.regular, fontSize: 14, color: SuVietColors.muc2, textAlign: 'center', lineHeight: 22 },

  // History styles
  historyCard: {
    backgroundColor: SuVietColors.card,
    borderRadius: 22, borderWidth: 1, borderColor: SuVietColors.line,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },
  historyDivider: {
    height: 1, backgroundColor: SuVietColors.line, marginHorizontal: 20,
  },
  historyIconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  iconQuiz: { backgroundColor: 'rgba(179,30,36,0.08)' },
  iconGame: { backgroundColor: 'rgba(168,130,58,0.1)' },
  
  historyMiddle: { flex: 1, gap: 6, justifyContent: 'center' },
  historyTitle: { fontFamily: Fonts.bold, fontSize: 15, color: SuVietColors.muc },
  historyMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyMetaText: { fontFamily: Fonts.regular, fontSize: 12, color: SuVietColors.muc2 },
  historyMetaDivider: { fontFamily: Fonts.regular, fontSize: 12, color: SuVietColors.muc2 },
  
  historyRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 6, flexShrink: 0 },
  xpPill: {
    backgroundColor: '#f7e6e4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  xpPillText: { fontFamily: Fonts.bold, fontSize: 11, color: SuVietColors.son },
  historyDate: { fontFamily: Fonts.regular, fontSize: 11, color: SuVietColors.muc2 },
});
