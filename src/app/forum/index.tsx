/**
 * ForumScreen — Danh sách bài viết diễn đàn
 * Route: /forum
 *
 * Hiển thị danh sách bài viết phân trang, nút tạo bài mới.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { AppHeader, Screen } from '@/components/ui';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { ForumPost, getForumPosts } from '@/services/forumService';
import { getRankTier } from '@/services/rankService';
import { useFocusEffect } from '@react-navigation/native';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Tạo chuỗi thời gian tương đối bằng tiếng Việt */
function timeAgo(timestamp: { toDate?: () => Date } | Date | null): string {
  if (!timestamp) return '';
  const date = typeof (timestamp as any).toDate === 'function'
    ? (timestamp as any).toDate()
    : timestamp instanceof Date
      ? timestamp
      : new Date();

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Lấy chữ cái đầu của tên (dùng cho avatar fallback) */
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────

export default function ForumScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { profile } = useGamification();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadPosts = useCallback(async (isRefresh = true) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      const result = await getForumPosts(20, isRefresh ? null : lastDoc);

      if (isRefresh) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load forum posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  // Load lại khi focus vào screen (ví dụ sau khi tạo bài mới)
  useFocusEffect(
    useCallback(() => {
      loadPosts(true);
    }, []),
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false);
    }
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isMe = item.authorId === user?.id;
    const authorRank = isMe && profile ? profile.currentRank : item.authorRank;
    const authorName = isMe && user ? (user.name || user.displayName || user.username || 'Ẩn danh') : (item.authorName || 'Ẩn danh');
    const authorPhoto = isMe && user ? (user.avatar || user.photo || '') : item.authorPhoto;

    const rankTier = getRankTier(authorRank);

    return (
      <TouchableOpacity
        style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/forum/[postId]',
            params: { postId: item.id },
          } as any)
        }
      >
        {/* Author row */}
        <TouchableOpacity 
          style={styles.authorRow} 
          activeOpacity={0.7}
          onPress={() => router.push(`/user-profile/${item.authorId}` as any)}
        >
          <View style={[styles.avatarFrame, { borderColor: rankTier.color }]}>
            {authorPhoto ? (
              <Image source={{ uri: authorPhoto }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: rankTier.color }]}>
                <Text style={styles.avatarInitials}>{getInitials(authorName)}</Text>
              </View>
            )}
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                {authorName}
              </Text>
              <View style={[styles.rankBadge, { backgroundColor: `${rankTier.color}22` }]}>
                <Ionicons
                  name={rankTier.icon as keyof typeof Ionicons.glyphMap}
                  size={10}
                  color={rankTier.color}
                />
                <Text style={[styles.rankText, { color: rankTier.color }]}>
                  {authorRank}
                </Text>
              </View>
            </View>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {timeAgo(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{item.likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{item.replyCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryDim }]}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Chưa có bài viết nào
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Skeleton loading
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.authorRow}>
            <View style={[styles.avatarFrame, { backgroundColor: colors.border, borderWidth: 0 }]} />
            <View style={styles.authorInfo}>
              <View style={[styles.skeletonLine, { width: 100, backgroundColor: colors.border }]} />
              <View style={[styles.skeletonLine, { width: 60, backgroundColor: colors.border, marginTop: 4 }]} />
            </View>
          </View>
          <View style={[styles.skeletonLine, { width: '80%', backgroundColor: colors.border, marginTop: 12 }]} />
          <View style={[styles.skeletonLine, { width: '100%', backgroundColor: colors.border, marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border, marginTop: 4 }]} />
        </View>
      ))}
    </View>
  );

  return (
    <Screen>
      <AppHeader
        title="Diễn đàn"
        right={
          <TouchableOpacity
            onPress={() => {
              if (!user?.id) {
                router.push('/auth');
                return;
              }
              router.push('/forum/create' as any);
            }}
            style={[styles.composeBtn, { backgroundColor: colors.primaryDim }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING[3] }} />}
        />
      )}
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[10],
  },
  listContentEmpty: {
    flex: 1,
  },
  composeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Post card
  postCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  avatarFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  rankText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    marginTop: 1,
  },
  postTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: SPACING[3],
    lineHeight: 22,
  },
  postContent: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING[1],
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Empty state
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

  // Skeleton
  skeletonContainer: {
    padding: SPACING[4],
    gap: SPACING[3],
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },

  // Footer
  footerLoader: {
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
});
