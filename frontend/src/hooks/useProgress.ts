import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { transformProgressData, ProgressData } from '@/lib/data-transformers';

export interface ProgressState {
  progress: ProgressData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressActions {
  fetchProgress: () => Promise<void>;
  updateStudySession: (sessionData: StudySessionData) => Promise<void>;
  markCharacterLearned: (characterId: string, mastery: number) => Promise<void>;
  markVocabularyLearned: (vocabularyId: string, mastery: number) => Promise<void>;
  completeLesson: (lessonId: string, score: number) => Promise<void>;
  updateStudyGoal: (goal: number) => Promise<void>;
  resetProgress: () => void;
}

interface StudySessionData {
  characterType: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  characters: string[];
  duration: number; // minutes
  accuracy: number; // percentage
  score: number;
  level: string;
}

/**
 * Hook for managing learning progress and achievements
 */
export function useProgress(): ProgressState & ProgressActions {
  const [state, setState] = useState<ProgressState>({
    progress: null,
    isLoading: false,
    error: null,
  });

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.get('/progress');
      const progressData = transformProgressData(response.data);
      
      setState({
        progress: progressData,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch progress',
      }));
    }
  }, []);

  // Update study session
  const updateStudySession = useCallback(async (sessionData: StudySessionData) => {
    try {
      await apiClient.post('/progress/sessions', sessionData);
      
      // Refresh progress data
      await fetchProgress();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update study session');
    }
  }, [fetchProgress]);

  // Mark character as learned
  const markCharacterLearned = useCallback(async (characterId: string, mastery: number) => {
    try {
      await apiClient.post('/progress/characters', {
        characterId,
        mastery,
      });
      
      // Refresh progress data
      await fetchProgress();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark character as learned');
    }
  }, [fetchProgress]);

  // Mark vocabulary as learned
  const markVocabularyLearned = useCallback(async (vocabularyId: string, mastery: number) => {
    try {
      await apiClient.post('/progress/vocabulary', {
        vocabularyId,
        mastery,
      });
      
      // Refresh progress data
      await fetchProgress();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark vocabulary as learned');
    }
  }, [fetchProgress]);

  // Complete lesson
  const completeLesson = useCallback(async (lessonId: string, score: number) => {
    try {
      await apiClient.post('/progress/lessons', {
        lessonId,
        score,
        completedAt: new Date().toISOString(),
      });
      
      // Refresh progress data
      await fetchProgress();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete lesson');
    }
  }, [fetchProgress]);

  // Update study goal
  const updateStudyGoal = useCallback(async (goal: number) => {
    try {
      await apiClient.put('/progress/goal', { goal });
      
      // Refresh progress data
      await fetchProgress();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update study goal');
    }
  }, [fetchProgress]);

  // Reset progress (for testing purposes)
  const resetProgress = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await apiClient.delete('/progress/reset');
      
      setState({
        progress: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to reset progress',
      }));
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    ...state,
    fetchProgress,
    updateStudySession,
    markCharacterLearned,
    markVocabularyLearned,
    completeLesson,
    updateStudyGoal,
    resetProgress,
  };
}
