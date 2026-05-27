/**
 * Service Quiz
 * Firestore: games/quiz-lich-su-viet-nam/quizzes/{slug}
 */

import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { QuizItem } from '@/models/QuizzItem';

const QUIZ_DOC = 'quiz-lich-su-viet-nam';

/** Lấy tất cả quiz */
export const getQuizzes = async (): Promise<QuizItem[]> => {
  try {
    const q = query(collection(db, 'games', QUIZ_DOC, 'quizzes'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizItem));
  } catch (e) {
    console.error('❌ Lỗi getQuizzes:', e);
    throw e;
  }
};

/** Lấy quiz theo ID */
export const getQuizById = async (id: string): Promise<QuizItem | null> => {
  try {
    const snap = await getDoc(doc(db, 'games', QUIZ_DOC, 'quizzes', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as QuizItem;
  } catch (e) {
    console.error('❌ Lỗi getQuizById:', e);
    throw e;
  }
};
