/**
 * Tạo bài viết mới trong diễn đàn
 * Route: /forum/new
 * Tương đương: NewPostActivity.java
 */

import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createPost } from '@/services/forumService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề và nội dung.');
      return;
    }
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      await createPost({
        title: title.trim(),
        content: content.trim(),
        authorId: user?.id ?? 'anonymous',
        authorName: user?.name ?? user?.username ?? 'Ẩn danh',
        authorPhoto: user?.photo,
      });
      Alert.alert('Thành công', 'Đăng bài thành công!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể đăng bài. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài Viết Mới</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
          {loading ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={styles.submitBtnText}>Đăng</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.accent} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Tiêu đề bài viết…"
          placeholderTextColor={COLORS.gray400}
          value={title}
          onChangeText={setTitle}
          multiline={false}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Nội dung bài viết…"
          placeholderTextColor={COLORS.gray400}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  submitBtn: { width: 52, alignItems: 'flex-end' },
  submitBtnText: { color: COLORS.accent, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base },
  form: { padding: SPACING[4], gap: SPACING[3] },
  titleInput: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200,
    paddingHorizontal: SPACING[4], paddingVertical: 14, fontSize: FONT_SIZES.base, color: COLORS.gray900, ...SHADOWS.sm,
  },
  contentInput: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200,
    paddingHorizontal: SPACING[4], paddingVertical: 14, fontSize: FONT_SIZES.base, color: COLORS.gray900,
    minHeight: 200, ...SHADOWS.sm,
  },
});
