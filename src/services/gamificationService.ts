/**
 * Gamification Service — Orchestrator chính
 *
 * Kết hợp tất cả service (XP, Rank, Badge, Streak) để:
 * 1. Log session chơi (trong Firestore transaction)
 * 2. Lấy profile gamification đầy đủ
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  SessionInput,
  SessionResult,
  GameSession,
  UserGamification,
  DEFAULT_GAMIFICATION,
  UserBadge,
  DisplaySession,
  GamificationProfile,
} from '@/models/GamificationModels';
import { calculateXP } from '@/services/xpService';
import { getRankForXP, getNextRankInfo, getRankProgress } from '@/services/rankService';
import { checkNewBadges, BADGE_DEFINITIONS } from '@/services/badgeService';
import { calculateStreak } from '@/services/streakService';

/**
 * Trích xuất các field gamification từ user doc,
 * dùng default nếu chưa có (user doc cũ chưa có gamification fields).
 *
 * @param data - Dữ liệu raw từ Firestore user doc
 * @returns UserGamification object đầy đủ
 */
function extractGamification(data: Record<string, unknown>): UserGamification {
  return {
    totalXP: typeof data.totalXP === 'number' ? data.totalXP : DEFAULT_GAMIFICATION.totalXP,
    currentRank: typeof data.currentRank === 'string' ? data.currentRank : DEFAULT_GAMIFICATION.currentRank,
    currentStreak: typeof data.currentStreak === 'number' ? data.currentStreak : DEFAULT_GAMIFICATION.currentStreak,
    longestStreak: typeof data.longestStreak === 'number' ? data.longestStreak : DEFAULT_GAMIFICATION.longestStreak,
    lastPlayedDate: typeof data.lastPlayedDate === 'string' ? data.lastPlayedDate : DEFAULT_GAMIFICATION.lastPlayedDate,
    totalSessions: typeof data.totalSessions === 'number' ? data.totalSessions : DEFAULT_GAMIFICATION.totalSessions,
    highestScore: typeof data.highestScore === 'number' ? data.highestScore : DEFAULT_GAMIFICATION.highestScore,
  };
}

/**
 * Log 1 session chơi và cập nhật toàn bộ gamification data.
 *
 * Thực hiện trong 1 Firestore transaction để đảm bảo tính nhất quán:
 * 1. Đọc user doc hiện tại
 * 2. Đọc badge subcollection (để kiểm tra idempotent)
 * 3. Tính streak, XP, rank mới
 * 4. Ghi session vào history/{userId}/sessions
 * 5. Merge-update user doc
 * 6. Ghi badge mới (nếu có) vào users/{userId}/badges
 *
 * @param input - Dữ liệu session chơi
 * @returns SessionResult với XP, rank, badges mới
 * @throws Error nếu userId không hợp lệ hoặc user không tồn tại
 */
export async function logGameSession(input: SessionInput): Promise<SessionResult> {
  const { userId, type, gameId, score, totalQuestions, correctAnswers, timeTaken } = input;

  if (!userId) {
    throw new Error('userId không được để trống');
  }

  const userRef = doc(db, 'users', userId);

  // Đọc badges hiện tại trước transaction (getDocs không hỗ trợ trong transaction)
  const badgesSnap = await getDocs(collection(db, 'users', userId, 'badges'));
  const existingBadgeIds = badgesSnap.docs.map((d) => d.id);

  // Chạy transaction cho user doc
  const result = await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Người dùng không tồn tại');
    }

    const userData = userSnap.data() as Record<string, unknown>;
    const gamification = extractGamification(userData);

    // 1. Tính streak
    const streakResult = calculateStreak(gamification.lastPlayedDate, gamification.currentStreak);

    // 2. Tính XP
    const xpBreakdown = calculateXP({
      score,
      correctAnswers,
      totalQuestions,
      timeTaken,
      currentStreak: streakResult.newStreak,
    });

    // 3. Cập nhật tổng XP và rank
    const newTotalXP = gamification.totalXP + xpBreakdown.totalXP;
    const newRank = getRankForXP(newTotalXP);
    const oldRank = gamification.currentRank;
    const rankChanged = newRank !== oldRank;

    // 4. Cập nhật stats
    const newTotalSessions = gamification.totalSessions + 1;
    const newHighestScore = Math.max(gamification.highestScore, score);
    const newLongestStreak = Math.max(gamification.longestStreak, streakResult.newStreak);

    // 5. Ghi session vào history
    const isQuiz = type === 'quiz';
    const actualQuizId = isQuiz ? (input.quizId ?? input.gameId ?? null) : null;
    const actualGameId = isQuiz ? 'quiz-lich-su-viet-nam' : (input.gameId ?? null);

    const sessionData: GameSession = {
      type,
      gameId: actualGameId,
      quizId: actualQuizId,
      gameTitle: input.gameTitle ?? null,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      xpGained: xpBreakdown.totalXP,
      playedAt: Timestamp.now(),
      answers: input.answers ?? [],
      timelineItems: input.timelineItems ?? [],
    };

    const sessionRef = doc(collection(db, 'history', userId, 'sessions'));
    transaction.set(sessionRef, sessionData);

    // 6. Merge-update user doc (chỉ cập nhật gamification fields)
    transaction.set(
      userRef,
      {
        totalXP: newTotalXP,
        currentRank: newRank,
        currentStreak: streakResult.newStreak,
        longestStreak: newLongestStreak,
        lastPlayedDate: streakResult.todayStr,
        totalSessions: newTotalSessions,
        highestScore: newHighestScore,
      },
      { merge: true },
    );

    // 7. Kiểm tra badge mới
    const newBadges = checkNewBadges({
      totalSessions: newTotalSessions,
      currentStreak: streakResult.newStreak,
      correctAnswers,
      totalQuestions,
      timeTaken,
      score,
      newRank,
      rankChanged,
      existingBadgeIds,
    });

    // 8. Ghi badge mới vào subcollection
    for (const badge of newBadges) {
      const badgeRef = doc(db, 'users', userId, 'badges', badge.id);
      transaction.set(badgeRef, {
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        earnedAt: Timestamp.now(),
      });
    }

    return {
      xpGained: xpBreakdown.totalXP,
      totalXP: newTotalXP,
      currentRank: newRank,
      rankChanged,
      previousRank: rankChanged ? oldRank : undefined,
      newBadges,
    } satisfies SessionResult;
  });

  return result;
}

