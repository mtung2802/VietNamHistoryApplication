/**
 * Màn splash / chào mừng.
 * Tông charcoal premium + điểm nhấn gold.
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/contexts/ThemeContext';
import { Screen, Button } from '@/components/ui';

export default function SplashScreen() {
  const router = useRouter();
  const colors = useThemeColors();

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
        <Button
          label="Bắt đầu khám phá"
          icon="arrow-forward"
          size="lg"
          onPress={() => router.replace('/(tabs)/period')}
        />
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
  footer: { width: '100%', paddingHorizontal: SPACING[6] },
});
