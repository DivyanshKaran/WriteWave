/**
 * Centralized exports for all Zustand stores
 */

// Store exports
export { useAuthStore, useAuth, useAuthActions, useUserPreferences } from './auth-store';
export { useArticlesStore, useArticles, useArticlesActions, useArticleComments, useArticleFilters } from './articles-store';
export { useProgressStore, useProgress, useProgressActions, useOverallStats, useCategoryProgress, useJLPTProgress } from './progress-store';
export { useUIStore, useUI, useUIActions, useNotifications, useNotificationActions, useToasts, useToastActions, useModals, useModalActions } from './ui-store';
export { useCommunityStore, useCommunity, useCommunityActions, useForums, useStudyGroups, useCommunityFilters } from './community-store';

// Store types
export type { AuthStore } from './auth-store';
export type { ArticlesStore } from './articles-store';
export type { ProgressStore } from './progress-store';
export type { UIStore } from './ui-store';
export type { CommunityStore } from './community-store';
