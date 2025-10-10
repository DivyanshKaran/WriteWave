// API Service Functions
import { api } from '@/lib/api/client';
import { API_ENDPOINTS, buildUrl } from '@/lib/api/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  Character,
  ProgressStats,
} from '@/types';

// Auth Service
export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),
  
  register: (data: RegisterRequest) =>
    api.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data),
  
  refresh: (refreshToken: string) =>
    api.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken }),
  
  logout: () =>
    api.post(API_ENDPOINTS.AUTH.LOGOUT),
  
  forgotPassword: (email: string) =>
    api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
  
  verifyEmail: (token: string) =>
    api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
};

// User Service
export const userService = {
  getProfile: () =>
    api.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE),
  
  updateProfile: (data: Partial<UserProfile>) =>
    api.put<UserProfile>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  
  deleteAccount: () =>
    api.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT),
  
  getSettings: () =>
    api.get(API_ENDPOINTS.USERS.SETTINGS),
  
  updateSettings: (data: any) =>
    api.put(API_ENDPOINTS.USERS.SETTINGS, data),
};

// Content Service
export const contentService = {
  getCharacters: (params?: { type?: string; difficulty?: number; limit?: number; offset?: number }) =>
    api.get<Character[]>(buildUrl(API_ENDPOINTS.CONTENT.CHARACTERS, params)),
  
  getCharacter: (id: string) =>
    api.get<Character>(API_ENDPOINTS.CONTENT.CHARACTER_BY_ID(id)),
  
  getVocabulary: (params?: { level?: number; limit?: number; offset?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.CONTENT.VOCABULARY, params)),
  
  getLessons: (params?: { level?: number; type?: string; limit?: number; offset?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.CONTENT.LESSONS, params)),
  
  getLesson: (id: string) =>
    api.get(API_ENDPOINTS.CONTENT.LESSON_BY_ID(id)),
  
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(API_ENDPOINTS.CONTENT.MEDIA, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Progress Service
export const progressService = {
  getStats: () =>
    api.get<ProgressStats>(API_ENDPOINTS.PROGRESS.STATS),
  
  addXP: (amount: number, source: string) =>
    api.post(API_ENDPOINTS.PROGRESS.XP, { amount, source }),
  
  getLevel: () =>
    api.get(API_ENDPOINTS.PROGRESS.LEVEL),
  
  getStreaks: () =>
    api.get(API_ENDPOINTS.PROGRESS.STREAKS),
  
  getAchievements: () =>
    api.get(API_ENDPOINTS.PROGRESS.ACHIEVEMENTS),
  
  getMastery: (characterId: string) =>
    api.get(`${API_ENDPOINTS.PROGRESS.MASTERY}?character_id=${characterId}`),
  
  updateMastery: (characterId: string, mastery: number) =>
    api.post(API_ENDPOINTS.PROGRESS.MASTERY, { character_id: characterId, mastery }),
};

// Community Service
export const communityService = {
  getDiscussions: (params?: { category?: string; limit?: number; offset?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.COMMUNITY.DISCUSSIONS, params)),
  
  getDiscussion: (id: string) =>
    api.get(API_ENDPOINTS.COMMUNITY.DISCUSSION_BY_ID(id)),
  
  createDiscussion: (data: { title: string; content: string; category?: string }) =>
    api.post(API_ENDPOINTS.COMMUNITY.DISCUSSIONS, data),
  
  getPosts: (discussionId: string, params?: { limit?: number; offset?: number }) =>
    api.get(buildUrl(`${API_ENDPOINTS.COMMUNITY.POSTS}?discussion_id=${discussionId}`, params)),
  
  createPost: (data: { discussion_id: string; content: string }) =>
    api.post(API_ENDPOINTS.COMMUNITY.POSTS, data),
  
  getComments: (postId: string, params?: { limit?: number; offset?: number }) =>
    api.get(buildUrl(`${API_ENDPOINTS.COMMUNITY.COMMENTS}?post_id=${postId}`, params)),
  
  createComment: (data: { post_id: string; content: string }) =>
    api.post(API_ENDPOINTS.COMMUNITY.COMMENTS, data),
  
  getStudyGroups: (params?: { category?: string; limit?: number; offset?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.COMMUNITY.STUDY_GROUPS, params)),
  
  getStudyGroup: (id: string) =>
    api.get(API_ENDPOINTS.COMMUNITY.GROUP_BY_ID(id)),
  
  joinStudyGroup: (id: string) =>
    api.post(`${API_ENDPOINTS.COMMUNITY.STUDY_GROUPS}/${id}/join`),
  
  leaveStudyGroup: (id: string) =>
    api.post(`${API_ENDPOINTS.COMMUNITY.STUDY_GROUPS}/${id}/leave`),
  
  getLeaderboard: (params?: { period?: string; limit?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.COMMUNITY.LEADERBOARD, params)),
};

// Notification Service
export const notificationService = {
  getNotifications: (params?: { unread_only?: boolean; limit?: number; offset?: number }) =>
    api.get(buildUrl(API_ENDPOINTS.NOTIFICATIONS.LIST, params)),
  
  markAsRead: (id: string) =>
    api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  
  getPreferences: () =>
    api.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES),
  
  updatePreferences: (data: any) =>
    api.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, data),
  
  subscribe: (subscription: any) =>
    api.post(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, subscription),
};

// Analytics Service
export const analyticsService = {
  trackEvent: (event: string, data?: any) =>
    api.post(API_ENDPOINTS.ANALYTICS.EVENTS, { event, data }),
  
  getMetrics: (params?: { period?: string; metric?: string }) =>
    api.get(buildUrl(API_ENDPOINTS.ANALYTICS.METRICS, params)),
  
  getReports: (params?: { type?: string; period?: string }) =>
    api.get(buildUrl(API_ENDPOINTS.ANALYTICS.REPORTS, params)),
  
  getLearningInsights: () =>
    api.get(API_ENDPOINTS.ANALYTICS.LEARNING_INSIGHTS),
};
