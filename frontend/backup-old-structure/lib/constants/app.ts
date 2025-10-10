// Application constants
export const APP_CONFIG = {
  NAME: 'WriteWave',
  VERSION: '1.0.0',
  DESCRIPTION: 'Japanese Character Learning Platform',
  AUTHOR: 'WriteWave Team',
  WEBSITE: 'https://writewave.com',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_OCR: true,
  ENABLE_REAL_TIME_FEEDBACK: true,
  ENABLE_GAMIFICATION: true,
  ENABLE_COMMUNITY: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
} as const;

// Learning configuration
export const LEARNING_CONFIG = {
  DEFAULT_LESSON_DURATION: 15, // minutes
  MAX_LESSON_DURATION: 60, // minutes
  MIN_LESSON_DURATION: 5, // minutes
  DEFAULT_CHARACTERS_PER_LESSON: 10,
  MAX_CHARACTERS_PER_LESSON: 50,
  MIN_CHARACTERS_PER_LESSON: 5,
  PRACTICE_SESSIONS_PER_DAY: 3,
  STREAK_THRESHOLD: 7, // days
} as const;

// Gamification constants
export const GAMIFICATION_CONFIG = {
  XP_PER_CORRECT_CHARACTER: 10,
  XP_PER_LESSON_COMPLETION: 50,
  XP_PER_STREAK_DAY: 25,
  XP_PER_ACHIEVEMENT: 100,
  LEVEL_UP_THRESHOLD: 1000, // XP
  MAX_LEVEL: 100,
  STREAK_BONUS_MULTIPLIER: 1.5,
  PERFECT_SCORE_BONUS: 2.0,
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 500, // ms
  TOAST_DURATION: 3000, // ms
  MODAL_ANIMATION_DURATION: 200, // ms
  PAGE_TRANSITION_DURATION: 400, // ms
  LOADING_SPINNER_SIZE: 24, // px
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Please log in to continue.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait and try again.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  OCR_PROCESSING_ERROR: 'Failed to process character recognition.',
  CHARACTER_NOT_FOUND: 'Character not found in database.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  LESSON_COMPLETED: 'Lesson completed! Great job!',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  STREAK_MAINTAINED: 'Streak maintained!',
  CHARACTER_MASTERED: 'Character mastered!',
  PROGRESS_SAVED: 'Progress saved successfully!',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 500,
  POST_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 500,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LEARNING_PROGRESS: 'learning_progress',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  DRAFT_POST: 'draft_post',
  DRAFT_COMMENT: 'draft_comment',
} as const;

// Theme configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language configuration
export const LANGUAGE_CONFIG = {
  EN: 'en',
  JA: 'ja',
  DEFAULT: 'en',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak',
  LESSON_REMINDER: 'lesson_reminder',
  COMMUNITY: 'community',
  SYSTEM: 'system',
} as const;

// Analytics events
export const ANALYTICS_EVENTS = {
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  CHARACTER_PRACTICED: 'character_practiced',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STREAK_MAINTAINED: 'streak_maintained',
  COMMUNITY_POST_CREATED: 'community_post_created',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
} as const;
