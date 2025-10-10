"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from './AnimationConstants';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: TRANSFORM_VALUES.TRANSLATE_PAGE 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      exit={{ 
        opacity: 0, 
        y: -TRANSFORM_VALUES.TRANSLATE_PAGE 
      }}
      transition={{
        duration: ANIMATION_DURATION.MODERATE / 1000,
        ease: ANIMATION_EASING.EASE_IN_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Fade transition for simpler cases
export const FadeTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: ANIMATION_DURATION.MODERATE / 1000,
        ease: ANIMATION_EASING.EASE_IN_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger animation for lists
export const StaggerTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.05 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual item for stagger
export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: TRANSFORM_VALUES.TRANSLATE_PAGE 
        },
        visible: { 
          opacity: 1, 
          y: 0 
        },
      }}
      transition={{
        duration: ANIMATION_DURATION.MODERATE / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
