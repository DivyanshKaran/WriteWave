/**
 * Comprehensive TypeScript interfaces for the application
 */

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

// User interfaces
export interface User extends BaseEntity {
  name: string;
  username: string;
  email: string;
  location?: string;
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'ja' | 'es' | 'fr';
  romanization: 'hepburn' | 'kunrei' | 'nihon';
  notifications: NotificationSettings;
  learning: LearningPreferences;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  achievements: boolean;
  community: boolean;
  newsletter: boolean;
  email: boolean;
  push: boolean;
}

export interface LearningPreferences {
  dailyGoal: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audioPlayback: boolean;
  strokeOrder: boolean;
  autoAdvance: boolean;
  showHints: boolean;
}

export interface PrivacySettings {
  profilePublic: boolean;
  showProgress: boolean;
  showAchievements: boolean;
  allowMessages: boolean;
}

export interface UserStats {
  totalCharacters: number;
  totalVocabulary: number;
  studyStreak: number;
  totalStudyTime: number; // minutes
  lessonsCompleted: number;
  articlesWritten: number;
  totalViews: number;
  totalLikes: number;
  level: number;
  experience: number;
}

// Article interfaces
export interface Article extends BaseEntity {
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  author: User;
  tags: string[];
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  isTrending: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  slug: string;
}

export interface ArticleComment extends BaseEntity {
  articleId: string;
  authorId: string;
  author: User;
  content: string;
  parentId?: string;
  replies: ArticleComment[];
  likes: number;
  isEdited: boolean;
}

// Badge interfaces
export interface Badge extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'achievement' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  reward: {
    experience: number;
    points: number;
  };
}

export interface BadgeRequirement {
  type: 'characters_learned' | 'study_streak' | 'lessons_completed' | 'articles_written' | 'community_posts';
  value: number;
  description: string;
}

export interface UserBadge extends BaseEntity {
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  progress: number; // 0-100
}

// Progress interfaces
export interface ProgressData {
  overallStats: UserStats;
  categoryProgress: CategoryProgress;
  jlptProgress: JLPTProgress;
  weeklyActivity: WeeklyActivity[];
  recentAchievements: Achievement[];
  studyHistory: StudySession[];
}

export interface CategoryProgress {
  hiragana: ProgressItem;
  katakana: ProgressItem;
  kanji: ProgressItem;
  vocabulary: ProgressItem;
  grammar: ProgressItem;
}

export interface ProgressItem {
  learned: number;
  total: number;
  percentage: number;
  lastStudied?: string;
}

export interface JLPTProgress {
  N5: JLPTLevelProgress;
  N4: JLPTLevelProgress;
  N3: JLPTLevelProgress;
  N2: JLPTLevelProgress;
  N1: JLPTLevelProgress;
}

export interface JLPTLevelProgress {
  kanji: number;
  vocabulary: number;
  kanjiProgress: number;
  vocabProgress: number;
  grammarProgress: number;
  listeningProgress: number;
  readingProgress: number;
}

export interface WeeklyActivity {
  day: string;
  minutes: number;
  characters: number;
  vocabulary: number;
  lessons: number;
}

export interface Achievement extends BaseEntity {
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'special';
  earnedAt: string;
  experience: number;
  points: number;
}

export interface StudySession extends BaseEntity {
  userId: string;
  characterType: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  characters: string[];
  duration: number; // minutes
  accuracy: number; // percentage
  score: number;
  level: string;
  completedAt: string;
}

// Character interfaces
export interface Character {
  id: string;
  character: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  readings: CharacterReading[];
  meanings: string[];
  strokeOrder: string[];
  radical?: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  frequency: number;
  difficulty: number;
}

export interface CharacterReading {
  type: 'on' | 'kun' | 'nanori';
  reading: string;
  examples?: string[];
}

