import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';

function RootNavigator() {
  const { colors, isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Splash */}
        <Stack.Screen name="index" />
        {/* Tab navigator */}
        <Stack.Screen name="(tabs)" />

        {/* ── Luồng Lịch Sử ─────────────────────────────────── */}
        <Stack.Screen name="period-detail/[periodSlug]/index" />
        <Stack.Screen name="stage/[periodSlug]" />
        <Stack.Screen name="stage-detail/[periodSlug]/[stageSlug]/index" />
        <Stack.Screen name="event/[periodSlug]/[stageSlug]/[eventSlug]/index" />

        {/* ── Nhân Vật ──────────────────────────────────────── */}
        <Stack.Screen name="person-list/[periodSlug]/index" />
        <Stack.Screen name="person/[periodSlug]/[personSlug]/index" />
        <Stack.Screen name="person-event/[periodSlug]/[personSlug]/[eventSlug]/index" />

        {/* ── Hồ Sơ & Forum ─────────────────────────────────── */}
        <Stack.Screen name="profile-overview/index" />
        <Stack.Screen name="edit-profile/index" />
        <Stack.Screen name="forum/index" />
        <Stack.Screen name="forum/[postId]" />
        <Stack.Screen name="forum/new" />

        {/* ── Game ──────────────────────────────────────────── */}
        <Stack.Screen name="quiz/[quizSlug]/index" />
        <Stack.Screen name="timeline/[eraId]/index" />

        {/* ── Khám Phá ──────────────────────────────────────── */}
        <Stack.Screen name="explore/article/index" />
        <Stack.Screen name="explore/museum/index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
