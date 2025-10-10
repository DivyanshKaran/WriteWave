"use client";

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
  hideOnScroll?: boolean;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = '+',
  label,
  position = 'bottom-right',
  size = 'medium',
  hideOnScroll = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12';
      case 'medium':
        return 'w-14 h-14';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const { scale, opacity } = useSpring({
    scale: isVisible ? 1 : 0,
    opacity: isVisible ? 1 : 0,
    config: { tension: 300, friction: 30 },
  });

  useEffect(() => {
    if (!hideOnScroll || typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOnScroll]);

  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onClick();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-40 ${getPositionClasses()}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <motion.button
            onClick={handleClick}
            className={`
              ${getSizeClasses()}
              bg-black text-white rounded-full shadow-lg
              flex items-center justify-center
              hover:bg-gray-800 active:bg-gray-900
              transition-colors duration-200
              ${className}
            `}
            style={{ scale: scale.get(), opacity: opacity.get() }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xl font-bold">{icon}</span>
          </motion.button>
          
          {/* Label */}
          {label && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded-sm whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {label}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
