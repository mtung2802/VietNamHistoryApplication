import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPostById, updatePost } from '@/services/forumService';
import { getUserSession } from '@/services/userSession';
import { ForumPost } from '@/models/ForumPost';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, ErrorState, LoadingState, Screen } from '@/components/ui';
import { ForumComposer } from '@/components/forum/ForumComposer';
import { resolveForumAuthor } from '@/utils/forumUtils';

export default function EditPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [nextPost, user] = await Promise.all([getPostById(postId), getUserSession()]);
      const author = resolveForumAuthor(user);
      if (!nextPost || !author || nextPost.authorId !== author.id) {
        setError(true);
        return;
      }
      setPost(nextPost);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (title: string, content: string) => {
    try {
      setSaving(true);
      await updatePost(postId, { title, content });
      router.back();
    } catch {
      Alert.alert('Không thể cập nhật', 'Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Chỉnh sửa bài viết" />
        <LoadingState message="Đang tải bài viết..." />
      </Screen>
    );
  }

  if (error || !post) {
    return (
      <Screen>
        <AppHeader title="Chỉnh sửa bài viết" />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ErrorState
            message="Bạn không có quyền chỉnh sửa bài viết này."
            onRetry={load}
          />
        </View>
      </Screen>
    );
  }

  return (
    <ForumComposer
      heading="Chỉnh sửa bài viết"
      subtitle="Cập nhật nội dung thảo luận"
      submitLabel="Lưu thay đổi"
      initialTitle={post.title}
      initialContent={post.content}
      loading={saving}
      onSubmit={submit}
    />
  );
}
