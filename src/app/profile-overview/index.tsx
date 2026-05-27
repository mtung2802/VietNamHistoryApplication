/**
 * Trang hồ sơ sau khi đăng nhập
 * Route: /profile-overview
 * Tương đương: ProfileOverviewFragment.java
 */

import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

// Simple in-memory session (replace with AsyncStorage / Context as needed)
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileOverviewScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; photo?: string; username?: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('currentUser').then((raw) => {
      if (raw) setUser(JSON.parse(raw));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    router.replace('/(tabs)/profile');
  };

  const MenuItem = ({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ Sơ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.accent} />

        {/* Avatar + info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name ?? user?.username ?? 'Người dùng'}</Text>
          {!!user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <MenuItem emoji="✏️" label="Chỉnh sửa hồ sơ" onPress={() => router.push('/edit-profile')} />
          <MenuItem emoji="💬" label="Diễn đàn" onPress={() => router.push('/forum')} />
          <MenuItem emoji="🚪" label="Đăng xuất" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
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

  profileSection: { alignItems: 'center', paddingVertical: SPACING[6] },
  avatarWrapper: { marginBottom: SPACING[3] },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: COLORS.accent },
  avatarPlaceholder: { backgroundColor: '#fce8e8', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900 },
  userEmail: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: 4 },

  menuSection: { marginHorizontal: SPACING[4], gap: SPACING[2] },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING[3],
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[4], ...SHADOWS.sm,
  },
  menuEmoji: { fontSize: 22 },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.base, color: COLORS.gray800, fontWeight: FONT_WEIGHTS.medium },
  menuArrow: { color: COLORS.primary, fontSize: 22 },
});
