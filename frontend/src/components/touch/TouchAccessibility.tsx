"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TouchAccessibilityProps {
  children: React.ReactNode;
  className?: string;
}

export const TouchAccessibility: React.FC<TouchAccessibilityProps> = ({
  children,
  className = '',
}) => {
  const [isVoiceOverActive, setIsVoiceOverActive] = useState(false);
  const [isTalkBackActive, setIsTalkBackActive] = useState(false);
  const [systemFontSize, setSystemFontSize] = useState(16);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Detect screen readers
  useEffect(() => {
    const checkScreenReader = () => {
      // Check for VoiceOver (iOS)
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        setIsVoiceOverActive(window.speechSynthesis !== undefined);
      }
      
      // Check for TalkBack (Android)
      if (navigator.userAgent.includes('Android')) {
        setIsTalkBackActive(window.speechSynthesis !== undefined);
      }
    };

    checkScreenReader();
  }, []);

  // Monitor system preferences
  useEffect(() => {
    const updateSystemPreferences = () => {
      // Check for high contrast mode
      if (window.matchMedia) {
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        setIsHighContrast(highContrastQuery.matches);
        
        highContrastQuery.addEventListener('change', (e) => {
          setIsHighContrast(e.matches);
        });
      }

      // Check for reduced motion
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reducedMotionQuery.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
      }
    };

    updateSystemPreferences();
  }, []);

  // Monitor font size changes
  useEffect(() => {
    const updateFontSize = () => {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setSystemFontSize(rootFontSize);
    };

    updateFontSize();
    
    // Listen for font size changes
    const observer = new MutationObserver(updateFontSize);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`touch-accessibility ${className} ${
        isHighContrast ? 'high-contrast' : ''
      } ${isVoiceOverActive || isTalkBackActive ? 'screen-reader-active' : ''}`}
      style={{
        fontSize: `${systemFontSize}px`,
      }}
    >
      {children}
      
      {/* Accessibility indicators (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>VoiceOver: {isVoiceOverActive ? 'Active' : 'Inactive'}</div>
          <div>TalkBack: {isTalkBackActive ? 'Active' : 'Inactive'}</div>
          <div>High Contrast: {isHighContrast ? 'On' : 'Off'}</div>
          <div>Font Size: {systemFontSize}px</div>
        </div>
      )}
    </div>
  );
};

// Accessible touch target component
interface AccessibleTouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  ariaLabel: string;
  ariaHint?: string;
  disabled?: boolean;
  className?: string;
}

export const AccessibleTouchTarget: React.FC<AccessibleTouchTargetProps> = ({
  children,
  onClick,
  onLongPress,
  ariaLabel,
  ariaHint,
  disabled = false,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Start long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        // Haptic feedback for long press
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    }
    
    // Haptic feedback for tap
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaHint ? `${ariaLabel}-hint` : undefined}
      className={`
        min-h-[44px] min-w-[44px] p-2 rounded-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isPressed ? 'bg-gray-100' : 'hover:bg-gray-50'}
        transition-colors duration-150
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
      {ariaHint && (
        <div id={`${ariaLabel}-hint`} className="sr-only">
          {ariaHint}
        </div>
      )}
    </motion.button>
  );
};

// Screen reader announcements
export const useScreenReaderAnnouncement = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 5000);
  };

  return {
    announce,
    announcements,
  };
};

// Focus management for touch
export const useTouchFocus = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const focusElement = (element: HTMLElement) => {
    element.focus();
    setFocusedElement(element);
    
    // Scroll element into view
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  const blurElement = () => {
    if (focusedElement) {
      focusedElement.blur();
      setFocusedElement(null);
    }
  };

  return {
    focusedElement,
    focusElement,
    blurElement,
  };
};
