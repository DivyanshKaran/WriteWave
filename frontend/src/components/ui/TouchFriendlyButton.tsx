"use client";

import React from 'react';

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black text-white hover:bg-gray-800 active:bg-gray-900';
      case 'secondary':
        return 'bg-white text-black border-base hover:border-strong active:bg-gray-50';
      case 'tertiary':
        return 'text-black hover:underline active:text-gray-600';
      case 'destructive':
        return 'bg-error text-white hover:bg-red-600 active:bg-red-700';
      default:
        return 'bg-black text-white hover:bg-gray-800 active:bg-gray-900';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-3 text-sm';
      case 'md':
        return 'h-12 px-4 text-base';
      case 'lg':
        return 'h-14 px-6 text-lg';
      default:
        return 'h-12 px-4 text-base';
    }
  };

  const getDisabledClasses = () => {
    if (disabled) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    }
    return '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        min-h-touch min-w-touch
        font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        mobile:min-h-12 mobile:min-w-12
        tablet:min-h-10 tablet:min-w-10
        desktop:min-h-10 desktop:min-w-10
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getDisabledClasses()}
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-pulse">...</span>
      ) : (
        children
      )}
    </button>
  );
};
