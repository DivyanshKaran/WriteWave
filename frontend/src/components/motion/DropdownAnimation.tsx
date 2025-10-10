"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from './AnimationConstants';

interface DropdownAnimationProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const DropdownAnimation: React.FC<DropdownAnimationProps> = ({
  isOpen,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ 
            opacity: 0,
            y: -TRANSFORM_VALUES.TRANSLATE_DROPDOWN,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0,
            y: -TRANSFORM_VALUES.TRANSLATE_DROPDOWN,
            scale: 0.95
          }}
          transition={{
            duration: ANIMATION_DURATION.FAST / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          className={`absolute top-full left-0 mt-1 bg-white border-base shadow-lg z-10 ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Tooltip animation
export const TooltipAnimation: React.FC<DropdownAnimationProps> = ({
  isOpen,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ 
            opacity: 0,
            y: -TRANSFORM_VALUES.TRANSLATE_DROPDOWN,
            scale: 0.9
          }}
          animate={{ 
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0,
            y: -TRANSFORM_VALUES.TRANSLATE_DROPDOWN,
            scale: 0.9
          }}
          transition={{
            duration: ANIMATION_DURATION.FAST / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 ${className}`}
        >
          {children}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
