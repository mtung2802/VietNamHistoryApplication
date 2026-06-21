/**
 * CreatePostScreen — Tạo bài viết mới trên diễn đàn
 * Route: /forum/create
 *
 * Form nhập tiêu đề + nội dung, validate, submit lên Firestore.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Screen } from '@/components/ui';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { createPost } from '@/services/forumService';

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;

export default function CreatePostScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { profile } = useGamification();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đăng bài.');
      router.push('/auth');
      return;
    }

    setSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
        authorName: user.name || user.displayName || user.username || 'Ẩn danh',
        authorPhoto: user.avatar || user.photo || '',
        authorRank: profile?.currentRank ?? 'Newcomer',
      });

      router.back();
    } catch (err) {
      console.error('Create post failed:', err);
      Alert.alert('Lỗi', 'Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const PostButton = () => (
    <TouchableOpacity
      onPress={handleSubmit}
      disabled={!canSubmit}
      style={[
        styles.postButton,
        {
          backgroundColor: canSubmit ? colors.primary : colors.border,
        },
      ]}
    >
      {submitting ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <Text style={styles.postButtonText}>Đăng</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Screen>
      <AppHeader
        title="Tạo bài viết"
        showThemeToggle={false}
        right={<PostButton />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Tiêu đề</Text>
              <Text style={[styles.charCount, { color: title.length > TITLE_MAX ? colors.error : colors.textMuted }]}>
                {title.length}/{TITLE_MAX}
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Nhập tiêu đề bài viết..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
              maxLength={TITLE_MAX}
              returnKeyType="next"
            />
          </View>

          {/* Content */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Nội dung</Text>
              <Text style={[styles.charCount, { color: content.length > CONTENT_MAX ? colors.error : colors.textMuted }]}>
                {content.length}/{CONTENT_MAX}
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Chia sẻ suy nghĩ của bạn về lịch sử Việt Nam..."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={(t) => setContent(t.slice(0, CONTENT_MAX))}
              maxLength={CONTENT_MAX}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tips */}
          <View style={[styles.tipsCard, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: colors.primary }]}>Mẹo viết bài hay</Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                • Đặt tiêu đề rõ ràng, thu hút{'\n'}
                • Chia sẻ kiến thức hoặc câu hỏi thú vị{'\n'}
                • Tôn trọng cộng đồng và lịch sử
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: SPACING[4],
    gap: SPACING[5],
    paddingBottom: SPACING[10],
  },

  field: { gap: SPACING[2] },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    fontSize: FONT_SIZES.base,
  },
  textArea: {
    minHeight: 180,
    lineHeight: 24,
  },

  // Post button
  postButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    gap: SPACING[3],
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  tipsContent: { flex: 1, gap: 4 },
  tipsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  tipsText: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
  },
});
