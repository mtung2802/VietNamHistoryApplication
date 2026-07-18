/**
 * Service nhân vật lịch sử
 * Firestore paths:
 *   periods_person                           — list of person periods
 *   periods_person/{slug}/persons            — list of persons
 *   periods_person/{slug}/persons/{slug}     — person detail
 *   periods_person/{slug}/persons/{slug}/events/{slug} — person events
 */

import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { PersonPeriodItem, PersonListItem, PersonDetail, PersonEvent } from '@/models/Person';

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;
  }

  return undefined;
}

/** Lấy danh sách thời kỳ nhân vật (tab Person) */
export const getPersonPeriods = async (): Promise<PersonPeriodItem[]> => {
  try {
    const q = query(collection(db, 'periods_person'), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.filter((d) => d.data().status === 'published').map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: d.id,
        ...data,
        startDate: toIso(data.startDate),
        endDate: toIso(data.endDate),
      } as PersonPeriodItem;
    });
  } catch (e) {
    console.error('❌ Lỗi getPersonPeriods:', e);
    throw e;
  }
};

/** Lấy danh sách nhân vật trong một thời kỳ */
export const getPersonsByPeriod = async (periodSlug: string): Promise<PersonListItem[]> => {
  try {
    const periodSnap = await getDoc(doc(db, 'periods_person', periodSlug));
    if (!periodSnap.exists() || periodSnap.data().status !== 'published') return [];

    const q = query(
      collection(db, 'periods_person', periodSlug, 'persons'),
      orderBy('sortOrder', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.data().status === 'published')
      .map((d) => ({ ...d.data(), id: d.id, slug: d.id } as PersonListItem));
  } catch (e) {
    console.error('❌ Lỗi getPersonsByPeriod:', e);
    throw e;
  }
};

/** Lấy chi tiết một nhân vật */
export const getPersonDetail = async (
  periodSlug: string,
  personSlug: string,
): Promise<PersonDetail | null> => {
  try {
    const [periodSnap, snap] = await Promise.all([
      getDoc(doc(db, 'periods_person', periodSlug)),
      getDoc(doc(db, 'periods_person', periodSlug, 'persons', personSlug)),
    ]);
    if (!periodSnap.exists() || periodSnap.data().status !== 'published' || !snap.exists() || snap.data().status !== 'published') return null;
    return { ...snap.data(), id: snap.id, slug: snap.id } as PersonDetail;
  } catch (e) {
    console.error('❌ Lỗi getPersonDetail:', e);
    throw e;
  }
};

/** Lấy danh sách sự kiện của nhân vật */
export const getPersonEvents = async (
  periodSlug: string,
  personSlug: string,
): Promise<PersonEvent[]> => {
  try {
    const [periodSnap, personSnap] = await Promise.all([
      getDoc(doc(db, 'periods_person', periodSlug)),
      getDoc(doc(db, 'periods_person', periodSlug, 'persons', personSlug)),
    ]);
    if (!periodSnap.exists() || periodSnap.data().status !== 'published' || !personSnap.exists() || personSnap.data().status !== 'published') return [];

    const snap = await getDocs(
      collection(db, 'periods_person', periodSlug, 'persons', personSlug, 'events'),
    );
    return snap.docs
      .filter((d) => d.data().status === 'published')
      .map((d) => ({ ...d.data(), id: d.id, slug: d.id } as PersonEvent));
  } catch (e) {
    console.error('❌ Lỗi getPersonEvents:', e);
    throw e;
  }
};

/** Lấy chi tiết một sự kiện của nhân vật */
export const getPersonEventDetail = async (
  periodSlug: string,
  personSlug: string,
  eventSlug: string,
): Promise<PersonEvent | null> => {
  try {
    const [periodSnap, personSnap, snap] = await Promise.all([
      getDoc(doc(db, 'periods_person', periodSlug)),
      getDoc(doc(db, 'periods_person', periodSlug, 'persons', personSlug)),
      getDoc(doc(db, 'periods_person', periodSlug, 'persons', personSlug, 'events', eventSlug)),
    ]);
    if (
      !periodSnap.exists() || periodSnap.data().status !== 'published'
      || !personSnap.exists() || personSnap.data().status !== 'published'
      || !snap.exists() || snap.data().status !== 'published'
    ) return null;
    return { ...snap.data(), id: snap.id, slug: snap.id } as PersonEvent;
  } catch (e) {
    console.error('❌ Lỗi getPersonEventDetail:', e);
    throw e;
  }
};
