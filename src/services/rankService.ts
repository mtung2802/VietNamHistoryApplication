/**
 * Rank Service — Quản lý hệ thống xếp hạng
 *
 * Thresholds:
 *   Newcomer :   0   – 199
 *   Bronze   :   200 – 599
 *   Silver   :   600 – 1199
 *   Gold     :  1200 – 2499
 *   Platinum :  2500 – 4999
 *   Legend   :  5000+
 */

import { RankTier, NextRankInfo } from '@/models/GamificationModels';

/** Bảng rank xếp theo thứ tự tăng dần */
export const RANK_TIERS: RankTier[] = [
  { name: 'Newcomer',  minXP: 0,    maxXP: 199,      icon: 'seedling',           color: '#9CA3AF' },
  { name: 'Bronze',    minXP: 200,  maxXP: 599,      icon: 'shield-outline',     color: '#CD7F32' },
  { name: 'Silver',    minXP: 600,  maxXP: 1199,     icon: 'shield-half-full',   color: '#C0C0C0' },
  { name: 'Gold',      minXP: 1200, maxXP: 2499,     icon: 'shield-star',        color: '#FFD700' },
  { name: 'Platinum',  minXP: 2500, maxXP: 4999,     icon: 'diamond-stone',      color: '#E5E4E2' },
  { name: 'Legend',    minXP: 5000, maxXP: Infinity, icon: 'crown',              color: '#FF4500' },
];

/**
 * Xác định rank dựa trên tổng XP.
 *
 * @param totalXP - Tổng XP hiện tại
 * @returns Tên rank tương ứng
 *
 * @example
 * getRankForXP(750) // → 'Silver'
 */
export function getRankForXP(totalXP: number): string {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (totalXP >= RANK_TIERS[i].minXP) {
      return RANK_TIERS[i].name;
    }
  }
  return RANK_TIERS[0].name;
}

/**
 * Lấy thông tin rank tier theo tên.
 *
 * @param rankName - Tên rank
 * @returns RankTier object hoặc tier đầu tiên nếu không tìm thấy
 */
export function getRankTier(rankName: string): RankTier {
  return RANK_TIERS.find((t) => t.name === rankName) ?? RANK_TIERS[0];
}

/**
 * Lấy thông tin rank tiếp theo.
 *
 * @param totalXP - Tổng XP hiện tại
 * @returns NextRankInfo hoặc null nếu đã ở rank cao nhất (Legend)
 *
 * @example
 * getNextRankInfo(750) // → { name: 'Gold', minXP: 1200, xpNeeded: 450 }
 */
export function getNextRankInfo(totalXP: number): NextRankInfo | null {
  const currentRank = getRankForXP(totalXP);
  const currentIndex = RANK_TIERS.findIndex((t) => t.name === currentRank);

  // Đã ở rank cao nhất
  if (currentIndex >= RANK_TIERS.length - 1) {
    return null;
  }

  const nextTier = RANK_TIERS[currentIndex + 1];
  return {
    name: nextTier.name,
    minXP: nextTier.minXP,
    xpNeeded: nextTier.minXP - totalXP,
  };
}

/**
 * Tính progress (0–1) trong rank hiện tại.
 *
 * @param totalXP - Tổng XP hiện tại
 * @returns Tỉ lệ tiến độ 0.0 – 1.0
 *
 * @example
 * getRankProgress(900) // Silver (600-1199) → (900-600)/(1200-600) = 0.5
 */
export function getRankProgress(totalXP: number): number {
  const currentTier = getRankTier(getRankForXP(totalXP));
  const nextInfo = getNextRankInfo(totalXP);

  // Đã max rank
  if (!nextInfo) return 1;

  const rangeSize = nextInfo.minXP - currentTier.minXP;
  if (rangeSize <= 0) return 1;

  return Math.min(1, Math.max(0, (totalXP - currentTier.minXP) / rangeSize));
}
