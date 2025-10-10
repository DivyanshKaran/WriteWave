// Store Initialization Hook
import { useEffect } from 'react';
import { useUserStore } from './userStore';
import { useProgressStore } from './progressStore';
import { useCharacterStore } from './characterStore';
import { useUIStore } from './uiStore';

export const useStoreInitialization = () => {
  const { initializeAuth } = useUserStore();
  const { loadProgress } = useProgressStore();
  const { loadCharacters } = useCharacterStore();
  const { setTheme } = useUIStore();

  useEffect(() => {
    // Initialize authentication
    initializeAuth();
    
    // Load progress data
    loadProgress();
    
    // Load characters
    loadCharacters();
    
    // Apply theme from store
    const theme = useUIStore.getState().theme;
    setTheme(theme);
  }, [initializeAuth, loadProgress, loadCharacters, setTheme]);
};
