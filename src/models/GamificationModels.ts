/**
 * Models cho hệ thống Gamification
 * Định nghĩa kiểu dữ liệu: Session, Badge, Rank, XP
 */

import { Timestamp } from 'firebase/firestore';

// ═══════════════════════════════════════════════
//  SESSION
// ═══════════════════════════════════════════════

/** Loại session chơi */
export type SessionType = 'quiz' | 'game';

/** Dữ liệu trả lời từng câu (đối với quiz) */
export interface SessionAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  options: Record<string, string>;
}

/** Dữ liệu 1 session chơi — lưu vào history/{userId}/sessions/{sessionId} */
export interface GameSession {
  /** 'quiz' hoặc 'game' (timeline puzzle) */
  type: SessionType;
  /** Tham chiếu đến games/{gameId}, null nếu type === 'quiz' */
  gameId: string | null;
  /** Tham chiếu đến quizzes/{quizId} nếu type === 'quiz' */
  quizId?: string | null;
  /** Tên trò chơi / bài quiz */
  gameTitle?: string | null;
  /** Điểm đạt được trong session */
  score: number;
  /** Tổng số câu hỏi / events */
  totalQuestions: number;
  /** Số câu trả lời đúng / events đặt đúng */
  correctAnswers: number;
  /** Thời gian chơi (giây) */
  timeTaken: number;
  /** XP nhận được từ session này */
  xpGained: number;
  /** Thời điểm chơi */
  playedAt: Timestamp;
  /** Danh sách đáp án (nếu là quiz) */
  answers?: SessionAnswer[];
  /** Danh sách sự kiện niên đại (nếu là game) */
  timelineItems?: { year: string; event: string }[];
}

/** Tham số đầu vào khi submit session (chưa tính XP) */
export interface SessionInput {
  userId: string;
  type: SessionType;
  gameId?: string | null;
  quizId?: string | null;
  gameTitle?: string | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  answers?: SessionAnswer[];
  timelineItems?: { year: string; event: string }[];
}

/** Kết quả trả về sau khi log session */
export interface SessionResult {
  /** XP nhận được từ session này */
  xpGained: number;
  /** Tổng XP hiện tại */
  totalXP: number;
  /** Rank hiện tại */
  currentRank: string;
  /** Rank có thay đổi không */
  rankChanged: boolean;
  /** Rank cũ (nếu rankChanged === true) */
  previousRank?: string;
  /** Danh sách badge mới nhận */
  newBadges: BadgeDefinition[];
}

// ═══════════════════════════════════════════════
//  BADGE
// ═══════════════════════════════════════════════

/** Badge đã nhận — lưu vào users/{userId}/badges/{badgeId} */
export interface UserBadge {
  badgeId: string;
  name: string;
  description: string;
  earnedAt: Timestamp;
}

/** Định nghĩa badge (dữ liệu tĩnh, không lưu Firestore) */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
}

// ═══════════════════════════════════════════════
//  RANK
// ═══════════════════════════════════════════════

/** Một bậc rank */
export interface RankTier {
  name: string;
  minXP: number;
  maxXP: number; // Infinity cho rank cao nhất
  icon: string; // Ionicons name
  color: string;
}

/** Thông tin rank tiếp theo */
export interface NextRankInfo {
  name: string;
  minXP: number;
  xpNeeded: number; // XP còn thiếu
}

// ═══════════════════════════════════════════════
//  USER GAMIFICATION
// ═══════════════════════════════════════════════

/** Các field gamification trên user doc */
export interface UserGamification {
  totalXP: number;
  currentRank: string;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // format "YYYY-MM-DD"
  totalSessions: number;
  highestScore: number;
}

/** Giá trị mặc định cho user chưa có gamification data */
export const DEFAULT_GAMIFICATION: UserGamification = {
  totalXP: 0,
  currentRank: 'Newcomer',
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  totalSessions: 0,
  highestScore: 0,
};

// ═══════════════════════════════════════════════
//  PROFILE (dùng cho UI)
// ═══════════════════════════════════════════════

/** Session hiển thị trên UI (đã format) */
export interface DisplaySession {
  id: string;
  type: SessionType;
  gameId?: string | null;
  quizId?: string | null;
  gameTitle?: string;
  title?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // 0-100 %
  timeTaken: number;
  xpGained: number;
  playedAt: Date;
  answers?: SessionAnswer[];
  timelineItems?: { year: string; event: string }[];
}

/** Profile đầy đủ cho trang hồ sơ */
export interface GamificationProfile {
  // User info
  displayName: string;
  photoURL: string;
  email: string;
  // Gamification
  totalXP: number;
  currentRank: string;
  nextRank: string | null;
  xpToNextRank: number;
  xpProgress: number; // 0-1 progress trong rank hiện tại
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  highestScore: number;
  // Collections
  badges: UserBadge[];
  recentSessions: DisplaySession[];
}
