/**
 * Danh sách nhân vật trong một thời kỳ.
 * Port từ PersonListActivity.java.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  Fonts,
  SPACING,
  SuVietColors,
  ThemeColors,
} from '@/constants/theme';
import { useThemeColors, useThemeContext } from '@/contexts/ThemeContext';
import { PersonListItem } from '@/models/Person';
import { getPersonsByPeriod } from '@/services/personService';
import {
  EmptyState,
  ErrorState,
  HistoryImage,
  LoadingState,
  Screen,
  useTopInset,
} from '@/components/ui';

type VintagePalette = {
  paper: string;
  paperDeep: string;
  hero: string;
  heroText: string;
  panel: string;
  panelAlt: string;
  ink: string;
  mutedInk: string;
  gold: string;
  goldDark: string;
  goldSoft: string;
  sepia: string;
  rail: string;
  shadow: string;
  whiteWash: string;
};

function getVintagePalette(colors: ThemeColors, isDark: boolean): VintagePalette {
  if (isDark) {
    return {
      paper: '#1F1714',
      paperDeep: '#34261F',
      hero: SuVietColors.son2,
      heroText: '#F6E9CF',
      panel: '#2A201A',
      panelAlt: '#34261F',
      ink: colors.text,
      mutedInk: colors.textSecondary,
      gold: SuVietColors.sao,
      goldDark: SuVietColors.dong,
      goldSoft: 'rgba(233, 196, 106, 0.20)',
      sepia: SuVietColors.dong,
      rail: 'rgba(233, 196, 106, 0.52)',
      shadow: colors.black,
      whiteWash: 'rgba(246, 233, 207, 0.08)',
    };
  }

  return {
    paper: SuVietColors.giay,
    paperDeep: SuVietColors.rulesBg,
    hero: SuVietColors.son,
    heroText: '#F6E9CF',
    panel: SuVietColors.card,
    panelAlt: SuVietColors.rulesBg,
    ink: SuVietColors.muc,
    mutedInk: SuVietColors.muc2,
    gold: SuVietColors.dong,
    goldDark: SuVietColors.son,
    goldSoft: 'rgba(180, 155, 107, 0.20)',
    sepia: SuVietColors.dong,
    rail: 'rgba(180, 155, 107, 0.58)',
    shadow: SuVietColors.shadowSon,
    whiteWash: 'rgba(246, 233, 207, 0.12)',
  };
}

function formatLifeRange(person: PersonListItem) {
  const birth = person.birthDate || person.birth_year;
  const death = person.deathDate || person.death_year;

  if (birth && death) return `${birth} - ${death}`;
  if (birth) return `Sinh ${birth}`;
  if (death) return `Mất ${death}`;
  return 'Chưa rõ niên đại';
}

function DecorativeHeader() {
  const colors = useThemeColors();
  const { isDark, toggleTheme } = useThemeContext();
  const router = useRouter();
  const topInset = useTopInset();
  const palette = getVintagePalette(colors, isDark);
  const canBack = router.canGoBack();

  return (
    <View
      style={[
        styles.hero,
        {
          paddingTop: topInset + SPACING[2],
          backgroundColor: palette.hero,
          borderBottomColor: palette.gold,
          shadowColor: palette.shadow,
        },
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View
          style={[
            styles.heroCircleLarge,
            { borderColor: palette.goldSoft, backgroundColor: palette.whiteWash },
          ]}
        />
        <View style={[styles.heroCircleSmall, { borderColor: palette.goldSoft }]} />
        <View style={[styles.heroDiagonal, { backgroundColor: palette.goldSoft }]} />
      </View>

      <View style={styles.heroNav}>
        {canBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.heroIconButton, { backgroundColor: palette.goldSoft }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={23} color={palette.heroText} />
          </TouchableOpacity>
        ) : (
          <View style={styles.heroIconSpacer} />
        )}

        <View
          style={[
            styles.heroBadge,
            { borderColor: palette.gold, backgroundColor: palette.panel },
          ]}
        >
          <Ionicons name="hourglass-outline" size={15} color={palette.goldDark} />
          <Text style={[styles.heroBadgeText, { color: palette.goldDark }]}>
            Dòng thời gian
          </Text>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.heroIconButton, { backgroundColor: palette.goldSoft }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={21}
            color={palette.heroText}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.heroTitleRow}>
        <View
          style={[
            styles.heroStamp,
            { backgroundColor: palette.gold, borderColor: palette.goldDark },
          ]}
        >
          <Ionicons name="compass-outline" size={31} color={palette.heroText} />
        </View>

        <View style={styles.heroCopy}>
          <Text style={[styles.heroKicker, { color: palette.gold }]}>
            Danh sách theo thời kỳ
          </Text>
          <Text style={[styles.heroTitle, { color: palette.heroText }]} numberOfLines={2}>
            NHÂN VẬT LỊCH SỬ
          </Text>
        </View>
      </View>

      <View style={styles.heroRuleRow}>
        <View style={[styles.heroRule, { backgroundColor: palette.gold }]} />
        <View style={[styles.heroRuleDot, { borderColor: palette.gold }]} />
        <View style={[styles.heroRule, { backgroundColor: palette.gold }]} />
      </View>
    </View>
  );
}

function BackgroundOrnaments({ palette }: { palette: VintagePalette }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[styles.paperPatchTop, { backgroundColor: palette.paperDeep }]} />
      <View style={[styles.paperPatchBottom, { borderColor: palette.goldSoft }]} />
      <View style={[styles.paperCircle, { borderColor: palette.goldSoft }]} />
      <View style={[styles.paperSlash, { backgroundColor: palette.goldSoft }]} />
    </View>
  );
}

function TimelineRail({ index, palette }: { index: number; palette: VintagePalette }) {
  return (
    <View style={styles.railWrap}>
      <View style={[styles.railLine, { backgroundColor: palette.rail }]} />
      <View
        style={[
          styles.railNodeOuter,
          { borderColor: palette.gold, backgroundColor: palette.paper },
        ]}
      >
        <View
          style={[
            styles.railNodeInner,
            { backgroundColor: index % 2 === 0 ? palette.gold : palette.sepia },
          ]}
        />
      </View>
    </View>
  );
}

function PersonTimelineCard({
  item,
  index,
  onPress,
}: {
  item: PersonListItem;
  index: number;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const { isDark } = useThemeContext();
  const palette = getVintagePalette(colors, isDark);
  const imageUri = item.coverMediaRef || item.horizontalImage;
  const isEven = index % 2 === 0;

  return (
    <View style={styles.timelineItem}>
      <TimelineRail index={index} palette={palette} />
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[
          styles.timelineCard,
          isEven ? styles.timelineCardEven : styles.timelineCardOdd,
          {
            backgroundColor: isEven ? palette.panel : palette.panelAlt,
            borderColor: palette.goldSoft,
            shadowColor: palette.shadow,
          },
        ]}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <View style={[styles.cardCornerMark, { borderColor: palette.goldSoft }]} />
          <View style={[styles.cardDiagonal, { backgroundColor: palette.goldSoft }]} />
        </View>

        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.yearPill,
              { backgroundColor: palette.goldSoft, borderColor: palette.gold },
            ]}
          >
            <Ionicons name="time-outline" size={13} color={palette.goldDark} />
            <Text style={[styles.yearText, { color: palette.goldDark }]} numberOfLines={1}>
              {formatLifeRange(item)}
            </Text>
          </View>

          <View style={[styles.chevronBubble, { backgroundColor: palette.goldSoft }]}>
            <Ionicons name="chevron-forward" size={18} color={palette.goldDark} />
          </View>
        </View>

        <View style={styles.cardMainRow}>
          <View
            style={[
              styles.portraitFrame,
              { borderColor: palette.gold, backgroundColor: palette.paper },
            ]}
          >
            <HistoryImage
              uri={imageUri}
              style={styles.avatar}
              radius={BORDER_RADIUS.full}
              fallbackIcon="person-outline"
            />
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.name, { color: palette.ink }]} numberOfLines={2}>
              {item.name || 'Không có tên'}
            </Text>
            <View style={[styles.nameRule, { backgroundColor: palette.gold }]} />
            <Text style={[styles.title, { color: palette.goldDark }]} numberOfLines={2}>
              {item.title || 'Không có tiêu đề'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function PersonSearch({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const colors = useThemeColors();
  const { isDark } = useThemeContext();
  const palette = getVintagePalette(colors, isDark);

  return (
    <View
      style={[
        styles.searchBar,
        { borderColor: palette.goldSoft, backgroundColor: palette.whiteWash },
      ]}
    >
      <Ionicons name="search-outline" size={19} color={palette.goldDark} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Tìm kiếm nhân vật..."
        placeholderTextColor={palette.mutedInk}
        style={[styles.searchInput, { color: palette.ink }]}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Tìm kiếm nhân vật"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Xóa nội dung tìm kiếm"
        >
          <Ionicons name="close-circle" size={19} color={palette.goldDark} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PersonListScreen() {
  const { periodSlug } = useLocalSearchParams<{ periodSlug?: string }>();
  const periodId = useMemo(() => (typeof periodSlug === 'string' ? periodSlug : ''), [periodSlug]);
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useThemeContext();
  const palette = getVintagePalette(colors, isDark);

  const [persons, setPersons] = useState<PersonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersons = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('vi')
        .replace(/đ/g, 'd');
    const query = normalize(searchQuery.trim());

    if (!query) return persons;

    return persons.filter((person) =>
      normalize(person.name || '').includes(query),
    );
  }, [persons, searchQuery]);

  const load = useCallback(async (isRefresh = false) => {
    if (!periodId) {
      setError('Không tìm thấy thời kỳ nhân vật.');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setPersons(await getPersonsByPeriod(periodId));
    } catch {
      setError('Không thể tải danh sách nhân vật.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen style={{ backgroundColor: palette.paper }}>
      <BackgroundOrnaments palette={palette} />
      <DecorativeHeader />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={filteredPersons}
          keyExtractor={(person) => person.id}
          renderItem={({ item, index }: ListRenderItemInfo<PersonListItem>) => (
            <PersonTimelineCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/person/[periodSlug]/[personSlug]',
                  params: { periodSlug: periodId, personSlug: item.id },
                })
              }
            />
          )}
          ListHeaderComponent={<PersonSearch value={searchQuery} onChangeText={setSearchQuery} />}
          contentContainerStyle={[styles.list, filteredPersons.length === 0 && styles.emptyList]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[palette.gold]}
              tintColor={palette.gold}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              message={
                searchQuery.trim()
                  ? 'Không tìm thấy nhân vật phù hợp.'
                  : 'Chưa có nhân vật nào trong thời kỳ này.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
    borderBottomWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  heroNav: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconSpacer: {
    width: 36,
    height: 36,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING[3],
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    marginTop: SPACING[2],
  },
  heroStamp: {
    width: 54,
    height: 54,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroKicker: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.extrabold,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 3,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.black,
    fontFamily: Fonts.serifExtraBold,
    lineHeight: 27,
  },
  heroRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[3],
  },
  heroRule: {
    flex: 1,
    height: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  heroRuleDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
  },
  heroCircleLarge: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 1,
    top: -58,
    right: -36,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    bottom: 18,
    left: -22,
  },
  heroDiagonal: {
    position: 'absolute',
    width: 220,
    height: 14,
    right: -54,
    bottom: 28,
    transform: [{ rotate: '-29deg' }],
  },
  paperPatchTop: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: 134,
    right: -86,
    opacity: 0.55,
  },
  paperPatchBottom: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    left: -116,
    bottom: 52,
  },
  paperCircle: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    right: 22,
    bottom: 210,
  },
  paperSlash: {
    position: 'absolute',
    width: 2,
    height: 540,
    right: 68,
    top: 228,
    transform: [{ rotate: '18deg' }],
  },
  list: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[8],
    gap: SPACING[3],
  },
  emptyList: {
    flexGrow: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    minHeight: 44,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING[3],
    marginBottom: SPACING[2],
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: Fonts.regular,
    paddingVertical: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 142,
  },
  railWrap: {
    width: 32,
    alignItems: 'center',
    marginRight: SPACING[2],
  },
  railLine: {
    position: 'absolute',
    top: -SPACING[3],
    bottom: -SPACING[3],
    width: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  railNodeOuter: {
    width: 23,
    height: 23,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING[5],
  },
  railNodeInner: {
    width: 9,
    height: 9,
    borderRadius: BORDER_RADIUS.full,
  },
  timelineCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[3],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineCardEven: {
    marginRight: SPACING[1],
  },
  timelineCardOdd: {
    marginLeft: SPACING[2],
  },
  cardCornerMark: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    right: -28,
    top: -31,
  },
  cardDiagonal: {
    position: 'absolute',
    width: 132,
    height: 10,
    right: -28,
    bottom: 15,
    transform: [{ rotate: '-19deg' }],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  },
  yearPill: {
    flexShrink: 1,
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING[2],
  },
  yearText: {
    flexShrink: 1,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: Fonts.bold,
  },
  chevronBubble: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  portraitFrame: {
    width: 84,
    height: 84,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.full,
  },
  cardBody: {
    flex: 1,
    gap: SPACING[1],
    minWidth: 0,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.black,
    fontFamily: Fonts.serifExtraBold,
    lineHeight: 23,
  },
  nameRule: {
    width: 44,
    height: 2,
    borderRadius: BORDER_RADIUS.full,
    marginVertical: 2,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
});
