// Progress Store - XP, Levels, Streaks, Achievements
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { progressService, communityService } from '@/lib/api';
import type { ProgressState, Achievement, LeaderboardEntry, ProgressStats } from '@/types';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXp: 0,
      level: 1,
      streak: 0,
      achievements: [],
      charactersLearned: 0,
      lessonsCompleted: 0,
      weeklyXpData: [0, 0, 0, 0, 0, 0, 0],
      weekCompletion: [false, false, false, false, false, false, false],
      leaderboard: [],
      isLoading: false,
      isUpdating: false,

      // Load progress data
      loadProgress: async () => {
        set({ isLoading: true });
        try {
          const stats = await progressService.getStats();
          const achievements = await progressService.getAchievements();
          const streaks = await progressService.getStreaks();
          
          set({
            totalXp: stats.total_xp,
            level: stats.level,
            streak: stats.streak,
            achievements: (achievements as Achievement[]) || [],
            charactersLearned: stats.characters_learned,
            lessonsCompleted: stats.lessons_completed,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load progress:', error);
          set({ isLoading: false });
        }
      },

      // Add XP
      addXp: async (amount: number, source: string) => {
        set({ isUpdating: true });
        try {
          await progressService.addXP(amount, source);
          
          const currentState = get();
          const newTotalXp = currentState.totalXp + amount;
          const newLevel = Math.floor(newTotalXp / 1000) + 1; // Simple level calculation
          
          set({
            totalXp: newTotalXp,
            level: newLevel,
            isUpdating: false,
          });
        } catch (error) {
          console.error('Failed to add XP:', error);
          set({ isUpdating: false });
        }
      },

      // Update streak
      updateStreak: (newStreak: number) => {
        set({ streak: newStreak });
      },

      // Unlock achievement
      unlockAchievement: (achievementId: string) => {
        set(state => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId
              ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() }
              : achievement
          ),
        }));
      },

      // Update weekly data
      updateWeeklyData: (dayIndex: number, xp: number) => {
        set(state => ({
          weeklyXpData: state.weeklyXpData.map((dayXp, index) =>
            index === dayIndex ? dayXp + xp : dayXp
          ),
          weekCompletion: state.weekCompletion.map((completed, index) =>
            index === dayIndex ? true : completed
          ),
        }));
      },

      // Load leaderboard
      loadLeaderboard: async () => {
        try {
          const leaderboard = await communityService.getLeaderboard();
          set({ leaderboard: (leaderboard as LeaderboardEntry[]) || [] });
        } catch (error) {
          console.error('Failed to load leaderboard:', error);
        }
      },

      // Reset progress (for testing)
      resetProgress: () => {
        set({
          totalXp: 0,
          level: 1,
          streak: 0,
          achievements: [],
          charactersLearned: 0,
          lessonsCompleted: 0,
          weeklyXpData: [0, 0, 0, 0, 0, 0, 0],
          weekCompletion: [false, false, false, false, false, false, false],
          leaderboard: [],
        });
      },
    }),
    {
      name: 'progress-store',
      partialize: (state) => ({
        totalXp: state.totalXp,
        level: state.level,
        streak: state.streak,
        achievements: state.achievements,
        charactersLearned: state.charactersLearned,
        lessonsCompleted: state.lessonsCompleted,
        weeklyXpData: state.weeklyXpData,
        weekCompletion: state.weekCompletion,
      }),
    }
  )
);
