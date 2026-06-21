/**
 * UserProfileScreen — Trang thông tin cá nhân public của một người dùng
 * Route: /user-profile/[userId]
 *
 * Hiển thị avatar, tên, rank, XP, stats, và danh sách huy hiệu.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { BADGE_DEFINITIONS } from '@/services/badgeService';
import { getRankTier } from '@/services/rankService';
import { getUserGamificationProfile } from '@/services/gamificationService';
import { GamificationProfile } from '@/models/GamificationModels';
import { AppHeader, Screen } from '@/components/ui';
import { BadgeModal } from '@/components/ui/BadgeModal';
import { RankModal } from '@/components/ui/RankModal';

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colors = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [displayName, setDisplayName] = useState<string>('Người dùng');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [showRankModal, setShowRankModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DEFINITIONS[0] | null>(null);

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
      if (!userId) {
        if (active) setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user data (for name/avatar)
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const resolvedAvatar =
            typeof data.avatar === 'string' && data.avatar
              ? data.avatar
              : typeof data.photo === 'string' && data.photo
                ? data.photo
                : undefined;
          
          if (active) {
            setAvatarUri(resolvedAvatar);
            setDisplayName(
              typeof data.name === 'string'
                ? data.name
                : typeof data.displayName === 'string'
                  ? data.displayName
                  : 'Người dùng'
            );
          }
        }

        // Fetch gamification profile
        const gamificationData = await getUserGamificationProfile(userId);
        if (active) {
          setProfile(gamificationData);
        }

      } catch (error) {
        console.error('Lỗi khi tải hồ sơ người dùng:', error);
        if (active) Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUserData();

    return () => {
      active = false;
    };
  }, [userId]);

  const rankTier = profile ? getRankTier(profile.currentRank) : null;

  return (
    <Screen>
      <AppHeader title="Hồ sơ người chơi" showBack />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : profile ? (
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
                  {profile.currentRank}
                </Text>
              </View>
            )}
          </View>

          {/* ═══ XP Progress Bar ═══ */}
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

          {/* ═══ Stats Row ═══ */}
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

          {/* ═══ Badges Grid ═══ */}
          <View style={styles.sectionHeader}>
            <Ionicons name="medal-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Huy hiệu</Text>
          </View>

          <View style={styles.badgesGrid}>
            {BADGE_DEFINITIONS.map((def) => {
              const earned = profile.badges.find((b) => b.badgeId === def.id);
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

        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text style={{ color: colors.textMuted }}>Không tìm thấy thông tin</Text>
        </View>
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
          isEarned: !!(profile?.badges?.find(b => b.badgeId === selectedBadge.id)),
          earnedAt: profile?.badges?.find(b => b.badgeId === selectedBadge.id)?.earnedAt?.toDate?.()
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
});