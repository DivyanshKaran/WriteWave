/**
 * Centralized app constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
} as const;

// Form Configuration
export const FORM_CONFIG = {
  AUTO_SAVE_DELAY: 2000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// User Configuration
export const USER_CONFIG = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 8,
  MAX_BIO_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
} as const;

// Article Configuration
export const ARTICLE_CONFIG = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,
  MAX_EXCERPT_LENGTH: 500,
  MIN_TAGS: 1,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
  MIN_TAG_LENGTH: 2,
} as const;

// Learning Configuration
export const LEARNING_CONFIG = {
  MIN_STUDY_TIME: 5, // minutes
  MAX_STUDY_TIME: 180, // minutes
  DEFAULT_STUDY_GOAL: 30, // minutes
  STREAK_RESET_HOURS: 24,
  WORDS_PER_MINUTE: 200, // for reading time calculation
} as const;

// JLPT Configuration
export const JLPT_CONFIG = {
  LEVELS: ['N5', 'N4', 'N3', 'N2', 'N1'] as const,
  KANJI_COUNTS: {
    N5: 80,
    N4: 170,
    N3: 370,
    N2: 415,
    N1: 1165,
  },
  VOCABULARY_COUNTS: {
    N5: 800,
    N4: 1500,
    N3: 3750,
    N2: 6000,
    N1: 10000,
  },
} as const;

// Character Configuration
export const CHARACTER_CONFIG = {
  HIRAGANA_COUNT: 46,
  KATAKANA_COUNT: 46,
  TOTAL_KANJI: 2136, // Joyo kanji
  RADICALS_COUNT: 214,
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  AUTO_HIDE_DELAY: 5000,
  MAX_NOTIFICATIONS: 5,
  RETRY_DELAY: 1000,
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system' as const,
  AVAILABLE_THEMES: ['light', 'dark', 'system'] as const,
  FONT_SIZES: ['small', 'medium', 'large'] as const,
  DEFAULT_FONT_SIZE: 'medium' as const,
} as const;

// Language Configuration
export const LANGUAGE_CONFIG = {
  DEFAULT_LANGUAGE: 'en' as const,
  AVAILABLE_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ] as const,
  ROMANIZATION_STYLES: [
    { code: 'hepburn', name: 'Hepburn' },
    { code: 'kunrei', name: 'Kunrei-shiki' },
    { code: 'nihon', name: 'Nihon-shiki' },
  ] as const,
  DEFAULT_ROMANIZATION: 'hepburn' as const,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  ROMANIZATION: 'romanization',
  STUDY_GOAL: 'study_goal',
  NOTIFICATION_SETTINGS: 'notification_settings',
  DRAFT_ARTICLE: 'draft_article',
  LAST_VISITED_ROUTE: 'last_visited_route',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  APP: '/app',
  PROFILE: '/me',
  SETTINGS: '/settings',
  CHARACTERS: '/characters',
  HIRAGANA: '/characters/hiragana',
  KATAKANA: '/characters/katakana',
  KANJI: '/characters/kanji',
  RADICALS: '/characters/radicals',
  VOCABULARY: '/vocabulary',
  LESSONS: '/lessons',
  PROGRESS: '/progress',
  COMMUNITY: '/community',
  FORUMS: '/forums',
  GROUPS: '/groups',
  ARTICLES: '/articles',
  CREATE_ARTICLE: '/articles/create',
  ARTICLE_DETAIL: '/articles/:id',
  NOTIFICATIONS: '/notifications',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  ARTICLE_CREATED: 'Article created successfully.',
  ARTICLE_UPDATED: 'Article updated successfully.',
  ARTICLE_DELETED: 'Article deleted successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  ACCOUNT_DELETED: 'Account deleted successfully.',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING_PROFILE: 'Loading profile...',
  LOADING_ARTICLES: 'Loading articles...',
  LOADING_PROGRESS: 'Loading progress...',
  SAVING_CHANGES: 'Saving changes...',
  PUBLISHING_ARTICLE: 'Publishing article...',
  UPLOADING_FILE: 'Uploading file...',
} as const;

// Export all constants as a single object for easy access
export const CONFIG = {
  API: API_CONFIG,
  PAGINATION: PAGINATION_CONFIG,
  SEARCH: SEARCH_CONFIG,
  FORM: FORM_CONFIG,
  USER: USER_CONFIG,
  ARTICLE: ARTICLE_CONFIG,
  LEARNING: LEARNING_CONFIG,
  JLPT: JLPT_CONFIG,
  CHARACTER: CHARACTER_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG,
  THEME: THEME_CONFIG,
  LANGUAGE: LANGUAGE_CONFIG,
  STORAGE: STORAGE_KEYS,
  ROUTES,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  LOADING: LOADING_MESSAGES,
} as const;
