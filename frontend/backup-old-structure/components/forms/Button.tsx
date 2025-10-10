"use client";

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  'aria-label'?: string;
}

const getVariantClasses = (variant: ButtonVariant, disabled: boolean, loading: boolean) => {
  if (disabled || loading) {
    return 'bg-gray-200 text-gray-600 cursor-not-allowed';
  }

  switch (variant) {
    case 'primary':
      return 'bg-black text-white hover:border-strong';
    case 'secondary':
      return 'bg-white text-black border-base hover:border-strong';
    case 'tertiary':
      return 'bg-transparent text-black hover:underline';
    case 'destructive':
      return 'bg-error text-white hover:border-strong';
    default:
      return 'bg-black text-white hover:border-strong';
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 'h-8 px-3 body text-sm';
    case 'md':
      return 'h-12 px-6 body text-base';
    case 'lg':
      return 'h-14 px-8 body text-lg';
    default:
      return 'h-12 px-6 body text-base';
  }
};

const LoadingDots: React.FC = () => (
  <span className="inline-block">
    <span className="animate-pulse">.</span>
    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
  </span>
);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        ${getVariantClasses(variant, disabled, loading)}
        ${getSizeClasses(size)}
        ${variant !== 'tertiary' ? 'border-base' : ''}
        font-medium
        transition-all duration-200
        focus:outline-none focus:border-2 focus:border-black
        ${className}
      `}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
};
