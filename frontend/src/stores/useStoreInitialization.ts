// Store Initialization Hook
import { useEffect } from 'react';
import { useUserStore } from './userStore';
import { useUIStore } from './uiStore';

export const useStoreInitialization = () => {
  const { initializeAuth } = useUserStore();
  const { setTheme } = useUIStore();

  useEffect(() => {
    try {
      // Initialize authentication (safe - handles errors internally)
      if (initializeAuth && typeof initializeAuth === 'function') {
        initializeAuth();
      }
      
      // Apply theme from store (safe - handles errors internally)
      if (setTheme && typeof setTheme === 'function') {
        const theme = useUIStore.getState().theme;
        setTheme(theme);
      }
    } catch (error) {
      console.warn('Store initialization error:', error);
      // Don't throw - just log the error and continue
    }
  }, [initializeAuth, setTheme]);
};
