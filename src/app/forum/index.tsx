import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  deletePost,
  ForumDataSource,
  getPosts,
  subscribeToForum,
  togglePostLike,
} from '@/services/forumService';
import { getUserSession } from '@/services/userSession';
import { ForumPost } from '@/models/ForumPost';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, EmptyState, Screen } from '@/components/ui';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { resolveForumAuthor, toForumDate } from '@/utils/forumUtils';

type ForumFilter = 'latest' | 'popular' | 'unanswered';

const FILTERS: { key: ForumFilter; label: string }[] = [
  { key: 'latest', label: 'Mới nhất' },
  { key: 'popular', label: 'Nổi bật' },
  { key: 'unanswered', label: 'Chưa trả lời' },
];

export default function ForumScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<ForumDataSource>('firebase');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ForumFilter>('latest');
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [likingPostId, setLikingPostId] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      getUserSession().then((user) => setCurrentUserId(resolveForumAuthor(user)?.id));
    }, []),
  );

  useEffect(() => {
    const unsubscribe = subscribeToForum(
      (nextPosts, nextSource) => {
        setPosts(nextPosts);
        setSource(nextSource);
        setLoading(false);
      },
      (error) => console.warn('Không thể kết nối forum Firebase:', error),
    );
    return unsubscribe;
  }, []);

  const visiblePosts = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi-VN');
    const searched = keyword
      ? posts.filter((post) =>
          `${post.title} ${post.content} ${post.authorName ?? ''}`
            .toLocaleLowerCase('vi-VN')
            .includes(keyword),
        )
      : [...posts];

    if (filter === 'popular') {
      return searched.sort(
        (a, b) => b.likeCount + b.replyCount - (a.likeCount + a.replyCount),
      );
    }
    if (filter === 'unanswered') {
      return searched.filter((post) => post.replyCount === 0);
    }
    return searched.sort(
      (a, b) =>
        (toForumDate(b.createdAt)?.getTime() ?? 0) -
        (toForumDate(a.createdAt)?.getTime() ?? 0),
    );
  }, [filter, posts, search]);

  const requireUser = () => {
    if (currentUserId) return true;
    Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để thực hiện thao tác này.');
    return false;
  };

  const handleLike = async (post: ForumPost) => {
    if (!requireUser()) return;
    if (source === 'sample') {
      Alert.alert('Dữ liệu mẫu', 'Kết nối Firebase để thích bài viết này.');
      return;
    }

    try {
      setLikingPostId(post.postId);
      await togglePostLike(post.postId, currentUserId!);
    } catch {
      Alert.alert('Không thể cập nhật', 'Vui lòng thử lại sau.');
    } finally {
      setLikingPostId(undefined);
    }
  };

  const confirmDelete = (post: ForumPost) => {
    Alert.alert('Xóa bài viết', `Bạn có chắc muốn xóa “${post.title}”?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.postId);
          } catch {
            Alert.alert('Không thể xóa bài', 'Vui lòng thử lại sau.');
          }
        },
      },
    ]);
  };

  const openPostMenu = (post: ForumPost) => {
    Alert.alert('Tùy chọn bài viết', post.title, [
      {
        text: 'Chỉnh sửa',
        onPress: () =>
          router.push({
            pathname: '/forum/edit/[postId]',
            params: { postId: post.postId },
          }),
      },
      { text: 'Xóa bài', style: 'destructive', onPress: () => confirmDelete(post) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const refresh = async () => {
    try {
      setRefreshing(true);
      const nextPosts = await getPosts();
      if (nextPosts.length === 0 && source === 'sample') return;
      setPosts(nextPosts);
      setSource('firebase');
    } catch {
      Alert.alert('Chưa thể làm mới', 'Ứng dụng đang hiển thị dữ liệu có sẵn.');
    } finally {
      setRefreshing(false);
    }
  };

  const openNewPost = () => {
    if (requireUser()) router.push('/forum/new');
  };

  return (
    <Screen>
      <AppHeader
        title="Diễn đàn"
        subtitle={`${posts.length} cuộc thảo luận`}
        right={
          <TouchableOpacity
            onPress={openNewPost}
            style={[styles.headerButton, { backgroundColor: colors.primaryDim }]}
            accessibilityLabel="Tạo bài viết"
          >
            <Ionicons name="create-outline" size={21} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.controls}>
        {source === 'sample' && (
          <View
            style={[
              styles.offlineBanner,
              { backgroundColor: colors.primaryDim, borderColor: colors.primary },
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={17} color={colors.primary} />
            <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
              Đang hiển thị dữ liệu mẫu từ full_forum_database.json
            </Text>
          </View>
        )}

        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm bài viết, nội dung, tác giả"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Xóa tìm kiếm">
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.segmented, { backgroundColor: colors.surface }]}>
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.segment,
                  selected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: selected ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(post) => post.postId}
        renderItem={({ item }) => (
          <ForumPostCard
            post={item}
            currentUserId={currentUserId}
            liking={likingPostId === item.postId}
            onPress={() =>
              router.push({
                pathname: '/forum/[postId]',
                params: { postId: item.postId },
              })
            }
            onLike={() => handleLike(item)}
            onMenu={
              currentUserId === item.authorId && source === 'firebase'
                ? () => openPostMenu(item)
                : undefined
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          visiblePosts.length === 0 && styles.emptyList,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: SPACING[3] }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <Text style={{ color: colors.textSecondary }}>Đang tải thảo luận...</Text>
            </View>
          ) : (
            <EmptyState
              icon={search || filter === 'unanswered' ? 'search-outline' : 'chatbubbles-outline'}
              message={
                search || filter === 'unanswered'
                  ? 'Không tìm thấy cuộc thảo luận phù hợp.'
                  : 'Chưa có bài viết nào. Hãy mở cuộc thảo luận đầu tiên.'
              }
            />
          )
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        onPress={openNewPost}
        style={[styles.fab, { backgroundColor: colors.secondary }]}
        activeOpacity={0.88}
        accessibilityLabel="Đặt câu hỏi"
      >
        <Ionicons name="add" size={25} color={colors.onSecondary} />
        <Text style={[styles.fabText, { color: colors.onSecondary }]}>Đặt câu hỏi</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { paddingHorizontal: SPACING[4], paddingTop: SPACING[3], gap: SPACING[3] },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
  },
  offlineText: { flex: 1, fontSize: FONT_SIZES.xs, lineHeight: 17 },
  searchBox: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[3],
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, paddingVertical: SPACING[2] },
  segmented: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: BORDER_RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[1],
  },
  segmentText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  list: { padding: SPACING[4], paddingBottom: 100 },
  emptyList: { flexGrow: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: SPACING[5],
    bottom: SPACING[5],
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingHorizontal: SPACING[5],
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
});
