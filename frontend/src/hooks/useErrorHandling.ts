import { useState, useEffect, useCallback } from 'react';
import { useAlert } from '@/components/error/AlertManager';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onError, onSuccess } = options;
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: errorObj }));
      onError?.(errorObj);
      throw errorObj;
    }
  }, [asyncFunction, onError, onSuccess]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

// Enhanced API hook with automatic error handling
export function useApiWithErrorHandling<T>(
  apiCall: () => Promise<T>,
  options: UseAsyncOptions & {
    errorTitle?: string;
    showErrorAlert?: boolean;
  } = {}
) {
  const { showErrorAlert = true, errorTitle = 'API Error', ...asyncOptions } = options;
  const { showError } = useAlert();

  const handleError = useCallback((error: Error) => {
    if (showErrorAlert) {
      showError(
        errorTitle,
        error.message || 'An unexpected error occurred. Please try again.',
        {
          label: 'Retry',
          onClick: () => execute(),
        }
      );
    }
    asyncOptions.onError?.(error);
  }, [showErrorAlert, errorTitle, showError, asyncOptions]);

  return useAsync(apiCall, {
    ...asyncOptions,
    onError: handleError,
  });
}

// Retry mechanism hook
export function useRetry(
  maxRetries: number = 3,
  delay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (retryCount >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded`);
    }

    setIsRetrying(true);
    
    try {
      const result = await operation();
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      setRetryCount(prev => prev + 1);
      
      if (retryCount < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retryCount)));
        return retry(operation);
      }
      
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, delay]);

  return {
    retry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    reset: () => setRetryCount(0),
  };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection message
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
  };
}
