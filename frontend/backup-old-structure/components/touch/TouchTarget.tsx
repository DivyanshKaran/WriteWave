"use client";

import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface TouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'list-item' | 'icon';
  className?: string;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  onClick,
  disabled = false,
  size = 'medium',
  variant = 'button',
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'min-w-[40px] min-h-[40px]';
      case 'medium':
        return 'min-w-[44px] min-h-[44px]';
      case 'large':
        return 'min-w-[56px] min-h-[56px]';
      default:
        return 'min-w-[44px] min-h-[44px]';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'button':
        return 'px-4 py-2 rounded-sm border-base hover:border-strong active:bg-gray-50';
      case 'list-item':
        return 'px-4 py-3 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100';
      case 'icon':
        return 'p-2 rounded-sm hover:bg-gray-50 active:bg-gray-100';
      default:
        return 'px-4 py-2 rounded-sm border-base hover:border-strong active:bg-gray-50';
    }
  };

  const { scale, backgroundColor } = useSpring({
    scale: isPressed ? 0.95 : 1,
    backgroundColor: isPressed ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0)',
    config: { tension: 300, friction: 30 },
  });

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <animated.div
      style={{ scale, backgroundColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors duration-150
        ${className}
      `}
    >
      {children}
    </animated.div>
  );
};
