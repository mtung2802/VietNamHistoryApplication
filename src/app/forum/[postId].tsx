import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  addReply,
  deletePost,
  ForumDataSource,
  getPostById,
  subscribeToReplies,
  togglePostLike,
} from '@/services/forumService';
import { getUserSession } from '@/services/userSession';
import { ForumPost } from '@/models/ForumPost';
import { Reply } from '@/models/Reply';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, ErrorState, Screen } from '@/components/ui';
import { ForumAvatar } from '@/components/forum/ForumAvatar';
import { formatForumTime, ForumAuthor, resolveForumAuthor } from '@/utils/forumUtils';

function ReplyCard({ reply }: { reply: Reply }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.replyCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.black,
        },
      ]}
    >
      <ForumAvatar name={reply.authorName} uri={reply.authorPhoto} size={38} />
      <View style={styles.replyBody}>
        <View style={styles.replyMeta}>
          <Text style={[styles.replyAuthor, { color: colors.text }]} numberOfLines={1}>
            {reply.authorName || 'Người dùng'}
          </Text>
          <Text style={[styles.replyTime, { color: colors.textMuted }]}>
            {formatForumTime(reply.createdAt)}
          </Text>
        </View>
        <Text style={[styles.replyContent, { color: colors.textSecondary }]}>
          {reply.content}
        </Text>
      </View>
    </View>
  );
}

