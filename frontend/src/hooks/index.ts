/**
 * Centralized exports for all custom hooks
 */

// Core hooks
export { useApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { usePagination } from './usePagination';
export { useForm } from './useForm';

// Feature-specific hooks
export { useAuth } from './useAuth';
export { useArticles } from './useArticles';
export { useProgress } from './useProgress';
export { useNotifications } from './useNotifications';

// Error handling hooks
export { 
  useAsync, 
  useApiWithErrorHandling, 
  useRetry, 
  useNetworkStatus 
} from './useErrorHandling';

// Performance hooks
export {
  withMemo,
  withDeepMemo,
  useExpensiveCalculation,
  useStableCallback,
  useMemoizedDebounce,
  useIntersectionObserver,
  useVirtualScroll,
  usePerformanceMonitor,
  useLazyImage,
  useLazyComponent
} from './usePerformance';

// Accessibility hooks
export {
  useKeyboardNavigation,
  useFocusManagement,
  useScreenReaderAnnouncement,
  useAriaLiveRegion,
  useColorContrast,
  useReducedMotion,
  useHighContrast,
  useFocusVisible
} from './useAccessibility';

// Existing hooks
export { useIsMobile } from './use-mobile';
export { useToast } from './use-toast';

// Re-export types
export type { ApiState, ApiOptions } from './useApi';
export type { PaginationState, PaginationOptions, PaginationActions } from './usePagination';
export type { FormState, FormActions } from './useForm';
export type { AuthState, AuthActions } from './useAuth';
export type { ArticlesState, ArticlesActions } from './useArticles';
export type { ProgressState, ProgressActions } from './useProgress';
export type { NotificationState, NotificationActions } from './useNotifications';
