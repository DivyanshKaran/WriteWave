"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerEffectProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  className = '',
  isLoading = false
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Skeleton shimmer for loading states
export const SkeletonShimmer: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Text shimmer effect
export const TextShimmer: React.FC<{
  text: string;
  className?: string;
  isLoading?: boolean;
}> = ({ text, className = '', isLoading = false }) => {
  if (!isLoading) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="opacity-0">{text}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </span>
  );
};
