/**
 * Tab Hồ Sơ — Login / Register
 * Tương đương: ProfileFragment.java + RegisterFragment.java
 *
 * Login: query Firestore "users" where username == input, check password
 * (Google Sign-In + session sẽ được bổ sung ở Phase 4)
 */

import React, { useState } from 'react';
import {
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
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, AppHeader, Button } from '@/components/ui';

type Mode = 'login' | 'register';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert('Lỗi', 'Tên đăng nhập không tồn tại');
        return;
      }
      const data = snap.docs[0].data();
      if (data.password !== password) {
        Alert.alert('Lỗi', 'Mật khẩu không đúng');
        return;
      }
      router.replace('/profile-overview');
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại');
        return;
      }
      await addDoc(collection(db, 'users'), {
        username: username.trim(),
        password,
        name: fullName.trim(),
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => setMode('login') },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

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
      <AppHeader title="Hồ Sơ" showBack={false} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
              <Ionicons name="flag" size={40} color={colors.secondary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Lịch Sử Việt Nam</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              {mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
            </Text>
          </View>

          {/* Segmented control */}
          <View style={[styles.tabRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(['login', 'register'] as Mode[]).map((m) => {
              const active = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.tab, { backgroundColor: active ? colors.primary : 'transparent' }]}
                  onPress={() => setMode(m)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: active ? colors.onPrimary : colors.textSecondary },
                    ]}
                  >
                    {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <TextInput
                style={inputStyle}
                placeholder="Họ và tên"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            )}
            <TextInput
              style={inputStyle}
              placeholder="Tên đăng nhập"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={inputStyle}
              placeholder="Mật khẩu"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {mode === 'register' && (
              <TextInput
                style={inputStyle}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}

            <Button
              label={mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              icon={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
              loading={loading}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              size="lg"
              style={{ marginTop: SPACING[2] }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: SPACING[8] },
  hero: { alignItems: 'center', paddingTop: SPACING[6], paddingBottom: SPACING[5] },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: SPACING[3],
  },
  appName: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.3 },
  tagline: { fontSize: FONT_SIZES.sm, marginTop: 4 },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING[5],
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.full },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },

  form: { padding: SPACING[5], gap: SPACING[3] },
  input: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: 14,
    fontSize: FONT_SIZES.base,
    borderWidth: 1,
  },
});
