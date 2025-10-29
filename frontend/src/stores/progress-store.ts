import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProgressData, UserStats, CategoryProgress, JLPTProgress, Achievement, StudySession, WeeklyActivity } from '@/types';

interface ProgressState {
  progress: ProgressData | null;
  overallStats: UserStats | null;
  categoryProgress: CategoryProgress | null;
  jlptProgress: JLPTProgress | null;
  recentAchievements: Achievement[];
  weeklyActivity: WeeklyActivity[];
  studyHistory: StudySession[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface ProgressActions {
  setProgress: (progress: ProgressData) => void;
  setOverallStats: (stats: UserStats) => void;
  setCategoryProgress: (progress: CategoryProgress) => void;
  setJLPTProgress: (progress: JLPTProgress) => void;
  setRecentAchievements: (achievements: Achievement[]) => void;
  setWeeklyActivity: (activity: WeeklyActivity[]) => void;
  setStudyHistory: (history: StudySession[]) => void;
  addAchievement: (achievement: Achievement) => void;
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  updateCategoryProgress: (category: keyof CategoryProgress, progress: Partial<CategoryProgress[keyof CategoryProgress]>) => void;
  updateJLPTProgress: (level: keyof JLPTProgress, progress: Partial<JLPTProgress[keyof JLPTProgress]>) => void;
  incrementStudyStreak: () => void;
  resetStudyStreak: () => void;
  updateStudyTime: (minutes: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: string) => void;
  clearProgress: () => void;
  clearError: () => void;
}

type ProgressStore = ProgressState & ProgressActions;

const defaultStats: UserStats = {
  totalCharacters: 0,
  totalVocabulary: 0,
  studyStreak: 0,
  totalStudyTime: 0,
  lessonsCompleted: 0,
  articlesWritten: 0,
  totalViews: 0,
  totalLikes: 0,
  level: 1,
  experience: 0,
};

const defaultCategoryProgress: CategoryProgress = {
  hiragana: { learned: 0, total: 46, percentage: 0 },
  katakana: { learned: 0, total: 46, percentage: 0 },
  kanji: { learned: 0, total: 2136, percentage: 0 },
  vocabulary: { learned: 0, total: 0, percentage: 0 },
  grammar: { learned: 0, total: 0, percentage: 0 },
};

const defaultJLPTProgress: JLPTProgress = {
  N5: { kanji: 80, vocabulary: 800, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
  N4: { kanji: 170, vocabulary: 1500, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
  N3: { kanji: 370, vocabulary: 3750, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
  N2: { kanji: 415, vocabulary: 6000, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
  N1: { kanji: 1165, vocabulary: 10000, kanjiProgress: 0, vocabProgress: 0, grammarProgress: 0, listeningProgress: 0, readingProgress: 0 },
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // State
      progress: null,
      overallStats: null,
      categoryProgress: null,
      jlptProgress: null,
      recentAchievements: [],
      weeklyActivity: [],
      studyHistory: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setProgress: (progress) => set({ 
        progress,
        overallStats: progress.overallStats,
        categoryProgress: progress.categoryProgress,
        jlptProgress: progress.jlptProgress,
        recentAchievements: progress.recentAchievements,
        weeklyActivity: progress.weeklyActivity,
        studyHistory: progress.studyHistory,
        lastUpdated: new Date().toISOString(),
      }),

      setOverallStats: (stats) => set({ 
        overallStats: stats,
        lastUpdated: new Date().toISOString(),
      }),

      setCategoryProgress: (progress) => set({ 
        categoryProgress: progress,
        lastUpdated: new Date().toISOString(),
      }),

      setJLPTProgress: (progress) => set({ 
        jlptProgress: progress,
        lastUpdated: new Date().toISOString(),
      }),

      setRecentAchievements: (achievements) => set({ 
        recentAchievements: achievements,
        lastUpdated: new Date().toISOString(),
      }),

      setWeeklyActivity: (activity) => set({ 
        weeklyActivity: activity,
        lastUpdated: new Date().toISOString(),
      }),

      setStudyHistory: (history) => set({ 
        studyHistory: history,
        lastUpdated: new Date().toISOString(),
      }),

      addAchievement: (achievement) => set((state) => ({
        recentAchievements: [achievement, ...state.recentAchievements].slice(0, 10), // Keep only last 10
        lastUpdated: new Date().toISOString(),
      })),

      addStudySession: (session) => set((state) => ({
        studyHistory: [session, ...state.studyHistory].slice(0, 100), // Keep only last 100 sessions
        lastUpdated: new Date().toISOString(),
      })),

      updateStudySession: (id, updates) => set((state) => ({
        studyHistory: state.studyHistory.map((session) =>
          session.id === id ? { ...session, ...updates } : session
        ),
        lastUpdated: new Date().toISOString(),
      })),

      updateCategoryProgress: (category, progress) => set((state) => ({
        categoryProgress: state.categoryProgress ? {
          ...state.categoryProgress,
          [category]: { ...state.categoryProgress[category], ...progress },
        } : null,
        lastUpdated: new Date().toISOString(),
      })),

      updateJLPTProgress: (level, progress) => set((state) => ({
        jlptProgress: state.jlptProgress ? {
          ...state.jlptProgress,
          [level]: { ...state.jlptProgress[level], ...progress },
        } : null,
        lastUpdated: new Date().toISOString(),
      })),

      incrementStudyStreak: () => set((state) => ({
        overallStats: state.overallStats ? {
          ...state.overallStats,
          studyStreak: state.overallStats.studyStreak + 1,
        } : null,
        lastUpdated: new Date().toISOString(),
      })),

      resetStudyStreak: () => set((state) => ({
        overallStats: state.overallStats ? {
          ...state.overallStats,
          studyStreak: 0,
        } : null,
        lastUpdated: new Date().toISOString(),
      })),

      updateStudyTime: (minutes) => set((state) => ({
        overallStats: state.overallStats ? {
          ...state.overallStats,
          totalStudyTime: state.overallStats.totalStudyTime + minutes,
        } : null,
        lastUpdated: new Date().toISOString(),
      })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setLastUpdated: (date) => set({ lastUpdated: date }),

      clearProgress: () => set({
        progress: null,
        overallStats: null,
        categoryProgress: null,
        jlptProgress: null,
        recentAchievements: [],
        weeklyActivity: [],
        studyHistory: [],
        lastUpdated: null,
      }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        overallStats: state.overallStats,
        categoryProgress: state.categoryProgress,
        jlptProgress: state.jlptProgress,
        recentAchievements: state.recentAchievements,
        weeklyActivity: state.weeklyActivity,
        studyHistory: state.studyHistory.slice(0, 50), // Persist only last 50 sessions
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for better performance
export const useProgress = () => useProgressStore((state) => ({
  progress: state.progress,
  overallStats: state.overallStats,
  categoryProgress: state.categoryProgress,
  jlptProgress: state.jlptProgress,
  recentAchievements: state.recentAchievements,
  weeklyActivity: state.weeklyActivity,
  studyHistory: state.studyHistory,
  isLoading: state.isLoading,
  error: state.error,
  lastUpdated: state.lastUpdated,
}));

export const useProgressActions = () => useProgressStore((state) => ({
  setProgress: state.setProgress,
  setOverallStats: state.setOverallStats,
  setCategoryProgress: state.setCategoryProgress,
  setJLPTProgress: state.setJLPTProgress,
  setRecentAchievements: state.setRecentAchievements,
  setWeeklyActivity: state.setWeeklyActivity,
  setStudyHistory: state.setStudyHistory,
  addAchievement: state.addAchievement,
  addStudySession: state.addStudySession,
  updateStudySession: state.updateStudySession,
  updateCategoryProgress: state.updateCategoryProgress,
  updateJLPTProgress: state.updateJLPTProgress,
  incrementStudyStreak: state.incrementStudyStreak,
  resetStudyStreak: state.resetStudyStreak,
  updateStudyTime: state.updateStudyTime,
  setLoading: state.setLoading,
  setError: state.setError,
  setLastUpdated: state.setLastUpdated,
  clearProgress: state.clearProgress,
  clearError: state.clearError,
}));

export const useOverallStats = () => useProgressStore((state) => state.overallStats || defaultStats);

export const useCategoryProgress = () => useProgressStore((state) => state.categoryProgress || defaultCategoryProgress);

export const useJLPTProgress = () => useProgressStore((state) => state.jlptProgress || defaultJLPTProgress);
