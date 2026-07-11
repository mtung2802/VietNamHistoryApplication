import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { HistoryImage } from '@/components/ui';
import { BORDER_RADIUS, FONT_WEIGHTS } from '@/constants/theme';
import { Stage } from '@/models/Stage';
import { formatYear, yearFromIso } from '@/models/Period';
import { getPrimaryImageRef } from '@/utils/media';
import { TimelineLine } from './TimelineLine';
import { useTimelineColors } from './theme';

type TimelineItemProps = {
  item: Stage;
  index: number;
  width: number;
  isLast: boolean;
  onPress: () => void;
};

// Nhịp chung: line chạm dot, nội dung hiện, rồi mới nối sang mốc sau.
const TIMELINE_STEP_DURATION = 620;
const LINE_DRAW_DURATION = 520;

function getYearLabel(item: Stage) {
  if (item.yearRange?.trim()) return item.yearRange.trim();
  if (item.dateRange?.trim()) return item.dateRange.trim();

  if (item.startYear != null || item.endYear != null) {
    const start = item.startYear != null ? String(item.startYear) : 'N/A';
    const end = item.endYear != null ? String(item.endYear) : 'N/A';
    return start === end ? start : `${start} — ${end}`;
  }

  const start = formatYear(yearFromIso(item.startDate));
  const end = formatYear(yearFromIso(item.endDate));
  if (start === 'N/A' && end === 'N/A') return 'Chưa rõ niên đại';
  return start === end ? start : `${start} — ${end}`;
}

function TimelineItemComponent({ item, index, width, isLast, onPress }: TimelineItemProps) {
  const timelineColors = useTimelineColors();
  const compact = width < 390;
  const even = index % 2 === 0;
  const horizontalPadding = 20;
  const availableWidth = width - horizontalPadding * 2;
  const timelineColumnWidth = availableWidth * 0.12;
  const sideColumnWidth = (availableWidth - timelineColumnWidth) / 2;
  const imageHeight = Math.min(150, width * 0.34);
  const itemGap = compact ? 44 : 52;
  const itemHeight = imageHeight + itemGap;
  const timelineX = width / 2;
  const dotSize = compact ? 26 : 28;
  const dotTop = (imageHeight - dotSize) / 2;
  const lineDelay = index * TIMELINE_STEP_DURATION;
  const dotDelay = lineDelay + Math.round(LINE_DRAW_DURATION * 0.4);
  const entryDelay = dotDelay + 50;

  const progress = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const imageProgress = useSharedValue(0);
  const dateProgress = useSharedValue(0);
  const titleProgress = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      entryDelay,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    imageProgress.value = withDelay(
      entryDelay + 40,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    dateProgress.value = withDelay(
      entryDelay + 80,
      withTiming(1, { duration: 430, easing: Easing.out(Easing.cubic) }),
    );
    titleProgress.value = withDelay(
      entryDelay + 160,
      withTiming(1, { duration: 430, easing: Easing.out(Easing.cubic) }),
    );
    dotScale.value = withDelay(
      dotDelay,
      withSequence(
        withTiming(1.24, { duration: 220, easing: Easing.out(Easing.back(1.8)) }),
        withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      ),
    );
  }, [dateProgress, dotDelay, dotScale, entryDelay, imageProgress, progress, titleProgress]);

  const itemAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [30, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.96, 1]) * pressScale.value },
    ],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageProgress.value,
    transform: [{ scale: interpolate(imageProgress.value, [0, 1], [1.04, 1]) }],
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const dateAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dateProgress.value,
    transform: [
      { translateX: interpolate(dateProgress.value, [0, 1], [even ? 18 : -18, 0]) },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleProgress.value,
    transform: [
      { translateX: interpolate(titleProgress.value, [0, 1], [even ? 14 : -14, 0]) },
    ],
  }));

  const handlePress = () => {
    pressScale.value = withSequence(
      withTiming(0.98, { duration: 90 }),
      withTiming(1, { duration: 130 }, (finished) => {
        if (finished) runOnJS(onPress)();
      }),
    );
  };

  const imageUri = getPrimaryImageRef(item) ?? item.thumbnail ?? item.image;

  return (
    <View style={[styles.item, { width, height: itemHeight }]}>
      <TimelineLine
        x={timelineX}
        height={isLast ? dotTop + dotSize / 2 : itemHeight}
        delay={lineDelay}
        duration={LINE_DRAW_DURATION}
      />

      <Animated.View
        style={[
          styles.contentLayer,
          itemAnimatedStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Xem chi tiết ${item.title}`}
          onPress={handlePress}
          style={[
            styles.row,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: itemGap,
              flexDirection: even ? 'row' : 'row-reverse',
            },
          ]}
        >
          <View
            style={[
              styles.imageFrame,
              {
                width: sideColumnWidth,
                height: imageHeight,
                backgroundColor: timelineColors.paper,
                borderColor: timelineColors.border,
                shadowColor: timelineColors.brown,
                transform: [{ rotate: even ? '-1deg' : '1deg' }],
              },
            ]}
          >
            <Animated.View style={[styles.imageAnimatedWrap, imageAnimatedStyle]}>
              <HistoryImage
                uri={imageUri}
                style={styles.image}
                radius={BORDER_RADIUS.lg}
                fallbackIcon="image-outline"
              />
            </Animated.View>
            <View
              style={[
                styles.tape,
                { backgroundColor: timelineColors.tape },
                even ? styles.tapeLeft : styles.tapeRight,
              ]}
            />
          </View>

          <View style={{ width: timelineColumnWidth }} />

          <View
            style={[
              styles.textBlock,
              {
                width: sideColumnWidth,
                alignItems: even ? 'flex-start' : 'flex-end',
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.year,
                {
                  color: timelineColors.gold,
                  fontSize: compact ? 21 : 24,
                  lineHeight: compact ? 26 : 30,
                  textAlign: even ? 'left' : 'right',
                },
                dateAnimatedStyle,
              ]}
            >
              {getYearLabel(item)}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.title,
                {
                  color: timelineColors.deepRed,
                  fontSize: compact ? 18 : 21,
                  lineHeight: compact ? 23 : 27,
                  textAlign: even ? 'left' : 'right',
                },
                titleAnimatedStyle,
              ]}
            >
              {item.title || 'Giai đoạn lịch sử'}
            </Animated.Text>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.dot,
          {
            left: timelineX - dotSize / 2,
            top: dotTop,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: timelineColors.paper,
            borderColor: timelineColors.gold,
            shadowColor: timelineColors.brown,
          },
          dotAnimatedStyle,
        ]}
      >
        <View style={[styles.dotCenter, { backgroundColor: timelineColors.primaryRed }]} />
      </Animated.View>
    </View>
  );
}

export const TimelineItem = memo(TimelineItemComponent);

const styles = StyleSheet.create({
  item: {
    position: 'relative',
    alignSelf: 'center',
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flex: 1,
    alignItems: 'center',
  },
  imageFrame: {
    padding: 4,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
  },
  imageAnimatedWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tape: {
    position: 'absolute',
    top: -8,
    width: 54,
    height: 18,
  },
  tapeLeft: {
    left: 20,
    transform: [{ rotate: '-5deg' }],
  },
  tapeRight: {
    right: 20,
    transform: [{ rotate: '5deg' }],
  },
  textBlock: {
    minWidth: 0,
    justifyContent: 'center',
  },
  year: {
    fontWeight: FONT_WEIGHTS.black,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: FONT_WEIGHTS.black,
  },
  dot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 3,
  },
  dotCenter: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});
