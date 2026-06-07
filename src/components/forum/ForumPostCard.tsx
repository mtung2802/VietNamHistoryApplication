import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ForumPost } from '@/models/ForumPost';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { formatForumTime } from '@/utils/forumUtils';
import { ForumAvatar } from './ForumAvatar';

interface ForumPostCardProps {
  post: ForumPost;
  currentUserId?: string;
  liking?: boolean;
  onPress: () => void;
  onLike: () => void;
  onMenu?: () => void;
}

export function ForumPostCard({
  post,
  currentUserId,
  liking,
  onPress,
  onLike,
  onMenu,
}: ForumPostCardProps) {
  const colors = useThemeColors();
  const liked = !!currentUserId && post.likes.includes(currentUserId);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.black,
        },
      ]}
    >
      <View style={styles.authorRow}>
        <ForumAvatar name={post.authorName} uri={post.authorPhoto} />
        <View style={styles.authorText}>
          <Text style={[styles.author, { color: colors.text }]} numberOfLines={1}>
            {post.authorName || 'Người dùng'}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatForumTime(post.createdAt)}
          </Text>
        </View>
        {onMenu && (
          <TouchableOpacity
            onPress={onMenu}
            style={styles.iconButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityLabel="Tùy chọn bài viết"
          >
            <Ionicons name="ellipsis-horizontal" size={21} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.78}>
        <Text style={[styles.title, { color: colors.primary }]} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={3}>
          {post.content}
        </Text>
      </TouchableOpacity>

      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.action}
          onPress={onLike}
          disabled={liking}
          accessibilityLabel={liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.secondary : colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: liked ? colors.secondary : colors.textSecondary }]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onPress} accessibilityLabel="Xem trả lời">
          <Ionicons name="chatbubble-outline" size={19} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {post.replyCount} trả lời
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.action, styles.openAction]} onPress={onPress}>
          <Text style={[styles.openText, { color: colors.primary }]}>Xem thảo luận</Text>
          <Ionicons name="chevron-forward" size={17} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING[3] },
  authorText: { flex: 1, marginLeft: SPACING[3] },
  author: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  time: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, lineHeight: 24 },
  content: { fontSize: FONT_SIZES.sm, lineHeight: 21, marginTop: SPACING[2] },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: SPACING[4],
    paddingTop: SPACING[3],
    minHeight: 32,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: SPACING[1], marginRight: SPACING[4] },
  actionText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold },
  openAction: { flex: 1, justifyContent: 'flex-end', marginRight: 0 },
  openText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
});
