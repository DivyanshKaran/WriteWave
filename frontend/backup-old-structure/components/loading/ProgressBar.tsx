"use client";

import React from 'react';

interface ProgressBarProps {
  value?: number; // 0-100 for determinate
  indeterminate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  indeterminate = false,
  className = ''
}) => {
  if (indeterminate) {
    return (
      <div className={`w-full h-1 border-base bg-white overflow-hidden ${className}`}>
        <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
      </div>
    );
  }

  return (
    <div className={`w-full h-1 border-base bg-white overflow-hidden ${className}`}>
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

// Linear progress bar with custom styling
export const LinearProgress: React.FC<{
  value?: number;
  indeterminate?: boolean;
  height?: number;
  className?: string;
}> = ({ value, indeterminate, height = 4, className = '' }) => (
  <div 
    className={`w-full border-base bg-white overflow-hidden ${className}`}
    style={{ height: `${height}px` }}
  >
    {indeterminate ? (
      <div 
        className="h-full bg-primary animate-pulse"
        style={{ width: '30%' }}
      />
    ) : (
      <div 
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
    )}
  </div>
);
