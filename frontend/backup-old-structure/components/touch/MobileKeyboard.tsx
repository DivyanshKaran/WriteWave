"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface MobileKeyboardProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileKeyboard: React.FC<MobileKeyboardProps> = ({
  children,
  className = '',
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { y } = useSpring({
    y: isKeyboardVisible ? -keyboardHeight : 0,
    config: { tension: 300, friction: 30 },
  });

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Estimate keyboard height based on viewport change
      const estimatedKeyboardHeight = Math.max(0, documentHeight - viewportHeight);
      
      if (estimatedKeyboardHeight > 100) {
        setKeyboardHeight(estimatedKeyboardHeight);
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Scroll to focused element
        setTimeout(() => {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
    };

    const handleFocusOut = () => {
      // Small delay to allow for keyboard dismissal
      setTimeout(() => {
        setIsKeyboardVisible(false);
      }, 300);
    };

    // Initial check
    handleResize();

    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <animated.div
      ref={containerRef}
      style={{ y }}
      className={`transition-all duration-300 ${className}`}
    >
      {children}
    </animated.div>
  );
};

// Hook for keyboard-aware input
export const useKeyboardAwareInput = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const estimatedKeyboardHeight = Math.max(0, documentHeight - viewportHeight);
      
      if (estimatedKeyboardHeight > 100) {
        setKeyboardHeight(estimatedKeyboardHeight);
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Set appropriate input attributes
        if (target.getAttribute('type') === 'email') {
          target.setAttribute('autocomplete', 'email');
          target.setAttribute('autocapitalize', 'none');
        } else if (target.getAttribute('type') === 'password') {
          target.setAttribute('autocomplete', 'current-password');
        } else if (target.getAttribute('type') === 'tel') {
          target.setAttribute('inputmode', 'tel');
        } else if (target.getAttribute('type') === 'number') {
          target.setAttribute('inputmode', 'numeric');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
  };
};
