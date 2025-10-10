// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
  },

  // User endpoints
  USERS: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    DELETE_ACCOUNT: '/api/v1/users/account',
    SETTINGS: '/api/v1/users/settings',
  },

  // Content endpoints
  CONTENT: {
    CHARACTERS: '/api/v1/characters',
    CHARACTER_BY_ID: (id: string) => `/api/v1/characters/${id}`,
    VOCABULARY: '/api/v1/vocabulary',
    LESSONS: '/api/v1/lessons',
    LESSON_BY_ID: (id: string) => `/api/v1/lessons/${id}`,
    MEDIA: '/api/v1/media',
  },

  // Progress endpoints
  PROGRESS: {
    XP: '/api/v1/progress/xp',
    LEVEL: '/api/v1/progress/level',
    STREAKS: '/api/v1/progress/streaks',
    ACHIEVEMENTS: '/api/v1/progress/achievements',
    MASTERY: '/api/v1/progress/mastery',
    STATS: '/api/v1/progress/stats',
  },

  // Community endpoints
  COMMUNITY: {
    DISCUSSIONS: '/api/v1/community/discussions',
    DISCUSSION_BY_ID: (id: string) => `/api/v1/community/discussions/${id}`,
    POSTS: '/api/v1/community/posts',
    POST_BY_ID: (id: string) => `/api/v1/community/posts/${id}`,
    COMMENTS: '/api/v1/community/comments',
    STUDY_GROUPS: '/api/v1/community/groups',
    GROUP_BY_ID: (id: string) => `/api/v1/community/groups/${id}`,
    LEADERBOARD: '/api/v1/community/leaderboard',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    PREFERENCES: '/api/v1/notifications/preferences',
    SUBSCRIBE: '/api/v1/notifications/subscribe',
  },

  // Analytics endpoints
  ANALYTICS: {
    EVENTS: '/api/v1/analytics/events',
    METRICS: '/api/v1/analytics/metrics',
    REPORTS: '/api/v1/analytics/reports',
    LEARNING_INSIGHTS: '/api/v1/analytics/learning-insights',
  },

  // WebSocket endpoints
  WEBSOCKET: {
    COMMUNITY: '/api/v1/websocket/community',
    NOTIFICATIONS: '/api/v1/websocket/notifications',
    PRESENCE: '/api/v1/websocket/presence',
  },
} as const;

// Helper function to build query strings
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to build full URL with query params
export const buildUrl = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  const queryString = params ? buildQueryString(params) : '';
  return `${endpoint}${queryString}`;
};
