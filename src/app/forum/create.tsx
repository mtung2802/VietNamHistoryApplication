/**
 * CreatePostScreen — Tạo bài viết mới trên diễn đàn (Thiết kế Sử đàn)
 * Route: /forum/create
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
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader, Screen } from '@/components/ui';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { createPost } from '@/services/forumService';

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;

export default function CreatePostScreen() {
  const router = useRouter();
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
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={canSubmit ? [SuVietColors.son, SuVietColors.son2] : ['rgba(101,19,16,0.3)', 'rgba(101,19,16,0.3)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.postButton, canSubmit && HTML_SHADOWS.button]}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.postButtonText}>Đăng bài</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.screen}>
      <LinearGradient
        colors={[SuVietColors.son, SuVietColors.son2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#f6e9cf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết bài mới</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

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
              <Text style={styles.label}>Tiêu đề</Text>
              <Text style={[styles.charCount, title.length > TITLE_MAX && { color: SuVietColors.wrong }]}>
                {title.length}/{TITLE_MAX}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nhập tiêu đề bài viết..."
              placeholderTextColor={SuVietColors.muc2}
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
              maxLength={TITLE_MAX}
              returnKeyType="next"
            />
          </View>

          {/* Content */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nội dung</Text>
              <Text style={[styles.charCount, content.length > CONTENT_MAX && { color: SuVietColors.wrong }]}>
                {content.length}/{CONTENT_MAX}
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Chia sẻ suy nghĩ của bạn về lịch sử Việt Nam..."
              placeholderTextColor={SuVietColors.muc2}
              value={content}
              onChangeText={(t) => setContent(t.slice(0, CONTENT_MAX))}
              maxLength={CONTENT_MAX}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Ionicons name="bulb" size={20} color={SuVietColors.dong} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Mẹo viết bài hay</Text>
              <Text style={styles.tipsText}>
                • Đặt tiêu đề rõ ràng, thu hút{'\n'}
                • Chia sẻ kiến thức hoặc câu hỏi thú vị{'\n'}
                • Tôn trọng cộng đồng và lịch sử
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <PostButton />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },
  flex: { flex: 1 },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, zIndex: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.serifBold, fontSize: 18, color: '#f6e9cf' },

  content: { padding: 22, paddingTop: 30, gap: 24, paddingBottom: 100 },

  field: { gap: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: Fonts.bold, fontSize: 14, color: SuVietColors.muc, letterSpacing: 0.5 },
  charCount: { fontFamily: Fonts.regular, fontSize: 12, color: SuVietColors.muc2 },
  
  input: {
    backgroundColor: SuVietColors.card,
    borderWidth: 1, borderColor: SuVietColors.line,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: Fonts.regular, fontSize: 15, color: SuVietColors.muc,
  },
  textArea: {
    minHeight: 180, paddingTop: 16, lineHeight: 24,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: SuVietColors.rulesBg,
    borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: SuVietColors.dong,
  },
  tipsContent: { flex: 1, gap: 4 },
  tipsTitle: { fontFamily: Fonts.bold, fontSize: 14, color: SuVietColors.dong },
  tipsText: { fontFamily: Fonts.regular, fontSize: 13, color: SuVietColors.muc2, lineHeight: 22 },

  // Post button
  actionRow: { alignItems: 'center', marginTop: 16 },
  postButton: {
    paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 25, minWidth: 160, alignItems: 'center', justifyContent: 'center',
  },
  postButtonText: { fontFamily: Fonts.bold, fontSize: 15, color: '#f6e9cf', letterSpacing: 0.5 },
});
