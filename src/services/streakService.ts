/**
 * Streak Service — Tính chuỗi chơi liên tiếp
 *
 * Dùng múi giờ UTC+7 (Vietnam) để so sánh ngày.
 *
 * Logic:
 *   lastPlayedDate === yesterday → currentStreak += 1
 *   lastPlayedDate === today     → no change
 *   anything else               → currentStreak = 1
 */

/** Kết quả tính streak */
export interface StreakResult {
  /** Streak mới */
  newStreak: number;
  /** Ngày hôm nay (UTC+7) dạng "YYYY-MM-DD" */
  todayStr: string;
  /** Đã chơi hôm nay rồi chưa (streak không thay đổi) */
  alreadyPlayedToday: boolean;
}

/**
 * Lấy ngày hiện tại theo UTC+7 (Vietnam timezone).
 *
 * @returns Date string dạng "YYYY-MM-DD"
 */
export function getTodayVietnam(): string {
  const now = new Date();
  // UTC+7 = thêm 7 giờ vào UTC
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Lấy ngày hôm qua theo UTC+7.
 *
 * @returns Date string dạng "YYYY-MM-DD"
 */
export function getYesterdayVietnam(): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() - 1);
  return vnTime.toISOString().slice(0, 10);
}

/**
 * Tính streak mới dựa trên lastPlayedDate và currentStreak.
 *
 * @param lastPlayedDate - Ngày chơi cuối cùng ("YYYY-MM-DD") hoặc null
 * @param currentStreak - Streak hiện tại
 * @returns StreakResult với streak mới + ngày hôm nay
 *
 * @example
 * // Nếu hôm nay là 2026-06-20 (UTC+7):
 * calculateStreak('2026-06-19', 5) // → { newStreak: 6, todayStr: '2026-06-20', alreadyPlayedToday: false }
 * calculateStreak('2026-06-20', 5) // → { newStreak: 5, todayStr: '2026-06-20', alreadyPlayedToday: true }
 * calculateStreak('2026-06-17', 5) // → { newStreak: 1, todayStr: '2026-06-20', alreadyPlayedToday: false }
 * calculateStreak(null, 0)         // → { newStreak: 1, todayStr: '2026-06-20', alreadyPlayedToday: false }
 */
export function calculateStreak(
  lastPlayedDate: string | null,
  currentStreak: number,
): StreakResult {
  const todayStr = getTodayVietnam();
  const yesterdayStr = getYesterdayVietnam();

  // Đã chơi hôm nay → không thay đổi streak
  if (lastPlayedDate === todayStr) {
    return {
      newStreak: currentStreak,
      todayStr,
      alreadyPlayedToday: true,
    };
  }

  // Chơi tiếp ngày hôm qua → tăng streak
  if (lastPlayedDate === yesterdayStr) {
    return {
      newStreak: currentStreak + 1,
      todayStr,
      alreadyPlayedToday: false,
    };
  }

  // Bất kỳ trường hợp khác (gap hoặc chưa chơi bao giờ) → reset về 1
  return {
    newStreak: 1,
    todayStr,
    alreadyPlayedToday: false,
  };
}
