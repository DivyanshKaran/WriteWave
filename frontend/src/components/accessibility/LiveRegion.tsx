"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { A11Y_CONSTANTS } from '@/lib/accessibility/constants';

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  className = ''
}) => {
  return (
    <div
      className={`${A11Y_CONSTANTS.LIVE_REGION} ${className}`}
      aria-live={politeness}
      aria-atomic="true"
    >
      {children}
    </div>
  );
};

// Hook for managing live region announcements
export const useLiveRegion = () => {
  const [announcement, setAnnouncement] = useState<string>('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement(message);
    
    // Clear the announcement after a short delay
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  return { announcement, politeness, announce };
};

// Component for announcing dynamic content
export const Announcement: React.FC<{
  message: string;
  politeness?: 'polite' | 'assertive';
  className?: string;
}> = ({ message, politeness = 'polite', className = '' }) => {
  return (
    <LiveRegion politeness={politeness} className={className}>
      {message}
    </LiveRegion>
  );
};

// Toast announcements for screen readers
export const ScreenReaderToast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  className?: string;
}> = ({ message, type = 'info', className = '' }) => {
  const getPoliteness = () => {
    switch (type) {
      case 'error':
        return 'assertive';
      case 'success':
      case 'warning':
        return 'polite';
      default:
        return 'polite';
    }
  };

  return (
    <LiveRegion politeness={getPoliteness()} className={className}>
      {message}
    </LiveRegion>
  );
};

// Loading state announcements
export const LoadingAnnouncement: React.FC<{
  isLoading: boolean;
  loadingMessage?: string;
  completeMessage?: string;
  className?: string;
}> = ({ 
  isLoading, 
  loadingMessage = 'Loading content', 
  completeMessage = 'Content loaded',
  className = ''
}) => {
  return (
    <LiveRegion politeness="polite" className={className}>
      {isLoading ? loadingMessage : completeMessage}
    </LiveRegion>
  );
};

// Form validation announcements
export const FormAnnouncement: React.FC<{
  errors: string[];
  className?: string;
}> = ({ errors, className = '' }) => {
  const errorMessage = errors.length > 0 
    ? `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}: ${errors.join(', ')}`
    : 'Form is valid';

  return (
    <LiveRegion politeness="assertive" className={className}>
      {errorMessage}
    </LiveRegion>
  );
};

// Navigation announcements
export const NavigationAnnouncement: React.FC<{
  currentPage: string;
  totalPages?: number;
  className?: string;
}> = ({ currentPage, totalPages, className = '' }) => {
  const message = totalPages 
    ? `Page ${currentPage} of ${totalPages}`
    : `Page ${currentPage}`;

  return (
    <LiveRegion politeness="polite" className={className}>
      {message}
    </LiveRegion>
  );
};
