import React, { useEffect, useRef, useCallback, useState } from 'react';

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  onSelect?: (item: any, index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && onSelect) {
            onSelect(items[focusedIndex], focusedIndex);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    },
    [items, focusedIndex, onSelect]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    containerRef,
  };
}

// Hook for focus management
export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      previousFocusRef.current = activeElement;
      setFocusHistory((prev) => [...prev, activeElement]);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    focusHistory,
  };
}

// Hook for screen reader announcements
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    
    // Clear after announcement
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  return {
    announcement,
    announce,
  };
}

// Hook for ARIA live regions
export function useAriaLiveRegion() {
  const [liveMessage, setLiveMessage] = useState('');
  const [liveRegion, setLiveRegion] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setLiveRegion(priority);
    setLiveMessage(message);
    
    // Clear after announcement
    setTimeout(() => {
      setLiveMessage('');
    }, 1000);
  }, []);

  return {
    liveMessage,
    liveRegion,
    announce,
  };
}

// Hook for color contrast checking
export function useColorContrast(foreground: string, background: string) {
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);
  const [isAccessible, setIsAccessible] = useState<boolean | null>(null);

  useEffect(() => {
    // Simple contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    const calculateContrast = (fg: string, bg: string) => {
      // This is a simplified calculation
      // Real implementation would convert hex/rgb to luminance values
      const fgLuminance = 0.5; // Placeholder
      const bgLuminance = 0.5; // Placeholder
      
      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      
      return (lighter + 0.05) / (darker + 0.05);
    };

    const ratio = calculateContrast(foreground, background);
    setContrastRatio(ratio);
    setIsAccessible(ratio >= 4.5); // WCAG AA standard
  }, [foreground, background]);

  return {
    contrastRatio,
    isAccessible,
  };
}

// Hook for reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for high contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Hook for focus visible detection
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleFocusIn = () => {
      setIsFocusVisible(true);
    };

    const handleFocusOut = () => {
      setIsFocusVisible(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}
