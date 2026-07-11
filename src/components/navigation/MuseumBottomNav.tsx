import React, { useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemeContext';

export type MuseumNavKey = 'periods' | 'people' | 'games' | 'chat' | 'profile';

type MuseumBottomNavProps = {
  activeKey: MuseumNavKey;
  style?: StyleProp<ViewStyle>;
};

type NavItemConfig = {
  key: MuseumNavKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
};

export const MUSEUM_BOTTOM_NAV_HEIGHT = 62;
export const MUSEUM_BOTTOM_NAV_CONTENT_SPACE = 92;

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'periods', label: 'Thời kỳ', icon: 'library-outline', href: '/(tabs)/period' },
  { key: 'people', label: 'Nhân vật', icon: 'people-outline', href: '/(tabs)/person' },
  { key: 'games', label: 'Trò chơi', icon: 'game-controller-outline', href: '/(tabs)/game' },
  { key: 'chat', label: 'Chat AI', icon: 'chatbubble-ellipses-outline', href: '/(tabs)/explore' },
  { key: 'profile', label: 'Hồ sơ', icon: 'person-outline', href: '/(tabs)/profile' },
];

const DARK_MENU = {
  background: '#2F2A24',
  border: 'rgba(255, 244, 216, 0.14)',
  inactive: '#E8DCC8',
  active: '#D6A84F',
  activeBackground: 'rgba(214, 168, 79, 0.18)',
  centerBackground: 'rgba(214, 168, 79, 0.18)',
  centerBorder: 'rgba(214, 168, 79, 0.28)',
};

const BEIGE_MENU = {
  background: '#FFF4E6',
  border: 'rgba(92, 81, 70, 0.22)',
  inactive: '#5C5146',
  active: '#B8860B',
  activeBackground: 'rgba(184, 134, 11, 0.16)',
  centerBackground: 'rgba(184, 134, 11, 0.12)',
  centerBorder: 'rgba(184, 134, 11, 0.30)',
};

function MuseumNavItem({
  item,
  active,
  onPress,
}: {
  item: NavItemConfig;
  active: boolean;
  onPress: () => void;
}) {
  const { isDark } = useThemeContext();
  const menuColors = isDark ? BEIGE_MENU : DARK_MENU;
  const pressScale = useSharedValue(1);
  const activeProgress = useSharedValue(active ? 1 : 0);
  const isCenter = item.key === 'games';

  useEffect(() => {
    activeProgress.value = withTiming(active ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, activeProgress]);

  const itemAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const activeBackgroundStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [{ scale: interpolate(activeProgress.value, [0, 1], [0.72, 1]) }],
  }));

  const handlePress = () => {
    pressScale.value = withSequence(
      withTiming(0.9, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onPress)();
      }),
    );
  };

  return (
    <Animated.View style={[styles.itemSlot, itemAnimatedStyle]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        hitSlop={6}
        onPress={handlePress}
        style={[
          styles.navItem,
          isCenter && styles.centerItem,
          isCenter && {
            backgroundColor: menuColors.centerBackground,
            borderColor: menuColors.centerBorder,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.activeBackground,
            { backgroundColor: menuColors.activeBackground },
            activeBackgroundStyle,
          ]}
        />
        <Ionicons
          name={item.icon}
          size={active ? 24 : 23}
          color={active ? menuColors.active : menuColors.inactive}
        />
      </Pressable>
    </Animated.View>
  );
}

export function MuseumBottomNav({ activeKey, style }: MuseumBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeContext();
  const menuColors = isDark ? BEIGE_MENU : DARK_MENU;
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [entrance]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: interpolate(entrance.value, [0, 1], [24, 0]) }],
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + 12,
          backgroundColor: menuColors.background,
          borderColor: menuColors.border,
        },
        entranceStyle,
        style,
      ]}
    >
      {NAV_ITEMS.map((item) => (
        <MuseumNavItem
          key={item.key}
          item={item}
          active={item.key === activeKey}
          onPress={() => router.replace(item.href)}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: MUSEUM_BOTTOM_NAV_HEIGHT,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 14,
  },
  itemSlot: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerItem: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
});
