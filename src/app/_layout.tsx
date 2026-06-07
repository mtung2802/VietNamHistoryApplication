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
        <Stack.Screen name="stage/[periodSlug]" />
        <Stack.Screen name="stage-detail/[periodSlug]/[stageSlug]" />
        <Stack.Screen name="event/[periodSlug]/[stageSlug]/[eventSlug]" />

        {/* ── Nhân Vật ──────────────────────────────────────── */}
        <Stack.Screen name="person-list/[periodSlug]" />
        <Stack.Screen name="person/[periodSlug]/[personSlug]" />
        <Stack.Screen name="person-event/[periodSlug]/[personSlug]/[eventSlug]" />

        {/* ── Hồ Sơ & Forum ─────────────────────────────────── */}
        <Stack.Screen name="profile-overview/index" />
        <Stack.Screen name="edit-profile/index" />
        <Stack.Screen name="forum/index" />
        <Stack.Screen name="forum/[postId]" />
        <Stack.Screen name="forum/new" />
        <Stack.Screen name="forum/edit/[postId]" />

        {/* ── Game ──────────────────────────────────────────── */}
        <Stack.Screen name="quiz/[quizSlug]/index" />
        <Stack.Screen name="quiz/[quizSlug]/play" />
        <Stack.Screen name="quiz/[quizSlug]/result" />
        <Stack.Screen name="timeline/[eraId]/index" />
        <Stack.Screen name="timeline/[eraId]/play" />

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
