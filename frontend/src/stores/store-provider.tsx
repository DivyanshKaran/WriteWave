import { useEffect } from 'react';
import { useAuthStore } from './auth-store';
import { useUIStore } from './ui-store';
import { useProgressStore } from './progress-store';
import { useArticlesStore } from './articles-store';
import { useCommunityStore } from './community-store';
import { initializeMockAuth } from '@/lib/mock-data';

/**
 * Store provider component that handles store initialization and cleanup
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { setLoading: setAuthLoading, setError: setAuthError } = useAuthStore();
  const { setGlobalLoading, setGlobalError } = useUIStore();
  const { setLoading: setProgressLoading, setError: setProgressError } = useProgressStore();
  const { setLoading: setArticlesLoading, setError: setArticlesError } = useArticlesStore();
  const { setLoading: setCommunityLoading, setError: setCommunityError } = useCommunityStore();

  // Initialize stores on mount
  useEffect(() => {
    // Initialize mock auth for demo mode
    initializeMockAuth(useAuthStore.getState());
    
    // Set initial loading states
    setAuthLoading(false);
    setProgressLoading(false);
    setArticlesLoading(false);
    setCommunityLoading(false);
    
    // Clear any initial errors
    setAuthError(null);
    setProgressError(null);
    setArticlesError(null);
    setCommunityError(null);
    setGlobalError(null);
  }, [
    setAuthLoading,
    setProgressLoading,
    setArticlesLoading,
    setCommunityLoading,
    setAuthError,
    setProgressError,
    setArticlesError,
    setCommunityError,
    setGlobalError,
  ]);

  // Handle global error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setGlobalError(event.error?.message || 'An unexpected error occurred');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setGlobalError(event.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setGlobalError]);

  return <>{children}</>;
}

/**
 * Hook to reset all stores (useful for logout)
 */
export function useResetAllStores() {
  const { logout: authLogout } = useAuthStore();
  const { resetUI } = useUIStore();
  const { clearProgress } = useProgressStore();
  const { clearArticles } = useArticlesStore();
  const { clearCommunity } = useCommunityStore();

  return () => {
    authLogout();
    resetUI();
    clearProgress();
    clearArticles();
    clearCommunity();
  };
}

/**
 * Hook to get loading state from all stores
 */
export function useGlobalLoading() {
  const authLoading = useAuthStore((state) => state.isLoading);
  const uiLoading = useUIStore((state) => state.globalLoading.isLoading);
  const progressLoading = useProgressStore((state) => state.isLoading);
  const articlesLoading = useArticlesStore((state) => state.isLoading);
  const communityLoading = useCommunityStore((state) => state.isLoading);

  return authLoading || uiLoading || progressLoading || articlesLoading || communityLoading;
}

/**
 * Hook to get error state from all stores
 */
export function useGlobalError() {
  const authError = useAuthStore((state) => state.error);
  const uiError = useUIStore((state) => state.globalError);
  const progressError = useProgressStore((state) => state.error);
  const articlesError = useArticlesStore((state) => state.error);
  const communityError = useCommunityStore((state) => state.error);

  return authError || uiError || progressError || articlesError || communityError;
}
