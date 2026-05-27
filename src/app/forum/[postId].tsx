/**
 * Chi tiết bài viết + Replies
 * Route: /forum/[postId]
 * Tương đương: ForumDetailActivity.java
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, ListRenderItemInfo,
  Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPostById, getReplies, addReply } from '@/services/forumService';
import { ForumPost } from '@/models/ForumPost';
import { Reply } from '@/models/Reply';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ReplyCard({ item }: { item: Reply }) {
  const date = item.createdAt
    ? new Date((item.createdAt as any)?.seconds ? (item.createdAt as any).seconds * 1000 : item.createdAt).toLocaleDateString('vi-VN')
    : '';
  return (
    <View style={styles.replyCard}>
      <Text style={styles.replyAuthor}>👤 {(item as any).authorName ?? 'Ẩn danh'} · {date}</Text>
      <Text style={styles.replyContent}>{(item as any).content}</Text>
    </View>
  );
}

export default function ForumDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [p, rs] = await Promise.all([getPostById(postId), getReplies(postId)]);
      setPost(p);
      setReplies(rs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmitting(true);
      const raw = await AsyncStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      await addReply(postId!, {
        content: replyText.trim(),
        authorId: user?.id ?? 'anonymous',
        authorName: user?.name ?? user?.username ?? 'Ẩn danh',
        authorPhoto: user?.photo,
      });
      setReplyText('');
      await load();
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng trả lời.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{post?.title ?? 'Bài viết'}</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.accent} />

      <FlatList
        data={replies}
        keyExtractor={(r, i) => (r as any).id ?? String(i)}
        renderItem={({ item }: ListRenderItemInfo<Reply>) => <ReplyCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          post ? (
            <View style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postMeta}>
                👤 {(post as any).authorName ?? 'Ẩn danh'}  ·  💬 {post.replyCount ?? 0} trả lời
              </Text>
              <Text style={styles.postContent}>{(post as any).content}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có trả lời nào. Hãy là người đầu tiên!</Text>}
      />

      {/* Reply input */}
      <View style={styles.replyBar}>
        <TextInput
          style={styles.replyInput}
          placeholder="Viết trả lời…"
          placeholderTextColor={COLORS.gray400}
          value={replyText}
          onChangeText={setReplyText}
          multiline={false}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleAddReply} disabled={submitting}>
          {submitting ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.sendBtnText}>Gửi</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lightBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  accent: { height: 4, backgroundColor: COLORS.accent },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },
  list: { padding: SPACING[4], gap: SPACING[3], paddingBottom: SPACING[4] },
  postCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING[4], marginBottom: SPACING[2], ...SHADOWS.sm, borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  postTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900, marginBottom: 4 },
  postMeta: { fontSize: FONT_SIZES.xs, color: COLORS.primary, marginBottom: SPACING[3] },
  postContent: { fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 22 },
  replyCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING[3], ...SHADOWS.sm },
  replyAuthor: { fontSize: FONT_SIZES.xs, color: COLORS.primary, marginBottom: 4 },
  replyContent: { fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 20 },
  emptyText: { color: COLORS.gray400, fontSize: FONT_SIZES.sm, textAlign: 'center', paddingVertical: SPACING[6] },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING[2],
    padding: SPACING[3], borderTopWidth: 1, borderTopColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  replyInput: { flex: 1, backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING[4], paddingVertical: 10, fontSize: FONT_SIZES.sm, color: COLORS.gray900 },
  sendBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING[4], paddingVertical: 10, borderRadius: BORDER_RADIUS.full },
  sendBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },
});
