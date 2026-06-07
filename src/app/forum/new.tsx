import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createPost } from '@/services/forumService';
import { getUserSession } from '@/services/userSession';
import { ForumComposer } from '@/components/forum/ForumComposer';
import { ForumAuthor, resolveForumAuthor } from '@/utils/forumUtils';

export default function NewPostScreen() {
  const router = useRouter();
  const [author, setAuthor] = useState<ForumAuthor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserSession().then((user) => {
      const resolved = resolveForumAuthor(user);
      if (!resolved) {
        Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để tạo bài viết.', [
          { text: 'Quay lại', onPress: () => router.back() },
        ]);
        return;
      }
      setAuthor(resolved);
    });
  }, [router]);

  const submit = async (title: string, content: string) => {
    if (!author) {
      Alert.alert('Cần đăng nhập', 'Không tìm thấy phiên đăng nhập.');
      return;
    }

    try {
      setSubmitting(true);
      const postId = await createPost({
        title,
        content,
        authorId: author.id,
        authorName: author.name,
        authorPhoto: author.photo,
      });
      router.replace({ pathname: '/forum/[postId]', params: { postId } });
    } catch {
      Alert.alert('Không thể đăng bài', 'Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ForumComposer
      heading="Bài viết mới"
      subtitle="Mở một cuộc thảo luận"
      submitLabel="Đăng bài"
      loading={submitting}
      onSubmit={submit}
    />
  );
}
