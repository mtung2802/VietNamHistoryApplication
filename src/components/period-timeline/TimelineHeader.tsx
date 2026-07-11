import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useTimelineColors } from './theme';

type TimelineHeaderProps = {
  title: string;
  stageCount?: number;
  onBack: () => void;
};

export function TimelineHeader({ title, stageCount, onBack }: TimelineHeaderProps) {
  const { isDark, toggleTheme } = useThemeContext();
  const timelineColors = useTimelineColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: -16 * (1 - progress.value) }],
  }));

  return (
    <Animated.View
      style={[styles.header, { backgroundColor: timelineColors.background }, animatedStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [
          styles.headerButton,
          {
            backgroundColor: timelineColors.paper,
            borderColor: timelineColors.border,
            shadowColor: timelineColors.brown,
          },
          pressed && styles.headerButtonPressed,
        ]}
      >
        <Ionicons name="chevron-back" size={24} color={timelineColors.deepRed} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
        onPress={toggleTheme}
        hitSlop={10}
        style={({ pressed }) => [
          styles.headerButton,
          styles.themeButton,
          {
            backgroundColor: timelineColors.paper,
            borderColor: timelineColors.border,
            shadowColor: timelineColors.brown,
          },
          pressed && styles.headerButtonPressed,
        ]}
      >
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={22}
          color={timelineColors.gold}
        />
      </Pressable>

      <View style={styles.titleGroup}>
        <Text style={[styles.eyebrow, { color: timelineColors.gold }]}>
          DÒNG THỜI GIAN{stageCount != null ? `  •  ${stageCount} GIAI ĐOẠN` : ''}
        </Text>
        <Text style={[styles.title, { color: timelineColors.deepRed }]} numberOfLines={2}>
          {title}
        </Text>
      </View>

      <View style={styles.rule}>
        <View style={[styles.ruleLine, { backgroundColor: timelineColors.line }]} />
        <View style={[styles.ruleDiamond, { backgroundColor: timelineColors.primaryRed }]} />
        <View style={[styles.ruleLine, { backgroundColor: timelineColors.line }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[3],
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  themeButton: {
    position: 'absolute',
    top: SPACING[3],
    right: SPACING[5],
  },
  titleGroup: {
    marginTop: SPACING[3],
  },
  eyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  title: {
    fontFamily: 'serif',
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 30,
    marginTop: SPACING[1],
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING[3],
  },
  ruleLine: {
    flex: 1,
    height: 1,
    opacity: 0.55,
  },
  ruleDiamond: {
    width: 7,
    height: 7,
    marginHorizontal: SPACING[2],
    transform: [{ rotate: '45deg' }],
  },
});
