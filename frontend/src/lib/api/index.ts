// API Client and Configuration
export { apiClient, apiRequest, api } from './client';
export { API_ENDPOINTS, buildQueryString, buildUrl } from './endpoints';

// API Services
export {
  authService,
  userService,
  contentService,
  progressService,
  communityService,
  notificationService,
  analyticsService,
} from './services';

// Types
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  Character,
  ProgressStats,
} from '@/types';
