"use client";

import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { usePinch } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  className?: string;
}

export const PinchZoom: React.FC<PinchZoomProps> = ({
  children,
  minScale = 1,
  maxScale = 4,
  initialScale = 1,
  className = '',
}) => {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const [{ transform }, api] = useSpring(() => ({
    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
    config: { tension: 300, friction: 30 },
  }));

  const bind = usePinch(
    ({ active, offset: [d], memo = [scale, position.x, position.y] }) => {
      if (active) {
        const newScale = Math.max(minScale, Math.min(maxScale, memo[0] * d));
        setScale(newScale);
        setIsZoomed(newScale > 1.1);
        
        api.start({
          transform: `scale(${newScale}) translate(${memo[1]}px, ${memo[2]}px)`,
          immediate: true,
        });
      }
      
      return [scale, position.x, position.y];
    },
    {
      scaleBounds: { min: minScale, max: maxScale },
      rubberband: true,
    }
  );

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected
      if (isZoomed) {
        // Reset to original scale
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
        
        api.start({
          transform: `scale(${initialScale}) translate(0px, 0px)`,
        });
      } else {
        // Zoom to 2x
        const newScale = 2;
        setScale(newScale);
        setIsZoomed(true);
        
        api.start({
          transform: `scale(${newScale}) translate(0px, 0px)`,
        });
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
    
    lastTapRef.current = now;
  };

  const handleReset = () => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
    
    api.start({
      transform: `scale(${initialScale}) translate(0px, 0px)`,
    });
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <animated.div
        ref={containerRef}
        {...bind()}
        style={{ transform }}
        className="origin-center cursor-grab active:cursor-grabbing"
        onDoubleClick={handleDoubleTap}
      >
        {children}
      </animated.div>

      {/* Zoom controls */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-sm text-sm">
              <div className="flex items-center gap-2">
                <span>{Math.round(scale * 100)}%</span>
                <button
                  onClick={handleReset}
                  className="text-xs underline hover:no-underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {!isZoomed && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-sm text-xs text-center">
              Pinch to zoom • Double-tap to reset
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
