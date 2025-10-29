// Environment configuration for API endpoints
export const API_CONFIG = {
  // Base URLs for different environments
  baseURL: {
    development: 'http://localhost:8000',
    staging: 'https://staging-api.writewave.app',
    production: 'https://api.writewave.app',
  },
  
  // Service-specific endpoints
  services: {
    user: '/api/v1',
    content: '/api/v1',
    progress: '/api/v1',
    community: '/api/v1/community',
    articles: '/api',
    notifications: '/api',
    analytics: '/api',
    health: '/health',
  },
  
  // Kong API Gateway configuration
  kong: {
    baseURL: import.meta.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://api.writewave.app' 
      : 'http://localhost:8000'),
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
  },
  
  // WebSocket configuration
  websocket: {
    url: import.meta.env.VITE_WS_BASE_URL || (process.env.NODE_ENV === 'production'
      ? 'wss://api.writewave.app/ws'
      : 'ws://localhost:8000/ws'),
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  
  // Feature flags
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableCommunity: true,
    enableProgressTracking: true,
    enableOfflineMode: false,
  },
  
  // Rate limiting
  rateLimits: {
    requests: {
      perMinute: 100,
      perHour: 1000,
    },
    uploads: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    },
  },
  
  // Cache configuration
  cache: {
    ttl: {
      user: 5 * 60 * 1000, // 5 minutes
      content: 10 * 60 * 1000, // 10 minutes
      progress: 2 * 60 * 1000, // 2 minutes
      community: 5 * 60 * 1000, // 5 minutes
      articles: 15 * 60 * 1000, // 15 minutes
    },
    maxSize: 100, // Maximum number of cached items
  },
  
  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000,
    showUserFriendlyErrors: true,
  },
  
  // Authentication
  auth: {
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    autoRefresh: true,
    logoutOnRefreshFailure: true,
  },
};

// Get current environment
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'staging') {
    return 'staging';
  }
  return 'development';
};

// Get base URL for current environment
export const getBaseURL = (): string => {
  const env = getCurrentEnvironment();
  return API_CONFIG.baseURL[env];
};

// Get service URL
export const getServiceURL = (service: keyof typeof API_CONFIG.services): string => {
  const baseURL = getBaseURL();
  const servicePath = API_CONFIG.services[service];
  return `${baseURL}${servicePath}`;
};

// Environment variables
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || getBaseURL(),
  WS_URL: (import.meta as any).env?.VITE_WS_BASE_URL || API_CONFIG.websocket.url,
  ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_COMMUNITY: process.env.VITE_ENABLE_COMMUNITY === 'true',
  ENABLE_PROGRESS_TRACKING: process.env.VITE_ENABLE_PROGRESS_TRACKING === 'true',
  ENABLE_OFFLINE_MODE: process.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  DEBUG_MODE: process.env.VITE_DEBUG_MODE === 'true',
  LOG_LEVEL: process.env.VITE_LOG_LEVEL || 'info',
};

