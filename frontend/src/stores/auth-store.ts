import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserPreferences, NotificationSettings, LearningPreferences, PrivacySettings } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateLearningPreferences: (preferences: Partial<LearningPreferences>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  clearError: () => void;
  setTokens: (token: string, refreshToken: string) => void;
}

type AuthStore = AuthState & AuthActions;

const defaultUserPreferences: UserPreferences = {
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
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: localStorage.getItem('auth_token'),
      refreshToken: localStorage.getItem('refresh_token'),

      // Actions
      setTokens: (token: string, refreshToken: string) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken });
      },

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (user) => set({ 
        user, 
        isAuthenticated: true, 
        error: null,
        isLoading: false 
      }),

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false,
          token: null,
          refreshToken: null
        });
      },

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      updatePreferences: (preferences) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...preferences,
          },
        } : null,
      })),

      updateNotificationSettings: (settings) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            notifications: {
              ...state.user.preferences.notifications,
              ...settings,
            },
          },
        } : null,
      })),

      updateLearningPreferences: (preferences) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            learning: {
              ...state.user.preferences.learning,
              ...preferences,
            },
          },
        } : null,
      })),

      updatePrivacySettings: (settings) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            privacy: {
              ...state.user.preferences.privacy,
              ...settings,
            },
          },
        } : null,
      })),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Skip token persistence - it's already in localStorage
      skipHydration: true,
    }
  )
);

// Selectors for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setLoading: state.setLoading,
  setError: state.setError,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
  updatePreferences: state.updatePreferences,
  updateNotificationSettings: state.updateNotificationSettings,
  updateLearningPreferences: state.updateLearningPreferences,
  updatePrivacySettings: state.updatePrivacySettings,
  clearError: state.clearError,
}));

export const useUserPreferences = () => useAuthStore((state) => 
  state.user?.preferences || defaultUserPreferences
);
