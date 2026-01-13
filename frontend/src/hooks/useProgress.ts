import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressService } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { ProgressSummarySchema, StreakSchema } from "@/types/schemas";

export function useProgressSummary(userId: string) {
  return useQuery({
    queryKey: ["progress", "summary", userId],
    queryFn: async () => {
      const res = await progressService.getUserAnalytics(userId);
      const parsed = ProgressSummarySchema.safeParse(res.data);
      return parsed.success ? parsed.data : {};
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useStreak(userId: string) {
  return useQuery({
    queryKey: ["progress", "streak", userId],
    queryFn: async () => {
      const res = await progressService.getUserStreaks(userId);
      const parsed = StreakSchema.safeParse(res.data);
      return parsed.success ? parsed.data : {};
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecordProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await progressService.updateCharacterPractice(data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      if (variables?.userId) {
        qc.invalidateQueries({
          queryKey: ["progress", "summary", variables.userId],
        });
        qc.invalidateQueries({
          queryKey: ["progress", "streak", variables.userId],
        });
      }
    },
  });
}
import { transformProgressData, ProgressData } from "@/lib/data-transformers";

export interface ProgressState {
  progress: ProgressData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressActions {
  fetchProgress: () => Promise<void>;
  updateStudySession: (sessionData: StudySessionData) => Promise<void>;
  markCharacterLearned: (characterId: string, mastery: number) => Promise<void>;
  markVocabularyLearned: (
    vocabularyId: string,
    mastery: number
  ) => Promise<void>;
  completeLesson: (lessonId: string, score: number) => Promise<void>;
  updateStudyGoal: (goal: number) => Promise<void>;
  resetProgress: () => void;
}

interface StudySessionData {
  characterType: "hiragana" | "katakana" | "kanji" | "vocabulary" | "grammar";
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await progressService.getUserProgress(userId);
      const progressData = transformProgressData(response.data);

      setState({
        progress: progressData,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to fetch progress",
      }));
    }
  }, []);

  // Update study session -> map to XP update
  const updateStudySession = useCallback(
    async (sessionData: StudySessionData) => {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await progressService.updateXP({
          userId,
          minutes: sessionData.duration,
          score: sessionData.score,
          source: "study-session",
        } as any);

        // Refresh progress data
        await fetchProgress();
      } catch (error: any) {
        throw new Error(error.message || "Failed to update study session");
      }
    },
    [fetchProgress]
  );

  // Mark character as learned -> map to mastery update
  const markCharacterLearned = useCallback(
    async (characterId: string, mastery: number) => {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await progressService.updateMastery({
          userId,
          type: "character",
          id: characterId,
          mastery,
        } as any);

        // Refresh progress data
        await fetchProgress();
      } catch (error: any) {
        throw new Error(error.message || "Failed to mark character as learned");
      }
    },
    [fetchProgress]
  );

  // Mark vocabulary as learned -> map to mastery update
  const markVocabularyLearned = useCallback(
    async (vocabularyId: string, mastery: number) => {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await progressService.updateMastery({
          userId,
          type: "vocabulary",
          id: vocabularyId,
          mastery,
        } as any);

        // Refresh progress data
        await fetchProgress();
      } catch (error: any) {
        throw new Error(
          error.message || "Failed to mark vocabulary as learned"
        );
      }
    },
    [fetchProgress]
  );

  // Complete lesson -> map to XP update
  const completeLesson = useCallback(
    async (lessonId: string, score: number) => {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await progressService.updateXP({
          userId,
          score,
          lessonId,
          source: "lesson",
        } as any);

        // Refresh progress data
        await fetchProgress();
      } catch (error: any) {
        throw new Error(error.message || "Failed to complete lesson");
      }
    },
    [fetchProgress]
  );

  // Update study goal -> no direct endpoint; use XP update as placeholder to trigger recompute
  const updateStudyGoal = useCallback(
    async (goal: number) => {
      try {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await progressService.updateXP({
          userId,
          goal,
          source: "goal-update",
        } as any);

        // Refresh progress data
        await fetchProgress();
      } catch (error: unknown) {
        throw new Error(error.message || "Failed to update study goal");
      }
    },
    [fetchProgress]
  );

  // Reset progress (client-side only placeholder)
  const resetProgress = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      setState({
        progress: null,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to reset progress",
      }));
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