export interface UserCharacter extends BaseEntity {
  userId: string;
  characterId: string;
  character: Character;
  learnedAt: string;
  mastery: number; // 0-100
  lastReviewed: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

// Vocabulary interfaces
export interface Vocabulary {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  partOfSpeech: string[];
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  examples: VocabularyExample[];
  tags: string[];
  frequency: number;
}

export interface VocabularyExample {
  japanese: string;
  english: string;
  reading?: string;
}

export interface UserVocabulary extends BaseEntity {
  userId: string;
  vocabularyId: string;
  vocabulary: Vocabulary;
  learnedAt: string;
  mastery: number; // 0-100
  lastReviewed: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

// Lesson interfaces
export interface Lesson extends BaseEntity {
  title: string;
  description: string;
  content: LessonContent[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  estimatedTime: number; // minutes
  prerequisites: string[];
  objectives: string[];
  isPublished: boolean;
  order: number;
}

export interface LessonContent {
  type: 'text' | 'image' | 'audio' | 'video' | 'interactive' | 'quiz';
  content: any;
  order: number;
}

export interface UserLesson extends BaseEntity {
  userId: string;
  lessonId: string;
  lesson: Lesson;
  startedAt: string;
  completedAt?: string;
  progress: number; // 0-100
  score?: number;
  timeSpent: number; // minutes
}

// Community interfaces
export interface Forum extends BaseEntity {
  title: string;
  description: string;
  category: 'general' | 'learning' | 'jlpt' | 'culture' | 'off-topic';
  isActive: boolean;
  postCount: number;
  memberCount: number;
  lastPostAt?: string;
  moderators: string[];
}

export interface ForumPost extends BaseEntity {
  forumId: string;
  forum: Forum;
  authorId: string;
  author: User;
  title: string;
  content: string;
  tags: string[];
  views: number;
  likes: number;
  replies: number;
  isPinned: boolean;
  isLocked: boolean;
  lastReplyAt?: string;
}

export interface ForumReply extends BaseEntity {
  postId: string;
  post: ForumPost;
  authorId: string;
  author: User;
  content: string;
  parentId?: string;
  likes: number;
  isEdited: boolean;
}

export interface StudyGroup extends BaseEntity {
  name: string;
  description: string;
  category: 'jlpt' | 'conversation' | 'writing' | 'reading' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  maxMembers: number;
  currentMembers: number;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  moderators: string[];
  rules: string[];
  tags: string[];
}

export interface GroupMember extends BaseEntity {
  groupId: string;
  group: StudyGroup;
  userId: string;
  user: User;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  isActive: boolean;
}

// Notification interfaces
export interface Notification extends BaseEntity {
  userId: string;
  type: 'achievement' | 'message' | 'reply' | 'like' | 'follow' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
}

// Search interfaces
export interface SearchFilters {
  query?: string;
  tags?: string[];
  author?: string;
  category?: string;
  difficulty?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: SearchFilters;
}

// Form interfaces
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI interfaces
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  isOpen: boolean;
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Export all interfaces as a single object for easy access
export const Types = {
  BaseEntity,
  ApiResponse,
  ApiError,
  User,
  UserPreferences,
  NotificationSettings,
  LearningPreferences,
  PrivacySettings,
  UserStats,
  Article,
  ArticleComment,
  Badge,
  BadgeRequirement,
  UserBadge,
  ProgressData,
  CategoryProgress,
  ProgressItem,
  JLPTProgress,
  JLPTLevelProgress,
  WeeklyActivity,
  Achievement,
  StudySession,
  Character,
  CharacterReading,
  UserCharacter,
  Vocabulary,
  VocabularyExample,
  UserVocabulary,
  Lesson,
  LessonContent,
  UserLesson,
  Forum,
  ForumPost,
  ForumReply,
  StudyGroup,
  GroupMember,
  Notification,
  SearchFilters,
  SearchResult,
  FormField,
  FormState,
  Toast,
  Modal,
  LoadingState,
} as const;
