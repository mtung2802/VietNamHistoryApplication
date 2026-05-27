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

/** Lấy danh sách thời kỳ nhân vật (tab Person) */
export const getPersonPeriods = async (): Promise<PersonPeriodItem[]> => {
  try {
    const q = query(collection(db, 'periods_person'), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, slug: d.id, ...d.data() } as PersonPeriodItem));
  } catch (e) {
    console.error('❌ Lỗi getPersonPeriods:', e);
    throw e;
  }
};

/** Lấy danh sách nhân vật trong một thời kỳ */
export const getPersonsByPeriod = async (periodSlug: string): Promise<PersonListItem[]> => {
  try {
    const q = query(
      collection(db, 'periods_person', periodSlug, 'persons'),
      orderBy('sortOrder', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, slug: d.id, ...d.data() } as PersonListItem));
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
    const snap = await getDoc(doc(db, 'periods_person', periodSlug, 'persons', personSlug));
    if (!snap.exists()) return null;
    return { id: snap.id, slug: snap.id, ...snap.data() } as PersonDetail;
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
    const snap = await getDocs(
      collection(db, 'periods_person', periodSlug, 'persons', personSlug, 'events'),
    );
    return snap.docs.map((d) => ({ id: d.id, slug: d.id, ...d.data() } as PersonEvent));
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
    const snap = await getDoc(
      doc(db, 'periods_person', periodSlug, 'persons', personSlug, 'events', eventSlug),
    );
    if (!snap.exists()) return null;
    return { id: snap.id, slug: snap.id, ...snap.data() } as PersonEvent;
  } catch (e) {
    console.error('❌ Lỗi getPersonEventDetail:', e);
    throw e;
  }
};
