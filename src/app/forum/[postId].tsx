/**
 * ForumDetailScreen — Chi tiết bài viết + bình luận real-time
 * Route: /forum/[postId]
 *
 * Hiển thị nội dung đầy đủ, nút like, danh sách bình luận (onSnapshot),
 * và thanh nhập bình luận cố định ở đáy.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Screen } from '@/components/ui';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { getRankTier } from '@/services/rankService';
import {
  getForumPost,
  toggleLike,
  subscribeToReplies,
  addReply,
  ForumPost,
  ForumReply,
} from '@/services/forumService';

// ── Helpers ──────────────────────────────────────────────────────────────

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

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

// ── Avatar component ─────────────────────────────────────────────────────

function AvatarView({
  uri,
  name,
  size = 40,
  primaryColor,
  rankName,
}: {
  uri?: string;
  name: string;
  size?: number;
  primaryColor: string;
  rankName?: string;
}) {
  const rankTier = rankName ? getRankTier(rankName) : null;
  const frameColor = rankTier ? rankTier.color : primaryColor;
  
  // Size params
  const frameSize = size + 4; // Add 4px for the border frame
  const imgSize = size - 2; // Slight padding
  const radius = frameSize / 2;
  const imgRadius = imgSize / 2;

  return (
    <View
      style={{
        width: frameSize,
        height: frameSize,
        borderRadius: radius,
        borderWidth: rankTier ? 2 : 0,
        borderColor: frameColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: imgSize, height: imgSize, borderRadius: imgRadius }}
        />
      ) : (
        <View
          style={{
            width: imgSize,
            height: imgSize,
            borderRadius: imgRadius,
            backgroundColor: frameColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: imgSize * 0.35, fontWeight: '700' }}>
            {getInitials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Component ────────────────────────────────────────────────────────────

export default function ForumDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { profile } = useGamification();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Fetch post
  useEffect(() => {
    if (!postId) return;
    let active = true;

    (async () => {
      try {
        const data = await getForumPost(postId);
        if (active) {
          setPost(data);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        Alert.alert('Lỗi', 'Không thể tải bài viết.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [postId]);

  // Real-time replies
  useEffect(() => {
    if (!postId) return;
    const unsubscribe = subscribeToReplies(postId, setReplies);
    return () => unsubscribe();
  }, [postId]);

  // Like toggle
  const handleLike = useCallback(async () => {
    if (!user?.id || !post || liking) return;
    if (!postId) return;

    // Optimistic UI
    const wasLiked = post.likes.includes(user.id);
    setPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        likes: wasLiked
          ? prev.likes.filter((id) => id !== user.id)
          : [...prev.likes, user.id],
        likeCount: wasLiked
          ? Math.max(0, prev.likeCount - 1)
          : prev.likeCount + 1,
      };
    });

    setLiking(true);
    try {
      await toggleLike(postId, user.id);
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          likes: wasLiked
            ? [...prev.likes, user.id]
            : prev.likes.filter((id) => id !== user.id),
          likeCount: wasLiked
            ? prev.likeCount + 1
            : Math.max(0, prev.likeCount - 1),
        };
      });
    } finally {
      setLiking(false);
    }
  }, [user?.id, post, liking, postId]);

  // Send reply
  const handleSendReply = useCallback(async () => {
    const text = replyText.trim();
    if (!text || !user?.id || !postId || sending) return;

    setSending(true);
    try {
      await addReply(postId, {
        content: text,
        authorId: user.id,
        authorName: user.name || user.displayName || user.username || 'Ẩn danh',
        authorPhoto: user.avatar || user.photo || '',
        authorRank: profile?.currentRank ?? 'Newcomer',
      });
      setReplyText('');
      // Cập nhật replyCount local
      setPost((prev) => prev ? { ...prev, replyCount: prev.replyCount + 1 } : prev);
    } catch (err) {
      console.error('Send reply failed:', err);
      Alert.alert('Lỗi', 'Không thể gửi bình luận.');
    } finally {
      setSending(false);
    }
  }, [replyText, user, postId, sending]);

  const isLiked = post && user?.id ? post.likes.includes(user.id) : false;

  // ── Render ─────────────────────────────────────────────────────────────

  const renderReply = ({ item }: { item: ForumReply }) => {
    const isMe = item.authorId === user?.id;
    const authorRank = isMe && profile ? profile.currentRank : item.authorRank;
    const authorName = isMe && user ? (user.name || user.displayName || user.username || 'Ẩn danh') : (item.authorName || 'Ẩn danh');
    const authorPhoto = isMe && user ? (user.avatar || user.photo || '') : item.authorPhoto;

    const rankTier = getRankTier(authorRank);
    return (
      <View style={[styles.replyCard, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/user-profile/${item.authorId}` as any)}
        >
          <AvatarView
            uri={authorPhoto}
            name={authorName}
            size={34}
            primaryColor={colors.primary}
            rankName={authorRank}
          />
        </TouchableOpacity>
        <View style={styles.replyBody}>
          <View style={styles.replyHeader}>
            <TouchableOpacity
              style={styles.nameRow}
              activeOpacity={0.7}
              onPress={() => router.push(`/user-profile/${item.authorId}` as any)}
            >
              <Text style={[styles.replyAuthor, { color: colors.text }]} numberOfLines={1}>
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
            </TouchableOpacity>
            <Text style={[styles.replyTime, { color: colors.textMuted }]}>
              {timeAgo(item.createdAt)}
            </Text>
          </View>
          <Text style={[styles.replyContent, { color: colors.textSecondary }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (!post) return null;

    const isMe = post.authorId === user?.id;
    const authorRank = isMe && profile ? profile.currentRank : post.authorRank;
    const authorName = isMe && user ? (user.name || user.displayName || user.username || 'Ẩn danh') : (post.authorName || 'Ẩn danh');
    const authorPhoto = isMe && user ? (user.avatar || user.photo || '') : post.authorPhoto;
    const rankTier = getRankTier(authorRank);

    return (
      <View style={styles.headerContent}>
        {/* Post full content */}
        <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.authorRow}
            activeOpacity={0.7}
            onPress={() => router.push(`/user-profile/${post.authorId}` as any)}
          >
            <AvatarView
              uri={authorPhoto}
              name={authorName}
              size={44}
              primaryColor={colors.primary}
              rankName={authorRank}
            />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {authorName}
                </Text>
                {authorRank && (
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
                )}
              </View>
              <Text style={[styles.postTime, { color: colors.textMuted }]}>
                {timeAgo(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
          <Text style={[styles.postContent, { color: colors.textSecondary }]}>{post.content}</Text>

          {/* Like row */}
          <View style={[styles.likeRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.7}
              disabled={!user?.id}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.likeCount,
                  { color: isLiked ? colors.primary : colors.textMuted },
                ]}
              >
                {post.likeCount}
              </Text>
            </TouchableOpacity>

            <View style={styles.replyCountRow}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.likeCount, { color: colors.textMuted }]}>
                {post.replyCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Replies section header */}
        <View style={styles.repliesHeader}>
          <Ionicons name="chatbubbles-outline" size={16} color={colors.primary} />
          <Text style={[styles.repliesTitle, { color: colors.text }]}>
            Bình luận ({replies.length})
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Bài viết" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen>
        <AppHeader title="Bài viết" />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Bài viết không tồn tại hoặc đã bị xóa.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Bài viết" showThemeToggle={false} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={replies}
          keyExtractor={(item) => item.id}
          renderItem={renderReply}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noReplies}>
              <Text style={[styles.noRepliesText, { color: colors.textMuted }]}>
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </Text>
            </View>
          }
        />

        {/* Reply input bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            style={[styles.inputField, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="Viết bình luận..."
            placeholderTextColor={colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendReply}
            disabled={!replyText.trim() || sending}
            style={[
              styles.sendBtn,
              {
                backgroundColor: replyText.trim() ? colors.primary : colors.border,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[4],
    padding: SPACING[6],
  },
  errorText: {
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[4],
  },
  headerContent: {
    gap: SPACING[4],
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
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
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
  postTime: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  postTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[4],
    lineHeight: 26,
  },
  postContent: {
    fontSize: FONT_SIZES.base,
    marginTop: SPACING[2],
    lineHeight: 24,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[5],
    marginTop: SPACING[4],
    paddingTop: SPACING[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  replyCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Replies
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  repliesTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  noReplies: {
    paddingVertical: SPACING[6],
    alignItems: 'center',
  },
  noRepliesText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  },
  replyCard: {
    flexDirection: 'row',
    gap: SPACING[3],
    paddingVertical: SPACING[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  replyBody: { flex: 1, gap: 4 },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyAuthor: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  replyTime: {
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING[2],
  },
  replyContent: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING[2],
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    fontSize: FONT_SIZES.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
