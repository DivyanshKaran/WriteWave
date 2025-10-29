import { renderHook, act } from '@testing-library/react';
import { useApi, useLocalStorage, useDebounce, usePagination, useForm } from '@/hooks';
import { 
  useAsync, 
  useApiWithErrorHandling, 
  useRetry, 
  useNetworkStatus 
} from '@/hooks/useErrorHandling';
import { 
  useExpensiveCalculation, 
  useStableCallback, 
  useMemoizedDebounce,
  useIntersectionObserver,
  useVirtualScroll,
  useLazyImage,
  useLazyComponent
} from '@/hooks/usePerformance';
import { 
  useKeyboardNavigation,
  useFocusManagement,
  useScreenReaderAnnouncement,
  useAriaLiveRegion,
  useColorContrast,
  useReducedMotion,
  useHighContrast,
  useFocusVisible
} from '@/hooks/useAccessibility';
import { 
  createTestQueryClient,
  mockApiCall,
  mockMatchMedia,
  mockIntersectionObserver,
  waitForAsync
} from '../test-utils/test-utils';

describe('Core Hooks', () => {
  describe('useApi', () => {
    it('should handle successful API calls', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi('/test', { immediate: true }));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);

      await act(async () => {
        await waitForAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      mockApiCall.mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi('/test', { immediate: true }));

      await act(async () => {
        await waitForAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store and retrieve values', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('test-key')).toBe('"updated"');
    });

    it('should handle JSON serialization', () => {
      const testObject = { name: 'Test', value: 123 };
      const { result } = renderHook(() => useLocalStorage('test-object', testObject));

      expect(result.current[0]).toEqual(testObject);

      const newObject = { name: 'Updated', value: 456 };
      act(() => {
        result.current[1](newObject);
      });

      expect(result.current[0]).toEqual(newObject);
    });
  });

  describe('useDebounce', () => {
    it('should debounce values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated1' });
      rerender({ value: 'updated2' });
      rerender({ value: 'updated3' });

      expect(result.current).toBe('initial');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current).toBe('updated3');
    });
  });

  describe('usePagination', () => {
    it('should handle pagination state', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 100, itemsPerPage: 10 }));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.hasPreviousPage).toBe(true);

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.currentPage).toBe(5);
    });
  });

  describe('useForm', () => {
    it('should handle form state and validation', () => {
      const { result } = renderHook(() => useForm({
        initialValues: { name: '', email: '' },
        validation: {
          name: (value) => value.length < 2 ? 'Name too short' : null,
          email: (value) => !value.includes('@') ? 'Invalid email' : null,
        }
      }));

      expect(result.current.values).toEqual({ name: '', email: '' });
      expect(result.current.errors).toEqual({});

      act(() => {
        result.current.setValue('name', 'a');
      });

      expect(result.current.values.name).toBe('a');
      expect(result.current.errors.name).toBe('Name too short');

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.errors.name).toBe(null);
    });
  });
});

describe('Error Handling Hooks', () => {
  describe('useAsync', () => {
    it('should handle async operations', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('success');
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await waitForAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBe(null);
    });

    it('should handle async errors', async () => {
      const mockError = new Error('Async error');
      const mockAsyncFn = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));

      await act(async () => {
        await waitForAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useRetry', () => {
    it('should retry failed operations', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue('Success');

      const { result } = renderHook(() => useRetry(3, 10));

      await act(async () => {
        await result.current.retry(mockFn);
      });

      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('useNetworkStatus', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('should detect online status', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.wasOffline).toBe(false);
    });
  });
});

describe('Performance Hooks', () => {
  describe('useExpensiveCalculation', () => {
    it('should memoize expensive calculations', () => {
      const expensiveFn = jest.fn().mockReturnValue('result');
      
      const { result, rerender } = renderHook(
        ({ deps }) => useExpensiveCalculation(expensiveFn, deps),
        { initialProps: { deps: [1, 2] } }
      );

      expect(result.current).toBe('result');
      expect(expensiveFn).toHaveBeenCalledTimes(1);

      rerender({ deps: [1, 2] });
      expect(expensiveFn).toHaveBeenCalledTimes(1);

      rerender({ deps: [1, 3] });
      expect(expensiveFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('useStableCallback', () => {
    it('should memoize callbacks', () => {
      const callback = jest.fn();
      
      const { result, rerender } = renderHook(
        ({ deps }) => useStableCallback(callback, deps),
        { initialProps: { deps: [1, 2] } }
      );

      const firstCallback = result.current;
      rerender({ deps: [1, 2] });
      const secondCallback = result.current;

      expect(firstCallback).toBe(secondCallback);

      rerender({ deps: [1, 3] });
      const thirdCallback = result.current;

      expect(firstCallback).not.toBe(thirdCallback);
    });
  });

  describe('useIntersectionObserver', () => {
    beforeEach(() => {
      mockIntersectionObserver();
    });

    it('should observe intersection', () => {
      const { result } = renderHook(() => useIntersectionObserver());

      expect(result.current.ref).toBeDefined();
      expect(result.current.isIntersecting).toBe(false);
      expect(result.current.hasIntersected).toBe(false);
    });
  });

  describe('useVirtualScroll', () => {
    it('should calculate visible range', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const { result } = renderHook(() => useVirtualScroll(items, 50, 200));

      expect(result.current.visibleItems.length).toBeGreaterThan(0);
      expect(result.current.totalHeight).toBe(5000);
      expect(result.current.visibleRange.startIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('useLazyImage', () => {
    it('should handle image loading', async () => {
      const { result } = renderHook(() => useLazyImage('test-image.jpg'));

      expect(result.current.imageSrc).toBe('');
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});

describe('Accessibility Hooks', () => {
  describe('useKeyboardNavigation', () => {
    it('should handle keyboard navigation', () => {
      const items = ['item1', 'item2', 'item3'];
      const onSelect = jest.fn();
      
      const { result } = renderHook(() => useKeyboardNavigation(items, onSelect));

      expect(result.current.focusedIndex).toBe(-1);
      expect(result.current.containerRef).toBeDefined();
    });
  });

  describe('useFocusManagement', () => {
    it('should manage focus', () => {
      const { result } = renderHook(() => useFocusManagement());

      expect(result.current.saveFocus).toBeDefined();
      expect(result.current.restoreFocus).toBeDefined();
      expect(result.current.trapFocus).toBeDefined();
    });
  });

  describe('useScreenReaderAnnouncement', () => {
    it('should announce messages', () => {
      const { result } = renderHook(() => useScreenReaderAnnouncement());

      act(() => {
        result.current.announce('Test message');
      });

      expect(result.current.announcement).toBe('Test message');
    });
  });

  describe('useReducedMotion', () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it('should detect reduced motion preference', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current).toBe(false);
    });
  });

  describe('useHighContrast', () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it('should detect high contrast preference', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current).toBe(false);
    });
  });

  describe('useFocusVisible', () => {
    it('should detect focus visibility', () => {
      const { result } = renderHook(() => useFocusVisible());

      expect(result.current).toBe(false);
    });
  });
});
