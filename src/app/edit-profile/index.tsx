/**
 * Chỉnh sửa hồ sơ
 * Route: /edit-profile
 * Tương đương: EditProfileActivity.java
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('currentUser').then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        setName(u.name ?? '');
        setEmail(u.email ?? '');
        setUserId(u.id ?? null);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lỗi', 'Tên không được để trống'); return; }
    if (!userId) { Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng'); return; }
    try {
      setLoading(true);
      await setDoc(doc(db, 'users', userId), { name: name.trim(), email: email.trim() }, { merge: true });
      const raw = await AsyncStorage.getItem('currentUser');
      const u = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem('currentUser', JSON.stringify({ ...u, name: name.trim(), email: email.trim() }));
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin.');
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
        <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.accent} />

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập họ tên" placeholderTextColor={COLORS.gray400} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Nhập email" placeholderTextColor={COLORS.gray400} keyboardType="email-address" autoCapitalize="none" />

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
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
  form: { padding: SPACING[5], gap: SPACING[2], paddingBottom: SPACING[8] },
  label: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.gray700, marginBottom: 2 },
  input: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING[4], paddingVertical: 14,
    fontSize: FONT_SIZES.base, color: COLORS.gray900,
    borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.sm, marginBottom: SPACING[2],
  },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.full,
    paddingVertical: 16, alignItems: 'center', ...SHADOWS.md, marginTop: SPACING[4],
  },
  saveBtnText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base },
});
