// API Types - Request/Response types for all API endpoints

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication API Types
export interface AuthLoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
  goals?: string[];
}

export interface AuthRegisterResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface AuthRefreshRequest {
  refresh_token: string;
}

export interface AuthRefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthForgotPasswordRequest {
  email: string;
}

export interface AuthResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthVerifyEmailRequest {
  token: string;
}

// User API Types
export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  joined_at: string;
}

export interface UserUpdateProfileRequest {
  name?: string;
  avatar?: string;
  settings?: Record<string, unknown>;
}

export interface UserSettingsResponse {
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

// Content API Types
export interface CharacterResponse {
  id: string;
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  readings: string[];
  meanings: string[];
  stroke_order: string[];
  difficulty: number;
}

export interface CharactersListRequest {
  type?: 'hiragana' | 'katakana' | 'kanji';
  difficulty?: number;
  limit?: number;
  offset?: number;
}

export interface CharactersListResponse {
  characters: CharacterResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface VocabularyResponse {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  characters: string[];
  difficulty: number;
  category: string;
}

export interface LessonResponse {
  id: string;
  title: string;
  description: string;
  characters: string[];
  vocabulary: string[];
  difficulty: number;
  estimatedTime: number;
  completed: boolean;
  progress: number;
}

// Progress API Types
export interface ProgressStatsResponse {
  total_xp: number;
  level: number;
  streak: number;
  achievements: number;
  characters_learned: number;
  lessons_completed: number;
}

export interface ProgressAddXPRequest {
  amount: number;
  source: string;
  description?: string;
}

export interface ProgressAddXPResponse {
  newTotal: number;
  levelUp: boolean;
  newLevel?: number;
}

export interface AchievementResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface LeaderboardResponse {
  entries: Array<{
    id: string;
    name: string;
    xp: number;
    level: number;
    avatar?: string;
    rank: number;
  }>;
  userRank?: number;
  totalUsers: number;
}

// Community API Types
export interface DiscussionResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  locked: boolean;
}

export interface DiscussionCreateRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface PostResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  discussionId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked: boolean;
}

export interface PostCreateRequest {
  content: string;
  discussionId: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  postId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked: boolean;
}

export interface CommentCreateRequest {
  content: string;
  postId: string;
}

export interface StudyGroupResponse {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  joined: boolean;
}

export interface StudyGroupCreateRequest {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxMembers: number;
  isPublic: boolean;
}

// Notification API Types
export interface NotificationResponse {
  id: string;
  type: 'achievement' | 'streak' | 'lesson_reminder' | 'community' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationPreferencesResponse {
  email: boolean;
  push: boolean;
  achievements: boolean;
  streaks: boolean;
  community: boolean;
  lessonReminders: boolean;
}

export interface NotificationPreferencesRequest {
  email?: boolean;
  push?: boolean;
  achievements?: boolean;
  streaks?: boolean;
  community?: boolean;
  lessonReminders?: boolean;
}

// Analytics API Types
export interface AnalyticsEventRequest {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export interface AnalyticsMetricsResponse {
  period: string;
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
}

export interface AnalyticsReportResponse {
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
  insights: string[];
  recommendations: string[];
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validation?: ValidationError[];
  };
  timestamp: string;
}
