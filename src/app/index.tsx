/**
 * Màn splash / chào mừng.
 * Kiểm tra trạng thái đăng nhập khi ấn nút:
 * - Đã đăng nhập → vào app (tabs)
 * - Chưa đăng nhập → màn đăng nhập (auth)
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user, isLoading } = useAuth();

  // Hàm xử lý khi người dùng chủ động ấn nút "Khám phá ngay"
  const handleNavigate = () => {
    if (isLoading) return; // Đợi load xong auth data nếu chưa xong

    if (user) {
      router.replace('/(tabs)/period');
    } else {
      router.replace('/auth');
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.inner}>
        <View
          style={[
            styles.emblem,
            { borderColor: colors.primary, backgroundColor: colors.primaryDim },
          ]}
        >
          <Ionicons name="flag" size={56} color={colors.secondary} />
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>Lịch Sử Việt Nam</Text>
        <View style={[styles.divider, { backgroundColor: colors.primary }]} />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Hành trình 4000 năm dựng nước và giữ nước
        </Text>
      </View>

      <View style={styles.footer}>
        {isLoading ? (
          // Hiển thị loading nếu hệ thống đang kiểm tra trạng thái đăng nhập
          <View style={{ alignItems: 'center', gap: SPACING[2] }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          // Hiển thị nút bấm khi đã sẵn sàng
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleNavigate}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Khám Phá Ngay</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING[16] },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING[6] },
  emblem: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 64,
    height: 3,
    borderRadius: 2,
    marginVertical: SPACING[4],
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    paddingHorizontal: SPACING[6],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
  },
  // Thêm style cho nút bấm mới
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[6],
    borderRadius: 25,
    gap: SPACING[2],
    width: '80%', // Hoặc tùy chỉnh độ rộng theo thiết kế của bạn
    // Đổ bóng nhẹ cho nút
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
});