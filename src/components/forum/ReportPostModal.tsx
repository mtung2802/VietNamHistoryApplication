import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import {
  createForumReport,
  FORUM_REPORT_REASONS,
  ForumPost,
  ForumReportReasonCode,
} from '@/services/forumService';
import { SessionUser } from '@/services/userSession';

type ReportPostModalProps = {
  visible: boolean;
  post: ForumPost | null;
  reporter: SessionUser | null;
  onClose: () => void;
};

export function ReportPostModal({ visible, post, reporter, onClose }: ReportPostModalProps) {
  const colors = useThemeColors();
  const [reasonCode, setReasonCode] = useState<ForumReportReasonCode | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setReasonCode(null);
      setDescription('');
      setSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!post || !reporter?.id) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để gửi báo cáo.');
      return;
    }
    if (!reasonCode) {
      Alert.alert('Chưa chọn lý do', 'Hãy chọn một loại vi phạm.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Mô tả quá ngắn', 'Hãy mô tả vi phạm bằng ít nhất 10 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      await createForumReport({
        post,
        reporterId: reporter.id,
        reporterName: reporter.name || reporter.displayName || reporter.username || 'Người dùng',
        reporterEmail: reporter.email,
        reasonCode,
        description,
      });
      onClose();
      Alert.alert('Đã gửi báo cáo', 'Cảm ơn bạn. Quản trị viên sẽ kiểm tra nội dung này.');
    } catch (error) {
      console.error('Failed to report forum post:', error);
      Alert.alert('Không thể gửi báo cáo', 'Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={styles.handle} />
          <View style={styles.headingRow}>
            <View style={[styles.headingIcon, { backgroundColor: colors.primaryDim }]}>
              <Ionicons name="flag-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.headingText}>
              <Text style={[styles.title, { color: colors.text }]}>Báo cáo vi phạm</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {post?.title || 'Bài viết diễn đàn'}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityLabel="Đóng báo cáo"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Loại vi phạm</Text>
            <View style={styles.reasonList}>
              {FORUM_REPORT_REASONS.map((reason) => {
                const selected = reason.code === reasonCode;
                return (
                  <TouchableOpacity
                    key={reason.code}
                    activeOpacity={0.75}
                    onPress={() => setReasonCode(reason.code)}
                    style={[
                      styles.reasonRow,
                      { borderColor: selected ? colors.primary : colors.border },
                      selected && { backgroundColor: colors.primaryDim },
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        { borderColor: selected ? colors.primary : colors.textMuted },
                      ]}
                    >
                      {selected ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                    </View>
                    <Text style={[styles.reasonText, { color: colors.text }]}>{reason.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.descriptionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Mô tả chi tiết</Text>
              <Text style={[styles.counter, { color: colors.textMuted }]}>{description.length}/500</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              textAlignVertical="top"
              placeholder="Nêu rõ nội dung vi phạm để quản trị viên có đủ thông tin xử lý..."
              placeholderTextColor={colors.textMuted}
              style={[
                styles.descriptionInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            />
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={submitting}
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }, submitting && styles.disabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={19} color={colors.onPrimary} />
                <Text style={[styles.submitText, { color: colors.onPrimary }]}>Gửi báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(125,109,92,0.35)',
    marginBottom: 16,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headingText: { flex: 1, marginLeft: 12 },
  title: { fontFamily: Fonts.serifBold, fontSize: 22 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 2 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 14, marginBottom: 10 },
  reasonList: { gap: 8, marginBottom: 20 },
  reasonRow: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  reasonText: { fontFamily: Fonts.regular, fontSize: 14, marginLeft: 12, flex: 1 },
  descriptionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontFamily: Fonts.regular, fontSize: 12, marginBottom: 10 },
  descriptionInput: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  submitText: { fontFamily: Fonts.bold, fontSize: 15 },
  disabled: { opacity: 0.65 },
});
