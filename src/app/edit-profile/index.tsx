import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { deleteField, doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { uploadUserAvatar } from '@/services/userService';
import {
  getUserSession,
  saveUserSession,
  SessionUser,
} from '@/services/userSession';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { AppHeader, Button, Screen } from '@/components/ui';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getUserSession()
      .then((session) => {
        if (!active) return;
        if (!session) {
          router.replace('/(tabs)/profile');
          return;
        }

        setUser(session);
        setName(session.name || session.displayName || '');
        setEmail(session.email || '');
        setBio(session.bio || '');
        setPhone(session.phone || '');
        setAvatarUri(session.avatar || session.photo || '');
      })
      .catch(() => Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.'))
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const pickAvatar = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Cần quyền truy cập ảnh',
          'Vui lòng cho phép ứng dụng truy cập thư viện để chọn ảnh đại diện.',
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return;
    }
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert('Lỗi', 'Email không đúng định dạng');
      return;
    }
    if (!user?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setSaving(true);
      const uploadedAvatar = newAvatarUri
        ? await uploadUserAvatar(user.id, newAvatarUri)
        : avatarUri;
      const profileData = {
        name: normalizedName,
        displayName: normalizedName,
        email: normalizedEmail,
        bio: bio.trim(),
        phone: phone.trim(),
        avatar: uploadedAvatar,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, 'users', user.id),
        { ...profileData, photo: deleteField() },
        { merge: true },
      );
      await saveUserSession({ ...user, ...profileData, photo: undefined });

      Alert.alert('Thành công', 'Đã cập nhật hồ sơ.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Unable to save profile:', error);
      Alert.alert('Lỗi', 'Không thể lưu hồ sơ hoặc tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = newAvatarUri || avatarUri;
  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  return (
    <Screen>
      <AppHeader title="Chỉnh sửa hồ sơ" />
      {loadingProfile ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
                <View
                  style={[
                    styles.avatarFrame,
                    { backgroundColor: colors.surface, borderColor: colors.primary },
                  ]}
                >
                  {displayedAvatar ? (
                    <Image source={{ uri: displayedAvatar }} style={styles.avatar} />
                  ) : (
                    <Ionicons name="person" size={52} color={colors.textMuted} />
                  )}
                </View>
                <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={18} color={colors.onPrimary} />
                </View>
              </TouchableOpacity>
              <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                Chạm để đổi ảnh đại diện
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Họ và tên *</Text>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={inputStyle}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Số điện thoại</Text>
              <TextInput
                style={inputStyle}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Giới thiệu</Text>
              <TextInput
                style={[inputStyle, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Viết vài dòng về bạn"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={[styles.characterCount, { color: colors.textMuted }]}>
                {bio.length}/200
              </Text>
            </View>

            <Button
              label="Lưu thay đổi"
              icon="save-outline"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              size="lg"
              style={styles.saveButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  form: { padding: SPACING[5], paddingBottom: SPACING[10] },
  avatarSection: { alignItems: 'center', marginBottom: SPACING[6] },
  avatarFrame: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  avatar: { width: '100%', height: '100%' },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: { fontSize: FONT_SIZES.sm, marginTop: SPACING[3] },
  field: { marginBottom: SPACING[4] },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING[2],
  },
  input: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING[4],
    paddingVertical: 14,
    fontSize: FONT_SIZES.base,
  },
  bioInput: { minHeight: 108, paddingTop: 14 },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING[1],
  },
  saveButton: { marginTop: SPACING[2] },
});
