"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { motion, AnimatePresence } from 'framer-motion';

interface LongPressProps {
  children: React.ReactNode;
  onLongPress?: () => void;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  duration = 500,
  threshold = 10,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const { scale, opacity } = useSpring({
    scale: isPressed ? 0.95 : 1,
    opacity: showFeedback ? 0.7 : 1,
    config: { tension: 300, friction: 30 },
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    startTimeRef.current = Date.now();
    setIsPressed(true);
    setProgress(0);

    // Start progress animation
    const startProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        timerRef.current = setTimeout(startProgress, 16); // ~60fps
      } else {
        // Long press completed
        setShowFeedback(true);
        if (navigator.vibrate) {
          navigator.vibrate(50); // Longer haptic feedback
        }
        if (onLongPress) {
          onLongPress();
        }
        setTimeout(() => {
          setShowFeedback(false);
          setIsPressed(false);
          setProgress(0);
        }, 200);
      }
    };

    timerRef.current = setTimeout(startProgress, 16);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPositionRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startPositionRef.current.x);
    const deltaY = Math.abs(touch.clientY - startPositionRef.current.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel if moved too far
    if (distance > threshold) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPressed(false);
      setProgress(0);
    }
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
    setProgress(0);
    startPositionRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // For desktop testing
    startPositionRef.current = { x: e.clientX, y: e.clientY };
    startTimeRef.current = Date.now();
    setIsPressed(true);
    setProgress(0);

    const startProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        timerRef.current = setTimeout(startProgress, 16);
      } else {
        setShowFeedback(true);
        if (onLongPress) {
          onLongPress();
        }
        setTimeout(() => {
          setShowFeedback(false);
          setIsPressed(false);
          setProgress(0);
        }, 200);
      }
    };

    timerRef.current = setTimeout(startProgress, 16);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
    setProgress(0);
    startPositionRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <animated.div
        style={{ scale, opacity }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="cursor-pointer select-none"
      >
        {children}
      </animated.div>

      {/* Progress indicator */}
      <AnimatePresence>
        {isPressed && progress > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                <div
                  className="w-8 h-8 border-2 border-white rounded-full"
                  style={{
                    borderTopColor: 'transparent',
                    transform: `rotate(${progress * 360}deg)`,
                    transition: 'transform 0.1s linear',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-2 rounded-sm text-sm font-medium">
                Long press detected! ✓
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
