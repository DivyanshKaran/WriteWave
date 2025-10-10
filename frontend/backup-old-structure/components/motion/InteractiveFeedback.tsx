"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from '@/components/motion/AnimationConstants';

interface InteractiveFeedbackProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Input focus animation
export const InputFocus: React.FC<InteractiveFeedbackProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileFocus={{ 
        scale: 1.01,
        transition: { duration: ANIMATION_DURATION.FAST / 1000 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Success checkmark animation
export const SuccessCheckmark: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className = '' }) => {
  return (
    <motion.div
      className={`w-6 h-6 ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: isVisible ? 1 : 0 }}
      transition={{
        duration: ANIMATION_DURATION.SLOW / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isVisible ? 1 : 0 }}
          transition={{
            duration: ANIMATION_DURATION.SLOW / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          stroke="#00A86B"
        />
      </svg>
    </motion.div>
  );
};

// Error shake animation
export const ErrorShake: React.FC<InteractiveFeedbackProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        x: [0, -TRANSFORM_VALUES.SHAKE_DISTANCE, TRANSFORM_VALUES.SHAKE_DISTANCE, -TRANSFORM_VALUES.SHAKE_DISTANCE, TRANSFORM_VALUES.SHAKE_DISTANCE, 0],
      }}
      transition={{
        duration: ANIMATION_DURATION.MODERATE / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
};

// Loading spinner animation
export const LoadingSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = '' }) => {
  return (
    <motion.div
      className={`w-${size} h-${size} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: ANIMATION_EASING.LINEAR,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="60" />
      </svg>
    </motion.div>
  );
};

// Pulse animation for loading states
export const PulseAnimation: React.FC<InteractiveFeedbackProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: ANIMATION_EASING.EASE_IN_OUT,
      }}
    >
      {children}
    </motion.div>
  );
};

// Bounce animation for attention
export const BounceAnimation: React.FC<InteractiveFeedbackProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: ANIMATION_EASING.EASE_IN_OUT,
      }}
    >
      {children}
    </motion.div>
  );
};

// Scale animation for emphasis
export const ScaleAnimation: React.FC<InteractiveFeedbackProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: ANIMATION_EASING.EASE_IN_OUT,
      }}
    >
      {children}
    </motion.div>
  );
};

// Progress bar animation
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
}> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: ANIMATION_DURATION.MODERATE / 1000,
          ease: ANIMATION_EASING.EASE_OUT,
        }}
      />
    </div>
  );
};
