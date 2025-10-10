// User Types - Authentication, Profile, and User-related types

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  goals?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  joined_at: string;
}

// User Store State
export interface UserState {
  // Auth state
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

// Auth Hook State (legacy - for compatibility)
export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// User Settings and Preferences
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ja';
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    streaks: boolean;
    community: boolean;
  };
  privacy: {
    profilePublic: boolean;
    progressPublic: boolean;
    leaderboardVisible: boolean;
  };
  learning: {
    dailyGoal: number;
    reminderTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// User Statistics
export interface UserStats {
  totalLearningTime: number; // in minutes
  charactersLearned: number;
  charactersMastered: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  joinDate: string;
  lastActive: string;
}

// User Achievement Progress
export interface UserAchievementProgress {
  achievementId: string;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: string;
  xpEarned: number;
}

// User Learning Goals
export interface LearningGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'character' | 'level';
  target: number;
  current: number;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

// User Study Group Membership
export interface StudyGroupMembership {
  groupId: string;
  groupName: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  active: boolean;
}

// User Social Connections
export interface UserConnection {
  userId: string;
  username: string;
  avatar?: string;
  status: 'pending' | 'accepted' | 'blocked';
  connectedAt?: string;
}

// User Activity Log
export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'character_practiced' | 'lesson_completed' | 'achievement_unlocked';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
