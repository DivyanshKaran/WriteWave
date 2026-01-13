import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

// API Configuration
const API_CONFIG = {
  baseURL:
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
    (process.env.NODE_ENV === 'production' ? 'https://api.writewave.app' : 'http://localhost:8000'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Simple UUID v4 generator for request correlation when needed
function generateRequestId(): string {
  // Not crypto-strong; sufficient for correlation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Normalize backend errors into a consistent shape
function normalizeApiError(response: any) {
  const status = response?.status ?? 0;
  const data = response?.data ?? {};
  const message = data?.message || data?.error || 'Request failed';
  const code = data?.code || status;
  const traceId = response?.headers?.['x-request-id'] || response?.headers?.['x-correlation-id'];
  return { status, code, message, details: data, traceId };
}

// Single-flight refresh control
let refreshPromise: Promise<void> | null = null;
async function refreshTokensIfNeeded(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  refreshPromise = (async () => {
    try {
      // Prefer refreshed tokens returned via headers from Kong (if any) handled per-response below.
      if (!refreshToken) throw new Error('No refresh token');

      // Try canonical refresh endpoint first
      const url = `${API_CONFIG.baseURL}/api/v1/auth/refresh`;
      const resp = await axios.post(url, { refreshToken }, { timeout: 10000 });
      const newAccess = resp.data?.accessToken || resp.data?.token;
      const newRefresh = resp.data?.refreshToken || refreshToken;
      if (!newAccess) throw new Error('No access token in refresh response');
      setTokens(newAccess, newRefresh);
    } catch (e1: any) {
      // Fallback legacy path name if backend differs
      try {
        const url2 = `${API_CONFIG.baseURL}/api/v1/auth/refresh-token`;
        const resp2 = await axios.post(url2, { refreshToken: useAuthStore.getState().refreshToken }, { timeout: 10000 });
        const newAccess = resp2.data?.accessToken || resp2.data?.token;
        const newRefresh = resp2.data?.refreshToken || useAuthStore.getState().refreshToken;
        if (!newAccess) throw new Error('No access token in refresh response');
        useAuthStore.getState().setTokens(newAccess, newRefresh);
      } catch (e2) {
        logout();
        throw e2;
      }
    } finally {
      // allow another refresh later
      const p = refreshPromise; // capture
      refreshPromise = null;
      await p?.catch(() => undefined);
    }
  })();
  return refreshPromise;
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (!config.headers) config.headers = {} as any;
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    if (!(config.headers as any)['X-Request-Id']) {
      (config.headers as any)['X-Request-Id'] = generateRequestId();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and auto-refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If Kong issued new tokens in headers, persist them
    const newAccess = response.headers?.['x-new-token'];
    const newRefresh = response.headers?.['x-refresh-token'];
    if (newAccess) {
      useAuthStore.getState().setTokens(newAccess, newRefresh || useAuthStore.getState().refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    // Only attempt refresh once per request
    if (status === 401 && !originalRequest.__isRetried) {
      originalRequest.__isRetried = true;
      try {
        await refreshTokensIfNeeded();
        // Update auth header and replay
        const token = useAuthStore.getState().token;
        if (!originalRequest.headers) originalRequest.headers = {} as any;
        if (token) (originalRequest.headers as any).Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (e) {
        useAuthStore.getState().logout();
        // Let callers handle redirect; avoid hard navigation here to keep SPA flow predictable
      }
    }

    // Normalize error before rejecting
    const normalized = normalizeApiError(error?.response);
    return Promise.reject(normalized);
  }
);

// API Service Classes
export class UserService {
  private client = apiClient;

  // Auth endpoints
  async register(data: RegisterData) {
    return this.client.post('/api/v1/auth/register', data);
  }

  async login(data: LoginData) {
    return this.client.post('/api/v1/auth/login', data);
  }

  async logout() {
    return this.client.post('/api/v1/auth/logout');
  }

  async forgotPassword(email: string) {
    return this.client.post('/api/v1/auth/forgot-password', { email });
  }

  async resetPassword(data: ResetPasswordData) {
    return this.client.post('/api/v1/auth/reset-password', data);
  }

  async verifyEmail(token: string) {
    return this.client.post('/api/v1/auth/verify-email', { token });
  }

  async resendVerification(email: string) {
    return this.client.post('/api/v1/auth/resend-verification', { email });
  }

  async getMe() {
    return this.client.get('/api/v1/auth/me');
  }

  // User profile endpoints
  async getProfile() {
    return this.client.get('/api/v1/users/profile');
  }

  async updateProfile(data: UpdateProfileData) {
    return this.client.put('/api/v1/users/profile', data);
  }

  async getSettings() {
    return this.client.get('/api/v1/users/settings');
  }

  async updateSettings(data: UpdateSettingsData) {
    return this.client.put('/api/v1/users/settings', data);
  }

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.client.put('/api/v1/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getUserStats() {
    return this.client.get('/api/v1/users/stats');
  }

  async searchUsers(query: string) {
    return this.client.get(`/api/v1/users/search?q=${encodeURIComponent(query)}`);
  }

  async deactivateAccount() {
    return this.client.post('/api/v1/users/deactivate');
  }

  async deleteAccount() {
    return this.client.delete('/api/v1/users/account');
  }
}

export class ContentService {
  private client = apiClient;

  // Characters endpoints
  async getHiragana() {
    return this.client.get('/api/v1/characters/hiragana');
  }

  async getKatakana() {
    return this.client.get('/api/v1/characters/katakana');
  }

  async getKanji(level: string) {
    return this.client.get(`/api/v1/characters/kanji/${level}`);
  }

  async getCharacter(id: string) {
    return this.client.get(`/api/v1/characters/${id}`);
  }

  async getCharacterStrokeOrder(id: string) {
    return this.client.get(`/api/v1/characters/${id}/stroke-order`);
  }

  async getCharacterPronunciation(id: string) {
    return this.client.get(`/api/v1/characters/${id}/pronunciation`);
  }

  async getCharacterExamples(id: string) {
    return this.client.get(`/api/v1/characters/${id}/examples`);
  }

  async getCharacterRadicals(id: string) {
    return this.client.get(`/api/v1/characters/${id}/radicals`);
  }

  async getCharacterCompounds(id: string) {
    return this.client.get(`/api/v1/characters/${id}/compounds`);
  }

  async searchCharacters(query: string) {
    return this.client.get(`/api/v1/characters/search?q=${encodeURIComponent(query)}`);
  }

  async getCharacterStatistics() {
    return this.client.get('/api/v1/characters/statistics');
  }

  async getRandomCharacter() {
    return this.client.get('/api/v1/characters/random');
  }

  // Vocabulary endpoints
  async getVocabulary(params?: VocabularyParams) {
    return this.client.get('/api/v1/vocabulary', { params });
  }

  async getVocabularyItem(id: string) {
    return this.client.get(`/api/v1/vocabulary/${id}`);
  }

  async searchVocabulary(query: string) {
    return this.client.get(`/api/v1/vocabulary/search?q=${encodeURIComponent(query)}`);
  }

  async getVocabularyByPartOfSpeech(partOfSpeech: string) {
    return this.client.get(`/api/v1/vocabulary/part-of-speech/${partOfSpeech}`);
  }

  async getVocabularyByCategory(category: string) {
    return this.client.get(`/api/v1/vocabulary/category/${category}`);
  }

  async getVocabularyByJLPT(level: string) {
    return this.client.get(`/api/v1/vocabulary/jlpt/${level}`);
  }

  async getVocabularyFrequency() {
    return this.client.get('/api/v1/vocabulary/frequency');
  }

  async getVocabularyStatistics() {
    return this.client.get('/api/v1/vocabulary/statistics');
  }

  async getRandomVocabulary() {
    return this.client.get('/api/v1/vocabulary/random');
  }

  // Lessons endpoints
  async getLessons(params?: LessonParams) {
    return this.client.get('/api/v1/lessons', { params });
  }

  async getLesson(id: string) {
    return this.client.get(`/api/v1/lessons/${id}`);
  }

  async getLessonSteps(id: string) {
    return this.client.get(`/api/v1/lessons/${id}/steps`);
  }

  async getLessonPrerequisites(id: string) {
    return this.client.get(`/api/v1/lessons/${id}/prerequisites`);
  }

  async getLessonsByLevel(level: string) {
    return this.client.get(`/api/v1/lessons/level/${level}`);
  }

  async getLessonsByCategory(category: string) {
    return this.client.get(`/api/v1/lessons/category/${category}`);
  }

  async getLessonStatistics() {
    return this.client.get('/api/v1/lessons/statistics');
  }

  async getLessonProgression() {
    return this.client.get('/api/v1/lessons/progression');
  }

  // Media endpoints
  async getMedia(params?: MediaParams) {
    return this.client.get('/api/v1/media', { params });
  }

  async getMediaItem(id: string) {
    return this.client.get(`/api/v1/media/${id}`);
  }

  async getMediaFile(id: string) {
    return this.client.get(`/api/v1/media/${id}/file`);
  }

  async getMediaThumbnail(id: string) {
    return this.client.get(`/api/v1/media/${id}/thumbnail`);
  }

  async uploadMedia(file: File, metadata?: MediaMetadata) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return this.client.post('/api/v1/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getMediaByType(type: string) {
    return this.client.get(`/api/v1/media/type/${type}`);
  }

  async getMediaByCategory(category: string) {
    return this.client.get(`/api/v1/media/category/${category}`);
  }

  async searchMedia(query: string) {
    return this.client.get(`/api/v1/media/search?q=${encodeURIComponent(query)}`);
  }

  async getMediaStatistics() {
    return this.client.get('/api/v1/media/statistics');
  }
}

export class ProgressService {
  private client = apiClient;

  async getUserProgress(userId: string) {
    return this.client.get(`/api/v1/progress/${userId}`);
  }

  async updateCharacterPractice(data: CharacterPracticeData) {
    return this.client.post('/api/v1/progress/character-practice', data);
  }

  async updateXP(data: XPUpdateData) {
    return this.client.put('/api/v1/progress/xp', data);
  }

  async getUserStreaks(userId: string) {
    return this.client.get(`/api/v1/progress/streaks/${userId}`);
  }

  async getUserAchievements(userId: string) {
    return this.client.get(`/api/v1/progress/achievements/${userId}`);
  }

  async updateMastery(data: MasteryUpdateData) {
    return this.client.post('/api/v1/progress/update-mastery', data);
  }

  async getUserAnalytics(userId: string) {
    return this.client.get(`/api/v1/progress/analytics/${userId}`);
  }

  async getLeaderboard(period: string) {
    return this.client.get(`/api/v1/progress/leaderboard/${period}`);
  }

  async getUserRank(userId: string, period: string) {
    return this.client.get(`/api/v1/progress/rank/${userId}/${period}`);
  }

  async getUserInsights(userId: string) {
    return this.client.get(`/api/v1/progress/insights/${userId}`);
  }

  async getUserMetrics(userId: string) {
    return this.client.get(`/api/v1/progress/metrics/${userId}`);
  }

  async freezeStreak(data: FreezeStreakData) {
    return this.client.post('/api/v1/progress/freeze-streak', data);
  }

  async getUserReview(userId: string) {
    return this.client.get(`/api/v1/progress/review/${userId}`);
  }

  async getUserWeakAreas(userId: string) {
    return this.client.get(`/api/v1/progress/weak-areas/${userId}`);
  }
}

export class CommunityService {
  private client = apiClient;

  // Forum endpoints
  async getForums() {
    return this.client.get('/api/v1/community/forums');
  }

  async getForum(slug: string) {
    return this.client.get(`/api/v1/community/forums/${slug}`);
  }

  async getPosts(params?: PostParams) {
    return this.client.get('/api/v1/community/posts', { params });
  }

  async getPost(postId: string) {
    return this.client.get(`/api/v1/community/posts/${postId}`);
  }

  async createPost(data: CreatePostData) {
    return this.client.post('/api/v1/community/posts', data);
  }

  async updatePost(postId: string, data: UpdatePostData) {
    return this.client.put(`/api/v1/community/posts/${postId}`, data);
  }

  async deletePost(postId: string) {
    return this.client.delete(`/api/v1/community/posts/${postId}`);
  }

  async pinPost(postId: string) {
    return this.client.patch(`/api/v1/community/posts/${postId}/pin`);
  }

  async getPostComments(postId: string) {
    return this.client.get(`/api/v1/community/posts/${postId}/comments`);
  }

  async createComment(postId: string, data: CreateCommentData) {
    return this.client.post(`/api/v1/community/posts/${postId}/comments`, data);
  }

  async updateComment(commentId: string, data: UpdateCommentData) {
    return this.client.put(`/api/v1/community/comments/${commentId}`, data);
  }

  async deleteComment(commentId: string) {
    return this.client.delete(`/api/v1/community/comments/${commentId}`);
  }

  async votePost(postId: string, data: VoteData) {
    return this.client.post(`/api/v1/community/posts/${postId}/vote`, data);
  }

  async voteComment(commentId: string, data: VoteData) {
    return this.client.post(`/api/v1/community/comments/${commentId}/vote`, data);
  }

  async searchPosts(query: string) {
    return this.client.get(`/api/v1/community/posts/search?q=${encodeURIComponent(query)}`);
  }

  // Study Groups endpoints
  async getStudyGroups(params?: StudyGroupParams) {
    return this.client.get('/api/v1/community/study-groups', { params });
  }

  async getMyStudyGroups() {
    return this.client.get('/api/v1/community/study-groups/my');
  }

  async getStudyGroup(groupId: string) {
    return this.client.get(`/api/v1/community/study-groups/${groupId}`);
  }

  async createStudyGroup(data: CreateStudyGroupData) {
    return this.client.post('/api/v1/community/study-groups', data);
  }

  async updateStudyGroup(groupId: string, data: UpdateStudyGroupData) {
    return this.client.put(`/api/v1/community/study-groups/${groupId}`, data);
  }

  async deleteStudyGroup(groupId: string) {
    return this.client.delete(`/api/v1/community/study-groups/${groupId}`);
  }

  async joinStudyGroup(groupId: string) {
    return this.client.post(`/api/v1/community/study-groups/${groupId}/join`);
  }

  async leaveStudyGroup(groupId: string) {
    return this.client.post(`/api/v1/community/study-groups/${groupId}/leave`);
  }

  async updateMemberRole(groupId: string, memberId: string, role: string) {
    return this.client.put(`/api/v1/community/study-groups/${groupId}/members/${memberId}/role`, { role });
  }

  async removeMember(groupId: string, memberId: string) {
    return this.client.delete(`/api/v1/community/study-groups/${groupId}/members/${memberId}`);
  }

  async getGroupChallenges(groupId: string) {
    return this.client.get(`/api/v1/community/study-groups/${groupId}/challenges`);
  }

  async createChallenge(groupId: string, data: CreateChallengeData) {
    return this.client.post(`/api/v1/community/study-groups/${groupId}/challenges`, data);
  }

  async updateChallenge(challengeId: string, data: UpdateChallengeData) {
    return this.client.put(`/api/v1/community/challenges/${challengeId}`, data);
  }

  async deleteChallenge(challengeId: string) {
    return this.client.delete(`/api/v1/community/challenges/${challengeId}`);
  }

  // Social endpoints
  async getFriendRequests() {
    return this.client.get('/api/v1/community/friends/requests');
  }

  async sendFriendRequest(data: SendFriendRequestData) {
    return this.client.post('/api/v1/community/friends/requests', data);
  }

  async respondToFriendRequest(requestId: string, data: RespondToFriendRequestData) {
    return this.client.put(`/api/v1/community/friends/requests/${requestId}`, data);
  }

  async deleteFriendRequest(requestId: string) {
    return this.client.delete(`/api/v1/community/friends/requests/${requestId}`);
  }

  async getFriends() {
    return this.client.get('/api/v1/community/friends');
  }

  async removeFriend(friendId: string) {
    return this.client.delete(`/api/v1/community/friends/${friendId}`);
  }

  async followUser(userId: string) {
    return this.client.post(`/api/v1/community/users/${userId}/follow`);
  }

  async unfollowUser(userId: string) {
    return this.client.delete(`/api/v1/community/users/${userId}/follow`);
  }

  async getUserFollowers(userId: string) {
    return this.client.get(`/api/v1/community/users/${userId}/followers`);
  }

  async getUserFollowing(userId: string) {
    return this.client.get(`/api/v1/community/users/${userId}/following`);
  }

  async getUserActivity(userId: string) {
    return this.client.get(`/api/v1/community/users/${userId}/activity`);
  }

  async getUserAchievements(userId: string) {
    return this.client.get(`/api/v1/community/users/${userId}/achievements`);
  }

  async getUserStats(userId: string) {
    return this.client.get(`/api/v1/community/users/${userId}/stats`);
  }

  async getFriendsActivity() {
    return this.client.get('/api/v1/community/activity/friends');
  }

  // Leaderboard endpoints
  async getLeaderboard(params?: LeaderboardParams) {
    return this.client.get('/api/v1/community/leaderboard', { params });
  }

  async getLeaderboardStats() {
    return this.client.get('/api/v1/community/leaderboard/stats');
  }

  async getUserRank(userId: string, type: string) {
    return this.client.get(`/api/v1/community/leaderboard/users/${userId}/rank/${type}`);
  }

  async getUsersAround(userId: string, type: string) {
    return this.client.get(`/api/v1/community/leaderboard/users/${userId}/around/${type}`);
  }

  async getCategoryLeaderboard(categoryId: string, type: string) {
    return this.client.get(`/api/v1/community/leaderboard/categories/${categoryId}/${type}`);
  }

  async getGroupLeaderboard(groupId: string, type: string) {
    return this.client.get(`/api/v1/community/leaderboard/groups/${groupId}/${type}`);
  }

  async checkAchievements(data: CheckAchievementsData) {
    return this.client.post('/api/v1/community/achievements/check', data);
  }
}

export class ArticlesService {
  private client = apiClient;

  async getArticles(params?: ArticleParams) {
    return this.client.get('/api/articles', { params });
  }

  async getArticle(id: string) {
    return this.client.get(`/api/articles/${id}`);
  }

  async createArticle(data: CreateArticleData) {
    return this.client.post('/api/articles', data);
  }

  async updateArticle(id: string, data: UpdateArticleData) {
    return this.client.put(`/api/articles/${id}`, data);
  }

  async deleteArticle(id: string) {
    return this.client.delete(`/api/articles/${id}`);
  }

  async likeArticle(id: string) {
    return this.client.post(`/api/articles/${id}/like`);
  }

  async bookmarkArticle(id: string) {
    return this.client.post(`/api/articles/${id}/bookmark`);
  }

  async getTrendingArticles() {
    return this.client.get('/api/articles/trending');
  }

  async getFeaturedArticles() {
    return this.client.get('/api/articles/featured');
  }

  async getUserArticles(userId: string) {
    return this.client.get(`/api/articles/user/${userId}`);
  }

  async getArticleStats() {
    return this.client.get('/api/articles/stats');
  }

  async getUserArticleStats(userId: string) {
    return this.client.get(`/api/articles/user/${userId}/stats`);
  }

  async getArticleComments(id: string) {
    return this.client.get(`/api/articles/${id}/comments`);
  }

  async createComment(id: string, data: CreateCommentData) {
    return this.client.post(`/api/articles/${id}/comments`, data);
  }

  async getPopularTags() {
    return this.client.get('/api/articles/tags/popular');
  }
}

export class NotificationService {
  private client = apiClient;

  async getNotifications(userId: string, params?: NotificationParams) {
    return this.client.get(`/api/notifications/user/${userId}`, { params });
  }

  async getNotification(id: string) {
    return this.client.get(`/api/notifications/${id}`);
  }

  async updateNotification(id: string, data: UpdateNotificationData) {
    return this.client.put(`/api/notifications/${id}`, data);
  }

  async deleteNotification(id: string) {
    return this.client.delete(`/api/notifications/${id}`);
  }

  async markAsRead(id: string) {
    return this.client.put(`/api/notifications/${id}`, { read: true });
  }

  async markAllAsRead() {
    return this.client.put('/api/notifications/mark-all-read');
  }

  async clearAllNotifications(userId: string) {
    return this.client.delete(`/api/notifications/user/${userId}/clear`);
  }

  async getPreferences(userId: string) {
    return this.client.get(`/api/preferences/${userId}`);
  }

  async updatePreferences(userId: string, data: UpdatePreferencesData) {
    return this.client.put(`/api/preferences/${userId}`, data);
  }

  async resetPreferences(userId: string) {
    return this.client.post(`/api/preferences/${userId}/reset`);
  }

  async subscribeToPush(userId: string, data: PushSubscriptionData) {
    return this.client.post(`/api/subscriptions/${userId}`, data);
  }

  async getSubscriptions(userId: string) {
    return this.client.get(`/api/subscriptions/${userId}`);
  }

  async unsubscribeFromPush(userId: string) {
    return this.client.post(`/api/subscriptions/${userId}/unsubscribe`);
  }

  async getVapidKey() {
    return this.client.get('/api/subscriptions/vapid-key');
  }
}

export class AnalyticsService {
  private client = apiClient;

  async trackEvent(data: EventData) {
    return this.client.post('/api/events', data);
  }

  async getAnalytics(params?: AnalyticsParams) {
    return this.client.get('/api/analytics', { params });
  }

  async getDashboard() {
    return this.client.get('/api/dashboards');
  }

  async getReports(params?: ReportParams) {
    return this.client.get('/api/reports', { params });
  }

  async getABTests() {
    return this.client.get('/api/ab-tests');
  }

  async createABTest(data: CreateABTestData) {
    return this.client.post('/api/ab-tests', data);
  }

  async updateABTest(id: string, data: UpdateABTestData) {
    return this.client.put(`/api/ab-tests/${id}`, data);
  }

  async deleteABTest(id: string) {
    return this.client.delete(`/api/ab-tests/${id}`);
  }
}

// Health check service
export class HealthService {
  private client = apiClient;

  async checkHealth() {
    return this.client.get('/health');
  }

  async checkUserServiceHealth() {
    return this.client.get('/health/users');
  }

  async checkContentServiceHealth() {
    return this.client.get('/health/content');
  }

  async checkProgressServiceHealth() {
    return this.client.get('/health/progress');
  }

  async checkCommunityServiceHealth() {
    return this.client.get('/health/community');
  }

  async checkNotificationServiceHealth() {
    return this.client.get('/health/notifications');
  }

  async checkAnalyticsServiceHealth() {
    return this.client.get('/health/analytics');
  }
}

// Export service instances
export const userService = new UserService();
export const contentService = new ContentService();
export const progressService = new ProgressService();
export const communityService = new CommunityService();
export const articlesService = new ArticlesService();
export const notificationService = new NotificationService();
export const analyticsService = new AnalyticsService();
export const healthService = new HealthService();

// Export the main API client
export { apiClient };

// Type definitions
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UpdateSettingsData {
  email?: string;
  language?: string;
  timezone?: string;
  notifications?: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface VocabularyParams {
  level?: string;
  category?: string;
  partOfSpeech?: string;
  limit?: number;
  offset?: number;
}

export interface LessonParams {
  level?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface MediaParams {
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface CharacterPracticeData {
  characterId: string;
  accuracy: number;
  timeSpent: number;
  attempts: number;
}

export interface XPUpdateData {
  amount: number;
  source: string;
  metadata?: Record<string, any>;
}

export interface MasteryUpdateData {
  characterId: string;
  masteryLevel: number;
  lastReviewed: string;
}

export interface FreezeStreakData {
  reason: string;
  duration?: number;
}

export interface PostParams {
  forum?: string;
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  forum?: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface VoteData {
  type: 'up' | 'down';
}

export interface StudyGroupParams {
  category?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

export interface CreateStudyGroupData {
  name: string;
  description: string;
  category: string;
  level: string;
  maxMembers?: number;
  isPrivate?: boolean;
}

export interface UpdateStudyGroupData {
  name?: string;
  description?: string;
  maxMembers?: number;
  isPrivate?: boolean;
}

export interface CreateChallengeData {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  rewards?: Record<string, any>;
}

export interface UpdateChallengeData {
  title?: string;
  description?: string;
  difficulty?: string;
  endDate?: string;
  rewards?: Record<string, any>;
}

export interface SendFriendRequestData {
  userId: string;
  message?: string;
}

export interface RespondToFriendRequestData {
  action: 'accept' | 'decline';
}

export interface LeaderboardParams {
  type?: string;
  period?: string;
  limit?: number;
  offset?: number;
}

export interface CheckAchievementsData {
  userId: string;
  achievements: string[];
}

export interface ArticleParams {
  category?: string;
  tag?: string;
  author?: string;
  trending?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  isPublished?: boolean;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface NotificationParams {
  type?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface UpdateNotificationData {
  read?: boolean;
  archived?: boolean;
}

export interface UpdatePreferencesData {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  marketing?: boolean;
  categories?: string[];
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface EventData {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  metric?: string;
  dimension?: string;
}

export interface ReportParams {
  type?: string;
  format?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateABTestData {
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficAllocation: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateABTestData {
  name?: string;
  description?: string;
  trafficAllocation?: number;
  endDate?: string;
}

export interface ABTestVariant {
  name: string;
  description: string;
  configuration: Record<string, any>;
}