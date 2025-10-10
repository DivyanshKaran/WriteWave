"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES, SHADOW_VALUES } from '@/components/motion/AnimationConstants';

interface HoverEffectsProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Link hover effect with underline animation
export const LinkHover: React.FC<HoverEffectsProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.a
      onClick={onClick}
      className={`relative inline-block text-black hover:text-gray-700 cursor-pointer ${className}`}
      whileHover={{ 
        transition: { duration: ANIMATION_DURATION.FAST / 1000 }
      }}
    >
      {children}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black origin-center"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{
          duration: ANIMATION_DURATION.FAST / 1000,
          ease: ANIMATION_EASING.EASE_OUT,
        }}
      />
    </motion.a>
  );
};

// Card hover effect with lift and shadow
export const CardHover: React.FC<HoverEffectsProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      whileHover={{ 
        y: -2,
        boxShadow: SHADOW_VALUES.CARD_HOVER,
        transition: { duration: ANIMATION_DURATION.FAST / 1000 }
      }}
      whileTap={{ 
        scale: TRANSFORM_VALUES.SCALE_PRESS,
        transition: { duration: 0.1 }
      }}
      transition={{
        duration: ANIMATION_DURATION.FAST / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
};

// Image hover effect with scale
export const ImageHover: React.FC<HoverEffectsProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`overflow-hidden cursor-pointer ${className}`}
      whileHover={{ 
        scale: TRANSFORM_VALUES.SCALE_HOVER,
        transition: { duration: ANIMATION_DURATION.MODERATE / 1000 }
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

// Button hover effect with border animation
export const ButtonHover: React.FC<HoverEffectsProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ 
        transition: { duration: ANIMATION_DURATION.FAST / 1000 }
      }}
      whileTap={{ 
        scale: TRANSFORM_VALUES.SCALE_PRESS,
        transition: { duration: 0.1 }
      }}
    >
      {children}
      <motion.div
        className="absolute inset-0 border-2 border-black"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{
          duration: ANIMATION_DURATION.FAST / 1000,
          ease: ANIMATION_EASING.EASE_OUT,
        }}
      />
    </motion.button>
  );
};

// Interactive element with ripple effect
export const RippleEffect: React.FC<HoverEffectsProps> = ({ children, className = '', onClick }) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-black bg-opacity-20 rounded-full"
          initial={{ 
            x: ripple.x - 10,
            y: ripple.y - 10,
            width: 20,
            height: 20,
            scale: 0,
          }}
          animate={{ 
            scale: 4,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
        />
      ))}
    </div>
  );
};
