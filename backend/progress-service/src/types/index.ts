// Progress Service TypeScript Types

import { Request } from 'express';

// Base types
export interface BaseResponse {
  success: boolean;
  message: string;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// User Progress Types
export interface UserProgress {
  id: string;
  userId: string;
  currentLevel: number;
  totalXp: number;
  currentXp: number;
  xpToNextLevel: number;
  levelName: string;
  streakCount: number;
  longestStreak: number;
  lastActivityDate?: Date;
  totalStudyTime: number;
  charactersLearned: number;
  charactersMastered: number;
  perfectScores: number;
  achievementsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgressInput {
  userId: string;
  currentLevel?: number;
  totalXp?: number;
  currentXp?: number;
  xpToNextLevel?: number;
  levelName?: string;
  streakCount?: number;
  longestStreak?: number;
  lastActivityDate?: Date;
  totalStudyTime?: number;
  charactersLearned?: number;
  charactersMastered?: number;
  perfectScores?: number;
  achievementsCount?: number;
}

// XP Transaction Types
export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  source: XpSource;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface XpTransactionInput {
  userId: string;
  amount: number;
  source: XpSource;
  description: string;
  metadata?: any;
}

export enum XpSource {
  CHARACTER_PRACTICE = 'CHARACTER_PRACTICE',
  PERFECT_STROKE = 'PERFECT_STROKE',
  DAILY_STREAK = 'DAILY_STREAK',
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  VOCABULARY_LEARNED = 'VOCABULARY_LEARNED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  PERFECT_SCORE = 'PERFECT_SCORE',
  DAILY_LOGIN = 'DAILY_LOGIN',
  WEEKLY_CHALLENGE = 'WEEKLY_CHALLENGE',
  MONTHLY_CHALLENGE = 'MONTHLY_CHALLENGE',
  SOCIAL_SHARE = 'SOCIAL_SHARE',
  REVIEW_SESSION = 'REVIEW_SESSION',
  MISTAKE_CORRECTION = 'MISTAKE_CORRECTION',
  SPEED_CHALLENGE = 'SPEED_CHALLENGE'
}

// Character Mastery Types
export interface CharacterMastery {
  id: string;
  userId: string;
  characterId: string;
  characterType: CharacterType;
  masteryLevel: MasteryLevel;
  accuracyScore: number;
  practiceCount: number;
  correctCount: number;
  totalTimeSpent: number;
  lastPracticed?: Date;
  nextReviewDate?: Date;
  streakCount: number;
  difficultyRating: number;
  strokeOrderScore: number;
  recognitionScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterMasteryInput {
  userId: string;
  characterId: string;
  characterType: CharacterType;
  masteryLevel?: MasteryLevel;
  accuracyScore?: number;
  practiceCount?: number;
  correctCount?: number;
  totalTimeSpent?: number;
  lastPracticed?: Date;
  nextReviewDate?: Date;
  streakCount?: number;
  difficultyRating?: number;
  strokeOrderScore?: number;
  recognitionScore?: number;
}

export const CharacterType = {
  HIRAGANA: 'HIRAGANA',
  KATAKANA: 'KATAKANA',
  KANJI: 'KANJI'
} as const;
export type CharacterType = typeof CharacterType[keyof typeof CharacterType];

export const MasteryLevel = {
  LEARNING: 'LEARNING',
  PRACTICING: 'PRACTICING',
  MASTERED: 'MASTERED',
  EXPERT: 'EXPERT'
} as const;
export type MasteryLevel = typeof MasteryLevel[keyof typeof MasteryLevel];

// Practice Session Types
export interface PracticeSession {
  id: string;
  characterMasteryId: string;
  userId: string;
  characterId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  accuracy?: number;
  strokesCorrect: number;
  strokesTotal: number;
  xpEarned: number;
  isPerfect: boolean;
  notes?: string;
  createdAt: Date;
}

export interface PracticeSessionInput {
  characterMasteryId: string;
  userId: string;
  characterId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  accuracy?: number;
  strokesCorrect?: number;
  strokesTotal?: number;
  xpEarned?: number;
  isPerfect?: boolean;
  notes?: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon?: string;
  xpReward: number;
  badgeReward?: string;
  unlockCondition: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementInput {
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon?: string;
  xpReward?: number;
  badgeReward?: string;
  unlockCondition: any;
  isActive?: boolean;
}

export const AchievementCategory = {
  LEARNING: 'LEARNING',
  PRACTICE: 'PRACTICE',
  STREAK: 'STREAK',
  MASTERY: 'MASTERY',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
  MILESTONE: 'MILESTONE',
  CHALLENGE: 'CHALLENGE'
} as const;
export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory];

export const AchievementRarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY'
} as const;
export type AchievementRarity = typeof AchievementRarity[keyof typeof AchievementRarity];

// User Achievement Types
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: any;
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievementInput {
  userId: string;
  achievementId: string;
  progress?: any;
  isUnlocked?: boolean;
  unlockedAt?: Date;
}

// Streak Types
export interface Streak {
  id: string;
  userId: string;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivity?: Date;
  freezeCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreakInput {
  userId: string;
  type: StreakType;
  currentCount?: number;
  longestCount?: number;
  lastActivity?: Date;
  freezeCount?: number;
  isActive?: boolean;
}

export const StreakType = {
  DAILY_LOGIN: 'DAILY_LOGIN',
  DAILY_PRACTICE: 'DAILY_PRACTICE',
  PERFECT_SCORE: 'PERFECT_SCORE',
  WEEKLY_STUDY: 'WEEKLY_STUDY',
  MONTHLY_GOAL: 'MONTHLY_GOAL'
} as const;
export type StreakType = typeof StreakType[keyof typeof StreakType];

// Analytics Types
export interface UserAnalytics {
  id: string;
  userId: string;
  date: Date;
  studyTimeMinutes: number;
  charactersPracticed: number;
  accuracyAverage: number;
  xpEarned: number;
  achievementsUnlocked: number;
  streakMaintained: boolean;
  weakAreas?: any;
  improvementTrends?: any;
  predictions?: any;
  createdAt: Date;
}

export interface UserAnalyticsInput {
  userId: string;
  date?: Date;
  studyTimeMinutes?: number;
  charactersPracticed?: number;
  accuracyAverage?: number;
  xpEarned?: number;
  achievementsUnlocked?: number;
  streakMaintained?: boolean;
  weakAreas?: any;
  improvementTrends?: any;
  predictions?: any;
}

// Leaderboard Types
export interface Leaderboard {
  id: string;
  userId: string;
  period: LeaderboardPeriod;
  rank: number;
  score: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardInput {
  userId: string;
  period: LeaderboardPeriod;
  rank: number;
  score: number;
  metadata?: any;
}

export enum LeaderboardPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME'
}

// Level and XP Types
export interface LevelInfo {
  level: number;
  name: string;
  xpRequired: number;
  xpToNext: number;
  totalXp: number;
  multiplier: number;
  rewards: string[];
}

export interface XpCalculation {
  baseXp: number;
  multiplier: number;
  bonusXp: number;
  totalXp: number;
  source: XpSource;
  description: string;
}

// Analytics and Insights Types
export interface LearningInsights {
  userId: string;
  period: string;
  studyTime: number;
  charactersLearned: number;
  accuracyTrend: number[];
  weakAreas: string[];
  strongAreas: string[];
  improvementRate: number;
  predictions: {
    nextLevelDate: Date;
    masteryProjection: number;
    recommendedFocus: string[];
  };
}

export interface ProgressMetrics {
  userId: string;
  currentLevel: number;
  levelProgress: number;
  streakCount: number;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  rank: number;
  percentile: number;
}

// Request/Response Types
export interface GetUserProgressRequest {
  userId: string;
}

export interface UpdateXpRequest {
  userId: string;
  amount: number;
  source: XpSource;
  description: string;
  metadata?: any;
}

export interface UpdateCharacterMasteryRequest {
  userId: string;
  characterId: string;
  characterType: CharacterType;
  accuracy: number;
  timeSpent: number;
  isPerfect: boolean;
  strokesCorrect: number;
  strokesTotal: number;
}

export interface GetStreaksRequest {
  userId: string;
  type?: StreakType;
}

export interface GetAchievementsRequest {
  userId: string;
  category?: AchievementCategory;
  rarity?: AchievementRarity;
  unlocked?: boolean;
}

export interface GetAnalyticsRequest {
  userId: string;
  period: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetLeaderboardRequest {
  period: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

// Custom Request Types
export interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Error Types
export interface ProgressError {
  code: string;
  message: string;
  details?: any;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: number;
  cacheHit: boolean;
  timestamp: Date;
}

// Real-time Update Types
export interface RealTimeUpdate {
  type: 'xp_update' | 'level_up' | 'achievement_unlock' | 'streak_update' | 'mastery_update';
  userId: string;
  data: any;
  timestamp: Date;
}

// Background Job Types
export interface BackgroundJob {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Configuration Types
export interface ServiceConfig {
  xp: {
    baseMultiplier: number;
    streakMultiplier: number;
    achievementMultiplier: number;
    levelUpXpBase: number;
    levelUpXpMultiplier: number;
  };
  achievements: {
    checkInterval: number;
    notificationEnabled: boolean;
  };
  streaks: {
    freezeLimit: number;
    milestoneRewards: boolean;
    resetHour: number;
  };
  analytics: {
    batchSize: number;
    processingInterval: number;
    retentionDays: number;
  };
  leaderboard: {
    updateInterval: number;
    cacheTtl: number;
    topCount: number;
  };
  performance: {
    cacheTtl: number;
    cacheMaxSize: number;
    batchSize: number;
    concurrentLimit: number;
  };
}
