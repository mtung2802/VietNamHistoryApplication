import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTimelineColors } from './theme';

type TimelineLineProps = {
  x: number;
  height: number;
  delay: number;
  duration?: number;
};

export function TimelineLine({ x, height, delay, duration = 900 }: TimelineLineProps) {
  const timelineColors = useTimelineColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height * progress.value,
  }), [height]);

  return (
    <View pointerEvents="none" style={[styles.track, { left: x - 6, height }]}>
      <Animated.View
        style={[styles.line, { backgroundColor: timelineColors.line }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    width: 12,
    alignItems: 'center',
    zIndex: 0,
  },
  line: {
    width: 2,
  },
});
