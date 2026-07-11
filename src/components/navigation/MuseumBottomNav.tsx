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
  background: '#34261F',
  border: 'rgba(180, 155, 107, 0.24)',
  inactive: '#D6C5AA',
  active: '#E9C46A',
  activeBackground: 'rgba(233, 196, 106, 0.16)',
  centerBackground: 'rgba(233, 196, 106, 0.16)',
  centerBorder: 'rgba(233, 196, 106, 0.30)',
};

const LIGHT_MENU = {
  background: '#FDF8EC',
  border: 'rgba(101, 19, 16, 0.12)',
  inactive: '#7D6D5C',
  active: '#82151B',
  activeBackground: 'rgba(130, 21, 27, 0.10)',
  centerBackground: 'rgba(180, 155, 107, 0.18)',
  centerBorder: 'rgba(180, 155, 107, 0.38)',
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
  const menuColors = isDark ? DARK_MENU : LIGHT_MENU;
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
  const menuColors = isDark ? DARK_MENU : LIGHT_MENU;
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
    shadowColor: 'rgba(101,19,16,1)',
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
