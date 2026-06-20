/**
 * XP Service — Tính điểm kinh nghiệm cho mỗi session chơi
 *
 * Công thức:
 *   Base XP = score
 *   + Accuracy bonus: correctAnswers/totalQuestions >= 0.8 → +20 XP
 *   + Speed bonus: timeTaken < 30 → +10 XP
 *   × Streak multiplier: currentStreak >= 3 → ×1.5 (ceil)
 */

/** Tham số tính XP */
interface XPCalculationParams {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  currentStreak: number;
}

/** Kết quả tính XP kèm chi tiết từng bonus */
export interface XPBreakdown {
  baseXP: number;
  accuracyBonus: number;
  speedBonus: number;
  streakMultiplier: number;
  totalXP: number;
}

/**
 * Tính XP cho 1 session chơi.
 *
 * @param params - Score, accuracy, time, streak hiện tại
 * @returns Chi tiết breakdown XP
 *
 * @example
 * calculateXP({ score: 8, correctAnswers: 8, totalQuestions: 10, timeTaken: 25, currentStreak: 3 })
 * // → { baseXP: 8, accuracyBonus: 20, speedBonus: 10, streakMultiplier: 1.5, totalXP: 57 }
 */
export function calculateXP(params: XPCalculationParams): XPBreakdown {
  const { score, correctAnswers, totalQuestions, timeTaken, currentStreak } = params;

  // Base XP = score
  const baseXP = Math.max(0, score);

  // Accuracy bonus: >= 80% correct → +20 XP
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const accuracyBonus = accuracy >= 0.8 ? 20 : 0;

  // Speed bonus: < 30 seconds → +10 XP
  const speedBonus = timeTaken < 30 ? 10 : 0;

  // Streak multiplier: >= 3 streak → ×1.5
  const streakMultiplier = currentStreak >= 3 ? 1.5 : 1;

  // Tổng XP (ceil khi có multiplier)
  const rawTotal = (baseXP + accuracyBonus + speedBonus) * streakMultiplier;
  const totalXP = Math.ceil(rawTotal);

  return {
    baseXP,
    accuracyBonus,
    speedBonus,
    streakMultiplier,
    totalXP,
  };
}
