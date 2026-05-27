/**
 * Chi tiết nhân vật
 * Route: /person/[periodSlug]/[personSlug]
 * Tương đương: PersonDetailActivity.java
 *
 * Sections (accordion): Thành tựu, Tóm tắt cuộc đời, Sự kiện tham gia
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Animated, Image, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PersonDetail, PersonEvent } from '@/models/Person';
import { getPersonDetail, getPersonEvents } from '@/services/personService';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SHADOWS, SPACING } from '@/constants/theme';

// ── Accordion Section ────────────────────────────────────────────────────────
function AccordionSection({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={accStyles.container}>
      <TouchableOpacity style={accStyles.header} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={accStyles.title}>{title}</Text>
        <Text style={[accStyles.arrow, open && accStyles.arrowOpen]}>›</Text>
      </TouchableOpacity>
      {open && <View style={accStyles.body}>{children}</View>}
    </View>
  );
}

const accStyles = StyleSheet.create({
  container: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING[4] },
  title: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray800 },
  arrow: { fontSize: 24, color: COLORS.primary, transform: [{ rotate: '0deg' }] },
  arrowOpen: { transform: [{ rotate: '90deg' }] },
  body: { paddingHorizontal: SPACING[4], paddingBottom: SPACING[4], gap: 8 },
});

// ── Bullet list ────────────────────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function PersonDetailScreen() {
  const { periodSlug, personSlug } = useLocalSearchParams<{ periodSlug: string; personSlug: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [events, setEvents] = useState<PersonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!periodSlug || !personSlug) return;
    try {
      setLoading(true);
      setError(null);
      const [p, evs] = await Promise.all([
        getPersonDetail(periodSlug, personSlug),
        getPersonEvents(periodSlug, personSlug),
      ]);
      setPerson(p);
      setEvents(evs);
    } catch {
      setError('Không thể tải thông tin nhân vật.');
    } finally {
      setLoading(false);
    }
  }, [periodSlug, personSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (error || !person) return (
    <View style={styles.centered}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Text style={{ fontSize: 48 }}>⚠️</Text>
      <Text style={styles.errorText}>{error ?? 'Không tìm thấy nhân vật'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={load}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const imageUri = person.horizontalImage || person.coverMediaRef;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle} numberOfLines={1}>{person.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Banner image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder]}>
            <Text style={{ fontSize: 72 }}>👑</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Name + title */}
          <Text style={styles.name}>{person.name}</Text>
          {!!person.title && <Text style={styles.personTitle}>{person.title}</Text>}
          {(person.birth_year || person.death_year) && (
            <Text style={styles.lifespan}>
              {person.birth_year ?? '?'} – {person.death_year ?? '?'}
              {person.hometown ? ` · ${person.hometown}` : ''}
            </Text>
          )}

          {/* Overview */}
          {!!person.overview && (
            <View style={styles.overviewCard}>
              <Text style={styles.overviewText}>{person.overview}</Text>
            </View>
          )}

          {/* Accordion: Thành tựu */}
          {person.achievements?.length ? (
            <AccordionSection title="🏆 Thành tựu">
              <BulletList items={person.achievements} />
            </AccordionSection>
          ) : null}

          {/* Accordion: Tóm tắt cuộc đời */}
          {person.lifetime?.length ? (
            <AccordionSection title="📖 Tóm tắt cuộc đời">
              <BulletList items={person.lifetime} />
            </AccordionSection>
          ) : null}

          {/* Accordion: Sự kiện tham gia */}
          <AccordionSection title={`⚔️ Sự kiện tham gia (${events.length})`}>
            {events.length === 0 ? (
              <Text style={styles.emptyText}>Không có sự kiện nào.</Text>
            ) : (
              events.map((ev) => (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.eventRow}
                  onPress={() => router.push({
                    pathname: '/person-event/[periodSlug]/[personSlug]/[eventSlug]',
                    params: { periodSlug, personSlug, eventSlug: ev.id },
                  })}
                  activeOpacity={0.75}
                >
                  <View style={styles.eventDot} />
                  <Text style={styles.eventTitle}>{ev.title ?? ev.id}</Text>
                  <Text style={styles.eventArrow}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </AccordionSection>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.lightBg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.lightBg },
  errorText: { color: COLORS.gray600, textAlign: 'center', fontSize: FONT_SIZES.base },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BORDER_RADIUS.full },
  retryText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backBtnText: { color: COLORS.white, fontSize: 30, fontWeight: FONT_WEIGHTS.bold, lineHeight: 34 },
  headerBarTitle: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center' },

  banner: { width: '100%', height: 240 },
  bannerPlaceholder: { backgroundColor: '#fce8e8', alignItems: 'center', justifyContent: 'center' },

  content: { padding: SPACING[4], gap: SPACING[3] },
  name: { fontSize: FONT_SIZES['2xl'], fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray900 },
  personTitle: { fontSize: FONT_SIZES.base, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semibold },
  lifespan: { fontSize: FONT_SIZES.sm, color: COLORS.gray500 },
  overviewCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING[4], ...SHADOWS.sm, borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  overviewText: { fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 22 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 7 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 22 },

  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  eventTitle: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.gray800 },
  eventArrow: { color: COLORS.primary, fontSize: 20 },
  emptyText: { color: COLORS.gray400, fontSize: FONT_SIZES.sm },
});
