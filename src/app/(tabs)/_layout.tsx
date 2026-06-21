import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useThemeColors } from '@/contexts/ThemeContext';
import { FONT_WEIGHTS } from '@/constants/theme';

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      initialRouteName="period"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.select({ ios: 86, android: 64 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: 28, android: 8 }),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: FONT_WEIGHTS.semibold },
      }}
    >
      <Tabs.Screen
        name="period"
        options={{
          title: 'Thời kỳ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="person"
        options={{
          title: 'Nhân vật',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Trò chơi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
