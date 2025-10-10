"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { A11Y_CONSTANTS, focusableSelectors } from '@/lib/accessibility/constants';

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  trapFocus = false,
  restoreFocus = false,
  initialFocus
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Focus management
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    // Set initial focus
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else {
      focusableElements[0].focus();
    }

    // Focus trap
    if (trapFocus) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [trapFocus, initialFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  return (
    <div ref={containerRef} className="focus-manager">
      {children}
    </div>
  );
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  onKeyDown?: (e: KeyboardEvent) => void,
  dependencies: React.DependencyList = []
) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    onKeyDown?.(e);
  }, dependencies);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook for focus management
export const useFocusManagement = () => {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { focusElement, trapFocus };
};

// Component for managing focus on mount/unmount
export const FocusOnMount: React.FC<{
  children: React.ReactNode;
  selector?: string;
  className?: string;
}> = ({ children, selector, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selector) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
      }
    } else if (ref.current) {
      const focusableElement = ref.current.querySelector(focusableSelectors) as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
