"use client";

import { useEffect } from 'react';
import { useUserStore, useUIStore } from '@/stores';

export const StoreInitializer = () => {
  useEffect(() => {
    // Initialize stores safely
    try {
      // Only initialize if we're in the browser
      if (typeof window !== 'undefined') {
        // Initialize user store
        const { initializeAuth } = useUserStore.getState();
        
        if (initializeAuth && typeof initializeAuth === 'function') {
          initializeAuth();
        }

        // Initialize UI store theme
        const { setTheme, theme } = useUIStore.getState();
        
        if (setTheme && typeof setTheme === 'function') {
          setTheme(theme);
        }
      }
    } catch (error) {
      console.warn('StoreInitializer error:', error);
    }
  }, []);

  return null;
};
