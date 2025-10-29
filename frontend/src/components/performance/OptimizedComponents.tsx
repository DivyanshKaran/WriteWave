import React from 'react';
import { withMemo, useIntersectionObserver, useLazyImage } from '@/hooks/usePerformance';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = withMemo<OptimizedImageProps>(({
  src,
  alt,
  placeholder,
  className,
  width,
  height,
  loading = 'lazy'
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const { imageSrc, isLoaded, isError } = useLazyImage(
    isIntersecting ? src : '',
    placeholder
  );

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onError={() => {
            if (isError) {
              console.warn(`Failed to load image: ${src}`);
            }
          }}
        />
      )}
      {!isLoaded && !isError && placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
});

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleRange = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      startIndex: Math.max(0, startIndex - 5), // Overscan
      endIndex: Math.min(items.length - 1, endIndex + 5),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MemoizedCardProps {
  title: string;
  description: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}

export const MemoizedCard = withMemo<MemoizedCardProps>(({
  title,
  description,
  image,
  onClick,
  className
}) => {
  const handleClick = React.useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {image && (
        <OptimizedImage
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
});

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyComponent({
  children,
  fallback = <div className="h-32 bg-muted animate-pulse rounded-lg" />,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyComponentProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  return (
    <div ref={ref}>
      {hasIntersected ? children : fallback}
    </div>
  );
}

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

export function PerformanceMonitor({ componentName, children }: PerformanceMonitorProps) {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });

  return <>{children}</>;
}