export default function ForumDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [author, setAuthor] = useState<ForumAuthor | null>(null);
  const [source, setSource] = useState<ForumDataSource>('firebase');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    try {
      setLoadError(false);
      const nextPost = await getPostById(postId);
      setPost(nextPost);
      if (!nextPost) setLoadError(true);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      getUserSession().then((user) => setAuthor(resolveForumAuthor(user)));
      loadPost();
    }, [loadPost]),
  );

  useEffect(() => {
    if (!postId) return;
    return subscribeToReplies(
      postId,
      (nextReplies, nextSource) => {
        setReplies(nextReplies);
        setSource(nextSource);
      },
      (error) => console.warn('Không thể tải replies từ Firebase:', error),
    );
  }, [postId]);

  const handleLike = async () => {
    if (!author) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để thích bài viết.');
      return;
    }
    if (!post || source === 'sample') {
      Alert.alert('Dữ liệu mẫu', 'Kết nối Firebase để thích bài viết này.');
      return;
    }

    try {
      setLiking(true);
      await togglePostLike(post.postId, author.id);
      await loadPost();
    } catch {
      Alert.alert('Không thể cập nhật', 'Vui lòng thử lại sau.');
    } finally {
      setLiking(false);
    }
  };

  const handleAddReply = async () => {
    const content = replyText.trim();
    if (!content || submitting) return;
    if (!author) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để trả lời.');
      return;
    }
    if (source === 'sample') {
      Alert.alert('Dữ liệu mẫu', 'Kết nối Firebase để tham gia thảo luận.');
      return;
    }

    try {
      setSubmitting(true);
      await addReply(postId, {
        content,
        authorId: author.id,
        authorName: author.name,
        authorPhoto: author.photo,
      });
      setReplyText('');
      await loadPost();
    } catch {
      Alert.alert('Không thể gửi trả lời', 'Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (!post) return;
    Alert.alert('Xóa bài viết', `Bạn có chắc muốn xóa “${post.title}”?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.postId);
            router.replace('/forum');
          } catch {
            Alert.alert('Không thể xóa bài', 'Vui lòng thử lại sau.');
          }
        },
      },
    ]);
  };

  const openMenu = () => {
    if (!post) return;
    Alert.alert('Tùy chọn bài viết', post.title, [
      {
        text: 'Chỉnh sửa',
        onPress: () =>
          router.push({
            pathname: '/forum/edit/[postId]',
            params: { postId: post.postId },
          }),
      },
      { text: 'Xóa bài', style: 'destructive', onPress: confirmDelete },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const liked = !!post && !!author && post.likes.includes(author.id);
  const canManage = !!post && !!author && post.authorId === author.id && source === 'firebase';

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Chi tiết thảo luận" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (loadError || !post) {
    return (
      <Screen>
        <AppHeader title="Chi tiết thảo luận" />
        <ErrorState message="Bài viết không tồn tại hoặc đã bị xóa." onRetry={loadPost} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <Screen>
        <AppHeader
          title="Chi tiết thảo luận"
          subtitle={`${post.replyCount} trả lời`}
          right={
            canManage ? (
              <TouchableOpacity
                onPress={openMenu}
                style={[styles.headerButton, { backgroundColor: colors.primaryDim }]}
                accessibilityLabel="Tùy chọn bài viết"
              >
                <Ionicons name="ellipsis-horizontal" size={21} color={colors.primary} />
              </TouchableOpacity>
            ) : undefined
          }
        />

        <FlatList
          data={replies}
          keyExtractor={(reply) => reply.id}
          renderItem={({ item }) => <ReplyCard reply={item} />}
          ItemSeparatorComponent={() => <View style={{ height: SPACING[3] }} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {source === 'sample' && (
                <View
                  style={[
                    styles.sampleBanner,
                    { backgroundColor: colors.primaryDim, borderColor: colors.primary },
                  ]}
                >
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                  <Text style={[styles.sampleText, { color: colors.textSecondary }]}>
                    Đây là nội dung mẫu. Tương tác được bật khi kết nối Firebase.
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.postCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.black,
                  },
                ]}
              >
                <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
                <View style={styles.authorRow}>
                  <ForumAvatar name={post.authorName} uri={post.authorPhoto} size={44} />
                  <View style={styles.authorInfo}>
                    <Text style={[styles.postAuthor, { color: colors.text }]} numberOfLines={1}>
                      {post.authorName || 'Người dùng'}
                    </Text>
                    <Text style={[styles.postTime, { color: colors.textMuted }]}>
                      {formatForumTime(post.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.postContent, { color: colors.textSecondary }]}>
                  {post.content}
                </Text>

                <View style={[styles.postActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={handleLike}
                    disabled={liking}
                    style={styles.postAction}
                  >
                    <Ionicons
                      name={liked ? 'heart' : 'heart-outline'}
                      size={21}
                      color={liked ? colors.secondary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.postActionText,
                        { color: liked ? colors.secondary : colors.textSecondary },
                      ]}
                    >
                      {post.likeCount} lượt thích
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.postActionText, { color: colors.textSecondary }]}>
                      {post.replyCount} trả lời
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Trả lời ({replies.length})
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyReplies}>
              <Ionicons name="chatbox-ellipses-outline" size={42} color={colors.textMuted} />
              <Text style={[styles.emptyReplyText, { color: colors.textMuted }]}>
                Chưa có trả lời nào. Hãy là người đầu tiên chia sẻ góc nhìn.
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.replyBar,
            { backgroundColor: colors.surfaceElevated, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.replyInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={author ? 'Viết câu trả lời...' : 'Đăng nhập để trả lời'}
            placeholderTextColor={colors.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            editable={!!author && source === 'firebase'}
            multiline
            maxLength={1000}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: replyText.trim() ? colors.primary : colors.border,
                opacity: submitting ? 0.65 : 1,
              },
            ]}
            onPress={handleAddReply}
            disabled={!replyText.trim() || submitting}
            accessibilityLabel="Gửi trả lời"
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Ionicons name="send" size={20} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: SPACING[4], paddingBottom: SPACING[6] },
  sampleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    marginBottom: SPACING[3],
  },
  sampleText: { flex: 1, fontSize: FONT_SIZES.xs, lineHeight: 18 },
  postCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4],
    ...SHADOWS.sm,
  },
  postTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 31,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING[4] },
  authorInfo: { flex: 1, marginLeft: SPACING[3] },
  postAuthor: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  postTime: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  postContent: { fontSize: FONT_SIZES.base, lineHeight: 26, marginTop: SPACING[5] },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: SPACING[5],
    paddingTop: SPACING[3],
  },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  postActionText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING[6],
    marginBottom: SPACING[3],
  },
  replyCard: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    ...SHADOWS.sm,
  },
  replyBody: { flex: 1, marginLeft: SPACING[3] },
  replyMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  replyAuthor: {
    flexShrink: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  replyTime: { fontSize: FONT_SIZES.xs },
  replyContent: { fontSize: FONT_SIZES.sm, lineHeight: 21, marginTop: SPACING[2] },
  emptyReplies: { alignItems: 'center', paddingVertical: SPACING[8], gap: SPACING[3] },
  emptyReplyText: {
    maxWidth: 290,
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    lineHeight: 21,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
  },
  replyInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 112,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
