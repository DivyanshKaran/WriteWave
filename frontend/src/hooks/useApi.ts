import { useState, useEffect, useCallback, useRef } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
}

/**
 * Generic API hook with loading, error, and retry logic
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: ApiOptions = {}
): ApiState<T> & { refetch: () => Promise<void>; reset: () => void } {
  const { immediate = true, retries = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const retryCountRef = useRef(0);

  const executeApiCall = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      retryCountRef.current = 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (retryCountRef.current < retries) {
        retryCountRef.current++;
        setTimeout(() => {
          executeApiCall();
        }, retryDelay);
      } else {
        setState({ data: null, loading: false, error: errorMessage });
        retryCountRef.current = 0;
      }
    }
  }, [apiCall, retries, retryDelay]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await executeApiCall();
  }, [executeApiCall]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    retryCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (immediate) {
      executeApiCall();
    }
  }, [immediate, executeApiCall]);

  return { ...state, refetch, reset };
}