/**
 * Lấy profile gamification đầy đủ cho 1 user.
 *
 * Bao gồm:
 * - Thông tin user cơ bản (displayName, email, avatar)
 * - Gamification stats (XP, rank, streak)
 * - Danh sách badge đã nhận
 * - 10 session chơi gần nhất
 *
 * @param userId - Firebase UID
 * @returns GamificationProfile object
 * @throws Error nếu user không tồn tại
 */
export async function getUserGamificationProfile(
  userId: string,
): Promise<GamificationProfile> {
  if (!userId) {
    throw new Error('userId không được để trống');
  }

  // Đọc song song: user doc + badges + recent sessions
  const [userSnap, badgesSnap, sessionsSnap] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(collection(db, 'users', userId, 'badges')),
    getDocs(
      query(
        collection(db, 'history', userId, 'sessions'),
        orderBy('playedAt', 'desc'),
        limit(10),
      ),
    ),
  ]);

  if (!userSnap.exists()) {
    throw new Error('Người dùng không tồn tại');
  }

  const userData = userSnap.data() as Record<string, unknown>;
  const gamification = extractGamification(userData);

  // Parse badges
  const badges: UserBadge[] = badgesSnap.docs.map((d) => {
    const data = d.data();
    return {
      badgeId: data.badgeId ?? d.id,
      name: data.name ?? '',
      description: data.description ?? '',
      earnedAt: data.earnedAt,
    } as UserBadge;
  });

  // Retroactive badge sync
  const existingBadgeIds = badges.map(b => b.badgeId);
  const { checkNewBadges } = require('./badgeService');
  const missedBadges = checkNewBadges({
    totalSessions: gamification.totalSessions,
    highestScore: gamification.highestScore,
    longestStreak: gamification.longestStreak,
    currentRank: gamification.currentRank,
    existingBadgeIds,
  });
  if (missedBadges.length > 0) {
    const batch = writeBatch(db);
    missedBadges.forEach((badge: any) => {
      const badgeRef = doc(collection(db, 'users', userId, 'badges'));
      batch.set(badgeRef, {
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        earnedAt: serverTimestamp(),
      });
      badges.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        earnedAt: Timestamp.fromDate(new Date()), // Local temp
      });
    });
    // Add fire-and-forget sync
    batch.commit().catch((e: any) => console.error('Failed to sync missed badges', e));
  }

  // Parse recent sessions
  const recentSessions: DisplaySession[] = sessionsSnap.docs.map((d) => {
    const data = d.data();
    const total = typeof data.totalQuestions === 'number' ? data.totalQuestions : 0;
    const correct = typeof data.correctAnswers === 'number' ? data.correctAnswers : 0;
    return {
      id: d.id,
      type: data.type ?? 'quiz',
      gameTitle: data.gameTitle ?? undefined,
      score: data.score ?? 0,
      totalQuestions: total,
      correctAnswers: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      timeTaken: data.timeTaken ?? 0,
      xpGained: data.xpGained ?? 0,
      playedAt: data.playedAt?.toDate?.() ?? new Date(),
    } as DisplaySession;
  });

  // Rank info
  const nextRankInfo = getNextRankInfo(gamification.totalXP);
  const xpProgress = getRankProgress(gamification.totalXP);

  return {
    displayName:
      (typeof userData.displayName === 'string' ? userData.displayName : '') ||
      (typeof userData.username === 'string' ? userData.username : '') ||
      'Người dùng',
    photoURL: (typeof userData.avatar === 'string' ? userData.avatar : '') ||
      (typeof userData.photo === 'string' ? userData.photo : ''),
    email: typeof userData.email === 'string' ? userData.email : '',
    totalXP: gamification.totalXP,
    currentRank: gamification.currentRank,
    nextRank: nextRankInfo?.name ?? null,
    xpToNextRank: nextRankInfo?.xpNeeded ?? 0,
    xpProgress,
    currentStreak: gamification.currentStreak,
    longestStreak: gamification.longestStreak,
    totalSessions: gamification.totalSessions,
    highestScore: gamification.highestScore,
    badges,
    recentSessions,
  };
}

