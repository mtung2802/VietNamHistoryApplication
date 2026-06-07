import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, Button, Screen } from '@/components/ui';

interface ForumComposerProps {
  heading: string;
  subtitle: string;
  submitLabel: string;
  initialTitle?: string;
  initialContent?: string;
  loading?: boolean;
  onSubmit: (title: string, content: string) => Promise<void>;
}

export function ForumComposer({
  heading,
  subtitle,
  submitLabel,
  initialTitle = '',
  initialContent = '',
  loading,
  onSubmit,
}: ForumComposerProps) {
  const colors = useThemeColors();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [touched, setTouched] = useState(false);

  const titleError = touched && !title.trim();
  const contentError = touched && !content.trim();
  const canSubmit = !!title.trim() && !!content.trim() && !loading;

  const submit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    await onSubmit(title.trim(), content.trim());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <AppHeader title={heading} subtitle={subtitle} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Tiêu đề</Text>
              <Text style={[styles.counter, { color: colors.textMuted }]}>{title.length}/120</Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Bạn muốn thảo luận điều gì?"
              placeholderTextColor={colors.textMuted}
              maxLength={120}
              returnKeyType="next"
              style={[
                styles.titleInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: titleError ? colors.error : colors.border,
                  color: colors.text,
                },
              ]}
            />
            {titleError && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Vui lòng nhập tiêu đề.
              </Text>
            )}
          </View>

          <View>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Nội dung</Text>
              <Text style={[styles.counter, { color: colors.textMuted }]}>
                {content.length}/3000
              </Text>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Mô tả câu hỏi, bối cảnh hoặc góc nhìn của bạn..."
              placeholderTextColor={colors.textMuted}
              maxLength={3000}
              multiline
              textAlignVertical="top"
              style={[
                styles.contentInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: contentError ? colors.error : colors.border,
                  color: colors.text,
                },
              ]}
            />
            {contentError && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Vui lòng nhập nội dung.
              </Text>
            )}
          </View>

          <View
            style={[
              styles.note,
              { backgroundColor: colors.primaryDim, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Hãy trình bày rõ ràng, tôn trọng người đọc và ưu tiên nguồn lịch sử đáng tin cậy.
            </Text>
          </View>

          <Button
            label={submitLabel}
            icon="send"
            size="lg"
            loading={loading}
            disabled={!canSubmit && touched}
            onPress={submit}
          />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING[4], paddingBottom: SPACING[10], gap: SPACING[5] },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  },
  label: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  counter: { fontSize: FONT_SIZES.xs },
  titleInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    fontSize: FONT_SIZES.base,
  },
  contentInput: {
    minHeight: 220,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    fontSize: FONT_SIZES.base,
    lineHeight: 24,
  },
  errorText: { fontSize: FONT_SIZES.xs, marginTop: SPACING[1] },
  note: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
  },
  noteText: { fontSize: FONT_SIZES.xs, lineHeight: 19 },
});
