"use client";

import React, { useState, useRef } from 'react';
import { useSpring, animated, useSpringValue } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onSwipeUp?: () => void;
  className?: string;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  children,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  }));

  const opacity = useSpringValue(1);

  const bind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx, vy] }) => {
      const triggerDistance = 120; // Distance to trigger swipe
      const triggerVelocity = 0.5; // Velocity to trigger swipe

      if (active) {
        setIsDragging(true);
        
        // Calculate rotation based on horizontal movement
        const rotation = mx * 0.1;
        
        // Calculate scale based on movement distance
        const distance = Math.sqrt(mx * mx + my * my);
        const scaleValue = Math.max(0.95, 1 - distance * 0.0005);
        
        api.start({
          x: mx,
          y: my,
          rotate: rotation,
          scale: scaleValue,
          immediate: true,
        });

        // Determine swipe direction
        if (Math.abs(mx) > Math.abs(my)) {
          if (mx > 0) {
            setSwipeDirection('right');
          } else {
            setSwipeDirection('left');
          }
        } else if (my < 0) {
          setSwipeDirection('up');
        } else {
          setSwipeDirection(null);
        }
      } else {
        setIsDragging(false);
        
        // Check if swipe threshold was met
        const shouldSwipe = 
          Math.abs(mx) > triggerDistance || 
          Math.abs(vx) > triggerVelocity ||
          Math.abs(my) > triggerDistance ||
          Math.abs(vy) > triggerVelocity;

        if (shouldSwipe) {
          // Trigger haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }

          // Animate card out
          opacity.set(0);
          
          if (swipeDirection === 'right' && onSwipeRight) {
            api.start({
              x: typeof window !== 'undefined' ? window.innerWidth : 800,
              rotate: 30,
              scale: 0.8,
            });
            setTimeout(() => onSwipeRight(), 300);
          } else if (swipeDirection === 'left' && onSwipeLeft) {
            api.start({
              x: typeof window !== 'undefined' ? -window.innerWidth : -800,
              rotate: -30,
              scale: 0.8,
            });
            setTimeout(() => onSwipeLeft(), 300);
          } else if (swipeDirection === 'up' && onSwipeUp) {
            api.start({
              y: typeof window !== 'undefined' ? -window.innerHeight : -600,
              scale: 0.8,
            });
            setTimeout(() => onSwipeUp(), 300);
          }
        } else {
          // Return to center
          api.start({
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
          });
          setSwipeDirection(null);
        }
      }
    },
    {
      axis: undefined, // Allow both horizontal and vertical
      bounds: { left: -200, right: 200, top: -200, bottom: 200 },
      rubberband: true,
    }
  );

  return (
    <div className={`relative ${className}`}>
      {/* Swipe indicators */}
      <AnimatePresence>
        {isDragging && swipeDirection && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {swipeDirection === 'right' && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="bg-green-500 text-white px-3 py-2 rounded-sm text-sm font-medium">
                  I know this ✓
                </div>
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="bg-orange-500 text-white px-3 py-2 rounded-sm text-sm font-medium">
                  Need review 📚
                </div>
              </div>
            )}
            {swipeDirection === 'up' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-3 py-2 rounded-sm text-sm font-medium">
                  Show info ℹ️
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <animated.div
        ref={cardRef}
        {...bind()}
        style={{
          x,
          y,
          rotate: rotate.to(r => `${r}deg`),
          scale,
          opacity,
          touchAction: 'none',
        }}
        className="bg-white border-base rounded-sm shadow-sm cursor-grab active:cursor-grabbing"
      >
        {children}
      </animated.div>
    </div>
  );
};
