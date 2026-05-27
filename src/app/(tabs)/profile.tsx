/**
 * Tab Hồ Sơ — Login / Register
 * Tương đương: ProfileFragment.java + RegisterFragment.java
 *
 * Login: query Firestore "users" where username == input, check password
 * Google Sign-In: Firebase Auth Google provider
 */

import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { db, auth } from '@/services/firebase';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

type Mode = 'login' | 'register';

export default function ProfileScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  /** Login: query users by username, verify password manually (như Java) */
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      // Java login: query `users` where `username` == input
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert('Lỗi', 'Tên đăng nhập không tồn tại');
        return;
      }
      const userDoc = snap.docs[0];
      const data = userDoc.data();
      if (data.password !== password) {
        Alert.alert('Lỗi', 'Mật khẩu không đúng');
        return;
      }
      // Success
      router.replace('/profile-overview');
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /** Register: create user doc in Firestore */
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
      // Java stores password plaintext — replicate same logic
      const { addDoc } = await import('firebase/firestore');
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

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.flag}>🇻🇳</Text>
          <Text style={styles.appName}>Lịch Sử Việt Nam</Text>
          <Text style={styles.tagline}>{mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => setMode('register')}>
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor={COLORS.gray400}
              value={fullName}
              onChangeText={setFullName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor={COLORS.gray400}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={COLORS.gray400}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={COLORS.gray400}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  scroll: { flexGrow: 1 },
  headerSection: {
    backgroundColor: COLORS.primary, alignItems: 'center',
    paddingTop: 60, paddingBottom: 32, paddingHorizontal: SPACING[6],
  },
  flag: { fontSize: 56, marginBottom: 8 },
  appName: { color: COLORS.accent, fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, marginTop: 4 },

  tabRow: { flexDirection: 'row', marginHorizontal: SPACING[5], marginTop: SPACING[5], backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.full, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.full },
  tabActive: { backgroundColor: COLORS.white, ...SHADOWS.sm },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, fontWeight: FONT_WEIGHTS.medium },
  tabTextActive: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },

  form: { padding: SPACING[5], gap: SPACING[3] },
  input: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING[4], paddingVertical: 14,
    fontSize: FONT_SIZES.base, color: COLORS.gray900,
    borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.full,
    paddingVertical: 16, alignItems: 'center', ...SHADOWS.md, marginTop: SPACING[2],
  },
  primaryBtnText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base },
});