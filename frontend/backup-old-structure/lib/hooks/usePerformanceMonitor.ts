// Performance Monitoring Hook
import { useState, useEffect } from 'react';
import type { PerformanceMetrics } from '@/types';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
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
