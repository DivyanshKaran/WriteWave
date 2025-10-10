"use client";

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  variant = 'rectangular'
}) => {
  const getDimensions = () => {
    if (variant === 'text') {
      return {
        width: width || `${Math.random() * 40 + 60}%`, // 60-100% random width
        height: height || '8px'
      };
    }
    return {
      width: width || '100%',
      height: height || '20px'
    };
  };

  const dimensions = getDimensions();

  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${variant === 'circular' ? 'rounded-full' : ''}
        ${className}
      `}
      style={{
        width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width,
        height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
      }}
    />
  );
};

// Predefined skeleton components for common patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} variant="text" />
    ))}
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton width={120} height={48} className={className} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border-base bg-white p-6 space-y-4 ${className}`}>
    <Skeleton width="60%" height={24} />
    <SkeletonText lines={2} />
    <div className="flex gap-2">
      <SkeletonButton />
      <SkeletonButton />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`border-base bg-white ${className}`}>
    {/* Header */}
    <div className="h-12 bg-gray-50 border-b border-black flex items-center px-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width="80%" height={12} className="flex-1 mr-4 last:mr-0" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="h-14 border-b border-gray-200 flex items-center px-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} width="70%" height={12} className="flex-1 mr-4 last:mr-0" />
        ))}
      </div>
    ))}
  </div>
);
