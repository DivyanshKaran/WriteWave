"use client";

import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 60,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ y, rotate }, api] = useSpring(() => ({
    y: 0,
    rotate: 0,
    config: { tension: 300, friction: 30 },
  }));

  const bind = useDrag(
    ({ active, movement: [, my], velocity: [, vy] }) => {
      // Only allow pull down from top
      if (my < 0 || !active) {
        if (active) {
          setIsPulling(true);
          const distance = Math.abs(my);
          
          // Rubber band effect
          const rubberBand = Math.min(distance, threshold * 1.5);
          const rotation = (distance / threshold) * 360;
          
          api.start({
            y: rubberBand,
            rotate: rotation,
            immediate: true,
          });

          // Check if threshold is met
          setCanRefresh(distance >= threshold);
        } else {
          setIsPulling(false);
          
          if (canRefresh && !isRefreshing) {
            // Trigger refresh
            handleRefresh();
          } else {
            // Return to original position
            api.start({
              y: 0,
              rotate: 0,
            });
            setCanRefresh(false);
          }
        }
      }
    },
    {
      axis: 'y',
      bounds: { top: -threshold * 2, bottom: 0 },
      rubberband: true,
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      api.start({
        y: 0,
        rotate: 0,
      });
      setCanRefresh(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ height: threshold }}
          >
            <animated.div
              style={{ rotate: rotate.to(r => `${r}deg`) }}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Refreshing...</span>
                </div>
              ) : (
                <div className={`flex items-center gap-2 ${canRefresh ? 'text-green-600' : 'text-gray-600'}`}>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  <span className="text-sm">
                    {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </div>
              )}
            </animated.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <animated.div
        ref={containerRef}
        {...bind()}
        style={{ y }}
        className="min-h-screen"
      >
        {children}
      </animated.div>
    </div>
  );
};
