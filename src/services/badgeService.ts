/**
 * Badge Service — Quản lý hệ thống huy hiệu
 *
 * 9 badge:
 *   first_play    → totalSessions === 1
 *   play_10       → totalSessions === 10
 *   play_50       → totalSessions === 50
 *   streak_3      → currentStreak >= 3
 *   streak_7      → currentStreak >= 7
 *   perfect_score → correctAnswers === totalQuestions
 *   speed_demon   → timeTaken < 20 AND score > 0
 *   rank_gold     → rank vừa thay đổi thành "Gold"
 *   rank_legend   → rank vừa thay đổi thành "Legend"
 */

import { BadgeDefinition } from '@/models/GamificationModels';

/** Danh sách định nghĩa tất cả badge */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_play',
    name: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành lượt chơi đầu tiên',
    icon: 'footsteps-outline',
  },
  {
    id: 'play_10',
    name: 'Chiến Binh Kiên Nhẫn',
    description: 'Hoàn thành 10 lượt chơi',
    icon: 'medal-outline',
  },
  {
    id: 'play_50',
    name: 'Bậc Thầy Lịch Sử',
    description: 'Hoàn thành 50 lượt chơi',
    icon: 'ribbon-outline',
  },
  {
    id: 'streak_3',
    name: 'Kiên Trì',
    description: 'Đạt chuỗi chơi 3 ngày liên tiếp',
    icon: 'flame-outline',
  },
  {
    id: 'streak_7',
    name: 'Không Bỏ Cuộc',
    description: 'Đạt chuỗi chơi 7 ngày liên tiếp',
    icon: 'flame',
  },
  {
    id: 'perfect_score',
    name: 'Hoàn Hảo',
    description: 'Trả lời đúng tất cả câu hỏi trong 1 lượt',
    icon: 'star',
  },
  {
    id: 'speed_demon',
    name: 'Tốc Độ Ánh Sáng',
    description: 'Hoàn thành trong dưới 20 giây với điểm > 0',
    icon: 'flash',
  },
  {
    id: 'rank_gold',
    name: 'Hạng Vàng',
    description: 'Đạt hạng Gold',
    icon: 'shield',
  },
  {
    id: 'rank_legend',
    name: 'Huyền Thoại',
    description: 'Đạt hạng Legend — cấp cao nhất',
    icon: 'trophy',
  },
];

/** Lấy định nghĩa badge theo ID */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

/** Tham số kiểm tra badge mới */
interface BadgeCheckParams {
  /** Tổng sessions SAU khi cộng session hiện tại */
  totalSessions: number;
  /** Streak hiện tại SAU khi cập nhật */
  currentStreak: number;
  /** Số câu đúng trong session hiện tại */
  correctAnswers: number;
  /** Tổng câu hỏi trong session hiện tại */
  totalQuestions: number;
  /** Thời gian chơi (giây) */
  timeTaken: number;
  /** Điểm đạt được */
  score: number;
  /** Rank mới SAU khi cập nhật */
  newRank: string;
  /** Rank có vừa thay đổi không */
  rankChanged: boolean;
  /** Danh sách badgeId đã earned trước đó */
  existingBadgeIds: string[];
}

/**
 * Kiểm tra và trả về danh sách badge mới cần trao.
 * Idempotent: chỉ trả về badge chưa có trong existingBadgeIds.
 *
 * @param params - Dữ liệu session + user state hiện tại
 * @returns Danh sách BadgeDefinition mới cần trao
 *
 * @example
 * checkNewBadges({ totalSessions: 1, ... }) // → [{ id: 'first_play', ... }]
 */
export function checkNewBadges(params: BadgeCheckParams): BadgeDefinition[] {
  const {
    totalSessions,
    currentStreak,
    correctAnswers,
    totalQuestions,
    timeTaken,
    score,
    newRank,
    rankChanged,
    existingBadgeIds,
  } = params;

  const earned = new Set(existingBadgeIds);
  const newBadges: BadgeDefinition[] = [];

  const tryAward = (badgeId: string) => {
    if (earned.has(badgeId)) return;
    const def = getBadgeDefinition(badgeId);
    if (def) {
      newBadges.push(def);
      earned.add(badgeId); // Tránh trao trùng trong cùng 1 lần check
    }
  };

  // Session milestones
  if (totalSessions === 1) tryAward('first_play');
  if (totalSessions >= 10) tryAward('play_10');
  if (totalSessions >= 50) tryAward('play_50');

  // Streak badges
  if (currentStreak >= 3) tryAward('streak_3');
  if (currentStreak >= 7) tryAward('streak_7');

  // Performance badges
  if (totalQuestions > 0 && correctAnswers === totalQuestions) {
    tryAward('perfect_score');
  }
  if (timeTaken < 20 && score > 0) {
    tryAward('speed_demon');
  }

  // Rank badges (Trao cho Rank hiện tại và tất cả Rank thấp hơn)
  const rankLevels: Record<string, number> = {
    'Newcomer': 0, 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4, 'Legend': 5
  };
  const currentLevel = rankLevels[newRank] || 0;

  if (currentLevel >= 3) tryAward('rank_gold'); // Gold or higher
  if (currentLevel >= 5) tryAward('rank_legend'); // Legend

  return newBadges;
}
