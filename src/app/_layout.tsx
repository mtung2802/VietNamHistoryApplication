import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { useEffect } from 'react';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from '@expo-google-fonts/playfair-display';
import {
  useFonts as useNunito,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

SplashScreen.preventAutoHideAsync();

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
        {/* Đăng nhập / Đăng ký */}
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
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

        {/* ── Hồ Sơ ─────────────────────────────────────────── */}
        <Stack.Screen name="profile-overview/index" />
        <Stack.Screen name="edit-profile/index" />
        <Stack.Screen name="user-profile/[userId]" />

        {/* ── Diễn đàn ────────────────────────────────────────── */}
        <Stack.Screen name="forum/index" />
        <Stack.Screen name="forum/[postId]" />
        <Stack.Screen name="forum/create" />

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
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });

  const [nunitoLoaded] = useNunito({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (playfairLoaded && nunitoLoaded) {
      SplashScreen.hideAsync();
    }
  }, [playfairLoaded, nunitoLoaded]);

  if (!playfairLoaded || !nunitoLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <GamificationProvider>
            <RootNavigator />
          </GamificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
