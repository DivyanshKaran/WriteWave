"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  className?: string;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  className = '',
}) => {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [isBackgrounded, setIsBackgrounded] = useState(false);
  const [touchLatency, setTouchLatency] = useState(0);

  // Detect low power mode
  useEffect(() => {
    const checkBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number; addEventListener: (event: string, handler: () => void) => void }> }).getBattery();
          setIsLowPowerMode(battery.level < 0.2);
          
          battery.addEventListener('levelchange', () => {
            setIsLowPowerMode(battery.level < 0.2);
          });
        } catch {
          console.log('Battery API not supported');
        }
      }
    };

    checkBatteryStatus();
  }, []);

  // Detect app backgrounding
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsBackgrounded(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Measure touch latency
  const measureTouchLatency = useCallback(() => {
    const startTime = performance.now();
    
    const handleTouchStart = () => {
      const endTime = performance.now();
      const latency = endTime - startTime;
      setTouchLatency(latency);
    };

    document.addEventListener('touchstart', handleTouchStart, { once: true });
  }, []);

  useEffect(() => {
    measureTouchLatency();
  }, [measureTouchLatency]);

  // Optimize based on conditions
  const getOptimizedProps = () => {
    const props: React.CSSProperties = {};

    if (isLowPowerMode) {
      // Reduce animation complexity
      props.animationDuration = '0.1s';
      props.transitionDuration = '0.1s';
    }

    if (isBackgrounded) {
      // Pause heavy operations
      props.animationPlayState = 'paused';
    }

    return props;
  };

  return (
    <div
      className={`${className} ${isLowPowerMode ? 'low-power-mode' : ''} ${isBackgrounded ? 'backgrounded' : ''}`}
      style={getOptimizedProps()}
    >
      {children}
      
      {/* Performance indicators (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Touch Latency: {touchLatency.toFixed(1)}ms</div>
          <div>Low Power: {isLowPowerMode ? 'Yes' : 'No'}</div>
          <div>Backgrounded: {isBackgrounded ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    touchLatency: 0,
    scrollFPS: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let frameCount = 0;
    let lastTime = performance.now();

    const measureScrollFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          scrollFPS: frameCount,
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureScrollFPS);
    };

    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const measureTouchLatency = () => {
      const startTime = performance.now();
      
      const handleTouchStart = () => {
        const endTime = performance.now();
        setMetrics(prev => ({
          ...prev,
          touchLatency: endTime - startTime,
        }));
      };

      document.addEventListener('touchstart', handleTouchStart, { once: true });
    };

    // Start measurements
    measureScrollFPS();
    measureMemory();
    measureTouchLatency();

    // Update memory usage periodically
    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
};

// Passive event listener hook
export const usePassiveEventListener = (
  element: HTMLElement | Window | Document | null,
  event: string,
  handler: EventListener,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    if (!element) return;

    element.addEventListener(event, handler, { passive: true });
    
    return () => {
      element.removeEventListener(event, handler);
    };
  }, [element, event, handler, ...deps]);
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const lastRun = React.useRef(Date.now());

  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay, ...deps]
  );
};
