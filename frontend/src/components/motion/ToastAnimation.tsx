"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES } from './AnimationConstants';

interface ToastAnimationProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

export const ToastAnimation: React.FC<ToastAnimationProps> = ({
  isVisible,
  onClose,
  children,
  className = '',
  autoClose = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0,
            x: TRANSFORM_VALUES.TRANSLATE_TOAST,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1,
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0,
            x: TRANSFORM_VALUES.TRANSLATE_TOAST,
            scale: 0.95
          }}
          transition={{
            duration: 0.25,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          className={`bg-white border-base shadow-lg p-4 max-w-sm w-full ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast container for multiple toasts
export const ToastContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {children}
    </div>
  );
};

// Individual toast with icon and message
export const Toast: React.FC<{
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-success text-success';
      case 'error':
        return 'border-error text-error';
      case 'warning':
        return 'border-warning text-warning';
      case 'info':
        return 'border-primary text-primary';
      default:
        return 'border-black text-black';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <ToastAnimation isVisible={isVisible} onClose={onClose}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getTypeStyles()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-black">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </ToastAnimation>
  );
};
