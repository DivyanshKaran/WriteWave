// Progress Types - XP, Level, Achievement, Streak, and Progress-related types

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatar?: string;
  rank: number;
}

// Progress Statistics
export interface ProgressStats {
  total_xp: number;
  level: number;
  streak: number;
  achievements: number;
  characters_learned: number;
  lessons_completed: number;
}

// Progress Store State
export interface ProgressState {
  // Core progress data
  totalXp: number;
  level: number;
  streak: number;
  achievements: Achievement[];
  charactersLearned: number;
  lessonsCompleted: number;
  
  // Weekly data
  weeklyXpData: number[];
  weekCompletion: boolean[];
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  
  // Actions
  loadProgress: () => Promise<void>;
  addXp: (amount: number, source: string) => Promise<void>;
  updateStreak: (newStreak: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateWeeklyData: (dayIndex: number, xp: number) => void;
  loadLeaderboard: () => Promise<void>;
  resetProgress: () => void;
}

// XP Transaction
export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: string; // 'character_practice' | 'lesson_complete' | 'achievement' | 'streak' | 'bonus'
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Level Definition
export interface Level {
  number: number;
  name: string;
  xpRequired: number;
  xpToNext: number;
  rewards: string[];
  description: string;
}

// Streak Data
export interface StreakData {
  current: number;
  longest: number;
  lastActivity: string;
  weekCompletion: boolean[];
  monthCompletion: boolean[];
  streakHistory: Array<{
    date: string;
    completed: boolean;
    xpEarned: number;
  }>;
}

// Daily Progress
export interface DailyProgress {
  date: string;
  xpEarned: number;
  charactersPracticed: number;
  lessonsCompleted: number;
  timeSpent: number; // in minutes
  streakMaintained: boolean;
  achievementsUnlocked: string[];
}

// Weekly Progress
export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  totalXp: number;
  dailyProgress: DailyProgress[];
  streakDays: number;
  goalsCompleted: number;
  averageAccuracy: number;
}

// Monthly Progress
export interface MonthlyProgress {
  month: string;
  year: number;
  totalXp: number;
  levelGained: number;
  charactersLearned: number;
  achievementsUnlocked: number;
  streakDays: number;
  weeklyProgress: WeeklyProgress[];
}

// Progress Analytics
export interface ProgressAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  metrics: {
    totalXp: number;
    averageDailyXp: number;
    streakDays: number;
    charactersLearned: number;
    lessonsCompleted: number;
    achievementsUnlocked: number;
    timeSpent: number;
    accuracy: number;
  };
  trends: {
    xpGrowth: number;
    streakGrowth: number;
    accuracyImprovement: number;
    learningSpeed: number;
  };
  insights: string[];
}

// Progress Goal
export interface ProgressGoal {
  id: string;
  userId: string;
  type: 'xp' | 'streak' | 'characters' | 'lessons' | 'time';
  target: number;
  current: number;
  deadline: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  reward?: string;
}

// Progress Milestone
export interface ProgressMilestone {
  id: string;
  name: string;
  description: string;
  type: 'xp' | 'level' | 'streak' | 'achievement';
  threshold: number;
  reward: {
    xp?: number;
    achievement?: string;
    badge?: string;
    title?: string;
  };
  unlocked: boolean;
  unlockedAt?: string;
}

// Progress Comparison
export interface ProgressComparison {
  userId: string;
  period: string;
  userProgress: ProgressStats;
  averageProgress: ProgressStats;
  percentile: number;
  rank: number;
  improvements: string[];
  areasToFocus: string[];
}

// Progress Report
export interface ProgressReport {
  userId: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalXp: number;
    levelGained: number;
    streakDays: number;
    charactersLearned: number;
    achievementsUnlocked: number;
  };
  dailyBreakdown: DailyProgress[];
  weeklyBreakdown: WeeklyProgress[];
  achievements: Achievement[];
  goals: ProgressGoal[];
  insights: string[];
  recommendations: string[];
}
