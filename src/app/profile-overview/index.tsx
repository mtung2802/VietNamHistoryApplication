import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  clearUserSession,
  getUserSession,
  saveUserSession,
  SessionUser,
} from '@/services/userSession';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { BADGE_DEFINITIONS } from '@/services/badgeService';
import { getRankTier } from '@/services/rankService';
import { DisplaySession } from '@/models/GamificationModels';
import { AppHeader, Screen } from '@/components/ui';
import { BadgeModal } from '@/components/ui/BadgeModal';
import { RankModal } from '@/components/ui/RankModal';

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
  onPress: () => void;
}

interface ProfileOverviewProps {
  embeddedInTab?: boolean;
  onLoggedOut?: () => void;
}

export function ProfileOverviewContent({
  embeddedInTab = false,
  onLoggedOut,
}: ProfileOverviewProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { profile, loading: gamificationLoading } = useGamification();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRankModal, setShowRankModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DEFINITIONS[0] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadUser = async () => {
        try {
          setLoading(true);
          const session = await getUserSession();
          if (!session) {
            if (embeddedInTab) {
              onLoggedOut?.();
            } else {
              router.replace('/auth');
            }
            return;
          }

          if (active) setUser(session);
          const snapshot = await getDoc(doc(db, 'users', session.id));
          const remoteData = snapshot.exists() ? snapshot.data() : {};
          const resolvedAvatar =
            typeof remoteData.avatar === 'string' && remoteData.avatar
              ? remoteData.avatar
              : typeof remoteData.photo === 'string' && remoteData.photo
                ? remoteData.photo
                : session.avatar || session.photo;
          const mergedUser: SessionUser = {
            ...session,
            ...remoteData,
            id: session.id,
            name:
              typeof remoteData.name === 'string'
                ? remoteData.name
                : typeof remoteData.displayName === 'string'
                  ? remoteData.displayName
                  : session.name,
            avatar: resolvedAvatar,
            photo: resolvedAvatar ? undefined : session.photo,
          };

          await saveUserSession(mergedUser);
          if (active) setUser(mergedUser);
        } catch (error) {
          console.error('Unable to load profile:', error);
          if (active) Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
        } finally {
          if (active) setLoading(false);
        }
      };

      loadUser();
      return () => {
        active = false;
      };
    }, [router]),
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await clearUserSession();
          if (embeddedInTab) {
            onLoggedOut?.();
          } else {
            router.replace('/auth');
          }
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, danger, onPress }: MenuItemProps) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: danger ? `${colors.error}18` : colors.primaryDim },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const avatarUri = user?.avatar || user?.photo;
  const displayName = user?.name || user?.displayName || user?.username || 'Người dùng';

  // Rank info
  const rankTier = profile ? getRankTier(profile.currentRank) : null;

  return (
    <Screen>
      <AppHeader title="Hồ sơ" showBack={false} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ═══ Avatar + Name + Rank ═══ */}
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatarFrame,
                { borderColor: rankTier?.color ?? colors.primary, backgroundColor: colors.surface },
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={52} color={colors.textMuted} />
              )}
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>

            {/* Rank badge */}
            {rankTier && (
              <View style={[styles.rankBadge, { backgroundColor: `${rankTier.color}22` }]}>
                <Ionicons
                  name={rankTier.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={rankTier.color}
                />
                <Text style={[styles.rankLabel, { color: rankTier.color }]}>
                  {profile!.currentRank}
                </Text>
              </View>
            )}
          </View>

          {/* ═══ XP Progress Bar ═══ */}
          {profile && (
            <TouchableOpacity
              style={[styles.xpSection, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowRankModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.xpHeader}>
                <Text style={[styles.xpLabel, { color: colors.text }]}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} /> {profile.totalXP} XP
                </Text>
                {profile.nextRank ? (
                  <Text style={[styles.xpToNext, { color: colors.textSecondary }]}>
                    {profile.xpToNextRank} XP → {profile.nextRank}
                  </Text>
                ) : (
                  <Text style={[styles.xpToNext, { color: colors.primary }]}>
                    MAX RANK! 🏆
                  </Text>
                )}
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: rankTier?.color ?? colors.primary,
                      width: `${Math.max(2, profile.xpProgress * 100)}%`,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* ═══ Stats Row ═══ */}
          {profile && (
            <View style={styles.statsRow}>
              <StatCard
                icon="game-controller-outline"
                value={String(profile.totalSessions)}
                label="Lượt chơi"
                color={colors}
              />
              <StatCard
                icon="trophy-outline"
                value={String(profile.highestScore * 10)}
                label="Điểm cao nhất"
                color={colors}
              />
              <StatCard
                icon="flame-outline"
                value={String(profile.currentStreak)}
                label="Chuỗi"
                color={colors}
              />
              <StatCard
                icon="trending-up-outline"
                value={String(profile.longestStreak)}
                label="Chuỗi max"
                color={colors}
              />
            </View>
          )}

          {/* ═══ Badges Grid ═══ */}
          <View style={styles.sectionHeader}>
            <Ionicons name="medal-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Huy hiệu</Text>
          </View>

          <View style={styles.badgesGrid}>
            {BADGE_DEFINITIONS.map((def) => {
              const earned = profile?.badges.find((b) => b.badgeId === def.id);
              const isEarned = !!earned;
              return (
                <TouchableOpacity
                  key={def.id}
                  style={[
                    styles.badgeCell,
                    {
                      backgroundColor: isEarned ? colors.primaryDim : colors.surface,
                      borderColor: isEarned ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBadge(def)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      {
                        backgroundColor: isEarned
                          ? `${colors.primary}30`
                          : `${colors.textMuted}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={def.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={isEarned ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.badgeCellName,
                      { color: isEarned ? colors.text : colors.textMuted },
                    ]}
                    numberOfLines={2}
                  >
                    {def.name}
                  </Text>
                  {isEarned && earned?.earnedAt && (
                    <Text style={[styles.badgeDate, { color: colors.textSecondary }]}>
                      {earned.earnedAt.toDate?.()
                        ? earned.earnedAt.toDate().toLocaleDateString('vi-VN')
                        : ''}
                    </Text>
                  )}
                  {!isEarned && (
                    <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ═══ Menu ═══ */}
          <View style={styles.menuSection}>
            <MenuItem
              icon="time-outline"
              label="Lịch sử chơi"
              onPress={() => router.push('/play-history' as any)}
            />
            <MenuItem
              icon="chatbubbles-outline"
              label="Diễn đàn"
              onPress={() => router.push('/forum' as any)}
            />
            <MenuItem
              icon="create-outline"
              label="Chỉnh sửa hồ sơ"
              onPress={() => router.push('/edit-profile')}
            />
            <MenuItem
              icon="log-out-outline"
              label="Đăng xuất"
              danger
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <RankModal 
        visible={showRankModal} 
        currentRankName={profile?.currentRank ?? null} 
        onClose={() => setShowRankModal(false)} 
      />
      
      <BadgeModal 
        visible={!!selectedBadge} 
        badge={selectedBadge ? {
          ...selectedBadge,
          isEarned: !!(profile?.badges.find(b => b.badgeId === selectedBadge.id)),
          earnedAt: profile?.badges.find(b => b.badgeId === selectedBadge.id)?.earnedAt?.toDate?.()
        } : null} 
        onClose={() => setSelectedBadge(null)} 
      />
    </Screen>
  );
}

/** Stat card mini component */
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: color.surface, borderColor: color.border }]}>
      <Ionicons name={icon} size={18} color={color.primary} />
      <Text style={[styles.statValue, { color: color.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: color.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function ProfileOverviewScreen() {
  return <ProfileOverviewContent />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING[5], paddingBottom: SPACING[10] },

  // Profile section
  profileSection: { alignItems: 'center' },
  avatarFrame: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  avatar: { width: '100%', height: '100%' },
  userName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[4],
    textAlign: 'center',
  },
  username: { fontSize: FONT_SIZES.sm, marginTop: 3 },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[2],
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.full,
  },
  rankLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // XP Section
  xpSection: {
    marginTop: SPACING[4],
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING[4],
    gap: SPACING[2],
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  xpToNext: {
    fontSize: FONT_SIZES.xs,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginTop: SPACING[4],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[6],
    marginBottom: SPACING[3],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Badges grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  badgeCell: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCellName: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
    flexShrink: 1,
    minHeight: 28,
  },
  badgeDate: {
    fontSize: 9,
  },



  // Menu
  menuSection: { gap: SPACING[3], marginTop: SPACING[6] },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING[3],
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: SPACING[3],
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