// Service endpoints mapping
export const SERVICE_ENDPOINTS = {
  // User Service
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    settings: '/users/settings',
    avatar: '/users/avatar',
    stats: '/users/stats',
    search: '/users/search',
    deactivate: '/users/deactivate',
    delete: '/users/account',
  },
  
  // Content Service
  characters: {
    hiragana: '/characters/hiragana',
    katakana: '/characters/katakana',
    kanji: '/characters/kanji',
    character: '/characters',
    search: '/characters/search',
    statistics: '/characters/statistics',
    random: '/characters/random',
  },
  vocabulary: {
    list: '/vocabulary',
    item: '/vocabulary',
    search: '/vocabulary/search',
    partOfSpeech: '/vocabulary/part-of-speech',
    category: '/vocabulary/category',
    jlpt: '/vocabulary/jlpt',
    frequency: '/vocabulary/frequency',
    statistics: '/vocabulary/statistics',
    random: '/vocabulary/random',
  },
  lessons: {
    list: '/lessons',
    item: '/lessons',
    steps: '/lessons',
    prerequisites: '/lessons',
    level: '/lessons/level',
    category: '/lessons/category',
    statistics: '/lessons/statistics',
    progression: '/lessons/progression',
  },
  media: {
    list: '/media',
    item: '/media',
    file: '/media',
    thumbnail: '/media',
    upload: '/media/upload',
    type: '/media/type',
    category: '/media/category',
    search: '/media/search',
    statistics: '/media/statistics',
  },
  
  // Progress Service
  progress: {
    user: '/progress',
    characterPractice: '/progress/character-practice',
    xp: '/progress/xp',
    streaks: '/progress/streaks',
    achievements: '/progress/achievements',
    mastery: '/progress/update-mastery',
    analytics: '/progress/analytics',
    leaderboard: '/progress/leaderboard',
    rank: '/progress/rank',
    insights: '/progress/insights',
    metrics: '/progress/metrics',
    freezeStreak: '/progress/freeze-streak',
    review: '/progress/review',
    weakAreas: '/progress/weak-areas',
  },
  
  // Community Service
  community: {
    forums: '/community/forums',
    posts: '/community/posts',
    comments: '/community/comments',
    studyGroups: '/community/study-groups',
    challenges: '/community/challenges',
    friends: '/community/friends',
    followers: '/community/users',
    activity: '/community/activity',
    leaderboard: '/community/leaderboard',
    achievements: '/community/achievements',
  },
  
  // Articles Service
  articles: {
    list: '/articles',
    item: '/articles',
    trending: '/articles/trending',
    featured: '/articles/featured',
    user: '/articles/user',
    stats: '/articles/stats',
    comments: '/articles',
    tags: '/articles/tags',
  },
  
  // Notification Service
  notifications: {
    list: '/notifications/user',
    item: '/notifications',
    preferences: '/preferences',
    subscriptions: '/subscriptions',
    vapidKey: '/subscriptions/vapid-key',
  },
  
  // Analytics Service
  analytics: {
    events: '/events',
    analytics: '/analytics',
    dashboards: '/dashboards',
    reports: '/reports',
    abTests: '/ab-tests',
  },
  
  // Health Check
  health: {
    general: '/health',
    users: '/health/users',
    content: '/health/content',
    progress: '/health/progress',
    community: '/health/community',
    notifications: '/health/notifications',
    analytics: '/health/analytics',
  },
};

// Request/Response interceptors configuration
export const INTERCEPTOR_CONFIG = {
  request: {
    addAuthToken: true,
    addRequestId: true,
    addTimestamp: true,
    addUserAgent: true,
  },
  response: {
    handleErrors: true,
    retryOnFailure: true,
    showNotifications: true,
    logErrors: true,
  },
};

// WebSocket event types
export const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  USER_STOPPED_TYPING: 'user:stopped_typing',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  
  // Community events
  POST_CREATED: 'post:created',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  
  // Progress events
  PROGRESS_UPDATED: 'progress:updated',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  STREAK_UPDATED: 'streak:updated',
  
  // Study group events
  GROUP_JOINED: 'group:joined',
  GROUP_LEFT: 'group:left',
  GROUP_UPDATED: 'group:updated',
  CHALLENGE_CREATED: 'challenge:created',
  
  // Error events
  ERROR: 'error',
  WARNING: 'warning',
};

// API response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error messages mapping
export const ERROR_MESSAGES = {
  [API_STATUS.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [API_STATUS.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [API_STATUS.FORBIDDEN]: 'Access denied. You do not have permission.',
  [API_STATUS.NOT_FOUND]: 'The requested resource was not found.',
  [API_STATUS.CONFLICT]: 'A conflict occurred. The resource may already exist.',
  [API_STATUS.UNPROCESSABLE_ENTITY]: 'The request could not be processed.',
  [API_STATUS.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
  [API_STATUS.INTERNAL_SERVER_ERROR]: 'An internal server error occurred.',
  [API_STATUS.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};

export default API_CONFIG;