/**
 * Lấy lịch sử chơi đầy đủ của 1 user (tối đa 100 sessions gần nhất).
 *
 * @param userId - Firebase UID
 * @param limitCount - Số lượng bản ghi tối đa (mặc định 100)
 * @returns Mảng các session chơi đã định dạng
 */
export async function getUserPlayHistory(
  userId: string,
  limitCount = 100,
): Promise<DisplaySession[]> {
  if (!userId) {
    throw new Error('userId không được để trống');
  }

  const sessionsSnap = await getDocs(
    query(
      collection(db, 'history', userId, 'sessions'),
      orderBy('playedAt', 'desc'),
      limit(limitCount),
    ),
  );

  const rawSessions = sessionsSnap.docs.map((d) => {
    const data = d.data();
    const total = typeof data.totalQuestions === 'number' ? data.totalQuestions : 0;
    const correct = typeof data.correctAnswers === 'number' ? data.correctAnswers : 0;
    return {
      id: d.id,
      type: data.type ?? 'quiz',
      gameId: data.gameId ?? null,
      quizId: data.quizId ?? null,
      gameTitle: data.gameTitle ?? undefined,
      score: data.score ?? 0,
      totalQuestions: total,
      correctAnswers: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      timeTaken: data.timeTaken ?? 0,
      xpGained: data.xpGained ?? 0,
      playedAt: data.playedAt?.toDate?.() ?? new Date(),
      answers: data.answers,
      timelineItems: data.timelineItems,
    } as DisplaySession;
  });

  const quizTargets = new Map<string, { gameId: string; quizId: string }>();
  const gameIds = new Set<string>();

  for (const s of rawSessions) {
    if (s.type === 'quiz') {
      const qId = s.quizId || s.gameId;
      const gId = s.quizId && s.gameId ? s.gameId : 'quiz-lich-su-viet-nam';
      if (qId && gId) {
        quizTargets.set(`${gId}_${qId}`, { gameId: gId, quizId: qId });
      }
    } else if (s.type === 'game' && s.gameId) {
      gameIds.add(s.gameId);
    }
  }

  const titleMap: Record<string, string> = {};
  const fetchPromises: Promise<void>[] = [];

  quizTargets.forEach(({ gameId, quizId }, key) => {
    fetchPromises.push(
      getDoc(doc(db, 'games', gameId, 'quizzes', quizId)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const title = `${data.eventID?.title ?? 'Không rõ'} · ${data.level ?? ''}`.trim();
          titleMap[key] = title.endsWith('·') ? title.slice(0, -1).trim() : title;
        }
      })
    );
  });

  gameIds.forEach((id) => {
    fetchPromises.push(
      getDoc(doc(db, 'games', 'timelinepuzzle', 'eras', id)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          titleMap[id] = data?.title || data?.name || 'Không rõ';
        }
      })
    );
  });

  await Promise.all(fetchPromises);

  return rawSessions.map((s) => {
    let fetchedTitle: string | undefined;
    if (s.type === 'quiz') {
      const qId = s.quizId || s.gameId;
      const gId = s.quizId && s.gameId ? s.gameId : 'quiz-lich-su-viet-nam';
      if (qId && gId) fetchedTitle = titleMap[`${gId}_${qId}`];
    } else if (s.type === 'game' && s.gameId) {
      fetchedTitle = titleMap[s.gameId];
    }

    return {
      ...s,
      title: fetchedTitle || s.gameTitle || 'Không rõ',
    };
  });
}

