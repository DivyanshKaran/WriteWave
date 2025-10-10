"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from '@/components/motion/AnimationConstants';

interface ButtonAnimationProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
}

export const ButtonAnimation: React.FC<ButtonAnimationProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black text-white hover:bg-gray-800';
      case 'secondary':
        return 'bg-white text-black border-base hover:border-strong';
      case 'tertiary':
        return 'text-black hover:underline';
      case 'destructive':
        return 'bg-error text-white hover:bg-red-600';
      default:
        return 'bg-black text-white hover:bg-gray-800';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: disabled ? 1 : TRANSFORM_VALUES.SCALE_HOVER,
        transition: { duration: ANIMATION_DURATION.FAST / 1000 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : TRANSFORM_VALUES.SCALE_PRESS,
        transition: { duration: 0.1 }
      }}
      transition={{
        duration: ANIMATION_DURATION.FAST / 1000,
        ease: ANIMATION_EASING.EASE_OUT,
      }}
      className={`
        inline-flex items-center justify-center
        h-12 px-4 font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

// Copy button with feedback animation
export const CopyButton: React.FC<{
  text: string;
  children: React.ReactNode;
  className?: string;
}> = ({ text, children, className = '' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="relative">
      <ButtonAnimation onClick={handleCopy} className={className}>
        {children}
      </ButtonAnimation>
      
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
        >
          Copied!
        </motion.div>
      )}
    </div>
  );
};
