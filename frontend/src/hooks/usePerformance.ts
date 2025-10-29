import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// Generic memoized component wrapper
export function withMemo<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual);
}

// Memoized component with custom comparison
export function withDeepMemo<T extends object>(
  Component: React.ComponentType<T>
) {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

// Hook for memoizing expensive calculations
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

// Hook for memoizing callbacks
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

// Hook for debounced values with memoization
export function useMemoizedDebounce<T>(
  value: T,
  delay: number,
  dependencies: React.DependencyList = []
): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, ...dependencies]);

  return debouncedValue;
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
  };
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
}

// Hook for code splitting
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    importFunc()
      .then((module) => {
        setComponent(() => module.default);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [importFunc]);

  return { Component, isLoading, error };
}
