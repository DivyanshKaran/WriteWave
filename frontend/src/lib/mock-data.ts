// Mock data for demo/development mode
import { User } from '@/types';

export const mockUser: User = {
  id: 'demo-user-001',
  email: 'demo@writewave.app',
  username: 'demo_learner',
  name: 'Demo User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  bio: 'Japanese language enthusiast learning with WriteWave!',
  location: 'Tokyo, Japan',
  isVerified: true,
  isActive: true,
  lastLoginAt: '2025-01-14T08:30:00Z',
  createdAt: '2024-06-15T10:00:00Z',
  updatedAt: '2025-01-14T08:30:00Z',
  preferences: {
    theme: 'system',
    fontSize: 'medium',
    language: 'en',
    romanization: 'hepburn',
    notifications: {
      dailyReminder: true,
      achievements: true,
      community: true,
      newsletter: false,
      email: true,
      push: true,
    },
    learning: {
      dailyGoal: 30,
      difficulty: 'intermediate',
      audioPlayback: true,
      strokeOrder: true,
      autoAdvance: false,
      showHints: true,
    },
    privacy: {
      profilePublic: true,
      showProgress: true,
      showAchievements: true,
      allowMessages: true,
    },
  },
};

export const mockProgress = {
  hiragana: { learned: 46, total: 46, mastery: 95 },
  katakana: { learned: 46, total: 46, mastery: 88 },
  kanji: { learned: 120, total: 2136, mastery: 72 },
  vocabulary: { learned: 450, total: 5000, mastery: 68 },
  grammar: { learned: 35, total: 200, mastery: 75 },
};

export const mockStats = {
  totalStudyTime: 4520, // minutes
  lessonsCompleted: 48,
  wordsLearned: 450,
  charactersLearned: 212,
  currentStreak: 15,
  longestStreak: 23,
  weeklyXP: 850,
  monthlyXP: 3200,
};

export const mockAchievements = [
  { id: '1', name: 'First Steps', description: 'Complete your first lesson', earned: true, earnedAt: '2024-06-16' },
  { id: '2', name: 'Hiragana Master', description: 'Learn all hiragana characters', earned: true, earnedAt: '2024-07-20' },
  { id: '3', name: 'Katakana Master', description: 'Learn all katakana characters', earned: true, earnedAt: '2024-08-15' },
  { id: '4', name: 'Week Warrior', description: 'Maintain a 7-day streak', earned: true, earnedAt: '2024-06-22' },
  { id: '5', name: 'Kanji Beginner', description: 'Learn 100 kanji', earned: true, earnedAt: '2024-10-01' },
  { id: '6', name: 'Vocabulary Builder', description: 'Learn 500 words', earned: false },
];

export const mockRecentActivity = [
  { type: 'lesson', title: 'JLPT N5 Grammar - Particles', date: '2025-01-14', xp: 50 },
  { type: 'practice', title: 'Kanji Review - Level 3', date: '2025-01-14', xp: 30 },
  { type: 'vocabulary', title: 'Daily Words - Food', date: '2025-01-13', xp: 25 },
  { type: 'lesson', title: 'Hiragana Writing Practice', date: '2025-01-13', xp: 40 },
];

// Initialize mock auth state - called from store provider
export function initializeMockAuth(authStore: any) {
  if (!authStore.isAuthenticated) {
    authStore.setUser(mockUser);
    authStore.setTokens('mock-token-demo', 'mock-refresh-token-demo');
  }
}
