/**
 * UserProfileScreen — Trang thông tin cá nhân public của một người dùng (Thiết kế Sử đàn)
 * Route: /user-profile/[userId]
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
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
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
  const initials = displayName.substring(0, 1).toUpperCase();

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
        <Text style={styles.headerTitle}>Hồ sơ người chơi</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={SuVietColors.son} />
        </View>
      ) : profile ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ═══ Avatar + Name + Rank ═══ */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={[SuVietColors.dong, SuVietColors.son]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View style={styles.avatarFrame}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <Text style={styles.initials}>{initials}</Text>
                )}
              </View>
            </LinearGradient>
            
            <Text style={styles.userName}>{displayName}</Text>

            {rankTier && (
              <View style={[styles.rankBadge, { backgroundColor: 'rgba(168,130,58,0.1)', borderColor: 'rgba(168,130,58,0.2)' }]}>
                <Ionicons name={rankTier.icon as any} size={14} color={SuVietColors.dong} />
                <Text style={styles.rankLabel}>{profile.currentRank}</Text>
              </View>
            )}
          </View>

          {/* ═══ XP Progress Bar ═══ */}
          <TouchableOpacity
            style={[styles.rankCard, HTML_SHADOWS.card]}
            onPress={() => setShowRankModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rankCardTop}>
              <View style={[styles.rankIconWrap, { backgroundColor: rankTier?.color || SuVietColors.dong }]}>
                <Ionicons name={rankTier?.icon as any || 'star'} size={28} color="#fff" />
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankSubtitle}>HẠNG HIỆN TẠI</Text>
                <Text style={styles.rankTitle}>{profile.currentRank}</Text>
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpValue}>{profile.totalXP}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[SuVietColors.dong, SuVietColors.son]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(2, profile.xpProgress * 100)}%` }]}
                />
              </View>
              <View style={styles.progressTextRow}>
                {profile.nextRank ? (
                  <>
                    <Text style={styles.progressText}>Còn {profile.xpToNextRank} XP</Text>
                    <Text style={styles.progressText}>Lên hạng {profile.nextRank}</Text>
                  </>
                ) : (
                  <Text style={[styles.progressText, { color: SuVietColors.son }]}>Đã đạt mức Rank cao nhất</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* ═══ Stats Row ═══ */}
          <View style={styles.statsRow}>
            <StatCard icon="game-controller" value={String(profile.totalSessions)} label="Lượt chơi" />
            <StatCard icon="trophy" value={String(profile.highestScore * 10)} label="Điểm cao" />
            <StatCard icon="flame" value={String(profile.currentStreak)} label="Chuỗi" />
            <StatCard icon="trending-up" value={String(profile.longestStreak)} label="Chuỗi max" />
          </View>

          {/* ═══ Badges Grid ═══ */}
          <View style={styles.sectionHeader}>
            <Ionicons name="medal" size={20} color={SuVietColors.dong} />
            <Text style={styles.sectionTitle}>Huy hiệu</Text>
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
                    isEarned ? styles.badgeEarned : styles.badgeLocked
                  ]}
                  onPress={() => setSelectedBadge(def)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badgeIconCircle, isEarned ? styles.badgeIconEarned : styles.badgeIconLocked]}>
                    <Ionicons
                      name={isEarned ? def.icon as any : 'lock-closed'}
                      size={isEarned ? 24 : 16}
                      color={isEarned ? '#fff' : SuVietColors.muc2}
                    />
                  </View>
                  <Text style={[styles.badgeCellName, !isEarned && { color: SuVietColors.muc2 }]} numberOfLines={2}>
                    {def.name}
                  </Text>
                  {isEarned && earned?.earnedAt && (
                    <Text style={styles.badgeDate}>
                      {earned.earnedAt.toDate?.() ? earned.earnedAt.toDate().toLocaleDateString('vi-VN') : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text style={{ fontFamily: Fonts.regular, color: SuVietColors.muc2 }}>Không tìm thấy thông tin</Text>
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

function StatCard({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={SuVietColors.son} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 22, paddingBottom: 40 },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, zIndex: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.serifBold, fontSize: 18, color: '#f6e9cf' },

  // Profile section
  profileSection: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
  avatarRing: {
    width: 106, height: 106, borderRadius: 53,
    padding: 3, alignItems: 'center', justifyContent: 'center',
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  avatarFrame: {
    width: '100%', height: '100%', borderRadius: 50,
    backgroundColor: SuVietColors.card,
    borderWidth: 3, borderColor: '#fdf8ec',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  initials: { fontFamily: Fonts.serifExtraBold, fontSize: 36, color: SuVietColors.son },
  
  userName: { fontFamily: Fonts.serifExtraBold, fontSize: 24, color: SuVietColors.muc, marginTop: 16, textAlign: 'center' },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1,
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16,
  },
  rankLabel: { fontFamily: Fonts.bold, fontSize: 11, color: SuVietColors.dong, textTransform: 'uppercase' },

  // Rank Card
  rankCard: {
    backgroundColor: SuVietColors.card,
    borderRadius: 22, borderWidth: 1, borderColor: SuVietColors.line,
    padding: 20, marginBottom: 20,
  },
  rankCardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rankIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fdf8ec',
  },
  rankInfo: { flex: 1 },
  rankSubtitle: { fontFamily: Fonts.bold, fontSize: 10, color: SuVietColors.dong, letterSpacing: 0.5 },
  rankTitle: { fontFamily: Fonts.serifExtraBold, fontSize: 18, color: SuVietColors.muc },
  xpInfo: { alignItems: 'flex-end' },
  xpValue: { fontFamily: Fonts.serifExtraBold, fontSize: 18, color: SuVietColors.son },
  xpLabel: { fontFamily: Fonts.regular, fontSize: 11, color: SuVietColors.muc2 },
  
  progressContainer: { marginTop: 16 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: SuVietColors.line, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontFamily: Fonts.regular, fontSize: 11.5, color: SuVietColors.muc2 },

  // Stats Row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12,
    backgroundColor: SuVietColors.card, borderRadius: 16, borderWidth: 1, borderColor: SuVietColors.line,
  },
  statValue: { fontFamily: Fonts.serifExtraBold, fontSize: 18, color: SuVietColors.muc },
  statLabel: { fontFamily: Fonts.semibold, fontSize: 10, color: SuVietColors.muc2 },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: Fonts.serifBold, fontSize: 18, color: SuVietColors.muc },

  // Badges grid
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' },
  badgeCell: {
    width: '31%', alignItems: 'center', padding: 10, paddingVertical: 14,
    borderRadius: 20, borderWidth: 1, minHeight: 130, marginBottom: 10,
  },
  badgeEarned: { backgroundColor: SuVietColors.card, borderColor: 'rgba(168,130,58,0.3)' },
  badgeLocked: { backgroundColor: 'transparent', borderColor: SuVietColors.line },
  badgeIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  badgeIconEarned: { backgroundColor: SuVietColors.dong },
  badgeIconLocked: { backgroundColor: 'rgba(42,32,26,0.06)' },
  badgeCellName: { fontFamily: Fonts.bold, fontSize: 11, color: SuVietColors.muc, textAlign: 'center', lineHeight: 16 },
  badgeDate: { fontFamily: Fonts.regular, fontSize: 10, color: SuVietColors.muc2, marginTop: 'auto' },
});