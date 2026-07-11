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
import { LinearGradient } from 'expo-linear-gradient';
import { deleteField, doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { uploadUserAvatar } from '@/services/userService';
import {
  getUserSession,
  saveUserSession,
  SessionUser,
} from '@/services/userSession';
import { Fonts, HTML_SHADOWS, SuVietColors, SPACING } from '@/constants/theme';
import { AppHeader, Screen } from '@/components/ui';

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
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

  return (
    <Screen style={styles.screen}>
      <LinearGradient
        colors={[SuVietColors.son, SuVietColors.son2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#f6e9cf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loadingProfile ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={SuVietColors.son} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
                <LinearGradient
                  colors={[SuVietColors.dong, SuVietColors.son]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.avatarRing}
                >
                  <View style={styles.avatarFrame}>
                    {displayedAvatar ? (
                      <Image source={{ uri: displayedAvatar }} style={styles.avatar} />
                    ) : (
                      <Ionicons name="person" size={52} color={SuVietColors.muc2} />
                    )}
                  </View>
                </LinearGradient>
                <View style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Chạm để đổi ảnh đại diện</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={SuVietColors.muc2}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor={SuVietColors.muc2}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Giới thiệu</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Viết vài dòng về bạn"
                placeholderTextColor={SuVietColors.muc2}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {bio.length}/200
              </Text>
            </View>

            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.8} style={styles.saveBtnWrap}>
              <LinearGradient
                colors={saving ? ['rgba(101,19,16,0.3)', 'rgba(101,19,16,0.3)'] : [SuVietColors.son, SuVietColors.son2]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.saveBtn, !saving && HTML_SHADOWS.button]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: SuVietColors.giay },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, zIndex: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.serifBold, fontSize: 18, color: '#f6e9cf' },

  form: { padding: 24, paddingTop: 32, paddingBottom: 60 },
  
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarRing: {
    width: 116, height: 116, borderRadius: 58,
    padding: 3, alignItems: 'center', justifyContent: 'center',
    shadowColor: SuVietColors.son, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  avatarFrame: {
    width: '100%', height: '100%', borderRadius: 55,
    backgroundColor: SuVietColors.card,
    borderWidth: 3, borderColor: '#fdf8ec',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: '100%', height: '100%' },
  editAvatarButton: {
    position: 'absolute', right: 0, bottom: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: SuVietColors.son,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fdf8ec',
  },
  avatarHint: { fontFamily: Fonts.regular, fontSize: 13, color: SuVietColors.muc2, marginTop: 12 },
  
  field: { marginBottom: 20 },
  label: { fontFamily: Fonts.bold, fontSize: 14, color: SuVietColors.muc, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: SuVietColors.card,
    borderWidth: 1, borderColor: SuVietColors.line,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: Fonts.regular, fontSize: 15, color: SuVietColors.muc,
  },
  bioInput: { minHeight: 108, paddingTop: 14, lineHeight: 22 },
  characterCount: {
    alignSelf: 'flex-end', fontFamily: Fonts.regular, fontSize: 12,
    color: SuVietColors.muc2, marginTop: 6,
  },
  
  saveBtnWrap: { marginTop: 16, alignItems: 'center' },
  saveBtn: {
    paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 25, minWidth: 160, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: '#f6e9cf', letterSpacing: 0.5 },
});
