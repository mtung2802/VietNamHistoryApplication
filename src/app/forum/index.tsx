/**
 * Diễn đàn — Danh sách bài viết
 * Route: /forum
 * Tương đương: ForumActivity.java
 * Realtime listener: forum/posts/all orderBy createdAt desc
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, ListRenderItemInfo, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { subscribeToForum } from '@/services/forumService';
import { ForumPost } from '@/models/ForumPost';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

function PostCard({ item, onPress }: { item: ForumPost; onPress: () => void }) {
  const date = item.createdAt
    ? new Date((item.createdAt as any)?.seconds ? (item.createdAt as any).seconds * 1000 : item.createdAt).toLocaleDateString('vi-VN')
    : '';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.metaAuthor}>👤 {item.authorName ?? 'Ẩn danh'}</Text>
        <Text style={styles.metaDate}>{date}</Text>
        <Text style={styles.metaReply}>💬 {item.replyCount ?? 0}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ForumScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = subscribeToForum(
      (data) => { setPosts(data); setLoading(false); },
      (e) => { console.error(e); setLoading(false); },
    );
    return () => { unsubRef.current?.(); };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diễn Đàn</Text>
        <TouchableOpacity
          onPress={() => router.push('/forum/new')}
          style={styles.newBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.newBtnText}>✎</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.accent} />

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post, index) => post.postId || `post-${index}`}
          renderItem={({ item }: ListRenderItemInfo<ForumPost>) => (
            <PostCard item={item} onPress={() => router.push({ pathname: '/forum/[postId]', params: { postId: item.postId } })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 48 }}>📭</Text>
              <Text style={styles.emptyText}>Chưa có bài viết nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  accent: { height: 4, backgroundColor: COLORS.accent },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  newBtn: { width: 40, alignItems: 'center' },
  newBtnText: { color: COLORS.accent, fontSize: 26, fontWeight: FONT_WEIGHTS.bold },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  list: { padding: SPACING[4], gap: SPACING[3], paddingBottom: SPACING[8] },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING[4], gap: SPACING[2], ...SHADOWS.sm },
  cardTitle: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900 },
  cardContent: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3], marginTop: SPACING[1] },
  metaAuthor: { fontSize: FONT_SIZES.xs, color: COLORS.primary, flex: 1 },
  metaDate: { fontSize: FONT_SIZES.xs, color: COLORS.gray400 },
  metaReply: { fontSize: FONT_SIZES.xs, color: COLORS.gray500 },
  emptyText: { color: COLORS.gray400, fontSize: FONT_SIZES.base, textAlign: 'center' },
});
