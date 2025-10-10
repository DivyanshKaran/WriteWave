"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxHeight?: number;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = 0.7,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [{ y }, api] = useSpring(() => ({
    y: typeof window !== 'undefined' ? window.innerHeight : 600,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    if (isOpen) {
      api.start({ y: 0 });
    } else {
      api.start({ y: typeof window !== 'undefined' ? window.innerHeight : 600 });
    }
  }, [isOpen, api]);

  const bind = useDrag(
    ({ active, movement: [, my], velocity: [, vy] }) => {
      if (active) {
        setIsDragging(true);
        api.start({
          y: Math.max(0, my),
          immediate: true,
        });
      } else {
        setIsDragging(false);
        
        // Determine if should close
        const shouldClose = 
          my > window.innerHeight * 0.3 || 
          vy > 0.5;
        
        if (shouldClose) {
          onClose();
        } else {
          // Return to open position
          api.start({ y: 0 });
        }
      }
    },
    {
      axis: 'y',
      bounds: { top: 0, bottom: typeof window !== 'undefined' ? window.innerHeight : 600 },
      rubberband: true,
    }
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Sheet */}
          <animated.div
            ref={sheetRef}
            {...bind()}
            style={{ 
              y,
              maxHeight: `${maxHeight * 100}vh`,
            }}
            className={`
              relative w-full bg-white rounded-t-lg shadow-lg
              ${className}
            `}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Header */}
            {title && (
              <div className="px-4 pb-4 border-b border-gray-200">
                <h3 className="heading text-lg font-semibold">{title}</h3>
              </div>
            )}
            
            {/* Content */}
            <div className="px-4 py-4 overflow-y-auto">
              {children}
            </div>
          </animated.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
